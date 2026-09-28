const PX_PER_DEG = 4;  // 1度あたりの表示幅
let headingTarget = 0;

window.addEventListener('load', function() {
    const tape = document.getElementById("headingTape");
    
    const directions = {
        0:   "N",
        45:  "NE",
        90:  "E",
        135: "SE",
        180: "S",
        225: "SW",
        270: "W",
        315: "NW"
    };
    
    /*
     * 0～360度のテープを複数回並べる
     * これによって360→0度の境界でも
     * 自然にスクロールできる
     */
    
    const START = -360;
    const END = 720;
    const STEP = 10;       // 10度ごと
    
    for (let deg = START; deg <= END; deg += STEP) {
        const x = deg * PX_PER_DEG;
    
        // 目盛り
        const mark = document.createElement("div");
        mark.className = "heading-mark";
    
        if (deg % 30 === 0) {
            mark.classList.add("major");
        }
    
        mark.style.left = x + "px";
        tape.appendChild(mark);
    
        // 方位文字
        const normalized = ((deg % 360) + 360) % 360;
    
        if (directions[normalized]) {
            const label = document.createElement("div");
            label.className = "heading-label";
            label.textContent = directions[normalized];
            label.style.left = x + "px";
            tape.appendChild(label);
        }
    
        // 数字
        if (deg % 30 === 0) {
            const degree = document.createElement("div");
            degree.className = "heading-degree";
            degree.textContent = normalized + "°";
            degree.style.left = x + "px";
            tape.appendChild(degree);
        }
    }

    moveHeadingTape(0);
    updateHeading();
});

function setHeading(heading) {
    heading %= 360;
    headingTarget = heading >= 0 ? heading : 360 + heading;
}

// headingの表示値を徐々にtargetに近づける
function updateHeading() {
  const headingValue = document.getElementById("headingValue");
  const current = parseInt(headingValue.textContent, 10);
  const delta = headingTarget - current;
  const nick = delta >= 0 ? Math.ceil(delta / 30) : Math.floor(delta / 30);  // 30フレーム描画でtarget値になるよう増加分を調整

  const newValue = Math.max(0, delta >= 0 ? Math.min(headingTarget, current + nick) : Math.max(headingTarget, current + nick));

  moveHeadingTape(newValue);

  requestAnimationFrame(updateHeading);
}

/*
 * Headingを指定してテープを移動
 */
function moveHeadingTape(heading) {
    const headingValue = document.getElementById("headingValue");
    const direction = document.getElementById("direction");
    const tape = document.getElementById("headingTape");

    heading = ((heading % 360) + 360) % 360;

    // 中央に現在方位を配置
    const center = document.querySelector(".heading-container").clientWidth / 2;

    const offset = center - heading * PX_PER_DEG;

    tape.style.transform = `translateX(${offset}px)`;
    headingValue.textContent = heading.toFixed(0);

    // 8方位
    const dirs = [
        "N",
        "NE",
        "E",
        "SE",
        "S",
        "SW",
        "W",
        "NW"
    ];

    const index = Math.round(heading / 45) % 8;

    direction.textContent = dirs[index];
}
