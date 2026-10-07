function drawGraph(canvasId, data, grids = 10) {
    const canvas = document.getElementById(canvasId);
    const ctx = canvas.getContext("2d");

    const width = canvas.clientWidth;
    const height = canvas.clientHeight;

    const RANGE_MIN = 10;  // 範囲が小さすぎる時の制限

    // Retinaディスプレイ対応
    const dpr = window.devicePixelRatio || 1;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    ctx.clearRect(0, 0, width, height);

    if (data.length < 2) return;

    // 補助線
    let min = Math.min(...data);
    let max = Math.max(...data);
    let range = Math.abs(max - min);
    if (range < RANGE_MIN) {
        const center = min + (range / 2);
        range = RANGE_MIN;
        min = Math.floor(center - (RANGE_MIN / 2));
        max = Math.floor(center + (RANGE_MIN / 2));
    }

    ctx.lineWidth = 1;
    ctx.strokeStyle = "rgba(255, 255, 255, 0.35)";
    ctx.fillStyle = "rgba(255,255,255,0.6)";
    ctx.font = "10px Arial";
    const gridStep = Math.ceil(range / grids);
    for (let v = min; v <= max; v += gridStep) {
        const y = height - ((v - min) / range) * height;
        ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(width, y); ctx.stroke();  // 補助線
        ctx.fillText( v.toFixed(0), 5, y - 3 );  // 値目盛り
    }

    // グラフ
    ctx.beginPath();

    data.forEach((v, i) => {
        const x = i / data.length * width;
        const y = height - ((v - min) / range) * height;

        if (i === 0) {
            ctx.moveTo(x, y);
        } else {
            ctx.lineTo(x, y);
        }
    });

    ctx.strokeStyle = "#fff";
    ctx.lineWidth = 2;
    ctx.stroke();
}
