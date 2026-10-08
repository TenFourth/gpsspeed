const accelCanvas = document.getElementById("accelCanvas");
const ctx = accelCanvas.getContext("2d");

let accelerationSensor = false;

/*
 * 直近サンプル
 */
const samples = [];
const MAX_SAMPLES = 200;
const SMOOTHING_COUNT = 30;  // 加速度表示の平滑化
const ACCEL_HOLD_MSEC = 3000;
const correctThreadAcc = 0.3;
const correctionAngle = {
    correctedAt: Date.now(),
    roll: 0,
    pitch: 0,
    yaw: 0
};

/*
 * 表示範囲
 */
const RANGE = 7;  // 7m/s2 -> 約0.75G


/*
 * 加速度 → Canvas座標
 */
function toCanvas(x, y) {
    const cx = accelCanvas.width / 2;
    const cy = accelCanvas.height / 2;

    const scale = accelCanvas.width / (RANGE * 2);

    return {
        x: cx + x * scale,
        y: cy - y * scale
    };
}

function drawAuxiliaryLine() {
    const xy = toCanvas(0, 0);
    const scale = accelCanvas.width / (RANGE * 2);
    const r = 2.451 * scale;  // 0.25Gの位置

    ctx.beginPath();
    ctx.setLineDash([3,7]);
    ctx.arc(xy.x, xy.y, r, 0, 2 * Math.PI);
    ctx.stroke();
}

/*
 * グラフ描画
 */
function draw() {
    ctx.clearRect(0, 0, accelCanvas.width, accelCanvas.height);

    const cx = accelCanvas.width / 2;
    const cy = accelCanvas.height / 2;

    const radius = Math.min(accelCanvas.width, accelCanvas.height) * 0.48;
    const gridSize = 40;

    ctx.save();

    /*
     * 背景
     */
    ctx.fillStyle = "#181818";

    // 円形にクリップ
    ctx.beginPath();
    ctx.arc(cx, cy, radius, 0, Math.PI * 2);
    ctx.clip();

    /*
     * グリッド
     */
    ctx.strokeStyle = "#333";
    ctx.lineWidth = 1;

    // 縦線
    for (let x = cx - radius; x <= cx + radius; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, cy - radius);
        ctx.lineTo(x, cy + radius);
        ctx.stroke();
    }

    // 横線
    for (let y = cy - radius; y <= cy + radius; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(cx - radius, y);
        ctx.lineTo(cx + radius, y);
        ctx.stroke();
    }

    /*
     * X軸
     */
    ctx.lineWidth = 2;
    ctx.strokeStyle = "#666";
    ctx.beginPath();
    ctx.moveTo(cx - radius, cy);
    ctx.lineTo(cx + radius, cy);
    ctx.stroke();

    /*
     * Y軸
     */
    ctx.beginPath();
    ctx.moveTo(cx, cy - radius);
    ctx.lineTo(cx, cy + radius);
    ctx.stroke();

    /*
     * 軸ラベル
     */
    ctx.fillStyle = "#aaa";
    ctx.font = "20px sans-serif";

    ctx.fillText("Left", accelCanvas.width - 50, cy - 8);
    ctx.fillText("Right", 20, cy - 8);
    ctx.fillText("Decel", cx + 8, 38);
    ctx.fillText("Accel", cx + 8, accelCanvas.height - 25);

    drawAuxiliaryLine()

    // クリップ解除
    ctx.restore();

    // -------------------------
    // 外側の円
    // -------------------------
    ctx.beginPath();
    ctx.arc(cx, cy, radius, 0, Math.PI * 2);

    ctx.lineWidth = 3;
    ctx.strokeStyle = "#888";
    ctx.stroke();

    // 最新値の赤い丸
    if (samples.length > 0) {
        const s = getSmoothingSample(samples.length - SMOOTHING_COUNT);
        drawPoint(ctx, s.x, s.y);
    }

    /*
     * 軌跡
     */
    if (samples.length > 1) {
        let max = {x: 0, y: 0};
        let min = {x: 0, y: 0};

        ctx.beginPath();
        samples.forEach((_, index) => {
            const s = getSmoothingSample(index);
            const p = toCanvas(s.x, s.y);

            if (index === 0) {
                ctx.moveTo(p.x, p.y);
            } else {
                ctx.lineTo(p.x, p.y);
            }

            /*
            * 数値表示
            */
            if (max.x < s.x) {
                max.x = s.x;
            }
            if (max.y < s.y) {
                max.y = s.y;
            }
            if (min.x > s.x) {
                min.x = s.x;
            }
            if (min.y > s.y) {
                min.y = s.y;
            }
        });

        ctx.strokeStyle = "#00aa11";
        ctx.lineWidth = 3;

        ctx.stroke();

        drawAccelText(ctx, max, min);
    }

}

function getSmoothingSample(index) {
    let sumX = 0, sumY = 0;  // 直近サンプルの平均でならす

    if (index < 0) {
        index = 0;
    }

    if (accelerationSensor === false && prevPosition !== null) {
        // 加速度センサーを使わずにGPSから求めた加速度を表す場合
        return {
            x: samples[index].x, y: samples[index].y
        };
    }

    const start = Math.min(index, Math.max(0, samples.length - SMOOTHING_COUNT));
    const end = Math.min(samples.length, start + SMOOTHING_COUNT);
    const mArray = samples.slice(start, end);
    mArray.forEach(s => {
        sumX += s.x;
        sumY += s.y;
    });

    return {
        x: sumX / SMOOTHING_COUNT,
        y: sumY / SMOOTHING_COUNT
    };
}

function drawPoint(ctx, x, y)
{
    const p = toCanvas(x, y);

    /*
     * 現在位置を大きな円で表示
     */
    ctx.beginPath();
    ctx.arc(p.x, p.y, 8, 0, Math.PI * 2);
    ctx.strokeStyle = "#fff";
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.fillStyle = "#ee2222";
    ctx.fill();
}

function drawAccelText(ctx, max, min) {
    ctx.fillStyle = "#efefef";
    ctx.font = "24px sans-serif";

    if (maxX > 1) {
        ctx.fillText(msToG(max.x).toFixed(1) + 'G', accelCanvas.width - 70, accelCanvas.height / 2 - 30);  // Left側
    }
    if (maxY > 1) {
        ctx.fillText(msToG(max.y).toFixed(1) + 'G', accelCanvas.width / 2 - 60, 40);  // Decel側
    }
    if (minX < -1) {
        ctx.fillText(msToG(Math.abs(min.x)).toFixed(1) + 'G', 25, accelCanvas.height / 2 - 30);  // Right側
    }
    if (minY < -1) {
        ctx.fillText(msToG(Math.abs(min.y)).toFixed(1) + 'G', accelCanvas.width / 2 - 60, accelCanvas.height - 25);  // Accel側
    }

    //document.getElementById("accelValue").textContent =
    //    `peak X: ${msToG(maxX).toFixed(2)} G　Y: ${msToG(maxY).toFixed(2)} G`;
}

function msToG(ms) {
    return ms / 9.80665;
}

/*
 * 加速度を受信
 */
function onMotion(event) {
    //const acc = event.acceleration;  // 端末によって補正された加速度
    const acc = event.accelerationIncludingGravity;  // 重力を含めた加速度(補正なしの生データ)

    /*
     * acceleration が取得できないブラウザもある
     */
    if (!acc) {
        return;
    }

    const x = acc.x ?? 0;
    const y = acc.y ?? 0;
    const z = acc.z ?? 0;

    if (Date.now() - correctionAngle.correctedAt > ACCEL_HOLD_MSEC) {
        const shakeMax = {
            x: Math.max(...samples.slice(1).map((v, index) => Math.abs(v.x - samples[index].x))),
            y: Math.max(...samples.slice(1).map((v, index) => Math.abs(v.y - samples[index].y)))
        };
        if (shakeMax.x <= correctThreadAcc && shakeMax.y <= correctThreadAcc) {
            accelCalibration(x, y, z);
        }
    }

    const corrected = rotateToHorizontal(x, y, z, correctionAngle.roll, correctionAngle.pitch);

    // センサーの軸に合わせて適宜マイナスにする
    if (document.getElementById('invertAccX').checked) {
        corrected.x = -corrected.x;
    }
    if (!document.getElementById('invertAccY').checked) {  // 縦軸はデフォルト反転(マイナス軸が上)
        corrected.y = -corrected.y;
    }

    pushAcceleration(corrected.x, corrected.y);
}

function pushAcceleration(x, y) {
    /*
     * サンプル追加
     */
    samples.push({ x: x, y: y, sampledAt: Date.now() });

    /*
     * 一番古いサンプルを削除
     */
    while (samples.length > MAX_SAMPLES) {
        samples.shift();
    }

    /*
     * 一定時間経過したサンプルを削除
     */
    while (samples.length > 0 && Date.now() - samples[0].sampledAt > ACCEL_HOLD_MSEC) {
        samples.shift();
    }

    draw();
}

function rotateToHorizontal(x, y, z, roll, pitch) {
    const cr = Math.cos(roll);
    const sr = Math.sin(roll);
    const cp = Math.cos(pitch);
    const sp = Math.sin(pitch);

    // Roll回転 (X軸周り)
    const y1 = y * cr - z * sr;
    const z1 = y * sr + z * cr;
    const x1 = x;

    // Pitch回転 (Y軸周り)
    const x2 = x1 * cp + z1 * sp;
    const z2 = -x1 * sp + z1 * cp;
    const y2 = y1;

    return {
        x: x2, // 水平X
        y: y2, // 水平Y
        z: z2 // 鉛直方向
   };
}

function accelCalibration(ax, ay, az) {
    correctionAngle.roll = Math.atan2(ay, az);
    correctionAngle.pitch = Math.atan2(-ax, Math.sqrt(ay * ay + az * az));
    correctionAngle.correctedAt = Date.now();
}

/*
 * センサー開始
 */
async function startAcceleration() {
    /*
     * iPhone / iPad
     */
    if (typeof DeviceMotionEvent !== "undefined" &&
        typeof DeviceMotionEvent.requestPermission === "function"
    ) {
        const permission = await DeviceMotionEvent.requestPermission();
        if (permission !== "granted") {
            alert("モーションセンサーの使用が許可されませんでした");
            return;
        }
    }

    window.addEventListener("devicemotion", onMotion);
    document.getElementById("startButton").disabled = true;
    accelerationSensor = true;
}

draw();

// -------------------------
// 中心点
// -------------------------
drawPoint(ctx, 0, 0);
