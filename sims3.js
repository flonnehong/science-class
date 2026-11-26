/* 1~4단원 움직이는 모형. task(이름)을 부르면 할 일 하나를 해낸 것으로 친다 */
import { h } from "./fb.js";
import { stage, T, rr, ln, arrow, seg, range, INK } from "./sims.js";
const G = "#58547a", OK = "#0b6b33", BL = "#2265c9", RD = "#d93a47";
const dot = (c, x, y, r, f, s, lw = 2) => { c.beginPath(); c.arc(x, y, r, 0, 7); if (f) { c.fillStyle = f; c.fill(); } if (s) { c.strokeStyle = s; c.lineWidth = lw; c.stroke(); } };
const side = (box, left, right) => box.append(h("div", { class: "side" }, left, right));
const note = () => h("div", { class: "why" });
const rnd = s => () => { s = (s * 16807) % 2147483647; return s / 2147483647; };
const btn = (t, f, pri) => h("button", { type: "button", class: "tg" + (pri ? " pri" : ""), onclick: f }, t);
const poly = (c, pts, f, s, lw = 2) => { c.beginPath(); pts.forEach((p, i) => i ? c.lineTo(p[0], p[1]) : c.moveTo(p[0], p[1])); c.closePath(); if (f) { c.fillStyle = f; c.fill(); } if (s) { c.strokeStyle = s; c.lineWidth = lw; c.stroke(); } };
/* 시간-온도 그래프 틀 */
const axes = (c, x0, y0, w, hh, xl, yl, xmax, ymax, xs, ys) => { ln(c, [[x0, y0 - hh], [x0, y0], [x0 + w, y0]], INK, 3); T(c, xl, x0 + w / 2, y0 + 30, 15); T(c, yl, x0 + 4, y0 - hh - 14, 15, INK, "left"); xs.forEach(v => T(c, String(v), x0 + v / xmax * w, y0 + 13, 13, G, "center", 400)); ys.forEach(v => { T(c, String(v), x0 - 6, y0 - v / ymax * hh, 13, G, "right", 400); ln(c, [[x0, y0 - v / ymax * hh], [x0 + w, y0 - v / ymax * hh]], "#ebe8f7", 1); }); };
const lerp = (tb, x) => { for (let i = 1; i < tb.length; i++) if (x <= tb[i][0]) { const [a, p] = tb[i - 1], [b, q] = tb[i]; return p + (q - p) * (x - a) / (b - a); } return tb[tb.length - 1][1]; };

export const SIMS3 = {
  /* 1-1 물의 양과 끓는 온도 */
  boil(box, task) {
    const M = [50, 100, 200], CL = ["#2265c9", "#e0366b", "#0b8a5c"], runs = {}; let m = 100, t = -1; const info = note(), left = h("div");
    const temp = (mm, tt) => Math.min(100, 20 + 80 * tt / (2.5 * mm / 50));
    stage(left, 700, 300, (c, dt) => {
      if (t >= 0) { t += dt * 1.6; runs[m] = t; if (t > 2.5 * m / 50 + 1.2) { task("m" + m); t = -1; say(); } }
      rr(c, 20, 40, 200, 230, 16, "#f3f6fb"); rr(c, 70, 130, 100, 110, 10, "rgba(120,180,255,.18)", "#9aa3b5", 3); const lv = 60 + m / 200 * 40; rr(c, 72, 240 - lv * .9, 96, lv * .9, 8, "rgba(80,150,255,.45)");
      if (t >= 0) { for (let i = 0; i < 6; i++) dot(c, 90 + i * 14, 236 - ((t * 60 + i * 23) % (lv * .8)), 3, temp(m, t) >= 100 ? "#fff" : "rgba(255,255,255,.4)"); ln(c, [[80, 262], [160, 262]], "#ff6b3d", 8); }
      T(c, `물 ${m} g`, 120, 60, 18); T(c, t >= 0 ? `${temp(m, t).toFixed(1)} °C` : "가열 전", 120, 95, 20, t >= 0 ? RD : G);
      axes(c, 290, 250, 380, 190, "가열 시간(분)", "온도(°C)", 12, 120, [0, 4, 8, 12], [20, 60, 100]);
      M.forEach((mm, i) => { const tt = runs[mm]; if (tt === undefined) return; const pts = []; for (let s = 0; s <= tt; s += .1) pts.push([290 + s / 12 * 380, 250 - temp(mm, s) / 120 * 190]); ln(c, pts, CL[i], 4); T(c, mm + " g", Math.min(650, pts[pts.length - 1][0]) + 4, 250 - temp(mm, tt) / 120 * 190 - 14 - i * 14, 13, CL[i], "left"); });
      ln(c, [[290, 250 - 100 / 120 * 190], [670, 250 - 100 / 120 * 190]], "#d93a47", 1.5, [6, 6]);
    });
    const say = () => { const done = M.filter(x => runs[x] !== undefined && runs[x] > 2.5 * x / 50); info.innerHTML = `<b class="t">물의 양을 바꾸어 끓여 보자</b><p>물의 양을 고르고 <b>가열하기</b>를 눌러요. 세 가지 양을 모두 끓여 보세요.</p>${done.length ? `<ol>${done.map(x => `<li>${x} g (부피 ${x} mL): 끓기 시작한 시간 약 ${(2.5 * x / 50).toFixed(1)}분, 끓는 온도 <b>100 °C</b></li>`).join("")}</ol>` : ""}${done.length >= 2 ? "<p>질량·부피·끓는 데 걸린 시간은 양에 따라 <b>달라지지만</b>, 끓는 온도는 <b>같아요</b>.</p>" : ""}`; };
    left.append(seg(M.map(x => [x, "물 " + x + " g"]), m, v => { m = v; t = -1; say(); }), h("div", { class: "controls" }, btn("가열하기", () => { t = 0; runs[m] = 0; }, true)));
    side(box, left, info); say();
  },
  /* 1-2 밀도 */
  density(box, task) {
    const O = [["sfe", "작은 철 조각", 15.8, 2, "#8d96a8"], ["lfe", "큰 철 조각", 39.5, 5, "#8d96a8"], ["al", "알루미늄 조각", 27, 10, "#c9d2de"], ["wood", "나무 조각", 6, 10, "#c8955a"]];
    let k = 0, step = 0; const rec = {}, info = note(), left = h("div");
    stage(left, 700, 300, (c, dt, tt) => {
      const [, n, mass, vol, col] = O[k], s = 16 + vol * 3;
      // 저울
      rr(c, 30, 220, 200, 40, 10, "#e8ebf2", "#9aa3b5"); rr(c, 60, 230, 140, 22, 6, "#1c2240"); T(c, step >= 1 ? mass.toFixed(1) + " g" : "0.0 g", 130, 241, 16, "#7dffb0");
      if (step === 1) rr(c, 130 - s / 2, 220 - s, s, s, 4, col, INK, 2);
      T(c, "전자저울", 130, 280, 14, G);
      // 눈금실린더
      const cx = 420, top = 40, bot = 260, wv = 70, scale = 2.6, w0 = 50; rr(c, cx - wv / 2, top, wv, bot - top, 6, "rgba(255,255,255,.6)", "#9aa3b5", 3);
      const vNow = w0 + (step >= 2 ? (k === 3 ? vol : vol) : 0), y = bot - vNow * scale; rr(c, cx - wv / 2 + 3, y, wv - 6, bot - y - 3, 4, "rgba(80,150,255,.35)");
      for (let v = 0; v <= 80; v += 10) { const yy = bot - v * scale; ln(c, [[cx + wv / 2, yy], [cx + wv / 2 + 10, yy]], G, 2); T(c, String(v), cx + wv / 2 + 14, yy, 12, G, "left", 400); }
      if (step >= 2) { const oy = k === 3 ? y - 4 + Math.sin(tt * 3) * 1.5 : bot - 6 - s * .5; rr(c, cx - s / 2 * .8, oy - s * .4, s * .8, s * .8, 4, col, INK, 2); if (k === 3) { ln(c, [[cx, oy - s * .4], [cx, top - 10]], G, 2); T(c, "가는 바늘로 눌러 잠기게", cx, top - 20, 13, G); } }
      T(c, `물 높이 ${vNow} mL`, cx, 282, 15, BL);
      // 물에 넣었을 때
      rr(c, 540, 120, 140, 140, 10, "rgba(80,150,255,.25)", "#9aa3b5", 3); T(c, "물에 넣으면", 610, 105, 15);
      if (rec[O[k][0]]) { const d = mass / vol, fy = d < 1 ? 118 : 250 - s * .7; rr(c, 610 - s * .35, fy - s * .35, s * .7, s * .7, 4, col, INK, 2); T(c, d < 1 ? "뜬다" : "가라앉는다", 610, 278, 16, d < 1 ? OK : RD); }
    });
    const say = () => { const rows = O.filter(o => rec[o[0]]).map(o => `<li>${o[1]}: ${o[2]} g ÷ ${o[3]} cm³ = <b>${(o[2] / o[3]).toFixed(1)} g/cm³</b></li>`).join(""); info.innerHTML = `<b class="t">${O[k][1]}의 단위 부피당 질량</b><p>① 저울에 올려 <b>질량</b>을 재고 ② 물이 50 mL 든 눈금실린더에 넣어 <b>늘어난 부피</b>를 읽어요.</p>${step === 2 ? `<p>부피 = ${50 + O[k][3]} − 50 = <b>${O[k][3]} cm³</b> (1 mL = 1 cm³)</p>` : ""}${rows ? "<ol>" + rows + "</ol>" : ""}${rec.sfe && rec.lfe ? "<p>크기가 달라도 <b>철</b>의 단위 부피당 질량은 같아요!</p>" : ""}`; };
    left.append(seg(O.map((o, i) => [i, o[1]]), k, v => { k = v; step = 0; say(); }), h("div", { class: "controls" }, btn("① 저울에 올리기", () => { step = 1; say(); }), btn("② 눈금실린더에 넣기", () => { if (step < 1) { info.querySelector("p").innerHTML = "먼저 <b>저울</b>로 질량을 재 보세요."; return; } step = 2; rec[O[k][0]] = 1; task(O[k][0]); say(); }, true)));
    side(box, left, info); say();
  },
  /* 1-3 용해도: 질산 칼륨 냉각, 기체 용해도 */
  solub(box, task) {
    const S = [[0, 13.3], [10, 20.9], [20, 31.6], [30, 45.8], [40, 63.9], [50, 85.5], [60, 110], [70, 138], [80, 169], [90, 202], [100, 246]];
    const TB = [["a", "가", 10, 5], ["b", "나", 10, 10], ["c", "다", 20, 10]]; let mode = "solid", k = 0, temp = 80, hot = false; const seen = {}, info = note(), left = h("div");
    const sat = c => { for (let x = 0; x <= 100; x += .1) if (lerp(S, x) >= c) return x; return 100; };
    stage(left, 700, 300, (c, dt, tt) => {
      if (mode === "solid") {
        axes(c, 330, 260, 340, 210, "온도(°C)", "용해도(g/물 100 g)", 100, 250, [0, 20, 40, 60, 80, 100], [50, 100, 150, 200]);
        ln(c, S.map(([x, y]) => [330 + x / 100 * 340, 260 - y / 250 * 210]), "#7a5cff", 4); T(c, "질산 칼륨", 600, 70, 14, "#7a5cff");
        TB.forEach(([id, n, w, g], i) => { const cc = g / w * 100, ts = sat(cc), x = 220 - (2 - i) * 70; const crys = temp < ts ? (cc - lerp(S, temp)) * w / 100 : 0;
          rr(c, x - 18, 70, 36, 160, 14, "rgba(255,255,255,.8)", i === k ? INK : "#b8bccb", i === k ? 4 : 2); rr(c, x - 15, 120 - w * 1.5, 30, 106 + w * 1.5, 12, "rgba(160,200,255,.35)");
          if (crys > 0) { const R = rnd(7 + i); for (let j = 0; j < Math.min(40, crys * 3); j++) rr(c, x - 13 + R() * 22, 222 - R() * Math.min(60, crys * 4), 5, 4, 1, "#fff", "#9aa3b5", 1); }
          T(c, n, x, 248, 18); T(c, `물 ${w} g`, x, 266, 12, G, "center", 400); T(c, `질산 칼륨 ${g} g`, x, 282, 12, G, "center", 400);
          if (i === k) { const px = 330 + temp / 100 * 340, py = 260 - cc / 250 * 210; dot(c, px, py, 7, crys > 0 ? RD : BL, "#fff"); ln(c, [[330, py], [670, py]], "#c9c4e6", 1.5, [5, 5]); } });
        T(c, `지금 온도 ${temp} °C`, 110, 40, 18, RD);
      } else {
        [[150, "얼음물", "#cfe8ff", .3], [450, "따뜻한 물", "#ffd9c2", 1.6]].forEach(([x, n, col, r]) => { rr(c, x - 110, 110, 220, 160, 14, col, "#9aa3b5", 3); rr(c, x - 18, 40, 36, 200, 14, "rgba(255,255,255,.7)", INK, 2); rr(c, x - 15, 80, 30, 157, 12, "rgba(200,170,90,.35)");
          if (hot) { const R = rnd(x); for (let j = 0; j < (r > 1 ? 26 : 5); j++) { const y = 235 - ((tt * 50 * r + R() * 160) % 150); dot(c, x - 10 + R() * 20, y, 2 + R() * 2, "#fff", "#9aa3b5", 1); } }
          T(c, n, x, 288, 17); }); T(c, "탄산수", 300, 60, 16, G);
      }
    });
    const say = () => { if (mode === "gas") { info.innerHTML = `<b class="t">온도에 따른 기체의 용해도</b><p>같은 양의 탄산수가 든 시험관을 얼음물과 따뜻한 물에 넣어요.</p>${hot ? "<p>따뜻한 물 쪽에서 기포가 훨씬 많이 생겨요 → 온도가 높을수록 기체(이산화 탄소)의 용해도가 <b>감소</b>해요.</p>" : ""}`; return; }
      const [, n, w, g] = TB[k], cc = g / w * 100; info.innerHTML = `<b class="t">시험관 (${n}) 식히기</b><p>물 ${w} g + 질산 칼륨 ${g} g → 물 100 g에 <b>${cc} g</b>이 녹아 있는 셈이에요. 온도를 낮추며 흰색 고체가 생기는 온도를 찾아요.</p><ol>${TB.filter(x => seen[x[0]]).map(x => `<li>(${x[1]}) 고체가 생기기 시작한 온도: 약 <b>${Math.round(sat(x[3] / x[2] * 100))} °C</b></li>`).join("")}</ol>${seen.a && seen.c ? "<p>(가)와 (다)는 물과 질산 칼륨의 <b>비율이 같아서</b> 같은 온도에서 고체가 생겨요.</p>" : ""}`; };
    const rg = range("온도", 0, 80, 1, 80, " °C", v => { temp = v; TB.forEach(([id, , w, g], i) => { if (i === k && v < sat(g / w * 100)) { if (!seen[id]) { seen[id] = 1; task(id); } } }); say(); });
    left.append(seg([["solid", "고체의 용해도"], ["gas", "기체의 용해도"]], mode, v => { mode = v; say(); }), h("div", { class: "controls" }, ...TB.map(([id, n], i) => btn(`시험관 (${n})`, () => { k = i; temp = 80; rg.querySelector("input").value = 80; rg.querySelector("b").textContent = "80 °C"; say(); })), rg), h("div", { class: "controls" }, btn("탄산수 시험관 넣기", () => { mode = "gas"; hot = true; task("gas"); say(); }, true)));
    side(box, left, info); say();
  },
  /* 1-4 녹는점과 끓는점 */
  melt(box, task) {
    const O = [["p5", "팔미트산 5 g", 25, 62.5, 1.6, "#e0366b"], ["p10", "팔미트산 10 g", 25, 62.5, 3.2, "#7a5cff"], ["e10", "에탄올 10 mL", 20, 78, 1.8, "#0b8a5c"], ["e20", "에탄올 20 mL", 20, 78, 3.6, "#e08a2b"]];
    let k = 0, t = -1; const run = {}, info = note(), left = h("div");
    const tmp = (o, s) => { const [, , T0, P, L] = o, r = o[0][0] === "p" ? 14 / (L / 1.6) : 16 / (L / 1.8), t1 = (P - T0) / r; return s < t1 ? T0 + r * s : s < t1 + L ? P : P + r * (s - t1 - L); };
    stage(left, 700, 300, (c, dt) => {
      if (t >= 0) { t += dt * 1.4; run[O[k][0]] = t; if (t > 9) { t = -1; task(O[k][0][0] === "p" ? O[k][0] : "eth"); say(); } }
      axes(c, 70, 250, 590, 200, "가열 시간(분)", "온도(°C)", 9, 100, [0, 3, 6, 9], [20, 40, 60, 80, 100]);
      O.forEach(o => { const tt = run[o[0]]; if (tt === undefined) return; const pts = []; for (let s = 0; s <= tt; s += .05) pts.push([70 + s / 9 * 590, 250 - Math.min(100, tmp(o, s)) / 100 * 200]); ln(c, pts, o[5], 4); });
      [[62.5, "약 62.5 °C"], [78, "약 78 °C"]].forEach(([v, s]) => { if (O.some(o => o[3] === v && run[o[0]] !== undefined)) { const y = 250 - v / 100 * 200; ln(c, [[70, y], [660, y]], "#d93a47", 1.5, [6, 6]); T(c, s, 664, y, 13, RD, "right"); } });
      O.forEach((o, i) => { if (run[o[0]] !== undefined) T(c, "— " + o[1], 90, 24 + i * 18, 13, o[5], "left"); });
    });
    const say = () => { const p = run.p5 !== undefined && run.p10 !== undefined, e = run.e10 !== undefined && run.e20 !== undefined; info.innerHTML = `<b class="t">가열 곡선 그리기</b><p>물질을 고르고 <b>가열하기</b>를 눌러 온도 변화를 그래프로 그려요. 양이 다른 두 그래프를 비교해 보세요.</p>${p ? "<p>팔미트산은 양이 달라도 약 <b>62.5 °C</b>에서 온도가 일정해요 → 이 온도에서 녹아요(<b>녹는점</b>).</p>" : ""}${e ? "<p>에탄올은 양이 달라도 약 <b>78 °C</b>에서 끓어요(<b>끓는점</b>).</p>" : ""}${p || e ? "<p>양이 많으면 온도가 일정한 구간이 <b>길어질</b> 뿐, 그 온도는 같아요.</p>" : ""}`; };
    left.append(seg(O.map((o, i) => [i, o[1]]), k, v => { k = v; t = -1; }), h("div", { class: "controls" }, btn("가열하기", () => { t = 0; }, true)));
    side(box, left, info); say();
  },
  /* 1-5 순물질과 혼합물의 끓는점 */
  pure(box, task) {
    let k = "w", t = -1; const run = {}, info = note(), left = h("div");
    const f = (id, s) => id === "w" ? Math.min(100, 20 + 30 * s) : (20 + 30 * s < 101.5 ? 20 + 30 * s : 101.5 + (s - 81.5 / 30) * 1.4);
    stage(left, 700, 300, (c, dt) => {
      if (t >= 0) { t += dt * 1.2; run[k] = t; if (t > 7) { task(k); t = -1; say(); } }
      axes(c, 80, 250, 560, 200, "가열 시간(분)", "온도(°C)", 7, 110, [0, 2, 4, 6], [20, 60, 100]);
      [["w", "#2265c9", "물"], ["s", "#e0366b", "소금물"]].forEach(([id, col, n]) => { const tt = run[id]; if (tt === undefined) return; const pts = []; for (let s = 0; s <= tt; s += .05) pts.push([80 + s / 7 * 560, 250 - f(id, s) / 110 * 200]); ln(c, pts, col, 4); const L = pts[pts.length - 1]; T(c, n, Math.min(L[0] + 6, 620), L[1] - 14, 15, col, "left"); });
      const y = 250 - 100 / 110 * 200; ln(c, [[80, y], [640, y]], "#9aa3b5", 1.5, [6, 6]); T(c, "100 °C", 644, y, 13, G, "left");
    });
    const say = () => { info.innerHTML = `<b class="t">물과 소금물 가열하기</b><p>두 액체를 각각 가열하여 그래프를 비교해 보세요.</p>${run.w !== undefined ? "<p><b>물</b>(순물질): 100 °C에서 끓고, 끓는 동안 온도가 <b>일정</b>해요.</p>" : ""}${run.s !== undefined ? "<p><b>소금물</b>(혼합물): 100 °C보다 높은 온도에서 끓기 시작하고, 끓는 동안에도 온도가 <b>계속 높아져요</b>. 물이 기화하면서 소금물이 점점 진해지기 때문이에요.</p>" : ""}`; };
    left.append(seg([["w", "물"], ["s", "소금물"]], k, v => { k = v; t = -1; }), h("div", { class: "controls" }, btn("가열하기", () => { t = 0; }, true)));
    side(box, left, info); say();
  },
  /* 1-6 혼합물 분리 네 가지 */
  separate(box, task) {
    const M = [["oil", "물 + 식용유", "분별 깔때기 꼭지 열기", "밀도"], ["kno", "질산 칼륨 + 황산 구리(Ⅱ)", "얼음물로 식힌 뒤 거르기", "용해도"], ["eth", "물 + 에탄올", "가열하여 나오는 기체 모으기", "끓는점"], ["gold", "모래 + 사금", "물속에서 접시 흔들기", "밀도"]];
    let k = 0, p = 0, go = false; const done = {}, info = note(), left = h("div");
    stage(left, 700, 300, (c, dt, tt) => {
      if (go) { p = Math.min(1, p + dt * .35); if (p >= 1) { go = false; done[M[k][0]] = 1; task(M[k][0]); say(); } }
      const id = M[k][0];
      if (id === "oil") { poly(c, [[250, 40], [450, 40], [360, 190], [340, 190]], "rgba(255,255,255,.8)", INK, 3); ln(c, [[350, 190], [350, 240]], INK, 6); rr(c, 330, 205, 40, 10, 3, p > 0 && p < 1 ? OK : "#9aa3b5");
        const wl = 1 - Math.min(1, p * 1.25); poly(c, [[262, 60], [438, 60], [400, 120], [300, 120]], "rgba(255,220,90,.7)"); if (wl > 0) poly(c, [[300, 120], [400, 120], [400 - (40 * (1 - wl)), 120 + 60 * wl], [300 + (40 * (1 - wl)), 120 + 60 * wl]], "rgba(90,160,255,.6)");
        rr(c, 300, 245, 100, 45, 8, "rgba(255,255,255,.7)", "#9aa3b5", 2); rr(c, 303, 287 - 40 * Math.min(1, p * 1.25), 94, 40 * Math.min(1, p * 1.25), 6, "rgba(90,160,255,.6)"); T(c, "식용유(위)", 520, 90, 16, "#b8860b"); T(c, "물(아래)", 520, 150, 16, BL); }
      if (id === "kno") { rr(c, 120, 90, 180, 170, 14, p > .1 ? "#cfe8ff" : "#ffd9c2", "#9aa3b5", 3); T(c, p > .1 ? "얼음물" : "뜨거운 용액", 210, 278, 15); rr(c, 170, 60, 80, 170, 10, "rgba(120,190,255,.5)", INK, 2);
        const R = rnd(3); for (let j = 0; j < 40 * p; j++) rr(c, 175 + R() * 66, 222 - R() * 30, 6, 4, 1, "#fff", "#9aa3b5", 1);
        poly(c, [[420, 70], [560, 70], [500, 150], [480, 150]], "rgba(255,255,255,.8)", INK, 3); if (p > .6) { const R2 = rnd(9); for (let j = 0; j < 24; j++) rr(c, 450 + R2() * 80, 85 + R2() * 30, 6, 4, 1, "#fff", "#9aa3b5", 1); rr(c, 450, 200, 80, 70, 8, "rgba(80,140,255,.55)", "#9aa3b5", 2); T(c, "파란 거른 용액", 490, 285, 13, BL); T(c, "흰 결정: 질산 칼륨", 490, 50, 14, INK); } }
      if (id === "eth") { axes(c, 80, 250, 560, 190, "가열 시간", "온도(°C)", 1, 110, [], [20, 60, 100]); const pts = []; for (let s = 0; s <= p; s += .01) { const v = s < .2 ? 20 + s / .2 * 58 : s < .45 ? 78 + (s - .2) * 20 : s < .6 ? 83 + (s - .45) / .15 * 17 : 100; pts.push([80 + s * 560, 250 - v / 110 * 190]); } ln(c, pts, "#7a5cff", 4); if (p > .4) T(c, "주로 에탄올이 나와요", 80 + .32 * 560, 250 - 90 / 110 * 190 - 18, 14, "#7a5cff"); if (p > .95) T(c, "주로 물이 나와요", 80 + .82 * 560, 250 - 100 / 110 * 190 - 18, 14, BL); }
      if (id === "gold") { c.save(); c.translate(350, 180); c.rotate(Math.sin(tt * 8) * .06 * (go ? 1 : 0)); c.beginPath(); c.ellipse(0, 0, 200, 60, 0, 0, 7); c.fillStyle = "#7d8597"; c.fill(); c.beginPath(); c.ellipse(0, -6, 180, 46, 0, 0, 7); c.fillStyle = "rgba(90,160,255,.45)"; c.fill(); const R = rnd(5); for (let j = 0; j < 160 * (1 - p); j++) dot(c, (R() - .5) * 330 + p * 160, (R() - .5) * 70, 3, "#c8a36a"); const R2 = rnd(11); for (let j = 0; j < 10; j++) dot(c, (R2() - .5) * 60, (R2() - .5) * 20 + 12, 3, "#ffd23f", "#b8860b", 1); c.restore(); T(c, "모래는 씻겨 나가고, 밀도가 큰 사금은 바닥에 남아요", 350, 40, 15); }
    });
    const say = () => { const [id, n, a, how] = M[k]; info.innerHTML = `<b class="t">${n}</b><p>버튼을 눌러 분리해 보세요.</p>${done[id] ? `<p>이용한 물질의 특성: <b>${how}</b> 차</p><p>${{ oil: "섞이지 않는 두 액체 중 밀도가 작은 식용유는 위, 물은 아래에 있어요. 아래층부터 따라 내요.", kno: "온도에 따른 용해도 차가 큰 질산 칼륨이 먼저 석출되고, 거름종이로 걸러요.", eth: "끓는점이 낮은 에탄올이 먼저 기화해서 나와요. 원유를 휘발유, 등유, 경유로 나누는 것도 같은 원리예요.", gold: "물에 흔들면 가벼운 모래는 씻겨 나가고 밀도가 큰 사금이 남아요." }[id]}</p>` : ""}<p class="hint">해 본 혼합물: ${Object.keys(done).length}/4</p>`; };
    left.append(seg(M.map((m, i) => [i, m[1]]), k, v => { k = v; p = done[M[v][0]] ? 1 : 0; go = false; say(); }), h("div", { class: "controls" }, btn("분리하기", () => { p = 0; go = true; }, true)));
    side(box, left, info); say();
  },
  /* 1-7 카놀라유·녹말·소금·물 분리 설계 */
  design(box, task) {
    const TOOLS = [["fun", "분별 깔때기"], ["fil", "거름 장치"], ["eva", "증발 접시에 가열"], ["iod", "아이오딘-아이오딘화 칼륨 용액"]], ANS = ["fun", "fil", "eva", "iod"];
    let s = 0, msg = ""; const info = note(), left = h("div");
    const ST = [["카놀라유 + 녹말 + 소금 + 물", "먼저 물에 뜨는 카놀라유를 분리하려면?"], ["녹말 + 소금물", "물에 녹지 않는 녹말을 분리하려면?"], ["소금물", "물에 녹아 있는 소금을 얻으려면?"], ["분리한 흰 가루", "흰 가루가 녹말인지 확인하려면?"], ["완성!", "네 물질을 모두 분리하고 확인했어요."]];
    stage(left, 700, 280, cx => {
      const NM = [["카놀라유", "#ffd23f", 0], ["녹말", "#f3efe2", 1], ["소금", "#fff", 2], ["물", "#9cc8ff", 2]];
      rr(cx, 30, 40, 260, 200, 18, "rgba(90,160,255,.12)", "#9aa3b5", 3); T(cx, "남은 혼합물", 160, 25, 15, G);
      NM.forEach(([n, col, at], i) => { const out = s > at; if (!out || i === 3 && s < 3) { if (i === 3 && s < 3 || !out) { dot(cx, 80 + (i % 2) * 120, 100 + Math.floor(i / 2) * 80, 30, col, "#9aa3b5"); T(cx, n, 80 + (i % 2) * 120, 100 + Math.floor(i / 2) * 80, 15); } } });
      T(cx, "분리한 물질", 520, 25, 15, G);
      NM.forEach(([n, col, at], i) => { if (s > at && !(i === 3 && s < 3)) { rr(cx, 380 + (i % 2) * 150, 50 + Math.floor(i / 2) * 100, 120, 70, 14, col, OK, 3); T(cx, n, 440 + (i % 2) * 150, 85 + Math.floor(i / 2) * 100, 17); } });
      if (s > 3) T(cx, "녹말 + 아이오딘 용액 → 청람색", 520, 262, 15, "#2b2f8a");
    });
    const say = () => { info.innerHTML = `<b class="t">${s + 1 > 4 ? "분리 성공" : (s + 1) + "단계"}: ${ST[s][0]}</b><p>${ST[s][1]}</p>${msg ? `<p>${msg}</p>` : ""}<p class="hint">소금은 카놀라유에 녹지 않아요. 녹말은 물에 녹지 않고 물보다 밀도가 커요.</p>`; };
    const pick = id => { if (s > 3) return; if (id === ANS[s]) { msg = ["⭕ 밀도가 작은 카놀라유가 위층! 아래층을 따라 내고 카놀라유를 남겨요.", "⭕ 거름종이 위에 녹말이 남고, 소금물은 빠져나가요.", "⭕ 물이 증발하고 소금이 남아요. (물은 증류로 모을 수 있어요)", "⭕ 청람색으로 변했어요. 녹말이 맞아요!"][s]; task("s" + (s + 1)); s++; } else msg = "❌ 이 단계에는 알맞지 않아요. 분리할 물질의 특성(밀도, 용해도, 끓는점)을 다시 생각해 보세요."; say(); };
    left.append(h("div", { class: "controls" }, TOOLS.map(([id, n]) => btn(n, () => pick(id)))), h("div", { class: "controls" }, btn("처음부터", () => { s = 0; msg = ""; say(); })));
    side(box, left, info); say();
  },
  /* 2-1 지구계 */
  spheres(box, task) {
    const SP = { geo: ["지권", "지구 표면과 지구 내부 (암석, 토양)"], hyd: ["수권", "바다, 빙하, 지하수, 강, 호수 등 지구의 물"], atm: ["기권", "지구를 둘러싼 대기"], bio: ["생물권", "지구에 사는 모든 생물 (지권, 수권, 기권에 걸쳐 있음)"], ext: ["외권", "기권 바깥의 우주 공간"] };
    const HS = [["ext", 600, 45, "달·인공위성"], ["atm", 300, 60, "구름·바람"], ["geo", 170, 170, "산·암석"], ["bio", 330, 190, "나무"], ["bio", 450, 250, "물고기"], ["hyd", 540, 220, "바다"], ["geo", 120, 255, "흙"], ["hyd", 250, 230, "강"]];
    const got = new Set(); let last = null; const info = note(), left = h("div");
    const cv = stage(left, 700, 300, (c, dt, tt) => {
      const g = c.createLinearGradient(0, 0, 0, 160); g.addColorStop(0, "#0e1230"); g.addColorStop(.35, "#7ec8ff"); g.addColorStop(1, "#dff1ff"); c.fillStyle = g; c.fillRect(0, 0, 700, 300);
      dot(c, 600, 40, 18, "#f1f0c8"); rr(c, 640, 70, 26, 10, 3, "#cfd6ff"); ln(c, [[630, 75], [676, 75]], "#9aa3d0", 3);
      [[260, 60], [330, 50], [380, 70]].forEach(([x, y]) => dot(c, x + Math.sin(tt) * 6, y, 26, "rgba(255,255,255,.9)"));
      poly(c, [[0, 300], [0, 200], [100, 120], [170, 150], [240, 90], [330, 180], [420, 200], [470, 210], [470, 300]], "#8c7a5b"); poly(c, [[240, 90], [260, 110], [220, 110]], "#fff");
      poly(c, [[470, 210], [700, 190], [700, 300], [470, 300]], "#3d8fd6"); ln(c, [[200, 300], [230, 240], [270, 225], [330, 215], [470, 212]], "#4aa3ff", 10);
      ln(c, [[330, 210], [330, 170]], "#6b4a2b", 6); dot(c, 330, 160, 24, "#2fa84f"); c.fillStyle = "#ffb3a7"; c.beginPath(); c.ellipse(450 + Math.sin(tt * 2) * 10, 255, 14, 7, 0, 0, 7); c.fill();
      HS.forEach(([k, x, y, n]) => { const on = got.has(k); dot(c, x, y, 13, on ? "rgba(255,210,63,.95)" : "rgba(255,255,255,.75)", INK, 2); T(c, on ? "✓" : "?", x, y + 1, 14); });
    });
    cv.cv.style.cursor = "pointer"; cv.cv.addEventListener("click", e => { const p = cv.at(e), hs = HS.find(([, x, y]) => Math.hypot(p.x - x, p.y - y) < 30); if (!hs) return; last = hs; got.add(hs[0]); task(hs[0]); say(); });
    const say = () => { info.innerHTML = `<b class="t">${last ? `${last[3]} → ${SP[last[0]][0]}` : "그림 속 ? 를 눌러 보세요"}</b>${last ? `<p>${SP[last[0]][0]}: ${SP[last[0]][1]}</p>` : "<p>지구를 이루는 것을 찾아 어느 권에 속하는지 알아봐요.</p>"}<p>찾은 권: ${[...got].map(k => SP[k][0]).join(", ") || "-"} (${got.size}/5)</p>${got.size === 5 ? "<p>다섯 권은 서로 <b>영향을 주고받으며</b> 하나의 <b>지구계</b>를 이뤄요. 예: 나무(생물권)는 광합성으로 공기(기권)를 깨끗하게 해요.</p>" : ""}`; };
    side(box, left, info); say();
  },
  /* 2-2 지권의 층상 구조 */
  layers(box, task) {
    const L = [[0, 35, "crust", "지각", "#a8794f", "고체", "가장 얇은 겉 부분. 대륙 지각 평균 약 35 km, 해양 지각 약 5 km. 여러 가지 암석으로 이루어짐"], [35, 2900, "mantle", "맨틀", "#e0884a", "고체", "지구 전체 부피의 약 80 %. 지각보다 밀도가 큰 물질"], [2900, 5100, "outer", "외핵", "#f2c94c", "액체(추정)", "철, 니켈 같은 무거운 물질"], [5100, 6400, "inner", "내핵", "#fff1a8", "고체(추정)", "철, 니켈 같은 무거운 물질. 지구 중심까지"]];
    let d = 0; const info = note(), left = h("div");
    stage(left, 700, 300, c => {
      const cx = 40, cy = 290, R = 260, rr_ = km => R * (1 - km / 6400);
      [...L].forEach(([a, b, , , col]) => { c.beginPath(); c.moveTo(cx, cy); c.arc(cx, cy, Math.max(rr_(a), 2), -Math.PI / 2, 0); c.closePath(); c.fillStyle = col; c.fill(); });
      c.beginPath(); c.moveTo(cx, cy); c.arc(cx, cy, R, -Math.PI / 2, 0); c.closePath(); c.strokeStyle = INK; c.lineWidth = 3; c.stroke();
      const y = cy - rr_(d); ln(c, [[cx, y], [cx + 290, y]], RD, 3); dot(c, cx, y, 7, RD, "#fff"); T(c, `깊이 ${d} km`, cx + 296, y, 16, RD, "left");
      L.forEach(([a, b, , n], i) => T(c, n, 440 + (i % 2) * 120, 250 + Math.floor(i / 2) * 26, 15, G, "left", 400));
      T(c, "지각은 너무 얇아 선처럼 보여요", 470, 40, 13, G);
    });
    const say = () => { const l = L.find(x => d >= x[0] && d <= x[1]) || L[3]; info.innerHTML = `<b class="t">${l[3]} (깊이 ${l[0]}~${l[1]} km)</b><p>상태: <b>${l[5]}</b></p><p>${l[6]}</p><p class="hint">지구 내부는 <b>지진파</b>를 분석하여 알아냈어요.</p>`; };
    left.append(h("div", { class: "controls" }, range("깊이", 0, 6400, 10, 0, " km", v => { d = v; const l = L.find(x => v >= x[0] && v <= x[1]); if (l) task(l[2]); say(); })), h("div", { class: "controls" }, L.map(l => btn(l[3], () => { d = Math.round((l[0] + l[1]) / 2); task(l[2]); say(); }))));
    task("crust"); side(box, left, info); say();
  },
  /* 2-3 광물의 특성 */
  mineral(box, task) {
    const M = [["석영", "무색·흰색", "#f4f4f6", "흰색", "#fff", "단단함 (유리를 긁음)", "없음", "없음"], ["장석", "흰색·분홍색", "#f6dccf", "흰색", "#fff", "단단함", "없음", "없음"], ["흑운모", "검은색", "#2c2a2a", "흰색", "#fff", "무름 (얇게 떨어짐)", "없음", "없음"], ["방해석", "무색·흰색", "#eef2ee", "흰색", "#fff", "무름 (석영에 긁힘)", "거품 발생", "없음"], ["자철석", "검은색", "#2a2b30", "검은색", "#222", "단단함", "없음", "클립이 붙음"], ["적철석", "검은색~적갈색", "#3b2a2a", "적갈색", "#8b3a2e", "단단함", "없음", "없음"], ["황철석", "노란색", "#d6b84a", "검은색", "#2a2a2a", "단단함", "없음", "없음"], ["금", "노란색", "#f2c230", "노란색", "#e0a800", "무름", "없음", "없음"]];
    const TS = [["col", "색 보기"], ["str", "조흔판에 긁기"], ["hard", "서로 긁어 보기"], ["acid", "묽은 염산 떨어뜨리기"], ["mag", "자석 대기"]];
    let k = 0, ts = "col"; const info = note(), left = h("div");
    stage(left, 700, 260, (c, dt, tt) => {
      const m = M[k]; c.fillStyle = "#f6f4ff"; c.fillRect(0, 0, 700, 260);
      poly(c, [[110, 70], [200, 50], [250, 120], [210, 200], [120, 210], [70, 140]], m[2], INK, 3); ln(c, [[120, 90], [180, 75]], "rgba(255,255,255,.5)", 4); T(c, m[0], 160, 236, 18);
      if (ts === "str") { rr(c, 360, 90, 260, 100, 10, "#fdfdf8", "#b8bccb", 3); ln(c, [[400, 140], [580, 130]], m[4], 10); T(c, "조흔판 (초벌구이 자기판)", 490, 70, 14, G); }
      if (ts === "acid") { rr(c, 470, 40, 16, 70, 6, "#fff", INK, 2); if (m[6] !== "없음") for (let i = 0; i < 14; i++) dot(c, 190 + Math.sin(i * 7) * 30, 90 - ((tt * 40 + i * 13) % 60), 4, "#fff", "#9aa3b5", 1); T(c, "묽은 염산", 478, 125, 14, G); }
      if (ts === "mag") { rr(c, 360, 100, 90, 40, 6, RD); rr(c, 450, 100, 90, 40, 6, BL); T(c, "N", 405, 120, 18, "#fff"); T(c, "S", 495, 120, 18, "#fff"); if (m[7] !== "없음") ln(c, [[300, 150], [360, 140]], "#9aa3b5", 5); }
      if (ts === "hard") { poly(c, [[400, 90], [470, 80], [490, 150], [420, 170]], "#f4f4f6", INK, 2); T(c, "석영", 445, 190, 14); ln(c, [[400, 130], [250, 120]], G, 2, [5, 5]); }
      if (ts === "col") T(c, "겉으로 보이는 색: " + m[1], 480, 130, 18);
    });
    const res = () => { const m = M[k]; return { col: `색: <b>${m[1]}</b>`, str: `조흔색: <b>${m[3]}</b>`, hard: `굳기: <b>${m[5]}</b>`, acid: `염산 반응: <b>${m[6]}</b>`, mag: `자성: <b>${m[7]}</b>` }[ts]; };
    const say = () => { info.innerHTML = `<b class="t">${M[k][0]}</b><p>${res()}</p><p class="hint">겉보기 색이 비슷한 광물(자철석·적철석·흑운모, 황철석·금)은 <b>조흔색</b>으로 구별해요.</p>`; };
    const check = () => { const n = M[k][0]; if (ts === "str" && ["적철석", "자철석", "흑운모", "황철석", "금"].includes(n)) task("str"); if (ts === "hard" && ["석영", "방해석"].includes(n)) task("hard"); if (ts === "acid" && n === "방해석") task("acid"); if (ts === "mag" && n === "자철석") task("mag"); say(); };
    left.append(h("div", { class: "controls" }, M.map((m, i) => h("button", { type: "button", class: "bin" + (i ? "" : " on"), onclick: e => { k = i; [...e.currentTarget.parentNode.children].forEach(b => b.classList.toggle("on", b === e.currentTarget)); check(); } }, m[0]))), seg(TS, ts, v => { ts = v; check(); }));
    side(box, left, info); say();
  },
  /* 2-4 생활 속 암석과 광물 */
  uses(box, task) {
    const U = [["화강암", "건물 바닥·계단·비석", "build"], ["석회암", "시멘트의 원료", "build"], ["대리암", "조각상·건물 장식", "art"], ["석영", "유리·반도체의 원료", "elec"], ["금", "반도체 회로·장신구", "elec"], ["흑연", "연필심", "life"], ["고령토", "도자기", "art"], ["리튬 광물", "배터리", "elec"], ["활석", "화장품 가루", "life"]];
    const F = { build: "건축", art: "예술", elec: "전자", life: "생활" }, open = new Set(); const info = note(), grid = h("div", { class: "bins" });
    const say = () => { info.innerHTML = `<b class="t">암석과 광물은 어디에 쓰일까?</b><p>카드를 눌러 쓰임새를 확인하세요. (${open.size}/${U.length})</p><p>찾은 분야: ${[...new Set([...open].map(i => F[U[i][2]]))].join(", ") || "-"}</p>${open.size >= 6 ? "<p>암석과 광물은 만들어지는 데 오랜 시간이 걸리는 <b>유한한 자원</b>이에요. 아껴 쓰고 재활용해야 해요.</p>" : ""}`; };
    U.forEach(([n, u, f], i) => { const b = h("button", { type: "button", class: "bin", onclick: () => { open.add(i); b.classList.add("on"); b.innerHTML = `<b>${n}</b> → ${u}`; task(f); say(); } }, n + " ❓"); grid.append(b); });
    side(box, grid, info); say();
  },
  /* 2-5 화성암 */
  igneous(box, task) {
    let deep = false, dark = true, p = 1; const info = note(), left = h("div");
    const name = () => deep ? (dark ? "반려암" : "화강암") : (dark ? "현무암" : "유문암"), key = { 반려암: "gab", 화강암: "gra", 현무암: "bas", 유문암: "rhy" };
    stage(left, 700, 280, (c, dt) => {
      if (p < 1) { p = Math.min(1, p + dt * (deep ? .25 : .9)); if (p >= 1) { task(key[name()]); say(); } }
      const g = c.createLinearGradient(0, 0, 0, 280); g.addColorStop(0, "#bfe3ff"); g.addColorStop(.2, "#bfe3ff"); g.addColorStop(.22, "#9b7b55"); g.addColorStop(1, "#4a3424"); c.fillStyle = g; c.fillRect(0, 0, 300, 280);
      const y = deep ? 220 : 70; c.beginPath(); c.ellipse(150, y, 70, 32, 0, 0, 7); c.fillStyle = `rgb(${255 - p * 120},${90 + p * 30},${40 + p * 60})`; c.fill(); T(c, deep ? "지하 깊은 곳" : "지표 부근", 150, y - 44, 15, "#fff");
      T(c, p < 1 ? "마그마가 식는 중…" : `${name()} 완성`, 150, 20, 16, INK);
      rr(c, 340, 30, 330, 220, 14, "#f6f4ff", "#b8bccb", 2); T(c, "돋보기로 본 모습", 505, 18, 14, G);
      const R = rnd(deep ? 3 : 8), n = deep ? 40 : 600, sz = deep ? 30 : 6; for (let i = 0; i < n; i++) { const x = 350 + R() * 310, yy = 40 + R() * 200, s = sz * (.5 + R() * .6) * Math.min(1, p * 1.2), d = R() < (dark ? .75 : .25); rr(c, x, yy, s, s * .8, 2, d ? "#2b2a30" : (R() < .5 ? "#f3f1ec" : "#e8c6b6")); }
    });
    const say = () => { info.innerHTML = `<b class="t">${name()}</b><p>${deep ? "지하 깊은 곳에서 <b>천천히</b> 식어 광물 결정이 <b>커요</b> → 심성암" : "지표 부근에서 <b>빨리</b> 식어 광물 결정이 <b>작아요</b> → 화산암"}</p><p>${dark ? "어두운색 광물이 많아 <b>어두운색</b>" : "밝은색 광물이 많아 <b>밝은색</b>"}</p><p class="hint">제주도의 현무암에는 기체가 빠져나간 구멍이 많아요.</p>`; };
    left.append(seg([[false, "지표 부근"], [true, "지하 깊은 곳"]], deep, v => { deep = v; p = 1; say(); }), seg([[true, "어두운색 광물 많음"], [false, "밝은색 광물 많음"]], dark, v => { dark = v; p = 1; say(); }), h("div", { class: "controls" }, btn("마그마 식히기", () => { p = 0; }, true)));
    side(box, left, info); say();
  },
  /* 2-6 퇴적암 */
  sedi(box, task) {
    const K = { gr: ["자갈", "#a39a8c", "역암", "con"], sa: ["모래", "#e3c88d", "사암", "san"], mu: ["진흙", "#9c7f6b", "이암", "mud"], li: ["석회 물질", "#eef0e6", "석회암", "lim"] };
    let L = [], hard = false, sq = 0; const info = note(), left = h("div");
    stage(left, 700, 280, (c, dt) => {
      if (hard && sq < 1) sq = Math.min(1, sq + dt * .6);
      rr(c, 150, 20, 400, 250, 10, "rgba(120,190,255,.2)", "#9aa3b5", 3); const bh = 40 * (1 - .3 * sq); let y = 266;
      L.forEach(([k, fos], i) => { const [, col] = K[k]; y -= bh; rr(c, 153, y, 394, bh, 2, col, hard ? INK : null, 1); const R = rnd(i + 3); if (k === "gr") for (let j = 0; j < 22; j++) dot(c, 160 + R() * 380, y + 6 + R() * (bh - 12), 6, "#7d7466"); if (k === "sa") for (let j = 0; j < 90; j++) dot(c, 160 + R() * 380, y + 3 + R() * (bh - 6), 1.4, "#b89a5a"); if (fos) { c.strokeStyle = "#5a4630"; c.lineWidth = 2; c.beginPath(); c.arc(300 + i * 30, y + bh / 2, 9, Math.PI, 0); c.stroke(); } if (hard) T(c, K[k][2], 520, y + bh / 2, 13, INK, "right"); });
      if (hard) arrow(c, 350, 4 + sq * 6, 350, 18 + sq * 6, RD, 4); T(c, hard ? "오랜 시간 다져지고 굳어져요" : "물속에 퇴적물이 쌓여요", 350, y - 14 > 30 ? y - 14 : 30, 15);
    });
    const say = () => { const rs = [...new Set(L.map(l => K[l[0]][2]))]; info.innerHTML = `<b class="t">${hard ? "퇴적암이 되었어요" : "퇴적물을 쌓아 보자"}</b><p>${hard ? `만들어진 암석: <b>${rs.join(", ")}</b>` : "퇴적물 버튼을 눌러 층을 쌓고, <b>다지고 굳히기</b>를 눌러요."}</p>${hard && L.length > 1 ? "<p>층마다 퇴적물이 달라 줄무늬가 보여요 → <b>층리</b></p>" : ""}${hard && L.some(l => l[1]) ? "<p>쌓일 때 묻힌 생물의 흔적이 <b>화석</b>으로 남았어요.</p>" : ""}<p class="hint">자갈 → 역암, 모래 → 사암, 진흙 → 이암, 석회 물질 → 석회암</p>`; };
    left.append(h("div", { class: "controls" }, Object.entries(K).map(([k, [n]]) => btn(n, () => { if (hard) { L = []; hard = false; sq = 0; } if (L.length < 5) L.push([k, false]); say(); })), btn("조개껍데기 묻기", () => { if (L.length && !hard) L[L.length - 1][1] = true; say(); })), h("div", { class: "controls" }, btn("다지고 굳히기", () => { if (!L.length) return; hard = true; sq = 0; L.forEach(l => task(K[l[0]][3])); say(); }, true), btn("다시 쌓기", () => { L = []; hard = false; sq = 0; say(); })));
    side(box, left, info); say();
  },
  /* 2-7 변성암 */
  meta(box, task) {
    const R0 = [["gra", "화강암", "편마암", true], ["san", "사암", "규암", false], ["lim", "석회암", "대리암", false], ["mud", "이암", "편암", true]];
    let k = 0, P = 0; const info = note(), left = h("div");
    stage(left, 700, 280, c => {
      const [, n, m, fol] = R0[k], f = P / 100; rr(c, 150, 40, 400, 200, 12, "#f4efe6", INK, 3);
      const R = rnd(5 + k); for (let i = 0; i < 160; i++) { const x = 160 + R() * 380, y = 50 + R() * 180, s = 6 + R() * 8, dark = R() < .35, col = k === 2 ? "#e9e6de" : k === 1 ? "#d9c08e" : dark ? "#3a3634" : R() < .5 ? "#f2efe8" : "#e8c6b6";
        if (fol) { const yy = 50 + (Math.round(((y - 50) / 180) * 9) / 9 * 180) * f + (y - 50) * (1 - f); c.save(); c.translate(x, yy); c.scale(1 + f * 1.3, 1 - f * .6); rr(c, -s / 2, -s / 3, s, s * .66, 2, col); c.restore(); }
        else rr(c, x, y, s * (1 + f * .7), s * (.7 + f * .4), 2, col); }
      if (P > 0) { arrow(c, 350, 4, 350, 36, RD, 3 + f * 5); arrow(c, 350, 276, 350, 244, RD, 3 + f * 5); }
      T(c, P >= 70 ? m : n, 350, 260, 18, P >= 70 ? OK : INK); T(c, "열", 100, 140, 18, "#ff6b3d"); T(c, "열", 600, 140, 18, "#ff6b3d");
    });
    const say = () => { const [, n, m, fol] = R0[k]; info.innerHTML = `<b class="t">${n} ${P >= 70 ? "→ " + m : ""}</b><p>지하 깊은 곳에서 <b>높은 열과 압력</b>을 받으면 성질이 변해 새로운 암석이 돼요.</p>${P >= 70 ? (fol ? "<p>광물이 압력에 <b>수직인 방향</b>으로 늘어서 줄무늬가 생겼어요 → <b>엽리</b></p>" : "<p>알갱이가 다시 결정을 이루어 더 단단하고 치밀해졌어요.</p>") : "<p>열과 압력을 높여 보세요.</p>"}`; };
    const rg = range("열과 압력", 0, 100, 5, 0, "", v => { P = v; if (v >= 70) task(R0[k][0]); say(); });
    left.append(seg(R0.map((r, i) => [i, r[1]]), k, v => { k = v; if (P >= 70) task(R0[k][0]); say(); }), h("div", { class: "controls" }, rg));
    side(box, left, info); say();
  },
  /* 2-8 암석의 순환 */
  cycle(box, task) {
    const N = { mag: ["마그마", 350, 245, "#ff6b3d"], ign: ["화성암", 160, 160, "#c9a27a"], sed: ["퇴적물", 350, 45, "#e3c88d"], sr: ["퇴적암", 560, 120, "#d8b98a"], met: ["변성암", 540, 230, "#9aa0c8"] };
    const E = [["mag", "ign", "식어서 굳음"], ["ign", "sed", "풍화·침식"], ["sr", "sed", "풍화·침식"], ["met", "sed", "풍화·침식"], ["sed", "sr", "다져지고 굳어짐"], ["ign", "met", "높은 열과 압력"], ["sr", "met", "높은 열과 압력"], ["ign", "mag", "녹음"], ["sr", "mag", "녹음"], ["met", "mag", "녹음"]];
    let at = "mag"; const path = ["마그마"], info = note(), left = h("div"), bx = h("div", { class: "controls" });
    stage(left, 700, 290, c => {
      E.forEach(([a, b]) => { const A = N[a], B = N[b], dx = B[1] - A[1], dy = B[2] - A[2], L = Math.hypot(dx, dy), o = 10; arrow(c, A[1] + dx / L * 48 - dy / L * o, A[2] + dy / L * 30 + dx / L * o, B[1] - dx / L * 52 - dy / L * o, B[2] - dy / L * 34 + dx / L * o, a === at ? RD : "#c9c4e6", a === at ? 4 : 2.5); });
      Object.entries(N).forEach(([k, [n, x, y, col]]) => { rr(c, x - 50, y - 24, 100, 48, 16, col, k === at ? INK : "#fff", k === at ? 4 : 2); T(c, n, x, y, 18); });
    });
    const draw = () => { bx.textContent = ""; E.filter(e => e[0] === at).forEach(([a, b, how]) => bx.append(btn(`${how} → ${N[b][0]}`, () => { at = b; path.push(N[b][0]); task(b); draw(); say(); }, true))); };
    const say = () => { info.innerHTML = `<b class="t">지금: ${N[at][0]}</b><p>빨간 화살표 중 하나를 골라 암석을 변하게 해 보세요.</p><p>지나온 길: ${path.slice(-7).join(" → ")}</p><p class="hint">암석은 주변 환경이 달라지면 오랜 시간 동안 끊임없이 다른 암석으로 변해요 → <b>암석의 순환</b></p>`; };
    left.append(bx); draw(); side(box, left, info); say();
  },
  /* 2-9 풍화와 토양 */
  soil(box, task) {
    const ST = [["단단한 암석이 지표에 드러나요", "rock"], ["물이 틈에서 얼었다 녹고, 식물 뿌리가 자라 암석이 쪼개져요", "s1"], ["암석 조각이 더 잘게 부서져 흙이 되고 생물이 자라요", "s2"], ["물이 스며들며 물에 녹은 물질과 진흙이 아래로 이동해요", "s3"], ["생물이 살 수 있는 토양이 완성되었어요", "s4"]];
    let s = 0; const info = note(), left = h("div");
    stage(left, 700, 290, (c, dt, tt) => {
      c.fillStyle = "#cfeaff"; c.fillRect(0, 0, 700, 290); const y0 = 70;
      rr(c, 120, y0 + 150, 460, 70, 0, "#6f6a66"); T(c, "기반암", 600, y0 + 185, 14, G, "left");
      if (s >= 1) { const R = rnd(4); for (let i = 0; i < 26; i++) rr(c, 125 + R() * 440, y0 + 105 + R() * 40, 18 + R() * 14, 12 + R() * 8, 4, "#827b74", "#5d5751", 1); T(c, "암석 조각", 600, y0 + 125, 14, G, "left"); } else rr(c, 120, y0 + 60, 460, 90, 0, "#7c7670");
      if (s >= 2) { rr(c, 120, y0 + 50, 460, 55, 0, "#a98e6c"); const R = rnd(9); for (let i = 0; i < 160; i++) dot(c, 122 + R() * 456, y0 + 52 + R() * 50, 1.6, "#7d6447"); }
      if (s >= 3) { rr(c, 120, y0 + 20, 460, 30, 0, "#5b4330"); rr(c, 120, y0 + 50, 460, 55, 0, "rgba(176,120,80,.55)"); T(c, "표토", 600, y0 + 35, 14, G, "left"); T(c, "심토", 600, y0 + 78, 14, G, "left"); for (let i = 0; i < 8; i++) arrow(c, 160 + i * 55, y0 + 30 + ((tt * 20 + i * 9) % 50), 160 + i * 55, y0 + 42 + ((tt * 20 + i * 9) % 50), "#4aa3ff", 2); }
      if (s >= 2) for (let i = 0; i < 6; i++) { ln(c, [[150 + i * 80, y0 + 20], [150 + i * 80, y0 - 10]], "#2fa84f", 4); dot(c, 150 + i * 80, y0 - 14, 9, "#2fa84f"); }
      if (s === 1) { for (let i = 0; i < 5; i++) ln(c, [[170 + i * 90, y0 + 60], [180 + i * 90, y0 + 110]], "#cfeaff", 3); T(c, "❄ 얼었다 녹음", 300, 40, 16, BL); }
      if (s === 4) T(c, "토양 완성!", 350, 30, 20, OK);
    });
    const say = () => { info.innerHTML = `<b class="t">${s + 1}단계</b><p>${ST[s][0]}</p><p class="hint">암석이 물, 공기, 생물 등의 영향으로 오랜 시간에 걸쳐 잘게 부서지고 성분이 변하는 현상 → <b>풍화</b></p>`; };
    left.append(h("div", { class: "controls" }, btn("◀ 이전", () => { s = Math.max(0, s - 1); say(); }), btn("오랜 시간이 흐르면 ▶", () => { s = Math.min(4, s + 1); task(ST[s][1]); say(); }, true)));
    side(box, left, info); say();
  },
  /* 2-10 대륙 이동 */
  pangea(box, task) {
    const SH = { na: [[-60, -40], [-10, -55], [40, -40], [55, -10], [20, 20], [0, 50], [-20, 40], [-45, 10], [-65, -15]], sa: [[-20, -55], [15, -50], [45, -25], [40, 5], [15, 35], [0, 70], [-12, 60], [-20, 20], [-35, -20]], af: [[-45, -45], [10, -55], [40, -40], [50, -5], [30, 25], [15, 55], [0, 58], [-10, 25], [-22, 0], [-50, -15]], eu: [[-90, -30], [-20, -45], [60, -40], [110, -20], [90, 10], [30, 15], [-20, 10], [-70, 0]], in: [[-18, -18], [18, -18], [10, 10], [0, 28], [-10, 10]], an: [[-70, -12], [0, -22], [70, -12], [55, 12], [-55, 12]], au: [[-30, -18], [20, -22], [35, 0], [15, 20], [-25, 18], [-35, 0]] };
    const NOW = { na: [150, 95, 0], sa: [215, 215, 0], af: [380, 180, 0], eu: [470, 80, 0], in: [490, 160, 0], an: [400, 310, 0], au: [600, 240, 0] };
    const PG = { na: [285, 85, -.5], sa: [300, 195, -.6], af: [362, 170, 0], eu: [410, 70, 0], in: [415, 230, .9], an: [370, 265, 0], au: [440, 275, .4] };
    const NM = { na: "북아메리카", sa: "남아메리카", af: "아프리카", eu: "유라시아", in: "인도", an: "남극", au: "오스트레일리아" };
    let y = 0, fos = false; const info = note(), left = h("div");
    stage(left, 700, 330, c => {
      c.fillStyle = "#cfe7ff"; c.fillRect(0, 0, 700, 330); const f = y / 2;
      Object.keys(SH).forEach(k => { const a = NOW[k], b = PG[k], x = a[0] + (b[0] - a[0]) * f, yy = a[1] + (b[1] - a[1]) * f, r = a[2] + (b[2] - a[2]) * f; c.save(); c.translate(x, yy); c.rotate(r); poly(c, SH[k], k === "sa" || k === "af" ? "#e9c46a" : "#b9d98a", "#5d6b3a", 2);
        if (fos && ["sa", "af"].includes(k)) dot(c, k === "sa" ? 28 : -18, -6, 8, "#2265c9", "#fff"); if (fos && ["sa", "af", "in", "an", "au"].includes(k)) dot(c, k === "sa" ? 18 : k === "af" ? -8 : 0, 22, 7, "#2fa84f", "#fff"); c.restore(); T(c, NM[k], x, yy, 12, INK); });
      T(c, y === 0 ? "현재" : `약 ${y}억 년 전`, 350, 18, 18, RD); if (fos) { dot(c, 40, 300, 7, "#2265c9"); T(c, "메소사우루스 화석", 52, 300, 13, INK, "left"); dot(c, 40, 318, 7, "#2fa84f"); T(c, "글로소프테리스 화석", 52, 318, 13, INK, "left"); }
    });
    const say = () => { info.innerHTML = `<b class="t">${y >= 2 ? "판게아" : y > 0 ? "대륙이 움직이는 중" : "현재의 대륙 분포"}</b><p>${y >= 2 ? "약 2억 년 전에는 모든 대륙이 하나로 모여 있었어요 (<b>판게아</b>)." : "시간을 거꾸로 돌려 보세요."}</p><p>베게너의 <b>대륙 이동설</b> 증거: 해안선 모양이 잘 들어맞음, 멀리 떨어진 대륙의 <b>화석 분포</b>가 이어짐, 빙하의 흔적, 지질 구조가 이어짐</p>`; };
    left.append(h("div", { class: "controls" }, range("과거로", 0, 2, .1, 0, "억 년 전", v => { y = Math.round(v * 10) / 10; if (y >= 2) task("pg"); if (y === 0) task("now"); say(); })), h("div", { class: "controls" }, btn("화석 분포 보기", () => { fos = !fos; if (fos) task("fos"); }, true)));
    side(box, left, info); say();
  },
  /* 2-11 판의 경계와 화산대·지진대 */
  plates(box, task) {
    const B = [[[205, 40], [225, 90], [238, 140], [250, 190], [272, 230], [300, 262], [330, 300]], [[240, 50], [380, 45], [520, 58]], [[530, 70], [545, 140], [575, 195], [592, 240], [588, 310]], [[655, 30], [648, 120], [668, 230], [655, 320]], [[70, 150], [130, 158], [200, 172]], [[520, 200], [500, 320]], [[40, 230], [60, 300]]];
    const LAND = [[[90, 40], [210, 40], [230, 110], [205, 180], [150, 175], [80, 160], [40, 100]], [[30, 170], [80, 170], [95, 230], [60, 300], [30, 260]], [[215, 230], [290, 225], [300, 270], [240, 285]], [[400, 40], [520, 50], [560, 130], [500, 170], [440, 120]], [[560, 200], [620, 200], [600, 300], [575, 310], [560, 250]], [[150, 318], [600, 318], [600, 330], [150, 330]]];
    let q = false, v = false, b = false, kr = false; const R = rnd(21), QS = [], VS = []; B.forEach((l, i) => l.forEach((p, j) => { if (!j) return; const a = l[j - 1]; for (let s = 0; s < 1; s += .08) { const x = a[0] + (p[0] - a[0]) * s, y = a[1] + (p[1] - a[1]) * s; QS.push([x + (R() - .5) * 22, y + (R() - .5) * 22]); if (i !== 4 && R() < .35) VS.push([x + (R() - .5) * 14, y + (R() - .5) * 14]); } })); for (let i = 0; i < 12; i++) QS.push([R() * 700, R() * 330]);
    const info = note(), left = h("div");
    stage(left, 700, 330, c => {
      c.fillStyle = "#cfe7ff"; c.fillRect(0, 0, 700, 330); LAND.forEach(p => poly(c, p, "#d9c99a", "#a8946a", 1.5));
      if (b) B.forEach(l => ln(c, l, RD, 3, [8, 5])); if (q) QS.forEach(([x, y]) => dot(c, x, y, 2.6, "#e08a2b")); if (v) VS.forEach(([x, y]) => poly(c, [[x, y - 5], [x + 5, y + 4], [x - 5, y + 4]], "#b3261e"));
      if (kr) { dot(c, 208, 112, 6, BL, "#fff"); T(c, "우리나라", 196, 104, 13, BL, "right"); dot(c, 232, 118, 6, "#7a5cff", "#fff"); T(c, "일본", 244, 120, 13, "#7a5cff", "left"); }
      T(c, "태평양", 400, 190, 18, "#6a8db8");
    });
    const say = () => { info.innerHTML = `<b class="t">화산 활동과 지진이 일어나는 곳</b><p>지진, 화산, 판의 경계를 차례로 켜 보세요.</p>${q || v ? "<p>지진대와 화산대는 <b>띠 모양</b>으로 분포해요.</p>" : ""}${b && (q || v) ? "<p>지진대·화산대는 <b>판의 경계</b>와 거의 일치해요. 판이 움직이며 경계에서 부딪치거나 멀어지기 때문이에요.</p>" : ""}${kr ? "<p>일본은 판의 경계에 가까워 지진과 화산 활동이 잦고, 우리나라는 경계에서 조금 떨어져 있어요.</p>" : ""}<p class="hint">판: 지각과 맨틀 윗부분을 포함하는 약 100 km 두께의 단단한 암석층</p>`; };
    left.append(h("div", { class: "controls" }, btn("지진 발생 위치", () => { q = !q; task("q"); say(); }), btn("화산 위치", () => { v = !v; task("v"); say(); }), btn("판의 경계", () => { b = !b; task("b"); say(); }, true), btn("우리나라와 일본", () => { kr = !kr; task("kr"); say(); })));
    side(box, left, info); say();
  },
  /* 3-1 빛의 반사와 굴절, 물체를 보는 과정 */
  seeing(box, task) {
    let mode = "see", on = false, a = 40; const tried = { refl: new Set(), refr: new Set() }, info = note(), left = h("div");
    stage(left, 700, 300, c => {
      if (mode === "see") { c.fillStyle = on ? "#fffbe8" : "#1c1d2e"; c.fillRect(0, 0, 700, 300); dot(c, 120, 70, 24, on ? "#ffe066" : "#555", INK); T(c, "전등", 120, 110, 15, on ? INK : "#aaa");
        dot(c, 360, 200, 34, on ? "#e0303a" : "#3a2a2e"); ln(c, [[360, 166], [366, 150]], on ? "#2fa84f" : "#333", 5); T(c, "사과", 360, 255, 15, on ? INK : "#777");
        c.fillStyle = on ? "#fff" : "#444"; c.beginPath(); c.ellipse(600, 120, 34, 20, 0, 0, 7); c.fill(); dot(c, 600, 120, 10, on ? "#2b2f8a" : "#222"); T(c, "눈", 600, 158, 15, on ? INK : "#aaa");
        if (on) { arrow(c, 140, 85, 330, 180, "#e0a800", 4); arrow(c, 392, 190, 566, 128, "#e0303a", 4); } }
      else { c.fillStyle = "#f7f8fc"; c.fillRect(0, 0, 700, 300); const cx = 350, cy = mode === "refl" ? 240 : 150, r = a * Math.PI / 180;
        if (mode === "refl") { rr(c, 150, cy, 400, 14, 2, "#cfd6e6", INK, 2); T(c, "거울", 600, cy + 7, 15); } else { c.fillStyle = "rgba(90,160,255,.3)"; c.fillRect(0, cy, 700, 150); T(c, "공기", 60, cy - 20, 15, G); T(c, "물", 60, cy + 22, 15, BL); }
        ln(c, [[cx, cy - 140], [cx, mode === "refl" ? cy : cy + 140]], "#9aa3b5", 2, [6, 6]); T(c, "법선", cx + 4, cy - 148, 13, G, "left");
        const L = 200; arrow(c, cx - Math.sin(r) * L, cy - Math.cos(r) * L, cx - Math.sin(r) * 4, cy - Math.cos(r) * 4, RD, 4);
        if (mode === "refl") { arrow(c, cx, cy, cx + Math.sin(r) * L, cy - Math.cos(r) * L, RD, 4); T(c, `입사각 ${a}°`, cx - 70, cy - 70, 15, RD); T(c, `반사각 ${a}°`, cx + 70, cy - 70, 15, RD); }
        else { const b = Math.asin(Math.sin(r) / 1.33); arrow(c, cx, cy, cx + Math.sin(b) * L * .7, cy + Math.cos(b) * L * .7, RD, 4); ln(c, [[cx, cy], [cx + Math.sin(r) * 120, cy + Math.cos(r) * 120]], "#c9c4e6", 2, [4, 6]); T(c, `입사각 ${a}°`, cx - 80, cy - 60, 15, RD); T(c, `굴절각 약 ${Math.round(b * 180 / Math.PI)}°`, cx + 90, cy + 80, 15, RD); } }
    });
    const say = () => { info.innerHTML = mode === "see" ? `<b class="t">물체를 보는 과정</b><p>${on ? "광원에서 나온 빛이 사과에서 <b>반사</b>되어 눈에 들어와요. 그래서 사과가 보여요." : "빛이 없으면 사과에서 반사되는 빛이 없어 보이지 않아요. 전등을 켜 보세요."}</p><p class="hint">태양, 전등처럼 스스로 빛을 내는 물체 → <b>광원</b></p>` : mode === "refl" ? `<b class="t">빛의 반사</b><p>입사각을 바꿔 보세요. 입사각과 반사각은 <b>항상 같아요</b> → 반사 법칙</p><p class="hint">각은 거울 면이 아니라 <b>법선</b>을 기준으로 재요.</p>` : `<b class="t">빛의 굴절</b><p>빛이 공기에서 물로 비스듬히 들어가면 경계면에서 <b>꺾여요</b>. 수직으로 들어가면 꺾이지 않아요.</p>`; };
    const rg = range("입사각", 0, 80, 5, 40, "°", v => { a = v; if (mode !== "see") { tried[mode].add(v); if (tried[mode].size >= 2) task(mode); } say(); });
    left.append(seg([["see", "물체 보기"], ["refl", "반사"], ["refr", "굴절"]], mode, v => { mode = v; say(); }), h("div", { class: "controls" }, btn("전등 켜기/끄기", () => { mode = "see"; on = !on; if (on) task("see"); say(); }, true), rg));
    side(box, left, info); say();
  },
  /* 3-2 평면거울의 상 */
  planemirror(box, task) {
    let d = 140, rays = false; const info = note(), left = h("div");
    const F = (c, x, y, s, flip) => { c.save(); c.translate(x, y); c.scale(flip ? -1 : 1, 1); ln(c, [[-12 * s, 40 * s], [-12 * s, -40 * s], [22 * s, -40 * s]], flip ? "rgba(224,54,107,.55)" : "#e0366b", 9 * s); ln(c, [[-12 * s, 0], [14 * s, 0]], flip ? "rgba(224,54,107,.55)" : "#e0366b", 9 * s); c.restore(); };
    stage(left, 700, 300, c => {
      c.fillStyle = "#f7f8fc"; c.fillRect(0, 0, 700, 300); const mx = 350; rr(c, mx - 6, 30, 12, 240, 3, "#cfd6e6", INK, 2); T(c, "평면거울", mx, 20, 15);
      F(c, mx - d, 150, 1, false); F(c, mx + d, 150, 1, true); T(c, "물체", mx - d, 210, 15); T(c, "상", mx + d, 210, 15, "#b0306a");
      ln(c, [[mx - d, 245], [mx, 245]], BL, 2); ln(c, [[mx, 255], [mx + d, 255]], "#b0306a", 2, [5, 5]); T(c, `${d}`, mx - d / 2, 233, 13, BL); T(c, `${d}`, mx + d / 2, 268, 13, "#b0306a");
      const ex = 120, ey = 60; c.fillStyle = "#fff"; c.beginPath(); c.ellipse(ex, ey, 22, 13, 0, 0, 7); c.fill(); c.strokeStyle = INK; c.lineWidth = 2; c.stroke(); dot(c, ex, ey, 6, INK); T(c, "눈", ex, ey - 24, 14);
      if (rays) [[mx - d + 22, 110], [mx - d - 12, 190]].forEach(([ox, oy]) => { const ix = 2 * mx - ox, t = (mx - ex) / (ix - ex), hy = ey + (oy - ey) * t; arrow(c, ox, oy, mx - 2, hy, "#e0a800", 3); arrow(c, mx, hy, ex + 20, ey + 6, "#e0a800", 3); ln(c, [[mx, hy], [ix, oy]], "#e0a800", 2, [5, 6]); });
    });
    const say = () => { info.innerHTML = `<b class="t">평면거울에 생기는 상</b><p>물체를 움직여 보세요. 거울에서 상까지의 거리는 물체까지의 거리와 <b>같아요</b>. 상의 크기도 물체와 <b>같고</b>, <b>좌우가 바뀌어</b> 보여요.</p>${rays ? "<p>물체에서 나온 빛이 거울에서 <b>반사 법칙</b>에 따라 반사되어 눈에 들어와요. 눈은 반사된 빛의 <b>연장선</b>이 모이는 곳에 물체가 있다고 느껴요.</p>" : ""}`; };
    left.append(h("div", { class: "controls" }, range("거울까지 거리", 40, 300, 10, 140, "", v => { d = v; if (v <= 80) task("near"); if (v >= 240) task("far"); say(); }), btn("빛의 경로 보기", () => { rays = !rays; task("rays"); say(); }, true)));
    side(box, left, info); say();
  },
  /* 3-3 거울과 렌즈의 모양과 빛 */
  shapes(box, task) {
    const O = [["pm", "평면거울"], ["vm", "볼록 거울"], ["cm", "오목 거울"], ["vl", "볼록 렌즈"], ["cl", "오목 렌즈"]];
    let k = "vl"; const info = note(), left = h("div");
    stage(left, 700, 280, c => {
      c.fillStyle = "#f7f8fc"; c.fillRect(0, 0, 700, 280); const cx = 360, cy = 140, lens = k[1] === "l", F = 120;
      if (k === "pm") rr(c, cx - 4, 30, 10, 220, 2, "#cfd6e6", INK, 2);
      if (k === "vm" || k === "cm") { c.beginPath(); const s = k === "vm" ? -1 : 1; c.moveTo(cx, 30); c.quadraticCurveTo(cx + s * -40 + 0, cy, cx, 250); c.strokeStyle = INK; c.lineWidth = 8; c.stroke(); }
      if (k === "vl") { c.beginPath(); c.moveTo(cx, 30); c.quadraticCurveTo(cx + 40, cy, cx, 250); c.quadraticCurveTo(cx - 40, cy, cx, 30); c.fillStyle = "rgba(120,190,255,.45)"; c.fill(); c.strokeStyle = INK; c.lineWidth = 2; c.stroke(); }
      if (k === "cl") { c.beginPath(); c.moveTo(cx - 24, 30); c.lineTo(cx + 24, 30); c.quadraticCurveTo(cx + 4, cy, cx + 24, 250); c.lineTo(cx - 24, 250); c.quadraticCurveTo(cx - 4, cy, cx - 24, 30); c.fillStyle = "rgba(120,190,255,.45)"; c.fill(); c.strokeStyle = INK; c.lineWidth = 2; c.stroke(); }
      [-80, -40, 0, 40, 80].forEach(o => { const y = cy + o; ln(c, [[60, y], [cx, y]], "#e0a800", 3); let ex, ey;
        if (k === "pm") { ex = 60; ey = y; } else if (k === "cm") { ex = cx - F * 2; ey = cy - o; } else if (k === "vm") { ex = 60; ey = y + o * 1.6; } else if (k === "vl") { ex = cx + F * 2.2; ey = cy - o * 1.2; } else { ex = 660; ey = y + o * 1.5; }
        arrow(c, cx, y, ex, ey, "#e0a800", 3); if (k === "vm" || k === "cl") ln(c, [[cx, y], [k === "vm" ? cx + F * .5 : cx - F, cy]], "#e0a800", 1.5, [4, 6]); });
      if (k === "cm" || k === "vl") dot(c, k === "cm" ? cx - F : cx + F, cy, 6, RD); T(c, O.find(o => o[0] === k)[1], 600, 30, 18);
    });
    const D = { pm: ["빛이 반사 법칙에 따라 그대로 반사돼요.", "손거울, 전신 거울"], vm: ["반사된 빛이 <b>퍼져요</b> → 넓은 범위를 볼 수 있어요.", "도로 반사 거울, 자동차 측면 거울, 상점 감시 거울"], cm: ["반사된 빛이 한 점으로 <b>모여요</b>.", "화장용 확대 거울, 치과용 거울, 손전등 반사판"], vl: ["가운데가 두꺼워요. 통과한 빛이 <b>모여요</b>.", "돋보기, 카메라 렌즈, 원시 안경"], cl: ["가운데가 얇아요. 통과한 빛이 <b>퍼져요</b>.", "근시 안경, 현관문 보안경"] };
    const say = () => { info.innerHTML = `<b class="t">${O.find(o => o[0] === k)[1]}</b><p>${D[k][0]}</p><p>생활 속 예: ${D[k][1]}</p>`; };
    left.append(seg(O, k, v => { k = v; task(v); say(); })); task("vl"); side(box, left, info); say();
  },
  /* 3-4 거울과 렌즈에 의한 상 */
  image(box, task) {
    const O = [["vl", "볼록 렌즈", 1], ["cl", "오목 렌즈", -1], ["cm", "오목 거울", 1], ["vm", "볼록 거울", -1]];
    let k = 0, d = .5; const info = note(), left = h("div");
    const calc = () => { const s = O[k][2]; if (Math.abs(d - 1) < .04 && s > 0) return null; const di = 1 / (s - 1 / d); return -di / d; };
    const cat = (c, x, y, sc, col) => { c.save(); c.translate(x, y); c.scale(sc, sc); dot(c, 0, 0, 40, col); poly(c, [[-36, -18], [-30, -56], [-8, -36]], col); poly(c, [[36, -18], [30, -56], [8, -36]], col); dot(c, -14, -6, 6, INK); dot(c, 14, -6, 6, INK); poly(c, [[-5, 8], [5, 8], [0, 14]], "#e0366b"); c.restore(); };
    stage(left, 700, 290, c => {
      c.fillStyle = "#f7f8fc"; c.fillRect(0, 0, 700, 290); T(c, "물체", 140, 24, 16); cat(c, 140, 150, 1, "#ffb347");
      T(c, "보이는 상", 480, 24, 16); rr(c, 330, 40, 300, 230, 16, "#fff", "#b8bccb", 2); const m = calc();
      if (m === null) T(c, "상이 흐릿해 보이지 않아요", 480, 155, 16, G); else { c.save(); c.beginPath(); c.rect(332, 42, 296, 226); c.clip(); cat(c, 480, 155, Math.max(-3, Math.min(3, m)) * 1, "#ffb347"); c.restore(); }
      T(c, `물체까지 거리: 초점 거리의 ${d.toFixed(1)}배`, 140, 270, 14, G);
    });
    const say = () => { const m = calc(), n = O[k][1]; let t = "상이 생기지 않아요 (초점 위치)"; if (m !== null) t = `${Math.abs(m) > 1.05 ? "물체보다 <b>크고</b>" : Math.abs(m) < .95 ? "물체보다 <b>작고</b>" : "물체와 크기가 비슷하고"} ${m > 0 ? "<b>바로 선</b>" : "<b>거꾸로 선</b>"} 상`;
      info.innerHTML = `<b class="t">${n}</b><p>${t}</p><p class="hint">${O[k][2] < 0 ? "볼록 거울·오목 렌즈: 거리와 관계없이 항상 작고 바로 선 상" : "오목 거울·볼록 렌즈: 가까우면 크고 바로 선 상, 멀어지면 거꾸로 선 상"}</p>`;
      if (m !== null) { if (O[k][2] > 0 && m > 1) task("big"); if (O[k][2] > 0 && m < 0) task("inv"); if (O[k][2] < 0) task("small"); } };
    left.append(seg(O.map((o, i) => [i, o[1]]), k, v => { k = v; say(); }), h("div", { class: "controls" }, range("거리", .2, 4, .1, .5, " 배", v => { d = v; say(); })));
    side(box, left, info); say();
  },
  /* 3-5 빛의 합성과 물체의 색 */
  rgb(box, task) {
    let mode = "mix", R = true, Gn = true, B = false, light = "W", obj = 0; const info = note(), left = h("div");
    const OB = [["딸기", ["R", "G"]], ["선인장과 화분", ["G", "B"]], ["흰 종이", ["W"]]], LC = { W: [1, 1, 1], R: [1, 0, 0], G: [0, 1, 0], B: [0, 0, 1] };
    const col = v => `rgb(${v[0] * 255},${v[1] * 255},${v[2] * 255})`, ref = (part, L) => { const m = { R: [1, 0, 0], G: [0, 1, 0], B: [0, 0, 1], W: [1, 1, 1] }[part]; return m.map((x, i) => x * L[i]); };
    stage(left, 700, 290, c => {
      c.fillStyle = "#0d0d14"; c.fillRect(0, 0, 700, 290);
      if (mode === "mix") { c.save(); c.globalCompositeOperation = "lighter"; [[R, "#ff0000", 300, 120], [Gn, "#00ff00", 400, 120], [B, "#0000ff", 350, 205]].forEach(([on, cc, x, y]) => { if (on) dot(c, x, y, 95, cc); }); c.restore(); }
      else { const L = LC[light], [n, parts] = OB[obj]; T(c, "조명: " + { W: "백색광", R: "빨간색", G: "초록색", B: "파란색" }[light], 350, 24, 16, col(L.map(x => .4 + x * .6)));
        if (obj === 0) { c.fillStyle = col(ref("R", L)); c.beginPath(); c.moveTo(350, 250); c.bezierCurveTo(250, 170, 270, 80, 350, 90); c.bezierCurveTo(430, 80, 450, 170, 350, 250); c.fill(); poly(c, [[310, 92], [350, 60], [390, 92], [350, 105]], col(ref("G", L))); }
        if (obj === 1) { rr(c, 300, 60, 100, 130, 40, col(ref("G", L))); poly(c, [[280, 190], [420, 190], [400, 270], [300, 270]], col(ref("B", L))); }
        if (obj === 2) rr(c, 250, 70, 200, 180, 6, col(ref("W", L))); }
    });
    const nm = () => { const k = (R ? "R" : "") + (Gn ? "G" : "") + (B ? "B" : ""); return { R: "빨간색", G: "초록색", B: "파란색", RG: "노란색", GB: "청록색", RB: "자홍색", RGB: "흰색", "": "검은색(빛 없음)" }[k]; };
    const say = () => { if (mode === "mix") { info.innerHTML = `<b class="t">빛의 삼원색 합성</b><p>지금 켠 빛이 겹친 곳의 색: <b>${nm()}</b></p><p>빨강+초록 = 노랑, 초록+파랑 = 청록, 파랑+빨강 = 자홍, 셋 모두 = <b>흰색</b></p><p class="hint">영상 장치의 화소도 빨강·초록·파랑 빛을 켜고 끄거나 밝기를 조절해 색을 나타내요.</p>`; const k = (R ? "R" : "") + (Gn ? "G" : "") + (B ? "B" : ""); ({ RG: "y", GB: "c", RB: "m", RGB: "w" })[k] && task({ RG: "y", GB: "c", RB: "m", RGB: "w" }[k]); }
      else info.innerHTML = `<b class="t">${OB[obj][0]}의 색</b><p>물체는 자신의 색에 해당하는 빛만 <b>반사</b>하고 나머지 빛은 <b>흡수</b>해요. 반사하는 빛이 없으면 <b>검게</b> 보여요.</p>`; };
    const T3 = h("div", { class: "controls" }, [["R", "빨간색 빛"], ["G", "초록색 빛"], ["B", "파란색 빛"]].map(([id, n]) => { const b = h("button", { type: "button", class: "tg" + ((id === "R" && R) || (id === "G" && Gn) || (id === "B" && B) ? " on" : ""), onclick: () => { mode = "mix"; if (id === "R") R = !R; if (id === "G") Gn = !Gn; if (id === "B") B = !B; b.classList.toggle("on"); say(); } }, n); return b; }));
    left.append(seg([["mix", "빛의 합성"], ["obj", "조명과 물체의 색"]], mode, v => { mode = v; say(); }), T3, h("div", { class: "controls" }, OB.map((o, i) => btn(o[0], () => { mode = "obj"; obj = i; say(); })), ...["W", "R", "G", "B"].map(l => btn({ W: "백색", R: "빨강", G: "초록", B: "파랑" }[l] + " 조명", () => { mode = "obj"; light = l; if (l !== "W") task("obj"); say(); }))));
    side(box, left, info); say();
  },
  /* 3-6 파동의 전달 */
  wave(box, task) {
    let A = 40, f = 1, parts = false, ph = 0; const info = note(), left = h("div");
    stage(left, 700, 280, (c, dt) => {
      ph += dt * f * Math.PI * 2; c.fillStyle = "#f7f8fc"; c.fillRect(0, 0, 700, 280); const y0 = 140, lam = 260 / f;
      ln(c, [[30, y0], [680, y0]], "#c9c4e6", 1.5, [6, 6]);
      const pts = []; for (let x = 40; x <= 680; x += 4) pts.push([x, y0 - A * Math.sin(ph - (x - 40) / lam * Math.PI * 2)]); ln(c, pts, BL, 4);
      for (let x = 40; x <= 680; x += 32) { const y = y0 - A * Math.sin(ph - (x - 40) / lam * Math.PI * 2); dot(c, x, y, x === 232 ? 9 : 5, x === 232 ? RD : "#7aa7e8", x === 232 ? "#fff" : null); }
      T(c, "손으로 흔드는 쪽", 60, 24, 14, G, "left"); arrow(c, 480, 24, 600, 24, OK, 4); T(c, "파동의 진행 방향", 540, 46, 13, OK);
      if (parts) { let x = 40 + lam * (ph / (Math.PI * 2) % 1 + .25); while (x > 40 + lam) x -= lam; T(c, "마루", x, y0 - A - 16, 14, RD); T(c, "골", x + lam / 2, y0 + A + 16, 14, RD); ln(c, [[x, y0 - A - 30], [x + lam, y0 - A - 30]], RD, 2); T(c, "파장", x + lam / 2, y0 - A - 42, 13, RD); ln(c, [[660, y0], [660, y0 - A]], "#7a5cff", 3); T(c, "진폭", 668, y0 - A / 2, 13, "#7a5cff", "left"); }
    });
    const say = () => { info.innerHTML = `<b class="t">줄을 흔들어 파동 만들기</b><p>빨간 점(매질)을 보세요. 파동은 앞으로 나아가지만 매질은 <b>제자리에서 위아래로 진동</b>만 해요.</p><p>진폭 ${A}, 진동수 ${f} Hz (1초에 ${f}번 진동)</p>${parts ? "<p>마루와 이웃한 마루 사이 거리 = <b>파장</b>, 진동 중심에서 마루까지 = <b>진폭</b></p>" : ""}<p class="hint">파동은 에너지와 정보를 전달해요.</p>`; };
    left.append(h("div", { class: "controls" }, range("흔드는 폭", 10, 70, 5, 40, "", v => { A = v; task("amp"); say(); }), range("빠르기", .5, 2, .5, 1, " Hz", v => { f = v; task("freq"); say(); })), h("div", { class: "controls" }, btn("파동의 요소 보기", () => { parts = !parts; task("parts"); say(); }, true)));
    side(box, left, info); say();
  },
  /* 3-7 소리의 세기·높낮이·음색 */
  sound(box, task) {
    let A = .5, f = 440, ty = "sine"; const NM = { sine: "플루트 같은 소리", triangle: "리코더 같은 소리", sawtooth: "바이올린 같은 소리", square: "클라리넷 같은 소리" }, info = note(), left = h("div"); let ac = null;
    const wf = x => { const p = x % 1; return ty === "sine" ? Math.sin(p * 2 * Math.PI) : ty === "triangle" ? 1 - 4 * Math.abs(p - .5) : ty === "sawtooth" ? 2 * p - 1 : (p < .5 ? 1 : -1) * .9; };
    stage(left, 700, 260, (c, dt, t) => {
      c.fillStyle = "#14183a"; c.fillRect(0, 0, 700, 260); ln(c, [[20, 130], [680, 130]], "#3a4170", 1.5); const per = 44000 / f / 2; const pts = []; for (let x = 20; x <= 680; x += 2) pts.push([x, 130 - A * 100 * wf((x - 20) / per + t * .3)]); ln(c, pts, "#7dffb0", 3);
      T(c, "소리 분석 화면", 80, 20, 14, "#9aa3d0");
    });
    const play = () => { try { ac = ac || new (window.AudioContext || window.webkitAudioContext)(); const o = ac.createOscillator(), g = ac.createGain(); o.type = ty; o.frequency.value = f; g.gain.value = 0; g.gain.linearRampToValueAtTime(A * .25, ac.currentTime + .03); g.gain.linearRampToValueAtTime(0, ac.currentTime + .9); o.connect(g).connect(ac.destination); o.start(); o.stop(ac.currentTime + 1); } catch (e) { } };
    const say = () => { info.innerHTML = `<b class="t">${NM[ty]}</b><p>세기: 진폭 ${Math.round(A * 100)} → ${A > .6 ? "<b>큰</b>" : A < .35 ? "<b>작은</b>" : "보통"} 소리</p><p>높낮이: 진동수 ${f} Hz → ${f > 600 ? "<b>높은</b>" : f < 330 ? "<b>낮은</b>" : "보통"} 소리</p><p>소리의 세기 = <b>진폭</b>, 높낮이 = <b>진동수</b>, 음색 = <b>파형</b></p>`; };
    left.append(h("div", { class: "controls" }, range("세기", .1, 1, .05, .5, "", v => { A = v; task("loud"); say(); }), range("높낮이", 220, 880, 10, 440, " Hz", v => { f = v; task("pitch"); say(); })), seg(Object.entries(NM).map(([k, n]) => [k, n.replace(" 같은 소리", "")]), ty, v => { ty = v; task("tone"); say(); }), h("div", { class: "controls" }, btn("🔊 소리 듣기", play, true)));
    side(box, left, info); say();
  },
  /* 4-1 물의 전기 분해 */
  electro(box, task) {
    let on = false, v = 0, test = ""; const info = note(), left = h("div");
    stage(left, 700, 300, (c, dt, tt) => {
      if (on) v = Math.min(1, v + dt * .12);
      c.fillStyle = "#f7f8fc"; c.fillRect(0, 0, 700, 300); [[230, "(-)극", 2], [470, "(+)극", 1]].forEach(([x, n, r]) => { rr(c, x - 30, 40, 60, 210, 10, "rgba(160,200,255,.35)", INK, 3); const gh = 150 * v * r / 2; rr(c, x - 27, 43, 54, gh, 6, "rgba(255,255,255,.95)"); T(c, n, x, 270, 16, x < 300 ? BL : RD); for (let i = 0; i < 8 && on; i++) dot(c, x - 15 + (i * 7) % 30, 240 - ((tt * 70 + i * 23) % (190 - gh)), 2.5, "#fff", "#9aa3b5", 1); T(c, `기체 ${Math.round(gh / 3)} mL`, x, 30, 14, G); });
      rr(c, 300, 250, 100, 30, 6, on ? OK : "#9aa3b5"); T(c, on ? "전원 켜짐" : "전원 꺼짐", 350, 265, 14, "#fff");
      if (test === "h") { T(c, "🔥 퍽!", 230, 80, 26, RD); } if (test === "o") { T(c, "🔥 불씨가 다시 타올라요", 520, 80, 18, "#e08a2b"); }
    });
    const say = () => { info.innerHTML = `<b class="t">물의 전기 분해</b><p>${v < .5 ? "전원을 켜고 기체가 모이기를 기다려 보세요. (물에 수산화 나트륨을 조금 녹여 전류가 잘 흐르게 해요)" : "(-)극 쪽 기체가 (+)극 쪽의 약 <b>2배</b> 모였어요."}</p>${test === "h" ? "<p>(-)극 기체에 성냥불 → '퍽' 소리: <b>수소</b></p>" : ""}${test === "o" ? "<p>(+)극 기체에 꺼져 가는 불씨 → 다시 타오름: <b>산소</b></p>" : ""}<p class="hint">물은 수소와 산소로 분해돼요 → 물은 원소가 아니라 <b>화합물</b></p>`; };
    left.append(h("div", { class: "controls" }, btn("전원 켜기", () => { on = true; task("on"); say(); }, true), btn("(-)극 기체에 성냥불", () => { if (v < .5) return; test = "h"; task("h2"); say(); }), btn("(+)극 기체에 꺼져 가는 불씨", () => { if (v < .5) return; test = "o"; task("o2"); say(); })));
    setInterval(() => { if (on && v >= .5 && !info.dataset.k) { info.dataset.k = 1; say(); } }, 500);
    side(box, left, info); say();
  },
  /* 4-2 화학식 만들기 */
  formula(box, task) {
    const A = { H: ["#ffffff", 14], C: ["#3a3a3a", 20], N: ["#3b6bd9", 19], O: ["#e0303a", 19], Cl: ["#2fa84f", 22] }, K = { H2O: "물", CO2: "이산화 탄소", NH3: "암모니아", CH4: "메테인", HCl: "염화 수소", H2O2: "과산화 수소", H2: "수소", O2: "산소", N2: "질소", CO: "일산화 탄소" };
    let bag = {}; const made = new Set(), info = note(), left = h("div");
    const NORM = { CH4: "CH4", H2O: "H2O", CO2: "CO2", H3N: "NH3", HCl: "HCl", H2O2: "H2O2", H2: "H2", O2: "O2", N2: "N2", CO: "CO" };
    const f = () => NORM[["C", "H", "N", "Cl", "O"].filter(e => bag[e]).map(e => e + (bag[e] > 1 ? bag[e] : "")).join("")] || null;
    const sub = s => s.replace(/(\d)/g, m => "₀₁₂₃₄₅₆₇₈₉"[m]);
    stage(left, 700, 250, (c, dt, tt) => {
      c.fillStyle = "#f7f8fc"; c.fillRect(0, 0, 700, 250); const list = Object.entries(bag).flatMap(([e, n]) => Array(n).fill(e)); const fm = f();
      list.forEach((e, i) => { const a = i / Math.max(1, list.length) * Math.PI * 2, r = list.length > 1 ? 34 : 0, x = 350 + Math.cos(a) * r, y = 120 + Math.sin(a) * r; dot(c, x, y, A[e][1], A[e][0], INK); T(c, e, x, y, 14, e === "C" || e === "N" ? "#fff" : INK); });
      T(c, fm ? `${K[fm]} ${sub(fm)}` : list.length ? "알려진 물질이 아니에요" : "원자를 골라 보세요", 350, 215, 20, fm ? OK : G);
    });
    const say = () => { const fm = f(); info.innerHTML = `<b class="t">원자를 모아 분자 만들기</b><p>원자 버튼을 눌러 모으면 화학식이 나와요. 물(H₂O), 이산화 탄소(CO₂), 암모니아(NH₃)를 만들어 보세요.</p>${fm ? `<p><b>${sub(fm)}</b>: ${Object.entries(bag).map(([e, n]) => `${{ H: "수소", C: "탄소", N: "질소", O: "산소", Cl: "염소" }[e]} 원자 ${n}개`).join(", ")}</p>` : ""}<p>만든 물질: ${[...made].map(sub).join(", ") || "-"}</p><p class="hint">원소 기호 오른쪽 아래의 작은 숫자는 원자의 개수예요. 1은 쓰지 않아요.</p>`; };
    left.append(h("div", { class: "controls" }, Object.keys(A).map(e => btn(e + " 더하기", () => { if (Object.values(bag).reduce((a, b) => a + b, 0) >= 6) return; bag[e] = (bag[e] || 0) + 1; const fm = f(); if (fm) { made.add(fm); if (["H2O", "CO2", "NH3"].includes(fm)) task(fm); } say(); })), btn("비우기", () => { bag = {}; say(); }, true)));
    side(box, left, info); say();
  },
  /* 4-3 원자의 구조 */
  atom(box, task) {
    const EL = ["", "수소 H", "헬륨 He", "리튬 Li", "베릴륨 Be", "붕소 B", "탄소 C", "질소 N", "산소 O", "플루오린 F", "네온 Ne", "나트륨 Na", "마그네슘 Mg", "알루미늄 Al", "규소 Si", "인 P", "황 S", "염소 Cl", "아르곤 Ar", "칼륨 K", "칼슘 Ca"];
    let p = 2, n = 2, e = 2, eOnly = false; const info = note(), left = h("div");
    stage(left, 700, 300, (c, dt, tt) => {
      c.fillStyle = "#f7f8fc"; c.fillRect(0, 0, 700, 300); const cx = 250, cy = 150, R = rnd(3);
      for (let i = 0; i < p + n; i++) { const a = R() * 7, r = Math.sqrt(R()) * (6 + Math.sqrt(p + n) * 4); dot(c, cx + Math.cos(a) * r, cy + Math.sin(a) * r, 7, i < p ? RD : "#b8bccb", "#fff", 1); }
      const sh = [2, 8, 8, 2]; let left_ = e; sh.forEach((cap, s) => { const k = Math.min(cap, left_); left_ -= k; if (k <= 0 && s > 0 && left_ <= 0) return; c.beginPath(); c.arc(cx, cy, 50 + s * 32, 0, 7); c.strokeStyle = "#d9d6ea"; c.lineWidth = 1.5; c.stroke(); for (let i = 0; i < k; i++) { const a = i / k * 7 + tt * (.6 - s * .1); dot(c, cx + Math.cos(a) * (50 + s * 32), cy + Math.sin(a) * (50 + s * 32), 6, BL, "#fff", 1); } });
      T(c, "● 양성자 (+)", 480, 80, 16, RD, "left"); T(c, "● 중성자", 480, 110, 16, G, "left"); T(c, "● 전자 (−)", 480, 140, 16, BL, "left"); T(c, "원자핵 = 양성자 + 중성자", 480, 180, 14, INK, "left");
    });
    const say = () => { const q = p - e; info.innerHTML = `<b class="t">${EL[p] || "?"}</b><p>양성자 ${p}개, 중성자 ${n}개, 전자 ${e}개</p><p>${q === 0 ? "양성자 수 = 전자 수 → 전기적으로 <b>중성</b>인 원자" : `전하 ${q > 0 ? "+" + q : q} → 전자 수가 달라 전하를 띠어요 (이온). 하지만 <b>양성자 수가 같으니 원소의 종류는 그대로</b>예요.`}</p><p class="hint">원소의 종류는 <b>양성자 수</b>에 따라 정해져요.</p>`; };
    const chk = () => { if (p === e) { if (p === 2) task("he"); if (p === 7) task("n"); if (p === 11) task("na"); } if (eOnly) task("ion"); say(); };
    const pm = (lab, get, set, mn, mx) => h("span", { class: "rg" }, lab, btn("−", () => { set(Math.max(mn, get() - 1)); chk(); }), btn("+", () => { set(Math.min(mx, get() + 1)); chk(); }));
    left.append(h("div", { class: "controls" }, pm("양성자", () => p, v => { p = v; eOnly = false; }, 1, 20), pm("중성자", () => n, v => { n = v; }, 0, 22), pm("전자", () => e, v => { e = v; eOnly = p !== v; }, 0, 20)), h("div", { class: "controls" }, btn("질소 원자 만들기", () => { p = 7; n = 7; e = 7; chk(); }), btn("나트륨 원자 만들기", () => { p = 11; n = 12; e = 11; chk(); })));
    side(box, left, info); say();
  },
  /* 4-4 주기율표 */
  ptable(box, task) {
    const E = [[1, "H", "수소", 1, 1, "비금속 기체. 가장 가벼운 원소"], [2, "He", "헬륨", 1, 18, "반응하지 않는 기체. 풍선, 비행선"], [3, "Li", "리튬", 2, 1, "반응성이 큰 금속. 배터리"], [4, "Be", "베릴륨", 2, 2, "가벼운 금속"], [5, "B", "붕소", 2, 13, "단단한 준금속"], [6, "C", "탄소", 2, 14, "흑연, 다이아몬드"], [7, "N", "질소", 2, 15, "공기의 약 78 %"], [8, "O", "산소", 2, 16, "호흡과 연소에 필요"], [9, "F", "플루오린", 2, 17, "반응성이 큰 기체. 치약"], [10, "Ne", "네온", 2, 18, "반응하지 않는 기체. 네온사인"], [11, "Na", "나트륨", 3, 1, "물과 격렬히 반응. 석유에 보관"], [12, "Mg", "마그네슘", 3, 2, "가벼운 금속. 불꽃놀이"], [13, "Al", "알루미늄", 3, 13, "가벼운 금속. 포일, 캔"], [14, "Si", "규소", 3, 14, "반도체"], [15, "P", "인", 3, 15, "성냥"], [16, "S", "황", 3, 16, "노란색 고체"], [17, "Cl", "염소", 3, 17, "소독제"], [18, "Ar", "아르곤", 3, 18, "반응하지 않는 기체. 전구 속 기체"], [19, "K", "칼륨", 4, 1, "물과 격렬히 반응. 석유에 보관"], [20, "Ca", "칼슘", 4, 2, "뼈, 조개껍데기"]];
    const COL = [1, 2, 13, 14, 15, 16, 17, 18]; let hl = 0, pick = null; const seen = new Set(), info = note(), grid = h("div", { style: "display:grid;grid-template-columns:repeat(8,1fr);gap:4px" });
    const cells = {}; for (let r = 1; r <= 4; r++) COL.forEach(g => { const e = E.find(x => x[3] === r && x[4] === g); const b = e ? h("button", { type: "button", class: "bin", style: "padding:4px 2px;text-align:center;font-size:15px;line-height:1.15", onclick: () => { pick = e; seen.add(e[0]); if (seen.size >= 3) task("pick"); draw(); say(); } }, h("small", {}, String(e[0])), h("br"), h("b", { style: "font-size:19px" }, e[1]), h("br"), h("small", {}, e[2])) : h("span"); if (e) cells[e[0]] = b; grid.append(b); });
    const draw = () => E.forEach(e => { const b = cells[e[0]]; b.style.background = hl && e[4] === hl ? (hl === 1 ? "#ffd8bd" : "#d9d1ff") : pick === e ? "#ffd23f" : ""; });
    const say = () => { info.innerHTML = pick ? `<b class="t">${pick[2]} ${pick[1]}</b><p>원자 번호 ${pick[0]} (양성자 ${pick[0]}개) · ${pick[3]}주기 ${pick[4]}족</p><p>${pick[5]}</p>` : `<b class="t">주기율표 (원자 번호 1~20)</b><p>원소를 눌러 정보를 보고, 아래 단추로 같은 족을 찾아보세요.</p>`; if (hl === 1) info.innerHTML += "<p><b>1족</b>(수소 제외): 반응성이 큰 금속. 물과 반응하고 공기 중에서 쉽게 변해 석유에 보관해요.</p>"; if (hl === 18) info.innerHTML += "<p><b>18족</b>: 다른 물질과 거의 반응하지 않는 기체예요.</p>"; info.innerHTML += `<p class="hint">가로줄 = 주기, 세로줄 = 족. 원자 번호 순서로 놓되 성질이 비슷한 원소가 같은 족에 오게 했어요.</p>`; };
    const left = h("div", {}, grid, h("div", { class: "controls" }, btn("1족 원소 보기", () => { hl = 1; task("g1"); draw(); say(); }, true), btn("18족 원소 보기", () => { hl = 18; task("g18"); draw(); say(); }, true)));
    side(box, left, info); say();
  },
  /* 4-5 물질을 이루는 입자 */
  particles(box, task) {
    const S = [["he", "헬륨", "atom"], ["fe", "철", "atom"], ["o2", "산소", "mol"], ["h2o", "물", "mol"], ["co2", "이산화 탄소", "mol"], ["nacl", "염화 나트륨", "ion"]];
    let k = 0; const info = note(), left = h("div"), R = rnd(17), P = Array.from({ length: 14 }, () => [R() * 600 + 50, R() * 200 + 40, (R() - .5) * 80, (R() - .5) * 80, R() * 7]);
    stage(left, 700, 280, (c, dt, tt) => {
      c.fillStyle = "#f7f8fc"; c.fillRect(0, 0, 700, 280); const id = S[k][0];
      if (id === "fe" || id === "nacl") { for (let i = 0; i < 12; i++) for (let j = 0; j < 6; j++) { const x = 150 + i * 36, y = 50 + j * 36; if (id === "fe") dot(c, x, y, 16, "#9aa3b5", "#fff"); else { const na = (i + j) % 2 === 0; dot(c, x, y, na ? 11 : 17, na ? "#8a7cf0" : "#2fa84f", "#fff"); T(c, na ? "+" : "−", x, y, 13, "#fff"); } } }
      else P.forEach(p => { p[0] += p[2] * dt; p[1] += p[3] * dt; if (p[0] < 40 || p[0] > 660) p[2] *= -1; if (p[1] < 40 || p[1] > 240) p[3] *= -1; const x = p[0], y = p[1], a = p[4] + tt * .5;
        if (id === "he") dot(c, x, y, 10, "#ffd23f", INK, 1.5);
        if (id === "o2") { dot(c, x - Math.cos(a) * 9, y - Math.sin(a) * 9, 11, RD, "#fff"); dot(c, x + Math.cos(a) * 9, y + Math.sin(a) * 9, 11, RD, "#fff"); }
        if (id === "h2o") { dot(c, x, y, 13, RD, "#fff"); dot(c, x + Math.cos(a - .9) * 15, y + Math.sin(a - .9) * 15, 8, "#fff", INK, 1); dot(c, x + Math.cos(a + .9) * 15, y + Math.sin(a + .9) * 15, 8, "#fff", INK, 1); }
        if (id === "co2") { dot(c, x, y, 12, "#3a3a3a", "#fff"); dot(c, x - Math.cos(a) * 20, y - Math.sin(a) * 20, 11, RD, "#fff"); dot(c, x + Math.cos(a) * 20, y + Math.sin(a) * 20, 11, RD, "#fff"); } });
      T(c, S[k][1], 350, 266, 17);
    });
    const D = { atom: "<b>원자</b>가 물질을 이루는 기본 입자로 존재해요.", mol: "원자들이 결합한 <b>분자</b>가 독립적으로 존재하며 그 물질의 성질을 나타내요.", ion: "전하를 띠는 <b>이온</b>(나트륨 이온 Na⁺, 염화 이온 Cl⁻)이 규칙적으로 많이 모여 있어요. 한 쌍씩 따로 떨어져 있지 않아서 분자가 아니에요." };
    const say = () => { info.innerHTML = `<b class="t">${S[k][1]}을(를) 이루는 입자</b><p>${D[S[k][2]]}</p><p class="hint">물(H₂O)과 과산화 수소(H₂O₂)는 같은 원자로 되어 있지만 <b>분자가 달라서</b> 성질이 달라요.</p>`; };
    left.append(seg(S.map((s, i) => [i, s[1]]), k, v => { k = v; task(S[v][2]); say(); })); task("atom"); side(box, left, info); say();
  },
  /* 4-6 이온의 형성과 이동 */
  ion(box, task) {
    const AT = [["Na", "나트륨", 11, -1, "나트륨 이온"], ["Mg", "마그네슘", 12, -2, "마그네슘 이온"], ["Cl", "염소", 17, 1, "염화 이온"], ["O", "산소", 8, 2, "산화 이온"]];
    let mode = "make", k = 0, de = 0, on = false, sp = "mn", x = 0; const info = note(), left = h("div");
    stage(left, 700, 280, (c, dt, tt) => {
      c.fillStyle = "#f7f8fc"; c.fillRect(0, 0, 700, 280);
      if (mode === "make") { const [s, n, p] = AT[k], e = p + de, cx = 220, cy = 140; dot(c, cx, cy, 26, RD, "#fff"); T(c, "+" + p, cx, cy, 15, "#fff"); let L = e; [2, 8, 8].forEach((cap, si) => { const m = Math.min(cap, L); L -= m; if (m <= 0) return; c.beginPath(); c.arc(cx, cy, 50 + si * 30, 0, 7); c.strokeStyle = "#d9d6ea"; c.stroke(); for (let i = 0; i < m; i++) { const a = i / m * 7 + tt * .4; dot(c, cx + Math.cos(a) * (50 + si * 30), cy + Math.sin(a) * (50 + si * 30), 6, BL, "#fff", 1); } });
        const q = -de, sym = s + (q === 0 ? "" : (Math.abs(q) > 1 ? Math.abs(q) : "") + (q > 0 ? "⁺" : "⁻")); T(c, sym.replace("2⁺", "²⁺").replace("2⁻", "²⁻"), 520, 120, 44, q > 0 ? RD : q < 0 ? BL : INK); T(c, q === 0 ? `${n} 원자 (중성)` : q > 0 ? "양이온" : "음이온", 520, 175, 18); }
      else { if (on) x = Math.min(1, x + dt * .12); rr(c, 80, 90, 540, 100, 12, "#e9e4d4", "#b8ae90", 3); T(c, "(−)극", 60, 140, 16, BL, "right"); T(c, "(+)극", 640, 140, 16, RD, "left"); rr(c, 66, 120, 14, 40, 3, "#9aa3b5"); rr(c, 620, 120, 14, 40, 3, "#9aa3b5");
        const dx = (sp === "mn" ? 1 : -1) * x * 220; c.fillStyle = sp === "mn" ? "rgba(140,40,160,.75)" : "rgba(40,120,220,.75)"; c.beginPath(); c.ellipse(350 + dx / 2, 140, 20 + Math.abs(dx) / 2, 18, 0, 0, 7); c.fill(); T(c, sp === "mn" ? "과망가니즈산 칼륨" : "황산 구리(Ⅱ)", 350, 70, 16); T(c, on ? "전원 켜짐 (약 20 V)" : "전원 꺼짐", 350, 222, 15, on ? OK : G); }
    });
    const say = () => { if (mode === "make") { const [s, n, , need, name] = AT[k], ok = de === need; info.innerHTML = `<b class="t">${n} 원자의 전자</b><p>전자 ${de < 0 ? -de + "개를 잃었어요" : de > 0 ? de + "개를 얻었어요" : "그대로"}.</p>${ok ? `<p>⭕ <b>${name}</b>이 되었어요. ${need < 0 ? "전자를 잃어 (+)전하 → 양이온" : "전자를 얻어 (−)전하 → 음이온"}</p>` : `<p class="hint">${n}은(는) 전자를 ${Math.abs(need)}개 ${need < 0 ? "잃기" : "얻기"} 쉬워요.</p>`}`; if (ok) task(need < 0 ? "cat" : "an"); }
      else info.innerHTML = `<b class="t">곤약 위 이온의 이동</b><p>곤약을 질산 칼륨 수용액으로 적시고 가운데에 알갱이를 놓은 뒤 전원을 켜요.</p>${x > .3 ? (sp === "mn" ? "<p>보라색(과망가니즈산 이온 MnO₄⁻)이 <b>(+)극</b>으로 이동 → <b>음이온</b></p>" : "<p>파란색(구리 이온 Cu²⁺)이 <b>(−)극</b>으로 이동 → <b>양이온</b></p>") : ""}<p class="hint">이온은 전하를 띠므로 전기력을 받아 이동해요.</p>`; };
    left.append(seg([["make", "이온 만들기"], ["move", "이온의 이동"]], mode, v => { mode = v; say(); }), h("div", { class: "controls" }, AT.map((a, i) => btn(a[1], () => { mode = "make"; k = i; de = 0; say(); })), btn("전자 잃기", () => { mode = "make"; de = Math.max(-3, de - 1); say(); }, true), btn("전자 얻기", () => { mode = "make"; de = Math.min(3, de + 1); say(); }, true)), h("div", { class: "controls" }, btn("과망가니즈산 칼륨", () => { mode = "move"; sp = "mn"; x = 0; on = false; say(); }), btn("황산 구리(Ⅱ)", () => { mode = "move"; sp = "cu"; x = 0; on = false; say(); }), btn("전원 켜기", () => { mode = "move"; on = true; setTimeout(() => { task(sp); say(); }, 3000); say(); }, true)));
    side(box, left, info); say();
  }
};
