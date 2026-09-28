window.addEventListener('load', function() {
    setCarAdove(0);
    setCarClimbing(0);
});

function drawCarAdove(canvasId, imagePath, angle, climbingMode = false) {
    const canvas = document.getElementById(canvasId);
    const ctx = canvas.getContext("2d");

    const cx = canvas.width / 2;
    const cy = canvas.height / 2;

    const img = new Image();
    img.onload = function() {
        const scale = {
            width: canvas.width / img.width,
            height: canvas.height / img.height
        }
        const minScale = Math.min(scale.width, scale.height);
        const imgSize = {
            width: img.width * minScale * 0.8,
            height: img.height * minScale * 0.8
        }

        ctx.clearRect(0, 0, canvas.width, canvas.height);

        ctx.save();  // 回転の起点を変更する前の状態を保持

        // Canvas中央を起点に描画
        ctx.translate(cx, cy);

        if (!isNaN(angle)) {
            ctx.rotate((climbingMode ? -angle : angle) * Math.PI / 180);
        }

        ctx.drawImage(img, -imgSize.width / 2, -imgSize.height / 2, imgSize.width, imgSize.height);

        // 外側の円
        const radius = (Math.min(canvas.width, canvas.height) / 2) - 2;
        ctx.beginPath();
        ctx.arc(0, 0, radius, 0, Math.PI * 2);

        ctx.lineWidth = 1;
        ctx.strokeStyle = "#f0f0f0";
        ctx.stroke();

        if (climbingMode) {
            ctx.beginPath();
            ctx.moveTo(-(canvas.width / 2) + 10, imgSize.height / 2);
            ctx.lineTo(canvas.width / 2 - 10, imgSize.height / 2);
            ctx.stroke();
        }

        ctx.restore();  // saveした状態に戻す

        // 回転角度を表示するテキスト
        ctx.font = "22px sans-serif";
        ctx.textAlign = "center";
        const angleText = !isNaN(angle) ? `${angle.toFixed(1)}°` : '---.-°';
        const textX = canvas.width / 2;
        const textY = climbingMode ? canvas.height - 10 : cy + 10;
        ctx.lineWidth = 5;
        ctx.strokeStyle = "black";
        ctx.strokeText(angleText, textX, textY);
        ctx.fillStyle = "#efefef";
        ctx.fillText(angleText, textX, textY);
    };
    img.src = imagePath;
}

function setCarAdove(angle) {
    drawCarAdove("car-adove", "img/car-adove.png", angle);
}

function setCarClimbing(slope) {
    drawCarAdove("car-climbing", "img/climbing.png", slope, true);
}
