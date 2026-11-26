/* 5·6·8단원 움직이는 모형. task(이름)을 부르면 할 일 하나를 해낸 것으로 친다 */
import { h } from "./fb.js";
import { stage, T, rr, ball, ln, arrow, seg, range, INK } from "./sims.js";
const G = "#58547a", OK = "#0b6b33", BL = "#2265c9", RD = "#d93a47";
const dot = (c, x, y, r, f, s) => { c.beginPath(); c.arc(x, y, r, 0, 7); if (f) { c.fillStyle = f; c.fill(); } if (s) { c.strokeStyle = s; c.lineWidth = 2; c.stroke(); } };
const side = (box, left, right) => box.append(h("div", { class: "side" }, left, right));
const note = () => h("div", { class: "why" });
const rnd = s => () => { s = (s * 16807) % 2147483647; return s / 2147483647; }; // 늘 같은 그림이 나오게
const graph = (c, x0, y0, w, hh, xl, yl, xmax, ymax, xs, ys) => { ln(c, [[x0, y0 - hh], [x0, y0], [x0 + w, y0]], INK, 3); T(c, xl, x0 + w / 2, y0 + 34, 16); T(c, yl, x0, y0 - hh - 14, 16); (xs || []).forEach(v => T(c, String(v), x0 + v / xmax * w, y0 + 14, 14, G, "center", 400)); (ys || []).forEach(v => { T(c, String(v), x0 - 6, y0 - v / ymax * hh, 14, G, "right", 400); ln(c, [[x0, y0 - v / ymax * hh], [x0 + w, y0 - v / ymax * hh]], "#ebe8f7", 1); }); };

export const SIMS2 = {
  /* 5-1 광합성에 필요한 물질과 만들어진 물질 */
  leaf(box, task) {
    let mode = "co2", led = false, run = 0, t = 0, co2 = 400, pts = [], tube = 0; const info = note();
    const say = () => { info.innerHTML = mode === "co2" ? `<b class="t">이산화 탄소 센서 실험</b><p>엘이디등을 <b>끄고</b> 측정한 뒤, <b>켜고</b> 다시 측정해 보세요. 그래프에서 이산화 탄소 농도가 어떻게 변하나요?</p><p>${pts.some(p => p.l) ? "빛이 있으면 이산화 탄소 농도가 <b>낮아져요</b> → 광합성에 <b>이산화 탄소</b>가 쓰여요." : pts.length ? "빛이 없으면 이산화 탄소 농도가 조금씩 높아져요." : ""}</p>` : `<b class="t">검정말 녹말 검출 실험</b><p>햇빛을 1시간 받은 검정말과, 알루미늄 포일로 감싸 빛을 받지 못한 검정말이에요.</p><p>${tube >= 2 ? "빛을 받은 잎만 <b>청람색</b>으로 변했어요 → 광합성으로 <b>녹말</b>이 만들어졌어요." : tube ? "에탄올로 엽록소를 빼서 색 변화를 잘 볼 수 있게 했어요." : ""}</p>`; };
    const left = h("div");
    stage(left, 720, 300, (c, dt) => {
      if (mode === "co2") {
        rr(c, 20, 40, 300, 220, 14, "#3b3a55"); rr(c, 60, 120, 200, 120, 12, "rgba(255,255,255,.15)", "#cfd3de", 3);
        for (let i = 0; i < 6; i++) { c.save(); c.translate(90 + i * 28, 200 - (i % 2) * 18); c.rotate(-.5 + i * .2); c.beginPath(); c.ellipse(0, 0, 22, 10, 0, 0, 7); c.fillStyle = "#2fa84f"; c.fill(); c.restore(); }
        rr(c, 140, 60, 40, 60, 6, "#9aa3b5"); T(c, "CO₂ 센서", 160, 50, 14, "#fff");
        rr(c, 230, 52, 70, 20, 6, led ? "#fff6b0" : "#777"); if (led) { c.fillStyle = "rgba(255,240,150,.25)"; c.beginPath(); c.moveTo(230, 72); c.lineTo(300, 72); c.lineTo(270, 250); c.lineTo(90, 250); c.fill(); }
        T(c, led ? "엘이디등 켬" : "엘이디등 끔", 170, 280, 16, led ? "#b07800" : G);
        if (run > 0) { const s = Math.min(dt, run); run -= s; t += s * 5; co2 += (led ? -(co2 - 250) * .06 : (900 - co2) * .012) * s * 5; pts.push({ x: t, y: co2, l: led }); if (run <= 0) { task(led ? "light" : "dark"); say(); } }
        const X = v => 380 + v / 120 * 310, Y = v => 250 - (v - 200) / 700 * 200; graph(c, 380, 250, 310, 200, "시간(초)", "CO₂ 농도(ppm)", 120, 900, [0, 60, 120], [200, 400, 600, 800].map(v => v - 200)); [200, 400, 600, 800].forEach(v => T(c, v, 374, Y(v), 13, G, "right", 400));
        for (let i = 1; i < pts.length; i++) ln(c, [[X(pts[i - 1].x), Y(pts[i - 1].y)], [X(pts[i].x), Y(pts[i].y)]], pts[i].l ? "#e0a800" : "#4b4a6b", 4);
      } else {
        [["빛을 받은 검정말", 0], ["포일로 감싼 검정말", 1]].forEach(([n, i]) => {
          const x = 180 + i * 360; T(c, n, x, 26, 18); if (i) rr(c, x - 34, 50, 68, 150, 12, "#c8ccd6", "#8a86a8"); else rr(c, x - 34, 50, 68, 150, 12, "rgba(170,220,255,.4)", "#8a86a8");
          dot(c, x, 250, 60, "#f4f1ea", "#bdb8a6");
          for (let k = 0; k < 5; k++) { c.save(); c.translate(x - 30 + k * 15, 250 + (k % 2 ? 12 : -10)); c.rotate(k * .7); c.beginPath(); c.ellipse(0, 0, 14, 6, 0, 0, 7); c.fillStyle = tube >= 2 ? (i ? "#c9a64a" : "#2b2f8a") : tube ? "#e8f1d0" : "#2fa84f"; c.fill(); c.restore(); }
          T(c, tube >= 2 ? (i ? "황갈색 (변화 없음)" : "청람색 (녹말 있음)") : tube ? "탈색됨" : "", x, 330 - 18, 16, tube >= 2 && !i ? "#2b2f8a" : G);
        });
      }
    });
    const ctl = h("div"), go = h("button", { type: "button", class: "tg pri", onclick: () => { if (run <= 0) { run = 4; } } }, "측정하기 (30초)");
    const b1 = h("button", { type: "button", class: "tg", onclick: () => { tube = Math.max(tube, 1); task("ethanol"); say(); } }, "① 에탄올 물중탕(탈색)"), b2 = h("button", { type: "button", class: "tg pri", onclick: () => { if (tube < 1) { b2.textContent = "먼저 ①을 해요"; setTimeout(() => b2.textContent = "② 녹말 검출 용액 떨어뜨리기", 1200); return; } tube = 2; task("iodine"); say(); } }, "② 녹말 검출 용액 떨어뜨리기");
    const draw = () => { ctl.textContent = ""; ctl.append(mode === "co2" ? h("div", {}, seg([[false, "엘이디등 끄기"], [true, "엘이디등 켜기"]], led, v => { led = v; }), h("div", { class: "controls" }, go)) : h("div", { class: "controls" }, b1, b2)); };
    left.append(seg([["co2", "탐구 1 · 이산화 탄소 측정"], ["starch", "탐구 2 · 녹말 검출"]], mode, v => { mode = v; draw(); say(); }), ctl); draw(); side(box, left, info); say();
  },
  /* 5-2 광합성에 영향을 미치는 환경요인 */
  factor(box, task) {
    const V = { light: 80, co2: 80, temp: 25 }, rec = { light: [], co2: [], temp: [] }, bub = []; let vr = "light", acc = 0;
    const rate = () => { const f = V.temp <= 35 ? Math.max(0, (V.temp - 5) / 30) : Math.max(0, 1 - (V.temp - 35) / 10); return Math.round(40 * Math.min(Math.min(1, V.light / 60), Math.min(1, V.co2 / 60)) * f); };
    const NAME = { light: ["빛의 세기", "%"], co2: ["이산화 탄소 농도", "%"], temp: ["온도", "°C"] }, info = note(), left = h("div");
    stage(left, 720, 300, (c, dt) => {
      rr(c, 40, 70, 180, 200, 14, "rgba(170,220,255,.45)", "#8a86a8"); ln(c, [[130, 260], [130, 130]], "#1f8a3c", 5); for (let i = 0; i < 6; i++) { c.beginPath(); c.ellipse(130 + (i % 2 ? 16 : -16), 240 - i * 20, 16, 6, i % 2 ? -.4 : .4, 0, 7); c.fillStyle = "#2fa84f"; c.fill(); }
      acc += dt * rate() / 8; while (acc > 1) { acc--; bub.push({ x: 130 + Math.random() * 10 - 5, y: 130 }); } for (let i = bub.length - 1; i >= 0; i--) { bub[i].y -= dt * 70; dot(c, bub[i].x, bub[i].y, 4, "#fff", "#5aa9e6"); if (bub[i].y < 76) bub.splice(i, 1); }
      const sun = V.light / 100; c.fillStyle = `rgba(255,200,40,${.2 + sun * .7})`; dot(c, 60, 34, 12 + sun * 10, c.fillStyle); T(c, `빛 ${V.light}% · CO₂ ${V.co2}% · ${V.temp} °C`, 130, 288, 15);
      const [nm, u] = NAME[vr], mx = vr === "temp" ? 50 : 100, X = v => 300 + v / mx * 380, Y = v => 250 - v / 40 * 200;
      graph(c, 300, 250, 380, 200, `${nm}(${u})`, "1분 동안 기포 수", mx, 40, vr === "temp" ? [0, 10, 20, 30, 40, 50] : [0, 20, 40, 60, 80, 100], [10, 20, 30, 40]);
      const p = rec[vr].slice().sort((a, b) => a[0] - b[0]); if (p.length > 1) ln(c, p.map(q => [X(q[0]), Y(q[1])]), RD, 3); p.forEach(q => dot(c, X(q[0]), Y(q[1]), 6, RD));
      T(c, `지금 1분 동안 기포 약 ${rate()}개`, 490, 20, 18, OK);
    });
    const sl = h("div", { class: "controls" }), mk = () => { sl.textContent = ""; const [nm, u] = NAME[vr]; sl.append(vr === "temp" ? range(nm, 10, 50, 5, V.temp, " " + u, v => { V.temp = v; }) : range(nm, 0, 100, 20, V[vr], " " + u, v => { V[vr] = v; }), h("button", { type: "button", class: "tg pri", onclick: () => { const r = rec[vr], i = r.findIndex(q => q[0] === V[vr]); if (i >= 0) r.splice(i, 1); r.push([V[vr], rate()]); if (r.length >= 3) task(vr); say(); } }, "기포 수 기록")); };
    const say = () => { info.innerHTML = `<b class="t">${NAME[vr][0]}만 바꾸기</b><p>다른 조건은 그대로 두고 <b>${NAME[vr][0]}</b>만 바꾸며 기포 수를 3번 이상 기록해 보세요.</p><p>${vr === "temp" ? "온도가 높아지면 기포가 늘다가, 어느 온도를 넘으면 <b>급격히 줄어요</b>." : "값이 커질수록 기포가 늘다가, 어느 정도 이상이면 <b>더 늘지 않아요</b>."}</p><p class="hint">기포는 광합성으로 나온 <b>산소</b>예요.</p>`; };
    left.append(seg([["light", "빛의 세기"], ["co2", "이산화 탄소 농도"], ["temp", "온도"]], vr, v => { V.light = 80; V.co2 = 80; V.temp = 25; vr = v; mk(); say(); }), sl); mk(); side(box, left, info); say();
  },
  /* 5-3 광합성과 호흡 */
  resp(box, task) {
    let L = 0, o2 = 50, co2 = 50, held = 0; const PL = [0, .5, 1.6], info = note(), left = h("div");
    stage(left, 720, 300, (c, dt) => {
      const p = PL[L], r = .5; o2 = Math.max(5, Math.min(95, o2 + (p - r) * dt * 6)); co2 = Math.max(5, Math.min(95, co2 - (p - r) * dt * 6)); held += dt; if (held > 2.5) task(["dark", "weak", "strong"][L]);
      rr(c, 30, 30, 330, 250, 18, L ? `rgba(255,236,150,${L * .25})` : "#3b3a55", "#8a86a8"); T(c, ["빛 없음", "약한 빛", "강한 빛"][L], 195, 52, 18, L ? INK : "#fff");
      ln(c, [[195, 260], [195, 150]], "#1f8a3c", 6); for (let i = 0; i < 4; i++) { c.beginPath(); c.ellipse(195 + (i % 2 ? 26 : -26), 240 - i * 26, 26, 10, i % 2 ? -.4 : .4, 0, 7); c.fillStyle = "#2fa84f"; c.fill(); }
      if (p) { arrow(c, 70, 110, 150, 160, "#888", 2 + p * 4); T(c, "CO₂", 62, 96, 16); arrow(c, 240, 160, 320, 110, BL, 2 + p * 4); T(c, "O₂", 330, 96, 16, BL); T(c, "광합성", 195, 96, 18, OK); }
      arrow(c, 70, 220, 150, 210, BL, 4); T(c, "O₂", 58, 232, 15, BL); arrow(c, 240, 210, 320, 222, "#888", 4); T(c, "CO₂", 338, 232, 15); T(c, "호흡", 195, 290 - 14, 16, RD);
      [["산소", o2, BL], ["이산화 탄소", co2, "#777"]].forEach(([n, v, col], i) => { const x = 420 + i * 150; rr(c, x, 60, 60, 200, 10, "#f3f2f8", "#dad7ea"); rr(c, x, 260 - v * 2, 60, v * 2, 10, col); T(c, n, x + 30, 40, 17); T(c, (L === 0 ? (i ? "↑" : "↓") : L === 1 ? "→" : (i ? "↓" : "↑")), x + 30, 280, 20, col); });
    });
    const say = () => { info.innerHTML = `<b class="t">${["빛이 없을 때", "빛이 약할 때", "빛이 강할 때"][L]}</b><p>${["<b>호흡만</b> 일어나요. 산소를 흡수하고 이산화 탄소를 내보내요.", "광합성과 호흡이 <b>비슷하게</b> 일어나 기체 농도가 거의 변하지 않아요.", "<b>광합성이 호흡보다 활발</b>해요. 이산화 탄소를 흡수하고 산소를 내보내요."][L]}</p><p class="hint">호흡은 빛이 있을 때나 없을 때나 <b>항상</b> 일어나요.</p>`; };
    left.append(seg([[0, "빛 없음"], [1, "약한 빛"], [2, "강한 빛"]], 0, v => { L = v; held = 0; say(); })); side(box, left, info); say();
  },
  /* 5-4 양분의 저장과 이용 */
  store(box, task) {
    let night = false, t = 0; const ps = [], info = note(), left = h("div"), R = rnd(7);
    stage(left, 720, 320, (c, dt) => {
      t += dt; if (t > 3) task(night ? "night" : "day");
      c.fillStyle = night ? "#2b2a4a" : "#dff3ff"; c.fillRect(0, 0, 720, 210); c.fillStyle = "#8a6a45"; c.fillRect(0, 210, 720, 110); dot(c, 660, 50, 26, night ? "#f1f0c8" : "#ffc400");
      ln(c, [[360, 290], [360, 60]], "#3c8a3c", 10); ln(c, [[360, 140], [250, 100]], "#3c8a3c", 6); ln(c, [[360, 110], [470, 80]], "#3c8a3c", 6);
      c.beginPath(); c.ellipse(220, 95, 50, 22, -.3, 0, 7); c.fillStyle = "#2fa84f"; c.fill(); c.beginPath(); c.ellipse(500, 76, 50, 22, .2, 0, 7); c.fill();
      dot(c, 410, 170, 22, "#d93a47"); T(c, "열매", 445, 170, 14, "#fff", "left"); c.beginPath(); c.ellipse(330, 268, 46, 26, 0, 0, 7); c.fillStyle = "#c9a26b"; c.fill(); T(c, "뿌리(덩이)", 330, 306, 14, "#fff");
      ln(c, [[355, 285], [355, 70]], "rgba(255,255,255,.5)", 2, [6, 6]); T(c, "체관", 372, 230, 13, "#fff", "left");
      if (!night && ps.length < 40 && R() < dt * 8) ps.push({ k: "g", x: 200 + R() * 60, y: 85 + R() * 20, s: 0 });
      if (night && R() < dt * 6) { const leaf = ps.find(p => p.k === "s"); if (leaf) { leaf.k = "m"; leaf.to = R() < .5 ? [330, 268] : [410, 170]; } }
      ps.forEach(p => { if (p.k === "g") { p.s += dt; if (p.s > 1.2) p.k = "s"; } if (p.k === "m") { const tx = p.x < 355 && p.y < 150 ? 355 : p.to[0], ty = p.x < 355 && p.y < 150 ? 150 : p.to[1]; p.x += Math.sign(tx - p.x) * Math.min(Math.abs(tx - p.x), dt * 90); p.y += Math.sign(ty - p.y) * Math.min(Math.abs(ty - p.y), dt * 90); if (Math.abs(p.x - p.to[0]) < 2 && Math.abs(p.y - p.to[1]) < 2) { p.k = "d"; p.x += (R() - .5) * 30; p.y += (R() - .5) * 20; } }
        dot(c, p.x, p.y, p.k === "s" ? 5 : 4, { g: "#ffe066", s: "#4a4fbf", m: "#ff9f1c", d: p.to && p.to[0] === 330 ? "#4a4fbf" : "#ffe066" }[p.k], "#fff"); });
      T(c, night ? "밤: 녹말이 설탕으로 바뀌어 체관으로 이동" : "낮: 잎에서 광합성으로 포도당 → 녹말로 저장", 360, 22, 17, night ? "#fff" : INK);
      [["#ffe066", "포도당"], ["#4a4fbf", "녹말"], ["#ff9f1c", "설탕(이동 중)"]].forEach(([col, n], i) => { dot(c, 30 + i * 130, 236, 6, col, "#fff"); T(c, n, 42 + i * 130, 236, 14, "#fff", "left"); });
    });
    const say = () => { info.innerHTML = night ? `<b class="t">밤</b><p>잎에 저장된 녹말은 물에 잘 녹지 않아 <b>설탕</b>으로 바뀌어 <b>체관</b>을 통해 이동해요.</p><p>뿌리, 줄기, 열매, 씨에 다양한 형태로 <b>저장</b>되고, 필요할 때 생명활동의 <b>에너지원</b>으로 쓰여요.</p>` : `<b class="t">낮</b><p>잎에서 광합성으로 만들어진 <b>포도당</b>은 잎에서 쓰이거나 <b>녹말</b>로 바뀌어 잠시 저장돼요.</p>`; };
    left.append(seg([[false, "낮"], [true, "밤"]], false, v => { night = v; t = 0; say(); })); side(box, left, info); say();
  },
  /* 6-1 영양소 검출 */
  nutri(box, task) {
    const F = ["증류수", "쌀 음료수", "두유", "식용유"], RG = [["녹말", "아이오딘-아이오딘화 칼륨", "#c9a64a", "#2b2f8a", "청람색"], ["단백질", "5% 수산화 나트륨+1% 황산구리", "#9ecbff", "#7b3fa8", "보라색"], ["지방", "수단Ⅲ", "#f0a67a", "#e8303a", "선홍색"], ["당", "베네딕트(가열)", "#5b8be0", "#e0662a", "황적색"]];
    const has = [[], [0, 3], [1, 2], [2]], drop = new Set(); let heat = false; const info = note(), left = h("div");
    const cv = stage(left, 720, 330, c => {
      F.forEach((f, j) => T(c, f, 230 + j * 130, 24, 17)); RG.forEach(([n, r], i) => { T(c, n + " 검출", 20, 72 + i * 70, 16, INK, "left"); T(c, r, 20, 92 + i * 70, 11, G, "left", 400); });
      RG.forEach((r, i) => F.forEach((f, j) => { const k = i + "_" + j, x = 230 + j * 130, y = 80 + i * 70, d = drop.has(k), pos = has[j].includes(i), col = !d ? "#f6f8fb" : i === 3 && !heat ? r[2] : pos ? r[3] : r[2]; dot(c, x, y, 26, col, "#b8bccb"); if (!d) T(c, "누르기", x, y, 12, G, "center", 400); }));
    });
    cv.cv.style.cursor = "pointer"; cv.cv.addEventListener("click", e => { const p = cv.at(e); for (let i = 0; i < 4; i++) for (let j = 0; j < 4; j++) if (Math.hypot(p.x - (230 + j * 130), p.y - (80 + i * 70)) < 30) { drop.add(i + "_" + j); chk(); } });
    const chk = () => { [1, 2, 3].forEach(j => { if ([0, 1, 2, 3].every(i => drop.has(i + "_" + j))) task("f" + j); }); say(); };
    const say = () => { const res = [1, 2, 3].filter(j => [0, 1, 2, 3].every(i => drop.has(i + "_" + j))).map(j => `<li><b>${F[j]}</b>: ${has[j].filter(i => i !== 3 || heat).map(i => RG[i][0]).join(", ") || "-"}${has[j].includes(3) && !heat ? " (당은 가열 후 확인)" : ""}</li>`).join(""); info.innerHTML = `<b class="t">영양소 검출 반응</b><p>칸을 눌러 검출 용액을 2방울 떨어뜨려요. 당 검출은 <b>뜨거운 물에 담가야</b> 색이 변해요.</p>${res ? "<ol>" + res + "</ol>" : ""}<p class="hint">증류수는 비교하려고 함께 실험해요. 제품에 따라 결과가 다를 수 있어요.</p>`; };
    left.append(h("div", { class: "controls" }, h("button", { type: "button", class: "tg pri", onclick: () => { heat = true; task("heat"); say(); } }, "베네딕트 시험관을 80~90 °C 물에 담그기"))); side(box, left, info); say();
  },
  /* 6-2 소화계 */
  gut(box, task) {
    const O = [["입", 0, "이로 음식물을 씹어 잘게 부수고 침과 섞어요.", [180, 52, 22, 12]], ["식도", 0, "입과 위를 잇는 관으로 음식물을 위로 내려 보내요.", [182, 110, 7, 48]], ["위", 0, "주머니 모양. 음식물을 잠시 저장하고 위액을 분비해요.", [222, 182, 38, 26]], ["작은창자", 0, "가늘고 긴 관. 음식물을 소화하고 영양소와 물을 흡수해요.", [180, 262, 46, 30]], ["큰창자", 0, "작은창자보다 굵은 관. 남은 물질에서 물을 흡수해요.", [180, 258, 74, 50]], ["항문", 0, "남은 물질을 몸 밖으로 내보내요.", [180, 334, 8, 8]], ["침샘", 1, "침을 만들어 입안으로 분비해요.", [148, 66, 9, 7]], ["간", 1, "쓸개즙을 만들어 쓸개로 보내요.", [150, 168, 46, 24]], ["쓸개", 1, "저장된 쓸개즙을 작은창자로 분비해요.", [160, 196, 9, 8]], ["이자", 1, "이자액을 만들어 작은창자로 분비해요.", [205, 214, 30, 8]]];
    let on = -1; const seen = new Set(), info = note(), left = h("div");
    const sv = stage(left, 360, 360, c => {
      c.fillStyle = "#ffe3d0"; c.beginPath(); c.ellipse(180, 52, 46, 46, 0, 0, 7); c.fill(); rr(c, 95, 96, 170, 250, 50, "#ffe3d0");
      O.forEach(([n, g, , [x, y, a, b]], i) => { if (n === "큰창자") { c.strokeStyle = i === on ? "#ff5a5f" : "#c98a5a"; c.lineWidth = 12; c.beginPath(); c.ellipse(x, y, a, b, 0, Math.PI * .75, Math.PI * 2.25); c.stroke(); return; } c.beginPath(); c.ellipse(x, y, a, b, 0, 0, 7); c.fillStyle = i === on ? "#ff5a5f" : g ? "#b07ad9" : n === "작은창자" ? "#f2b48a" : "#e88a6a"; c.fill(); });
      if (on >= 0) { const [n, , , [x, y]] = O[on]; T(c, n, x + 60 > 330 ? x - 60 : x + 60, y - 18, 18, RD); }
    });
    sv.cv.style.maxWidth = "300px";
    const bs = O.map(([n, g], i) => h("button", { type: "button", class: "bin", onclick: () => { on = i; seen.add(i); bs.forEach((b, k) => b.classList.toggle("on", k === i)); if ([0, 1, 2, 3, 4, 5].every(k => seen.has(k))) task("tube"); if ([6, 7, 8, 9].every(k => seen.has(k))) task("gland"); say(); } }, n));
    const say = () => { info.innerHTML = on < 0 ? `<b class="t">기관을 눌러 보세요</b><p>소화계는 음식물이 지나가는 <b>소화관</b>과 소화액을 만들거나 분비하는 <b>소화샘</b>으로 이루어져 있어요.</p>` : `<b class="t">${O[on][0]} <small>(${O[on][1] ? "소화샘" : "소화관"})</small></b><p>${O[on][2]}</p>`; };
    left.append(h("div", { class: "controls" }, h("b", {}, "소화관"), bs.slice(0, 6)), h("div", { class: "controls" }, h("b", {}, "소화샘"), bs.slice(6)));
    side(box, left, info); say();
  },
  /* 6-3 침의 소화 작용 */
  enzyme(box, task) {
    let st = 0, t = 0; const info = note(), left = h("div");
    stage(left, 720, 300, (c, dt) => {
      if (st === 1) { t = Math.min(1, t + dt / 2.5); if (t >= 1) { st = 2; task("warm"); say(); } }
      rr(c, 40, 160, 640, 120, 16, st >= 1 ? "rgba(255,160,120,.25)" : "rgba(170,220,255,.3)", "#8a86a8"); T(c, st >= 1 ? `35~40 °C 물 · ${st === 1 ? Math.round(t * 10) : 10}분` : "물", 360, 268, 16);
      [["(가) 녹말 용액 + 증류수", 0], ["(나) 녹말 용액 + 침 희석액", 1]].forEach(([n, i]) => {
        const x = 200 + i * 320; T(c, n, x, 26, 17); rr(c, x - 24, 50, 48, 170, 20, "rgba(255,255,255,.7)", "#8a86a8");
        const col = st >= 4 ? (i ? "#e0662a" : "#5b8be0") : "#eef3f7"; rr(c, x - 20, 120, 40, 96, 16, col);
        if (i && st >= 1) for (let k = 0; k < 6; k++) { const a = k * 1.05 + t * 6; dot(c, x + Math.cos(a) * 10, 168 + Math.sin(a) * 30, 3, "#ffb703"); }
        if (st >= 3) { dot(c, x + 90, 120, 26, i ? "#c9a64a" : "#2b2f8a", "#b8bccb"); T(c, "녹말 검출", x + 90, 158, 13, G); }
      });
    });
    const tb = h("table", { class: "mt" }), say = () => {
      tb.innerHTML = `<tr><th></th><th>(가) 증류수</th><th>(나) 침</th></tr><tr><th>녹말 검출</th><td>${st >= 3 ? "청람색 ○" : ""}</td><td>${st >= 3 ? "변화 없음 ×" : ""}</td></tr><tr><th>당 검출</th><td>${st >= 4 ? "변화 없음 ×" : ""}</td><td>${st >= 4 ? "황적색 ○" : ""}</td></tr>`;
      info.innerHTML = `<b class="t">${["먼저 두 시험관을 데워요", "데우는 중…", "용액을 조금씩 덜어 검출해요", "이제 당을 검출해요", "결과 정리"][st]}</b><p>${st >= 4 ? "(나)에서만 녹말이 사라지고 <b>당(엿당)</b>이 생겼어요. 침 속 소화효소 <b>아밀레이스</b>가 녹말을 엿당으로 분해했어요." : "다르게 한 조건은 <b>침을 넣었는지</b>예요."}</p>`; info.append(tb);
    };
    left.append(h("div", { class: "controls" }, h("button", { type: "button", class: "tg", onclick: () => { if (st === 0) { st = 1; t = 0; say(); } } }, "① 물에 10분 담그기"), h("button", { type: "button", class: "tg", onclick: () => { if (st >= 2) { st = Math.max(st, 3); task("iodine"); say(); } } }, "② 녹말 검출 용액"), h("button", { type: "button", class: "tg pri", onclick: () => { if (st >= 3) { st = 4; task("sugar"); say(); } } }, "③ 베네딕트 + 가열")));
    side(box, left, info); say();
  },
  /* 6-4 심장 */
  heart(box, task) {
    let ph = 0, t = 0; const info = note(), left = h("div");
    const CH = { ra: [150, 90, "우심방"], la: [330, 90, "좌심방"], rv: [150, 210, "우심실"], lv: [330, 210, "좌심실"] };
    stage(left, 480, 330, (c, dt) => {
      t = (t + dt * 1.2) % 1;
      ln(c, [[150, 20], [150, 50]], BL, 16); T(c, "대정맥", 150, 12, 14, BL); ln(c, [[330, 20], [330, 50]], RD, 16); T(c, "폐정맥", 330, 12, 14, RD);
      ln(c, [[195, 250], [240, 300], [400, 312]], BL, 14); T(c, "폐동맥 →폐", 430, 312, 13, BL); ln(c, [[285, 250], [250, 290], [60, 312]], RD, 14); T(c, "←대동맥 온몸", 40, 300, 13, RD);
      Object.entries(CH).forEach(([k, [x, y, n]]) => { const v = k[1] === "v", squeeze = (ph === 0 && !v) || (ph === 1 && v) ? 1 - .12 * Math.sin(t * Math.PI) : 1; c.save(); c.translate(x, y); c.scale(squeeze, squeeze); rr(c, -70, v ? -52 : -40, 140, v ? 104 : 80, 26, k[0] === "r" ? "#9fb8e8" : "#f2a3a6", INK, 3); c.restore(); T(c, n, x, y, 18); });
      [[150, 150], [330, 150]].forEach(([x, y]) => { const open = ph === 0; ln(c, open ? [[x - 30, y], [x - 20, y + 16]] : [[x - 30, y], [x, y]], OK, 5); ln(c, open ? [[x + 30, y], [x + 20, y + 16]] : [[x + 30, y], [x, y]], OK, 5); });
      [[195, 250], [285, 250]].forEach(([x, y]) => { const open = ph === 1; dot(c, x, y, 7, open ? "#c9f5d8" : OK); });
      const flow = ph === 0 ? [[150, 110, 150, 190, BL], [330, 110, 330, 190, RD]] : [[180, 230, 220, 280, BL], [300, 230, 260, 280, RD]]; flow.forEach(([a, b, x2, y2, col]) => { const k = t; arrow(c, a, b, a + (x2 - a) * (.3 + k * .7), b + (y2 - b) * (.3 + k * .7), col, 5); });
      T(c, "판막", 240, 150, 14, OK);
    });
    const say = () => { info.innerHTML = ph === 0 ? `<b class="t">심방이 수축할 때</b><p>심방과 심실 사이의 <b>판막이 열리고</b> 혈액이 심방 → 심실로 이동해요.</p><p>심실과 동맥 사이의 판막은 닫혀 있어요.</p>` : `<b class="t">심실이 수축할 때</b><p>심실과 동맥 사이의 <b>판막이 열려</b> 우심실 → 폐동맥, 좌심실 → 대동맥으로 혈액이 나가요.</p><p>심방과 심실 사이 판막은 <b>닫혀</b> 혈액이 거꾸로 흐르지 않아요.</p>`; };
    left.append(seg([[0, "심방 수축"], [1, "심실 수축"]], 0, v => { ph = v; task(v ? "v" : "a"); say(); })); side(box, left, info); say(); task("a");
  },
  /* 6-5 혈액 순환 경로 */
  circ(box, task) {
    const N = { lv: [300, 180], aorta: [430, 230], body: [520, 300], vc: [120, 250], ra: [180, 140], rv: [180, 190], pa: [160, 70], lung: [240, 30], pv: [330, 70], la: [300, 130] };
    const ROUTE = { body: ["lv", "aorta", "body", "vc", "ra"], lung: ["rv", "pa", "lung", "pv", "la"] }, NAME = { lv: "좌심실", aorta: "대동맥", body: "온몸의 모세혈관", vc: "대정맥", ra: "우심방", rv: "우심실", pa: "폐동맥", lung: "폐의 모세혈관", pv: "폐정맥", la: "좌심방" };
    let r = "body", s = 0; const info = note(), left = h("div");
    stage(left, 600, 340, (c, dt) => {
      const path = ROUTE[r], seg_ = Math.floor(s), f = s - seg_; s += dt * 1.1; if (s >= path.length - 1) { s = 0; task(r); }
      rr(c, 200, 10, 90, 40, 16, "#ffd0d6"); T(c, "폐", 245, 30, 16); rr(c, 470, 280, 120, 50, 16, "#ffe9c7"); T(c, "온몸", 530, 305, 16);
      ["ra", "rv", "la", "lv"].forEach(k => { const [x, y] = N[k]; rr(c, x - 42, y - 22, 84, 44, 12, k[0] === "r" ? "#cfdcf5" : "#f9cfd1", INK, 2); T(c, NAME[k], x, y, 15); });
      [["body", ROUTE.body], ["lung", ROUTE.lung]].forEach(([k, p]) => ln(c, p.map(q => N[q]), k === r ? "#232046" : "#dad7ea", k === r ? 3 : 2, [6, 6]));
      const a = N[path[seg_]], b = N[path[Math.min(seg_ + 1, path.length - 1)]], x = a[0] + (b[0] - a[0]) * f, y = a[1] + (b[1] - a[1]) * f;
      const rich = r === "body" ? seg_ < 2 : seg_ >= 2; dot(c, x, y, 11, rich ? "#e01e37" : "#7a1f3d", "#fff"); T(c, NAME[path[seg_]], x + 16, y - 16, 15, INK, "left");
      T(c, "● 산소가 많은 혈액", 20, 316, 14, "#e01e37", "left"); T(c, "● 산소가 적은 혈액", 20, 334, 14, "#7a1f3d", "left");
    });
    const say = () => { info.innerHTML = r === "body" ? `<b class="t">온몸순환</b><p>좌심실 → 대동맥 → <b>온몸의 모세혈관</b> → 대정맥 → 우심방</p><p>온몸의 세포에 <b>산소와 영양소</b>를 주고, <b>이산화 탄소와 노폐물</b>을 받아요.</p>` : `<b class="t">허파순환</b><p>우심실 → 폐동맥 → <b>폐의 모세혈관</b> → 폐정맥 → 좌심방</p><p>폐에서 <b>이산화 탄소</b>를 내보내고 <b>산소</b>를 받아요.</p>`; };
    left.append(seg([["body", "온몸순환"], ["lung", "허파순환"]], r, v => { r = v; s = 0; say(); })); side(box, left, info); say();
  },
  /* 6-6 호흡운동 모형 */
  breath(box, task) {
    let d = 0, cur = 0, last = 0; const info = note(), left = h("div");
    stage(left, 480, 330, (c, dt) => {
      const prev = cur; cur += (d - cur) * Math.min(1, dt * 4); const v = cur - prev;
      rr(c, 140, 40, 200, 230, 30, "rgba(200,230,255,.35)", "#8a86a8", 4); ln(c, [[240, 10], [240, 110]], "#8a86a8", 6); T(c, "빨대(숨관)", 290, 22, 14, G, "left");
      const R = 34 + cur * 22; c.beginPath(); c.ellipse(240, 140, R * .9, R, 0, 0, 7); c.fillStyle = "#ff9aa2"; c.fill(); T(c, "고무풍선(폐)", 240, 140, 14);
      c.beginPath(); c.moveTo(150, 270); c.quadraticCurveTo(240, 270 + cur * 70, 330, 270); c.strokeStyle = "#e0a800"; c.lineWidth = 8; c.stroke(); dot(c, 240, 270 + cur * 35, 8, "#888"); ln(c, [[240, 270 + cur * 35], [240, 300 + cur * 35]], "#888", 4); T(c, "고무 막(가로막)", 240, 318, 14, G);
      if (Math.abs(v) > .002) arrow(c, 240, v > 0 ? 0 : 60, 240, v > 0 ? 50 : 6, v > 0 ? BL : RD, 5);
      T(c, cur > .5 ? "공기가 들어와요" : cur < -.5 ? "공기가 나가요" : "", 400, 150, 16, cur > 0 ? BL : RD);
      if (cur > .9 && last !== 1) { last = 1; task("in"); say(); } if (cur < -.9 && last !== -1) { last = -1; task("out"); say(); }
    });
    const say = () => { const i = d > 0; info.innerHTML = `<b class="t">${d === 0 ? "고무 막을 움직여 보세요" : i ? "숨을 들이쉴 때" : "숨을 내쉴 때"}</b>` + (d === 0 ? "<p>고무 막은 <b>가로막</b>, 페트병 속 공간은 <b>흉강</b>, 고무풍선은 <b>폐</b>를 나타내요.</p>" : `<table class="mt"><tr><th>가로막</th><td>${i ? "내려감" : "올라감"}</td></tr><tr><th>갈비뼈</th><td>${i ? "올라감" : "내려감"}</td></tr><tr><th>흉강·폐의 부피</th><td>${i ? "커짐" : "작아짐"}</td></tr><tr><th>폐의 압력</th><td>${i ? "낮아짐" : "높아짐"}</td></tr><tr><th>공기 이동</th><td>${i ? "몸 밖 → 폐" : "폐 → 몸 밖"}</td></tr></table>`); };
    left.append(seg([[-1, "고무 막 밀어 올리기"], [1, "고무 막 잡아당기기"]], null, v => { d = v; say(); })); side(box, left, info); say();
  },
  /* 6-7 오줌 생성 (네프론) */
  kidney(box, task) {
    const K = [["혈구", "#e01e37", 9, 0, 0, 0], ["단백질", "#7b3fa8", 8, 0, 0, 0], ["포도당", "#e0a800", 6, 1, 1, 0], ["아미노산", "#2fa84f", 6, 1, 1, 0], ["물", "#5aa9e6", 5, 1, .9, 0], ["무기염류", "#8a86a8", 5, 1, .6, 0], ["요소", "#ff8c00", 6, 1, .4, 1]];
    const R = rnd(11), ps = []; K.forEach((k, i) => { for (let j = 0; j < (i === 4 ? 10 : 5); j++) ps.push({ i, x: 100 + R() * 40, y: 110 + R() * 40, tx: 0, ty: 0, z: "blood", r: R() }); });
    let st = 0; const info = note(), left = h("div");
    const place = () => ps.forEach(p => { const k = K[p.i]; let z = "blood"; if (st >= 1 && k[3]) z = "tube"; if (st >= 2 && z === "tube" && p.r < k[4]) z = "cap"; if (st >= 3 && z === "blood" && k[5]) z = "tube"; p.z = z; const Z = { blood: [60 + p.r * 110, 90 + R() * 80], tube: [270 + R() * 280, 236 + R() * 26], cap: [270 + R() * 280, 172 + R() * 26] }[z]; [p.tx, p.ty] = Z; });
    place(); ps.forEach(p => { p.x = p.tx; p.y = p.ty; });
    stage(left, 600, 300, (c, dt) => {
      rr(c, 40, 70, 160, 120, 60, "rgba(255,200,200,.35)", RD, 3); T(c, "토리(모세혈관 뭉치)", 120, 60, 13, RD); c.beginPath(); c.arc(120, 130, 86, -1.2, 4.3); c.strokeStyle = "#8a86a8"; c.lineWidth = 4; c.stroke(); T(c, "보먼주머니", 120, 230, 13, G);
      rr(c, 250, 222, 320, 50, 20, "rgba(255,240,200,.6)", "#c9a64a", 3); T(c, "세뇨관 → 오줌", 560, 286, 13, "#a07a00", "right"); rr(c, 250, 160, 320, 48, 20, "rgba(255,200,200,.35)", RD, 3); T(c, "모세혈관", 560, 150, 13, RD, "right");
      ps.forEach(p => { p.x += (p.tx - p.x) * Math.min(1, dt * 2); p.y += (p.ty - p.y) * Math.min(1, dt * 2); dot(c, p.x, p.y, K[p.i][2], K[p.i][1]); });
      K.forEach(([n, col], i) => { dot(c, 20 + i * 82, 16, 6, col); T(c, n, 30 + i * 82, 16, 13, INK, "left"); });
    });
    const say = () => { const u = K.map((k, i) => [k[0], ps.filter(p => p.i === i && p.z === "tube").length]).filter(x => x[1]); info.innerHTML = `<b class="t">${["콩팥으로 들어온 혈액", "① 여과", "② 재흡수", "③ 분비"][st]}</b><p>${["단추를 차례로 눌러 보세요.", "토리에서 보먼주머니로 <b>크기가 작은 물질</b>(물, 포도당, 아미노산, 무기염류, 요소)이 빠져나가요. 혈구·단백질은 남아요.", "세뇨관에서 모세혈관으로 <b>포도당·아미노산은 모두</b>, 물과 무기염류는 대부분 다시 흡수돼요.", "혈액에 남은 노폐물이 모세혈관에서 세뇨관으로 <b>분비</b>돼요."][st]}</p>${st ? "<p>세뇨관에 남은 것: " + u.map(x => `${x[0]} ${x[1]}`).join(", ") + "</p>" : ""}`; };
    left.append(h("div", { class: "controls" }, ...[["① 여과", 1, "f"], ["② 재흡수", 2, "r"], ["③ 분비", 3, "s"]].map(([t, v, k]) => h("button", { type: "button", class: "tg", onclick: () => { if (v > st + 1) return; st = v; place(); task(k); say(); } }, t)), h("button", { type: "button", class: "tg", onclick: () => { st = 0; place(); say(); } }, "처음으로")));
    side(box, left, info); say();
  },
  /* 6-8 세포호흡과 운동 */
  cellresp(box, task) {
    let lv = 0, t = 0; const Lv = [["휴식", 70, 16, 36.5], ["걷기", 95, 22, 36.7], ["달리기", 140, 34, 37.2], ["전력 질주", 175, 46, 37.6]], ps = [], R = rnd(3), info = note(), left = h("div");
    stage(left, 600, 300, (c, dt) => {
      t += dt; const k = (lv + 1) / 4; if (R() < dt * 8 * k) ps.push({ x: 20, y: 120 + R() * 60, k: R() < .5 ? "g" : "o", s: 0 });
      c.beginPath(); c.ellipse(300, 150, 150, 100, 0, 0, 7); c.fillStyle = "#fff2e0"; c.fill(); c.strokeStyle = "#e0a800"; c.lineWidth = 3; c.stroke(); T(c, "세포", 300, 66, 16, "#a07a00");
      c.beginPath(); c.ellipse(300, 160, 60, 32, 0, 0, 7); c.fillStyle = "#ffb3a7"; c.fill(); T(c, "마이토콘드리아", 300, 160, 13);
      for (let i = ps.length - 1; i >= 0; i--) { const p = ps[i]; p.s += dt; if (p.s < 1.4) { p.x += (300 - p.x) * dt * 1.8; p.y += (160 - p.y) * dt * 1.8; dot(c, p.x, p.y, 6, p.k === "g" ? "#e0a800" : BL); } else if (p.s < 3) { p.x += dt * 170; p.y += (p.k === "g" ? -1 : 1) * dt * 30; dot(c, p.x, p.y, 5, p.k === "g" ? "#999" : "#5aa9e6"); } else ps.splice(i, 1); }
      for (let i = 0; i < 3 + lv * 3; i++) { const a = t * 3 + i * 2.1; T(c, "⚡", 300 + Math.cos(a) * (70 + i * 3), 160 + Math.sin(a) * 44, 16, "#ff8c00"); }
      [["#e0a800", "포도당"], [BL, "산소"], ["#999", "이산화 탄소"], ["#5aa9e6", "물"]].forEach(([col, n], i) => { dot(c, 30 + i * 120, 285, 6, col); T(c, n, 42 + i * 120, 285, 14, INK, "left"); });
      if (t > 1.5) task(lv === 0 ? "rest" : lv >= 2 ? "run" : "walk");
    });
    const say = () => { const [n, hr, br, bt] = Lv[lv]; info.innerHTML = `<b class="t">${n}</b><table class="mt"><tr><th>심박수</th><td>분당 ${hr}회</td></tr><tr><th>호흡수</th><td>분당 ${br}회</td></tr><tr><th>체온</th><td>${bt} °C</td></tr></table><p>${lv ? "에너지가 많이 필요해 <b>세포호흡이 활발</b>해져요. 산소와 영양소를 더 빨리 공급하려고 심장이 빨리 뛰고 숨이 가빠져요. 에너지 일부는 <b>열</b>이 되어 체온이 올라가요." : "포도당 + 산소 → 이산화 탄소 + 물 + <b>에너지</b>"}</p>`; };
    left.append(seg(Lv.map((x, i) => [i, x[0]]), 0, v => { lv = v; t = 0; say(); })); side(box, left, info); say();
  },
  /* 8-1 연주 시차 */
  parallax(box, task) {
    let e = 1, dist = 2, seen = {}; const info = note(), left = h("div"), R = rnd(5), BG = Array.from({ length: 40 }, () => [R() * 700, R() * 40, 1 + R() * 2]);
    stage(left, 700, 360, c => {
      c.fillStyle = "#0e1230"; c.fillRect(0, 0, 700, 360); BG.forEach(([x, y, r]) => dot(c, x, y + 6, r, "#cfd6ff"));
      const sun = [350, 300], ex = sun[0] + e * 110, sy = 300 - [0, 90, 150, 200][dist]; c.strokeStyle = "#4a5280"; c.setLineDash([5, 6]); c.beginPath(); c.ellipse(350, 300, 110, 28, 0, 0, 7); c.stroke(); c.setLineDash([]);
      dot(c, 350, 300, 16, "#ffc400"); T(c, "태양", 350, 330, 13, "#ffe08a"); dot(c, ex, 300, 9, "#4aa3ff"); T(c, e > 0 ? "E₂" : "E₁", ex, 324, 14, "#bcd6ff");
      dot(c, 350, sy, 7, "#ffd58a"); T(c, "별 S", 366, sy, 14, "#ffd58a", "left");
      const tx = ex + (350 - ex) * (300 - 20) / (300 - sy); ln(c, [[ex, 300], [tx, 20]], "#9ad1ff", 2); dot(c, tx, 20, 6, "#ffd58a"); T(c, e > 0 ? "S₂" : "S₁", tx, 44, 14, "#ffd58a");
      const p = Math.atan(110 / (300 - sy)) * 180 / Math.PI; T(c, `연주 시차 (모형) 약 ${p.toFixed(1)}°`, 20, 340, 15, "#fff", "left"); T(c, "멀리 있는 별들(배경)", 690, 64, 13, "#9aa3d0", "right");
    });
    const say = () => { info.innerHTML = `<b class="t">${["", "가까운", "중간 거리의", "먼"][dist]} 별 S</b><p>지구가 E₁과 E₂에 있을 때 별 S가 배경 별에 대해 <b>다른 위치</b>에 보여요. 이 시차의 <b>절반</b>이 연주 시차예요.</p><p>별이 <b>멀수록</b> 연주 시차가 <b>작아져요</b>.</p><p class="hint">실제 연주 시차는 1″(초)보다 작을 만큼 아주 작아요. 모형에서는 크게 나타냈어요.</p>`; };
    const mark = () => { seen[dist + "_" + e] = 1; if (seen[dist + "_-1"] && seen[dist + "_1"]) task("both"); if (Object.keys(seen).map(k => k[0]).filter((v, i, a) => a.indexOf(v) === i).length >= 2) task("far"); };
    left.append(seg([[-1, "지구 E₁ (1월)"], [1, "지구 E₂ (7월)"]], 1, v => { e = v; mark(); }), seg([[1, "가까운 별"], [2, "중간 별"], [3, "먼 별"]], 2, v => { dist = v; mark(); say(); })); mark(); side(box, left, info); say();
  },
  /* 8-2 빛의 밝기와 거리 */
  lux(box, task) {
    let d = 20; const rec = {}, info = note(), left = h("div"), I = x => Math.round(3600 * (20 / x) ** 2);
    stage(left, 700, 260, c => {
      ln(c, [[60, 200], [680, 200]], "#c9a64a", 10); for (let x = 0; x <= 60; x += 10) { T(c, x + "", 80 + x * 9.5, 222, 13, G); }
      dot(c, 80, 170, 18, "#ffe066", "#e0a800"); c.fillStyle = "rgba(255,230,120,.25)"; c.beginPath(); c.moveTo(80, 170); c.lineTo(680, 60); c.lineTo(680, 280 - 0); c.fill();
      const x = 80 + d * 9.5; rr(c, x - 14, 120, 28, 60, 6, "#232046"); T(c, "센서", x, 106, 14);
      rr(c, 470, 20, 200, 60, 12, "#dff6ff", INK); T(c, `빛의 세기 ${I(d)} lx`, 570, 50, 20);
      [1, 2, 3].forEach(n => { const s = 10, x0 = 120 + n * 90 - n * s / 2; for (let i = 0; i < n; i++) for (let j = 0; j < n; j++) rr(c, x0 + i * s, 20 + j * s, s - 1, s - 1, 1, `rgba(255,200,0,${.9 / (n * n) + .05})`); T(c, `${n}배 거리: ${n * n}칸`, 120 + n * 90, 20 + n * s + 14, 12, G); });
    });
    const tb = h("table", { class: "mt" }), say = () => { const ds = [20, 40, 60]; tb.innerHTML = `<tr><th>거리(cm)</th>${ds.map(x => `<th>${x}</th>`).join("")}</tr><tr><th>빛의 세기(lx)</th>${ds.map(x => `<td>${rec[x] ?? ""}</td>`).join("")}</tr><tr><th>세기의 비</th>${ds.map(x => `<td>${rec[x] ? ["1", "1/4", "1/9"][ds.indexOf(x)] : ""}</td>`).join("")}</tr>`; info.innerHTML = `<b class="t">거리가 2배, 3배가 되면?</b><p>빛이 사방으로 퍼지며 더 넓은 면적(4칸, 9칸)을 비추므로, 같은 면적이 받는 빛의 밝기는 <b>1/4배, 1/9배</b>가 돼요.</p>`; info.append(tb); };
    left.append(seg([[20, "20 cm"], [40, "40 cm"], [60, "60 cm"]], 20, v => { d = v; }), h("div", { class: "controls" }, h("button", { type: "button", class: "tg pri", onclick: () => { rec[d] = I(d); if ([20, 40, 60].every(x => rec[x])) task("all"); say(); } }, "표에 기록"))); side(box, left, info); say();
  },
  /* 8-3 별의 등급 */
  mag(box, task) {
    const S = [["(가)", -1.5, 1.4], ["(나)", 1.1, 1.1], ["(다)", .4, -6.0]]; let k = 0, at10 = false; const done = new Set(), info = note(), left = h("div");
    stage(left, 700, 300, c => {
      c.fillStyle = "#0e1230"; c.fillRect(0, 0, 700, 300); const [n, m, M] = S[k], d = 10 * 10 ** ((m - M + 5) / 5) / 10, X = v => 60 + Math.log10(v) / 3 * 580;
      ln(c, [[60, 250], [640, 250]], "#9aa3d0", 2); [1, 10, 100, 1000].forEach(v => { ln(c, [[X(v), 244], [X(v), 256]], "#9aa3d0", 2); T(c, v + " pc", X(v), 272, 13, v === 10 ? "#ffd58a" : "#9aa3d0"); });
      dot(c, 30, 250, 10, "#4aa3ff"); T(c, "지구", 30, 272, 12, "#bcd6ff"); const x = X(at10 ? 10 : d), mm = at10 ? M : m, r = Math.max(3, 26 - mm * 3.2);
      const g = c.createRadialGradient(x, 140, 1, x, 140, r * 3); g.addColorStop(0, "rgba(255,250,220,1)"); g.addColorStop(1, "rgba(255,250,220,0)"); c.fillStyle = g; c.beginPath(); c.arc(x, 140, r * 3, 0, 7); c.fill();
      T(c, `별 ${n}`, x, 60, 17, "#fff"); T(c, at10 ? `10 pc에서 보이는 밝기: 절대 등급 ${M}` : `지금 보이는 밝기: 겉보기 등급 ${m}`, 350, 24, 17, "#ffd58a");
    });
    const say = () => { const [n, m, M] = S[k]; info.innerHTML = `<b class="t">별 ${n}</b><table class="mt"><tr><th>겉보기 등급</th><td>${m}</td></tr><tr><th>절대 등급</th><td>${M}</td></tr></table><p>${m < M ? "겉보기 등급이 절대 등급보다 <b>작아요</b> → 10 pc보다 <b>가까이</b> 있어요." : m === M ? "두 등급이 <b>같아요</b> → 꼭 <b>10 pc</b>에 있어요." : "겉보기 등급이 절대 등급보다 <b>커요</b> → 10 pc보다 <b>멀리</b> 있어요."}</p><p class="hint">등급이 작을수록 밝고, 1등급 차이는 약 2.5배 밝기 차이예요.</p>`; };
    left.append(seg(S.map((s, i) => [i, "별 " + s[0]]), 0, v => { k = v; at10 = false; tb.querySelectorAll("button").forEach((b, i) => b.classList.toggle("on", i === 0)); say(); }), (() => { const s = seg([[false, "지금 거리"], [true, "10 pc로 옮기기"]], false, v => { at10 = v; if (v) { done.add(k); if (done.size >= 3) task("all"); task("s" + k); } }); return s; })());
    const tb = left.lastChild; side(box, left, info); say();
  },
  /* 8-4 별의 색과 표면 온도 */
  starcolor(box, task) {
    let T0 = 5800; const CS = [[3000, "#ff6b3d", "적색"], [4500, "#ffa94d", "주황색"], [5800, "#ffe680", "황색"], [7500, "#fff4d6", "황백색"], [10000, "#ffffff", "백색"], [15000, "#cfe0ff", "청백색"], [30000, "#9bb8ff", "청색"]];
    const pick = t => CS.reduce((a, b) => Math.abs(Math.log(b[0] / t)) < Math.abs(Math.log(a[0] / t)) ? b : a), info = note(), left = h("div");
    stage(left, 700, 280, c => {
      c.fillStyle = "#0e1230"; c.fillRect(0, 0, 700, 280); const [, col, n] = pick(T0); const g = c.createRadialGradient(220, 130, 4, 220, 130, 120); g.addColorStop(0, "#fff"); g.addColorStop(.25, col); g.addColorStop(1, "rgba(0,0,0,0)"); c.fillStyle = g; c.beginPath(); c.arc(220, 130, 120, 0, 7); c.fill();
      T(c, `${n} 별`, 220, 262, 20, col); T(c, `표면 온도 약 ${T0.toLocaleString()} K`, 520, 60, 18, "#fff");
      CS.forEach(([t, cc, nn], i) => { dot(c, 420 + i * 40, 140, 14, cc); T(c, nn, 420 + i * 40, 170, 11, "#cfd6ff"); }); T(c, "← 낮다   표면 온도   높다 →", 540, 200, 14, "#9aa3d0");
    });
    const say = () => { const n = pick(T0)[2]; info.innerHTML = `<b class="t">${n}을 띠는 별</b><p>별의 색이 다른 까닭은 <b>표면 온도</b>가 다르기 때문이에요. <b>청색</b> 별은 표면 온도가 높고, <b>적색</b> 별은 낮아요.</p><p>${n === "적색" ? "예: 베텔게우스" : n === "황색" ? "예: 태양" : n === "백색" ? "예: 시리우스" : n === "청백색" ? "예: 리겔" : ""}</p>`; };
    left.append(h("div", { class: "controls" }, range("표면 온도", 3000, 30000, 500, 5800, " K", v => { T0 = v; const n = pick(v)[2]; if (n === "적색") task("red"); if (n === "황색") task("yellow"); if (n === "청색") task("blue"); say(); })), h("p", { class: "hint" }, "K(켈빈)은 온도의 단위예요.")); side(box, left, info); say();
  },
  /* 8-5 우리은하 */
  galaxy(box, task) {
    let v = "top", sun = false; const R = rnd(13), arms = Array.from({ length: 900 }, () => { const a = R() * 2, arm = Math.floor(R() * 4), th = arm * Math.PI / 2 + a * 3.2, r = 30 + a * 120; return [th + (R() - .5) * .4, r + (R() - .5) * 18, R()]; }), info = note(), left = h("div");
    stage(left, 640, 340, c => {
      c.fillStyle = "#0e1230"; c.fillRect(0, 0, 640, 340); const cx = 320, cy = 170;
      if (v === "top") { arms.forEach(([t, r, b]) => dot(c, cx + Math.cos(t) * r, cy + Math.sin(t) * r * .95, 1.2 + b, `rgba(200,215,255,${.3 + b * .5})`)); c.save(); c.translate(cx, cy); c.rotate(.5); rr(c, -60, -16, 120, 32, 16, "rgba(255,230,170,.85)"); c.restore(); T(c, "막대 모양 중심부", cx, cy + 48, 14, "#ffe08a"); T(c, "나선팔", cx + 150, cy - 110, 14, "#cfd6ff"); }
      else { const g = c.createRadialGradient(cx, cy, 2, cx, cy, 60); g.addColorStop(0, "rgba(255,235,190,1)"); g.addColorStop(1, "rgba(255,235,190,0)"); c.fillStyle = g; c.beginPath(); c.ellipse(cx, cy, 70, 34, 0, 0, 7); c.fill(); c.fillStyle = "rgba(200,215,255,.55)"; c.beginPath(); c.ellipse(cx, cy, 300, 10, 0, 0, 7); c.fill(); T(c, "중심부가 약간 부푼 원반 모양", cx, cy + 60, 14, "#ffe08a"); }
      ln(c, [[20, 320], [620, 320]], "#9aa3d0", 2); T(c, "지름 약 30000 pc", 320, 306, 14, "#cfd6ff");
      if (sun) { const x = cx + 170, y = v === "top" ? cy + 20 : cy; dot(c, x, y, 7, "#ffc400", "#fff"); T(c, "태양계 (중심에서 약 8500 pc)", x, y - 18, 14, "#ffc400"); ln(c, [[cx, y + 6], [x, y + 6]], "#ffc400", 2, [4, 4]); }
    });
    const say = () => { info.innerHTML = `<b class="t">${v === "top" ? "위에서 본 우리은하" : "옆에서 본 우리은하"}</b><p>${v === "top" ? "중심부에 별이 <b>막대 모양</b>으로 모여 있고, 주위에 <b>나선팔</b>이 있어요." : "중심부가 약간 부풀어 있는 <b>원반 모양</b>이에요."}</p>${sun ? "<p>태양계는 중심에서 약 <b>8500 pc</b> 떨어진 <b>나선팔</b>에 있어요. 그래서 지구에서 우리은하의 일부가 띠 모양의 <b>은하수</b>로 보여요.</p>" : ""}`; };
    left.append(seg([["top", "위에서 보기"], ["side", "옆에서 보기"]], v, x => { v = x; task(x); say(); }), h("div", { class: "controls" }, h("button", { type: "button", class: "tg pri", onclick: () => { sun = !sun; if (sun) task("sun"); say(); } }, "태양계 위치 보기"))); task("top"); side(box, left, info); say();
  },
  /* 8-6 성운과 성단 */
  nebula(box, task) {
    const TY = [["em", "방출 성운", "성간 물질이 주변 별빛을 흡수해 가열되며 <b>스스로 빛을 내요</b>. 붉은빛이 많아요. 예: 오리온대성운"], ["re", "반사 성운", "주변의 별빛을 <b>반사</b>하여 밝게 보여요. 푸른빛이 많아요."], ["dk", "암흑 성운", "뒤쪽에서 오는 별빛을 <b>가로막아</b> 어둡게 보여요. 예: 말머리성운"], ["op", "산개 성단", "수십~수만 개의 별이 <b>일정한 모양 없이 엉성하게</b> 모여 있어요. 예: 플레이아데스성단"], ["gl", "구상 성단", "수만~수십만 개의 별이 <b>공 모양으로 빽빽하게</b> 모여 있어요."]];
    let k = 0; const seen = new Set([0]), info = note(), left = h("div");
    stage(left, 600, 320, c => {
      const R = rnd(21 + k); c.fillStyle = "#070a1c"; c.fillRect(0, 0, 600, 320); const t = TY[k][0];
      if (t !== "dk") for (let i = 0; i < 120; i++) dot(c, R() * 600, R() * 320, R() * 1.4, "#aab3e0");
      const cloud = (col, n, cx, cy, s) => { for (let i = 0; i < n; i++) { const x = cx + (R() - .5) * s * 2, y = cy + (R() - .5) * s * 1.3, g = c.createRadialGradient(x, y, 1, x, y, 40); g.addColorStop(0, col); g.addColorStop(1, "rgba(0,0,0,0)"); c.fillStyle = g; c.beginPath(); c.arc(x, y, 40, 0, 7); c.fill(); } };
      if (t === "em") { cloud("rgba(255,80,110,.25)", 70, 300, 160, 170); dot(c, 300, 160, 4, "#fff"); }
      if (t === "re") { cloud("rgba(110,160,255,.22)", 60, 300, 160, 150); dot(c, 300, 160, 7, "#fff"); dot(c, 270, 150, 4, "#fff"); }
      if (t === "dk") { cloud("rgba(255,90,120,.22)", 60, 300, 160, 200); for (let i = 0; i < 160; i++) dot(c, R() * 600, R() * 320, R() * 1.4, "#aab3e0"); c.fillStyle = "#070a1c"; c.beginPath(); c.moveTo(250, 320); c.lineTo(260, 190); c.quadraticCurveTo(280, 120, 330, 130); c.lineTo(350, 160); c.lineTo(320, 175); c.lineTo(330, 210); c.lineTo(360, 320); c.fill(); }
      if (t === "op") for (let i = 0; i < 40; i++) dot(c, 300 + (R() - .5) * 340, 160 + (R() - .5) * 220, 2 + R() * 3, "#cfe0ff");
      if (t === "gl") for (let i = 0; i < 2500; i++) { const r = Math.abs((R() + R() + R() - 1.5)) * 90, a = R() * 7; dot(c, 300 + Math.cos(a) * r, 160 + Math.sin(a) * r, .9, "#ffe9b0"); }
      T(c, TY[k][1], 20, 24, 18, "#fff", "left"); T(c, "(그림으로 나타낸 모습)", 580, 304, 12, "#9aa3d0", "right");
    });
    const say = () => { info.innerHTML = `<b class="t">${TY[k][1]}</b><p>${TY[k][2]}</p><p class="hint">${k < 3 ? "성운: 성간 물질이 모여 구름처럼 보이는 천체" : "성단: 수많은 별이 무리를 이루는 천체"}</p>`; };
    left.append(seg(TY.map((x, i) => [i, x[1]]), 0, v => { k = v; seen.add(v); if (seen.size >= 5) task("all"); if ([0, 1, 2].every(x => seen.has(x))) task("neb"); if ([3, 4].every(x => seen.has(x))) task("clu"); say(); })); side(box, left, info); say();
  },
  /* 8-7 팽창하는 우주 (풍선 모형) */
  expand(box, task) {
    let r = 70; const A = [-.6, -.2, .9, 2.4], rows = [], info = note(), left = h("div");
    const D = (a, b) => (r / 20 * Math.abs(A[a] - A[b])).toFixed(1);
    stage(left, 600, 320, c => {
      c.fillStyle = "#fffdf5"; c.fillRect(0, 0, 600, 320); const g = c.createRadialGradient(270, 140, 10, 300, 160, r); g.addColorStop(0, "#ffd0d6"); g.addColorStop(1, "#ff8fa0"); c.fillStyle = g; c.beginPath(); c.arc(300, 160, r, 0, 7); c.fill(); ln(c, [[300, 160 + r], [300, 310]], "#8a86a8", 2);
      A.forEach((a, i) => { const x = 300 + Math.cos(a) * r * .8, y = 160 + Math.sin(a) * r * .8; T(c, "★", x, y, 16 + r / 20, ["#232046", "#2265c9", "#0b6b33", "#a07a00"][i]); T(c, "ABCD"[i], x + 14, y - 12, 13); });
      T(c, `풍선 크기 ${r < 90 ? "작게" : r > 130 ? "크게" : "중간"}`, 20, 24, 16, INK, "left");
    });
    const tb = h("table", { class: "mt" }), say = () => { tb.innerHTML = `<tr><th>풍선</th><th>A–B (가까운 것)</th><th>A–C (먼 것)</th></tr>` + rows.map(x => `<tr><th>${x[0]}</th><td>${x[1]} cm</td><td>${x[2]} cm</td></tr>`).join(""); info.innerHTML = `<b class="t">붙임딱지 사이의 거리</b><p>풍선을 작게 했을 때와 크게 했을 때 거리를 재어 비교해 보세요.</p><p>${rows.length >= 2 ? "풍선이 커지면 <b>모든</b> 붙임딱지 사이가 멀어지고, <b>멀리 있던 것일수록 더 많이</b> 멀어져요. 풍선 표면=우주, 붙임딱지=은하" : ""}</p>`; info.append(tb); };
    left.append(h("div", { class: "controls" }, range("풍선 불기", 60, 150, 10, 70, "", v => { r = v; }), h("button", { type: "button", class: "tg pri", onclick: () => { const n = r < 90 ? "작게" : r > 130 ? "크게" : "중간"; const i = rows.findIndex(x => x[0] === n); const row = [n, D(0, 1), D(0, 2)]; if (i >= 0) rows[i] = row; else rows.push(row); if (n === "작게") task("small"); if (n === "크게") task("big"); say(); } }, "거리 재기"))); side(box, left, info); say();
  },
  /* 8-8 우주 탐사 방법 */
  probe(box, task) {
    let k = 0, t = 0; const M = [["탐사선·탐사 차", "천체까지 비행해 주위를 돌며 탐사하거나, 천체 표면에 <b>직접 착륙</b>해 탐사해요. 예: 화성 탐사 차 퍼서비어런스"], ["인공위성", "일정한 궤도를 따라 <b>지구 주위를 공전</b>하며 우주와 지구를 관측해요. 예: 기상 위성, 위성 위치 확인 시스템(GPS)"], ["우주 망원경", "대기의 방해 없이 <b>우주에서</b> 천체와 우주 환경을 관측해요. 예: 허블 우주 망원경"]], info = note(), left = h("div"), R = rnd(9), ST = Array.from({ length: 70 }, () => [R() * 600, R() * 300]);
    stage(left, 600, 300, (c, dt) => {
      t += dt; c.fillStyle = "#0e1230"; c.fillRect(0, 0, 600, 300); ST.forEach(([x, y]) => dot(c, x, y, 1, "#aab3e0"));
      if (k === 0) { dot(c, 90, 220, 40, "#3d7bd9"); dot(c, 500, 90, 30, "#c1440e"); const f = (t % 5) / 5, x = 130 + f * 340, y = 200 - f * 100 - Math.sin(f * Math.PI) * 40; T(c, "🚀", x, y, 24); T(c, "지구", 90, 280, 14, "#cfd6ff"); T(c, "화성", 500, 140, 14, "#ffb08a"); if (f > .8) T(c, "착륙!", 500, 40, 16, "#ffd58a"); }
      if (k === 1) { dot(c, 300, 150, 60, "#3d7bd9"); c.strokeStyle = "#4a5280"; c.beginPath(); c.ellipse(300, 150, 130, 50, 0, 0, 7); c.stroke(); const a = t * 1.2; T(c, "🛰", 300 + Math.cos(a) * 130, 150 + Math.sin(a) * 50, 22); }
      if (k === 2) { dot(c, 150, 240, 70, "#3d7bd9"); const a = t * .6; const x = 150 + Math.cos(a) * 120, y = 240 + Math.sin(a) * 40 - 60; rr(c, x - 22, y - 8, 44, 16, 4, "#cfd3de"); ln(c, [[x + 22, y], [520, 70]], "rgba(255,230,140,.4)", 2, [4, 6]); for (let i = 0; i < 60; i++) { const b = i * .5; dot(c, 520 + Math.cos(b) * i * .5, 70 + Math.sin(b) * i * .3, 1.2, "#ffe9b0"); } T(c, "은하", 520, 110, 13, "#ffe9b0"); }
      T(c, M[k][0], 20, 24, 18, "#fff", "left");
    });
    const seen = new Set([0]), say = () => { info.innerHTML = `<b class="t">${M[k][0]}</b><p>${M[k][1]}</p>`; };
    left.append(seg(M.map((m, i) => [i, m[0]]), 0, v => { k = v; t = 0; seen.add(v); if (seen.size >= 3) task("all"); say(); })); side(box, left, info); say();
  }
};
