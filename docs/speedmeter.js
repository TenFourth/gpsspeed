const meter = document.getElementById('speedmeter');
const needle = document.getElementById('needle');
const value = document.getElementById('value');
const speed = document.getElementById('speed');
const toggle = document.getElementById('toggle');

const speedMeterMax = 240;
const speedAlertThreshold = 180
const startAngle = -135;
const endAngle = 135;

let speedDigitTarget = 0;

// 30km/h刻みの目盛り
for(let i=0;i<=speedMeterMax;i+=10){
  const a = startAngle + (endAngle-startAngle)*(i/speedMeterMax);
  const t = document.createElement('div');
  t.className='tick';
  t.style.setProperty('--a',`${a}deg`);
  t.style.setProperty('--w', i%30===0 ? '3px':'2px');
  t.style.setProperty('--h', i%30===0 ? '15px':'8px');
  t.style.setProperty('--c', i>=speedAlertThreshold ? '#e33':'#ddd');
  meter.appendChild(t);

  if(i%30===0){
    const l=document.createElement('div');
    l.className='label';
    l.style.setProperty('--a',`${a}deg`);
    l.textContent=i;
    if(i>=speedAlertThreshold) l.classList.add('red');
    meter.appendChild(l);
  }
}

function setAcceleration(ms2) {
    const max = 4.9; // 最大表示値

    // -max ～ +max (m/s^2)に制限
    ms2 = Math.max(-max, Math.min(max, ms2));

    if (ms2 >= 0) {
        // 加速
        const percent = ms2 / max * 50;
        document.getElementById("accelBar").style.width = percent + "%";
        document.getElementById("decelBar").style.width = "0%";
    } else {
        // 減速
        const percent = -ms2/ max * 50;
        document.getElementById("decelBar").style.width = percent + "%";
        document.getElementById("accelBar").style.width = "0%";
    }
    //document.getElementById("accelValue").textContent = (ms2 >= 0 ? "+" : "") + ms2.toFixed(1) + " km/h/s";

    // Gforce mapにも加速度を表示
    if (accelerationSensor === false && prevPosition !== null) {
        const accDir = degree - prevPosition.direction;
        const v = rotateVectorDeg(0, -ms2, accDir);  // -ms2 -> 加速した時にy軸はマイナス
        pushAcceleration(v.x, v.y);
    }
}

/**
 * 時速(km/h)から加速度(m/s^2)を算出
 **/
function getAcceleration(kmh) {
    const ms = kmh * 1000 / 3600;
    const prevMs = prevSpeed * 1000 / 3600;
    const deltaTime = (Date.now() - prevTime) / 1000;
    return (ms - prevMs) / deltaTime;
}

function rotateVectorDeg(x, y, degrees) {
  const rad = degrees * (Math.PI / 180);
  const cos = Math.cos(rad);
  const sin = Math.sin(rad);

  return {
    x: x * cos - y * sin,
    y: x * sin + y * cos
  };
}

/**
 * speedmeterに速度をセット
 **/
function setSpeed(v) {
  v = v < 1 ? 0 : Math.min(speedMeterMax, Number(v));  // 1キロ未満はゼロ扱い、メーター最大値を超えないよう正規化

  const angle=startAngle+(endAngle-startAngle)*(v/speedMeterMax);
  needle.style.transform=`translate(-50%,-100%) rotate(${angle}deg)`;
  speedDigitTarget = v;
  setAcceleration(getAcceleration(v));  // acceleration bar

  prevSpeed = v;
  prevTime = Date.now();

  speedHistory.push(v);
  while (speedHistory.length > 30) {
    speedHistory.shift();
  }
  drawGraph('speedHistoryGraph', speedHistory, 4);
}

// 速度の表示値を徐々にtargetに近づける
function updateSpeedDigit() {
  const current = parseInt(value.textContent, 10);
  const delta = speedDigitTarget - current;
  const nick = delta >= 0 ? Math.ceil(delta / 30) : Math.floor(delta / 30);  // 30フレーム描画でtarget値になるよう増加分を調整

  const newValue = Math.max(0, delta >= 0 ? Math.min(speedDigitTarget, current + nick) : Math.max(speedDigitTarget, current + nick));

  value.textContent=Math.round(newValue);

  requestAnimationFrame(updateSpeedDigit);
}

function resizeContent() {
    const speedmeterArea = document.getElementById('speedmeterArea');
    const speedmeter = document.getElementById('speedmeter');
    const originalWidth = 520;

    const scaleX = (speedmeterArea.clientWidth <= originalWidth ? speedmeterArea.clientWidth : window.innerWidth) / originalWidth;
    speedmeter.style.transform = `scale(${Math.min(1, scaleX)})`;

    // 縮小した後の下に余分な空白を抑止
    speedmeterArea.style.height = `${speedmeter.offsetHeight * Math.min(1, scaleX)}px`;
}

function pad(n) {
  return String(n).padStart(2, '0');
}

window.addEventListener("load", resizeContent);
window.addEventListener("resize", resizeContent);

updateSpeedDigit();
