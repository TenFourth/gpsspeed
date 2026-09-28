function drawGraph(canvasId, data, grids = 10) {
    const canvas = document.getElementById(canvasId);
    const ctx = canvas.getContext("2d");

    const width = canvas.clientWidth;
    const height = canvas.clientHeight;

    // Retinaディスプレイ対応
    const dpr = window.devicePixelRatio || 1;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    ctx.clearRect(0, 0, width, height);

    if (data.length < 2) return;

    // 補助線
    const min = Math.min(...data);
    const max = Math.max(...data);
    ctx.lineWidth = 1;
    ctx.strokeStyle = "rgba(255, 255, 255, 0.35)";
    ctx.fillStyle = "rgba(255,255,255,0.6)";
    ctx.font = "10px Arial";
    const gridStep = Math.ceil(Math.abs(max - min) / grids);
    if (gridStep >= 1) {
        for (let v = min; v <= max; v += gridStep) {
            const y = height - ((v - min) / Math.abs(min - max)) * height;
            ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(width, y); ctx.stroke();  // 補助線
            ctx.fillText( v.toFixed(0), 5, y - 3 );  // 値目盛り
        }
    } else {  // 全てが同じ値の場合
        const y = height / 2;
        ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(width, y); ctx.stroke();  // 補助線
        ctx.fillText( min.toFixed(0), 5, y - 3 );  // 値目盛り
    }

    // グラフ
    ctx.beginPath();

    data.forEach((v, i) => {
        const x = i / data.length * width;
        const y = min !== max ? height - ((v - min) / Math.abs(min - max)) * height : height / 2;

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
