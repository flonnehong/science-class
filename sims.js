/* 7단원 움직이는 모형. 각 함수는 요소 안에 모형을 만들고, task(이름)을 부르면 활동 하나를 해낸 것으로 친다 */
import { h } from "./fb.js";
const P = "#e0366b", N = "#2265c9", INK = "#232046";
function stage(box, W, H, draw) {
  const cv = h("canvas", { class: "simcv" }), d = Math.min(devicePixelRatio || 1, 2); cv.width = W * d; cv.height = H * d; cv.style.aspectRatio = W + "/" + H; const c = cv.getContext("2d"); box.append(cv);
  let last = performance.now();
  (function loop(t) { const dt = Math.min(.05, Math.max(0, (t - last) / 1000)); last = t; if (cv.getClientRects().length) { c.setTransform(d, 0, 0, d, 0, 0); c.clearRect(0, 0, W, H); draw(c, dt, t / 1000); } requestAnimationFrame(loop); })(last);
  return { cv, at(e) { const r = cv.getBoundingClientRect(); return { x: (e.clientX - r.left) * W / r.width, y: (e.clientY - r.top) * H / r.height }; } };
}
const T = (c, s, x, y, z = 18, col = INK, al = "center", w = 700) => { c.fillStyle = col; if (c.canvas.clientWidth && c.canvas.clientWidth < 430) z *= 1.25; c.font = `${w} ${z}px "Noto Sans KR",sans-serif`; c.textAlign = al; c.textBaseline = "middle"; c.fillText(s, x, y); };
const rr = (c, x, y, w, hh, r, f, s, lw = 3) => { c.beginPath(); c.roundRect ? c.roundRect(x, y, w, hh, r) : c.rect(x, y, w, hh); if (f) { c.fillStyle = f; c.fill(); } if (s) { c.strokeStyle = s; c.lineWidth = lw; c.stroke(); } };
const ball = (c, x, y, r, sign) => { c.fillStyle = sign > 0 ? P : N; c.beginPath(); c.arc(x, y, r, 0, 7); c.fill(); c.strokeStyle = "#fff"; c.lineWidth = Math.max(1.5, r / 5); c.beginPath(); c.moveTo(x - r * .5, y); c.lineTo(x + r * .5, y); if (sign > 0) { c.moveTo(x, y - r * .5); c.lineTo(x, y + r * .5); } c.stroke(); };
const ln = (c, pts, col, w = 4, dash) => { c.save(); c.strokeStyle = col; c.lineWidth = w; c.lineJoin = "round"; c.lineCap = "round"; c.setLineDash(dash || []); c.beginPath(); pts.forEach((p, i) => i ? c.lineTo(p[0], p[1]) : c.moveTo(p[0], p[1])); c.stroke(); c.restore(); };
const arrow = (c, x1, y1, x2, y2, col, w = 5) => { const a = Math.atan2(y2 - y1, x2 - x1); ln(c, [[x1, y1], [x2, y2]], col, w); c.fillStyle = col; c.beginPath(); c.moveTo(x2 + Math.cos(a) * 8, y2 + Math.sin(a) * 8); c.lineTo(x2 - Math.cos(a - .5) * 14, y2 - Math.sin(a - .5) * 14); c.lineTo(x2 - Math.cos(a + .5) * 14, y2 - Math.sin(a + .5) * 14); c.fill(); };
const seg = (list, on, f) => { const bs = list.map(([v, t]) => h("button", { type: "button", class: "tg" + (v === on ? " on" : ""), onclick: e => { bs.forEach(b => b.classList.toggle("on", b === e.currentTarget)); f(v); } }, t)); return h("div", { class: "controls" }, bs); };
const range = (lab, min, max, step, val, unit, f) => { const o = h("b", {}, val + unit); return h("label", { class: "rg" }, lab, h("input", { type: "range", min, max, step, value: val, oninput: e => { o.textContent = e.target.value + unit; f(+e.target.value); } }), o); };
const battery = (c, x, y, flip) => { rr(c, x - 60, y - 22, 120, 44, 8, "#ffd23f", INK); rr(c, flip ? x - 72 : x + 60, y - 10, 12, 20, 3, INK); T(c, "＋", flip ? x - 40 : x + 40, y, 24); T(c, "－", flip ? x + 40 : x - 40, y, 24); };
const bulb = (c, x, y, b, dead) => { if (b > 0) { const R = 34 + 46 * Math.min(1.4, b), g = c.createRadialGradient(x, y, 4, x, y, R); g.addColorStop(0, `rgba(255,214,60,${Math.min(.95, .25 + b * .7)})`); g.addColorStop(1, "rgba(255,214,60,0)"); c.fillStyle = g; c.beginPath(); c.arc(x, y, R, 0, 7); c.fill(); } c.beginPath(); c.arc(x, y, 24, 0, 7); c.fillStyle = dead ? "#eee" : b > 0 ? "#fff3b0" : "#fff"; c.fill(); c.strokeStyle = dead ? "#b9b6cf" : INK; c.lineWidth = 4; c.setLineDash(dead ? [5, 5] : []); c.stroke(); c.setLineDash([]); ln(c, [[x - 12, y - 12], [x + 12, y + 12]], dead ? "#b9b6cf" : INK, 3); ln(c, [[x - 12, y + 12], [x + 12, y - 12]], dead ? "#b9b6cf" : INK, 3); };

export const SIMS = {
  /* 1차시: 마찰할 때 전자의 이동 */
  rub(box, task) {
    let n = 0, drag = null, moved = 0, mode = "rub", pos = 1; const anim = [];
    const info = h("p", { class: "out" }), s = stage(box, 720, 300, (c, dt) => {
      if (mode === "rub") {
        T(c, "털가죽", 190, 26); T(c, "고무풍선", 530, 26);
        rr(c, 70, 50, 240, 190, 40, "#e8c39a", "#8a5a2c"); c.beginPath(); c.ellipse(530, 145, 110, 98, 0, 0, 7); c.fillStyle = "#ffb3c7"; c.fill(); c.strokeStyle = "#c2416b"; c.lineWidth = 3; c.stroke();
        const put = (x0, e) => { for (let i = 0; i < 8; i++) ball(c, x0 + (i % 4) * 46, 88 + (i >> 2) * 58, 13, 1); for (let i = 0; i < e; i++) ball(c, x0 - 12 + (i % 5) * 40, 116 + Math.floor(i / 5) * 52, 10, -1); };
        put(120, 8 - n - anim.length); put(460, 8 + n);
        for (let i = anim.length - 1; i >= 0; i--) { anim[i] += dt * 1.6; ball(c, 290 + 170 * anim[i], 150 - Math.sin(anim[i] * 3.14) * 40, 10, -1); if (anim[i] >= 1) { anim.splice(i, 1); n++; upd(); } }
        T(c, "↔ 이곳을 좌우로 문질러요 ↔", 360, 276, 18, "#58547a");
      } else {
        const same = mode === "bb", d = same ? 1 : -1; pos += ((same ? 1.5 : .55) - pos) * dt * 1.5; const x = 360, g = 110 * pos;
        ln(c, [[x - 90, 10], [x - g, 120]], "#8a86a8", 2); ln(c, [[x + 90, 10], [x + g, 120]], "#8a86a8", 2);
        const b = (cx, t, neg) => { c.beginPath(); c.ellipse(cx, 165, 62, 56, 0, 0, 7); c.fillStyle = neg ? "#ffb3c7" : "#e8c39a"; c.fill(); for (let i = 0; i < 4; i++) ball(c, cx - 30 + i * 20, 165 + (i % 2 ? 14 : -14), 10, neg ? -1 : 1); T(c, t, cx, 246, 17); };
        b(x - g, "풍선 (−)", true); b(x + g, same ? "풍선 (−)" : "털가죽 (＋)", same);
        arrow(c, x - g - d * 70, 165, x - g - d * 110, 165, "#119c4a"); arrow(c, x + g + d * 70, 165, x + g + d * 110, 165, "#119c4a");
        T(c, same ? "서로 밀어 내는 전기력" : "서로 끌어당기는 전기력", 360, 285, 20, "#0b6b33");
      }
    });
    const upd = () => { const e = 8 - n, q = 8 + n; info.innerHTML = `털가죽: 원자핵 (＋) 8개, 전자 ${e}개 → <b>${e === 8 ? "전기를 띠지 않음" : "(＋)전하를 띤다"}</b> · 풍선: 원자핵 (＋) 8개, 전자 ${q}개 → <b>${q === 8 ? "전기를 띠지 않음" : "(−)전하를 띤다"}</b>`; };
    const rubIt = () => { if (n + anim.length < 4) anim.push(0); if (n + anim.length >= 4) task("rub"); };
    s.cv.style.touchAction = "pan-y";
    s.cv.addEventListener("pointerdown", e => { drag = s.at(e).x; s.cv.setPointerCapture && s.cv.setPointerCapture(e.pointerId); });
    s.cv.addEventListener("pointermove", e => { if (drag === null || mode !== "rub") return; const x = s.at(e).x; moved += Math.abs(x - drag); drag = x; if (moved > 150) { moved = 0; rubIt(); } });
    ["pointerup", "pointercancel"].forEach(v => s.cv.addEventListener(v, () => { drag = null; }));
    box.append(h("div", { class: "controls" }, h("button", { type: "button", class: "tg", onclick: rubIt }, "문지르기")), seg([["rub", "마찰하는 중"], ["bb", "풍선과 풍선"], ["bf", "풍선과 털가죽"]], "rub", v => { mode = v; pos = v === "bb" ? .7 : 1.4; if (v !== "rub") task(v); }), info); upd();
  },
  /* 3차시: 전류와 전자의 이동 */
  flow(box, task) {
    let on = false, flip = false, off = 0, ph = 0; const path = [[150, 70], [570, 70], [570, 240], [150, 240]], len = [420, 170, 420, 170], tot = 1180;
    const pt = s => { s = ((s % tot) + tot) % tot; let i = 0; while (s > len[i]) { s -= len[i]; i++; } const a = path[i], b = path[(i + 1) % 4], f = s / len[i]; return [a[0] + (b[0] - a[0]) * f, a[1] + (b[1] - a[1]) * f]; };
    stage(box, 720, 310, (c, dt, t) => {
      const e = flip ? -1 : 1; if (on) off += dt * 70 * e; ph = t; // 전지 (＋)극이 오른쪽: 전자는 (−)극(왼쪽)에서 나와 시계 방향(위쪽은 →)
      ln(c, [...path, path[0]], "#b8bccb", 16); if (!on) { ln(c, [[320, 70], [400, 70]], "#fffdf5", 20); ln(c, [[320, 70], [388, 34]], INK, 6); } else ln(c, [[320, 70], [400, 70]], INK, 6);
      for (let i = 0; i < 26; i++) { const j = on ? 0 : Math.sin(ph * 4 + i * 2) * 5; const [x, y] = pt(i * tot / 26 + off + j); if (!on && x > 318 && x < 402 && y < 80) continue; ball(c, x, y + Math.cos(ph * 5 + i) * 2, 8, -1); }
      battery(c, 360, 240, flip); bulb(c, 570, 155, on ? 1 : 0); T(c, "스위치", 360, 104, 16, "#58547a"); T(c, "전구", 636, 155, 17);
      if (on) { const dirE = flip ? -1 : 1; arrow(c, 250 - dirE * 40 + 0, 34, 250 + dirE * 40, 34, N); T(c, "전자의 이동", 120, 34, 17, N); arrow(c, 500 + dirE * 40, 34, 500 - dirE * 40, 34, "#d93a47"); T(c, "전류의 방향", 638, 34, 17, "#d93a47"); }
      T(c, on ? "전자들이 한 방향으로 이동해요" : "전자가 제자리에서 움직이지만 한쪽으로 흐르지는 않아요", 360, 294, 17, "#58547a");
    });
    box.append(seg([[false, "스위치 열기"], [true, "스위치 닫기"]], false, v => { on = v; if (v) task("on"); }), seg([[false, "전지 그대로"], [true, "전지 뒤집기"]], false, v => { flip = v; if (v && on) task("flip"); }));
  },
  /* 4차시: 저항·전압과 전류 측정. 전압은 체크 상자로 골라 걸고, 고르면 바로 표와 그래프에 기록된다 */
  measure(box, task) {
    let V = 0, R = 15; const rec = {}; let off = 0; const I = () => V / R;
    const left = h("div"), right = h("div"); box.append(h("div", { class: "side" }, left, right));
    stage(left, 720, 240, (c, dt) => {
      off += dt * I() * 500; ln(c, [[110, 60], [610, 60], [610, 190], [110, 190], [110, 60]], "#b8bccb", 10);
      const w = R === 15 ? 120 : 240; for (let x = 0, y = 0; x < w; x += 10, y++) ln(c, [[360 - w / 2 + x, 60 + (y % 2 ? 12 : -12)], [360 - w / 2 + x + 10, 60 + (y % 2 ? -12 : 12)]], "#c2416b", 5); T(c, R === 15 ? "짧은 니크롬선" : "긴 니크롬선", 360, 24, 20);
      rr(c, 285, 165, 150, 50, 10, "#ffd23f", INK); T(c, `전원 ${V.toFixed(1)} V`, 360, 190, 22);
      rr(c, 545, 98, 140, 58, 10, "#dff6ff", INK); T(c, Math.round(I() * 1000) + " mA", 615, 120, 24); T(c, "전류계", 615, 145, 15);
      if (V) for (let i = 0; i < 14; i++) { const x = 110 + ((i * 36 + off) % 500); if (Math.abs(x - 360) > w / 2 + 6) ball(c, x, 60, 6, -1); }
      if (!V) T(c, "아래에서 전압을 체크해 보세요", 360, 128, 18, "#58547a");
    });
    const tb = h("table", { class: "mt" }), gv = h("canvas", { class: "simg" }), g = gv.getContext("2d"); gv.width = 640; gv.height = 380;
    const vs = [1.5, 3, 4.5, 6], chk = h("div", { class: "vchk", role: "group", "aria-label": "전압 고르기" });
    const boxes = vs.map(v => { const inp = h("input", { type: "checkbox", onchange: () => { const k = R + "_" + v; if (inp.checked) { V = v; rec[k] = Math.round(v / R * 1000); } else { delete rec[k]; const left_ = vs.filter(x => rec[R + "_" + x] !== undefined); V = left_.length ? left_[left_.length - 1] : 0; } sync(); draw(); if (rec["15_1.5"] && rec["30_1.5"]) task("r"); if (vs.every(x => rec["30_" + x])) task("v"); } }), lab = h("label", {}, inp, v + " V"); lab.inp = inp; chk.append(lab); return lab; });
    const sync = () => boxes.forEach((l, i) => { l.inp.checked = rec[R + "_" + vs[i]] !== undefined; l.classList.toggle("on", l.inp.checked); });
    const draw = () => {
      const all = [0, ...vs]; tb.innerHTML = `<tr><th>전압(V)</th>${all.map(v => `<th>${v}</th>`).join("")}</tr>` + [[15, "짧은 것(mA)"], [30, "긴 것(mA)"]].map(([r, t]) => `<tr><th>${t}</th>${all.map(v => `<td>${v === 0 ? 0 : rec[r + "_" + v] ?? ""}</td>`).join("")}</tr>`).join("");
      g.clearRect(0, 0, 640, 380); const X = v => 80 + v / 6 * 530, Y = a => 320 - a / 400 * 290; for (let i = 0; i <= 4; i++) { ln(g, [[80, Y(i * 100)], [610, Y(i * 100)]], "#e4e2f0", 2); T(g, String(i * 100), 70, Y(i * 100), 22, INK, "right", 400); T(g, String(i * 1.5), X(i * 1.5), 344, 22, INK, "center", 400); } ln(g, [[80, 22], [80, 320], [610, 320]], INK, 3); T(g, "전압(V)", 345, 370, 22); T(g, "전류(mA)", 110, 10, 22);
      [[15, "#d93a47"], [30, "#2265c9"]].forEach(([r, col]) => { const p = all.filter(v => v === 0 || rec[r + "_" + v] !== undefined).map(v => [X(v), Y(v / r * 1000)]); if (p.length > 1) ln(g, p, col, 4); p.forEach(q => { g.fillStyle = col; g.beginPath(); g.arc(q[0], q[1], 8, 0, 7); g.fill(); }); });
      T(g, "● 짧은 것", 470, 40, 20, "#d93a47"); T(g, "● 긴 것", 570, 40, 20, "#2265c9");
    };
    left.append(seg([[15, "짧은 니크롬선"], [30, "긴 니크롬선"]], 15, v => { R = v; const on = vs.filter(x => rec[R + "_" + x] !== undefined); V = on.length ? on[on.length - 1] : 0; sync(); }), h("div", { class: "controls" }, h("b", {}, "전압 고르기"), chk), h("p", { class: "hint" }, "체크하면 그 전압을 걸고 전류를 재어 표와 그래프에 적어요. 체크를 풀면 지워져요."));
    right.append(tb, gv); draw();
  },
  /* 5차시: 옴의 법칙 */
  ohm(box, task) {
    let V = 3, R = 10, off = 0; const seen = { v: new Set(), r: new Set() };
    stage(box, 720, 230, (c, dt) => {
      const I = V / R; off += dt * I * 260; rr(c, 60, 90, 600, 60, 30, "#e9edf5", "#8a86a8"); const n = 30; for (let i = 0; i < n; i++) ball(c, 70 + ((i * 20 + off) % 580), 106 + (i * 37 % 30), 7, -1);
      for (let i = 0; i < R / 5; i++) { const x = 250 + i * (220 / (R / 5)); ln(c, [[x, 94], [x, 112]], P, 6); ln(c, [[x + 10, 130], [x + 10, 146]], P, 6); }
      T(c, "저항이 클수록 방해하는 것이 많아요", 360, 178, 16, "#58547a"); T(c, `전류의 세기 = 전압 ÷ 저항 = ${V} V ÷ ${R} Ω = ${(I).toFixed(2)} A`, 360, 50, 22);
      for (let i = 0; i < V / 1.5; i++) rr(c, 70 + i * 50, 198, 42, 22, 5, "#ffd23f", INK, 2); T(c, "← 전압", 120 + V / 1.5 * 50, 210, 16);
    });
    box.append(h("div", { class: "controls" }, range("전압", 1.5, 9, 1.5, 3, " V", v => { V = v; seen.v.add(v); if (seen.v.size > 1) task("v"); }), range("저항", 5, 30, 5, 10, " Ω", v => { R = v; seen.r.add(v); if (seen.r.size > 1) task("r"); })));
  },
  /* 6차시: 직렬·병렬. 회로 옆에 저항·전압·전류로 밝기를 설명한다 */
  bulbs(box, task) {
    let m = "one", cut = false; const why = h("div", { class: "why", "aria-live": "polite" }), left = h("div");
    const W = {
      one: ["전구 1개 (비교 기준)", "<li>전지의 전압이 전구 하나에 <b>모두</b> 걸려요.</li><li>이때의 밝기를 기준으로 직렬·병렬과 비교해 봐요.</li>", "연결이 끊어지면 전류가 흐를 길이 없어 꺼져요."],
      ser: ["직렬연결: 왜 어두워질까?", "<li><b>저항</b>: 전구(저항) 2개를 한 줄로 이어 회로 전체의 저항이 전구 1개일 때보다 <b>커져요</b> (2배).</li><li><b>전류</b>: 전지의 전압은 그대로인데 전체 저항이 커지므로 <b>전류의 세기 = 전압 ÷ 저항</b>에 따라 회로에 흐르는 전류가 <b>약해져요</b> (1/2배). 두 전구에 흐르는 전류의 세기는 같아요.</li><li><b>전압</b>: 전지의 전압이 두 전구에 <b>나누어</b> 걸려 전구 하나에 걸리는 전압도 작아져요 (1/2배).</li></ol><p>➡ 각 전구에 흐르는 전류가 약해져서 전구 1개일 때보다 <b>어두워요</b>.</p><ol hidden>", "전류가 흐르는 길이 <b>하나뿐</b>이라, 한 곳이 끊기면 회로 전체에 전류가 흐르지 않아 <b>모든 전구가 꺼져요</b>."],
      par: ["병렬연결: 왜 밝기가 그대로일까?", "<li><b>전압</b>: 두 전구가 각각 전지에 바로 연결되어 전구마다 전지의 전압이 <b>그대로</b> 걸려요.</li><li><b>저항</b>: 전구 하나하나의 저항은 전구 1개일 때와 같아요. (길이 둘로 갈라져 회로 <b>전체</b>의 저항은 작아져요.)</li><li><b>전류</b>: 전압도 저항도 같으니 <b>전류의 세기 = 전압 ÷ 저항</b>에 따라 각 전구에 흐르는 전류도 전구 1개일 때와 <b>같아요</b>. (전지에서 나오는 전체 전류는 2배)</li></ol><p>➡ 그래서 각 전구의 밝기가 전구 1개일 때와 <b>같아요</b>.</p><ol hidden>", "끊어진 전구의 길만 막히고, 다른 길에는 여전히 전지의 전압이 걸려 전류가 흘러요. 그래서 <b>나머지 전구는 켜져 있어요</b>."]
    };
    const say = () => { const [t, body, c] = W[m]; why.innerHTML = `<b class="t">${t}</b>` + (cut ? `<p>✂ ${c}</p>` : `<ol>${body}</ol>`); };
    stage(left, 720, 290, c => {
      const b = { one: cut ? 0 : 1, ser: cut ? 0 : .3, par: 1 }[m];
      if (m === "par") { ln(c, [[160, 40], [560, 40]], INK); ln(c, [[160, 130], [560, 130]], INK); ln(c, [[160, 40], [160, 230], [560, 230], [560, 40]], INK); battery(c, 360, 230); bulb(c, 360, 40, 1); bulb(c, 360, 130, cut ? 0 : 1, cut); if (cut) { ln(c, [[400, 130], [450, 130]], "#fffdf5", 10); T(c, "✂", 425, 130, 24); } }
      else { ln(c, [[160, 70], [560, 70], [560, 230], [160, 230], [160, 70]], INK); battery(c, 360, 230); if (m === "one") bulb(c, 360, 70, b, cut); else { bulb(c, 270, 70, b); bulb(c, 450, 70, cut ? 0 : b, cut); } if (cut) { ln(c, [[500, 70], [546, 70]], "#fffdf5", 10); T(c, "✂", 523, 70, 24); } }
      T(c, { one: cut ? "전류가 흐르지 않아요" : "전구 1개", ser: cut ? "길이 하나뿐이라 모두 꺼져요" : "직렬연결: 1개일 때보다 어두워요", par: cut ? "나머지 전구는 켜져 있어요" : "병렬연결: 1개일 때와 밝기가 같아요" }[m], 360, 276, 21, "#0b6b33");
    });
    const cb = h("button", { type: "button", class: "tg", onclick: () => { cut = !cut; cb.classList.toggle("on", cut); cb.textContent = cut ? "다시 연결하기" : "전구 1개의 연결 끊기"; say(); if (cut && m !== "one") task(m); } }, "전구 1개의 연결 끊기");
    left.append(seg([["one", "전구 1개"], ["ser", "직렬연결"], ["par", "병렬연결"]], "one", v => { m = v; cut = false; cb.classList.remove("on"); cb.textContent = "전구 1개의 연결 끊기"; say(); }), h("div", { class: "controls" }, cb));
    box.append(h("div", { class: "side" }, left, why)); say();
  },
  /* 7차시: 전기 주전자 비교 */
  kettle(box, task) {
    let run = false, t0 = 0, done = false; const k = [[1500, "(가)"], [1600, "(나)"]];
    stage(box, 720, 270, (c, dt) => {
      if (run && t0 < 1) { t0 = Math.min(1, t0 + dt / 4); if (t0 === 1 && !done) { done = true; task("boil"); } }
      k.forEach(([w, n], i) => { const x = 190 + i * 340; rr(c, x - 70, 60, 140, 150, 22, "#fff", INK); rr(c, x - 62, 110, 124, 92, 14, `rgb(${120 + 120 * t0},${200 - 80 * t0},${255 - 140 * t0})`); ln(c, [[x + 70, 90], [x + 105, 110], [x + 105, 160], [x + 70, 180]], INK, 6); if (t0 > .8) for (let j = 0; j < 4; j++) { c.globalAlpha = .5; c.fillStyle = "#b9c4d6"; c.beginPath(); c.arc(x - 40 + j * 26, 40 - ((t0 * 60 + j * 9) % 22), 9, 0, 7); c.fill(); c.globalAlpha = 1; } T(c, n, x, 88, 20); T(c, w + " W", x, 234, 22, "#c2416b"); T(c, `${Math.round(25 + 75 * t0)} °C`, x, 155, 24, "#fff"); });
      T(c, t0 === 1 ? "두 주전자의 물 1 L가 동시에 끓었어요!" : "물 1 L, 처음 온도 25 °C", 360, 258, 18, "#58547a");
    });
    box.append(h("div", { class: "controls" }, h("button", { type: "button", class: "tg pri", onclick: () => { run = true; t0 = 0; } }, "동시에 전원 켜기")));
  },
  /* 8차시: 우리 집 전기 기구 */
  home(box, task) {
    const A = [["세탁기", "운동", 500], ["진공청소기", "운동", 1000], ["텔레비전", "빛", 150], ["전기난로", "열", 1500], ["LED 전등", "빛", 10], ["선풍기", "운동", 50]], on = new Set();
    const tot = h("b", { class: "big" }, "0 W"), bar = h("i"), list = h("div", { class: "apps" });
    const seen = new Set(); A.forEach(([n, e, w]) => { const b = h("button", { type: "button", class: "ap", onclick: () => { on.has(n) ? on.delete(n) : on.add(n); seen.add(n); b.classList.toggle("on", on.has(n)); const s = A.filter(a => on.has(a[0])).reduce((x, a) => x + a[2], 0); tot.textContent = s + " W"; bar.style.width = Math.min(100, s / 32.1) + "%"; if (seen.size >= 4) task("home"); } }, h("b", {}, n), h("span", {}, `${e} 에너지`), h("em", {}, w + " W")); list.append(b); });
    box.append(list, h("div", { class: "meter" }, h("div", { class: "mb" }, bar), h("span", {}, "지금 켜 둔 기구의 소비 전력 합: ", tot)), h("p", { class: "hint" }, "※ 소비 전력은 제품마다 달라요. 비교해 보기 위한 예시 값이에요."));
  },
  /* 9차시: 코일 주위의 자기장 */
  coil(box, task) {
    let I = 0; const ang = {};
    stage(box, 720, 320, (c, dt, t) => {
      const cx = 360, cy = 140, x0 = 250, x1 = 470, s = Math.sign(I), a = Math.abs(I);
      if (a) for (let k = 1; k <= 3; k++) { c.globalAlpha = .25 + .2 * a; [-1, 1].forEach(d => { c.beginPath(); c.ellipse(cx, cy + d * (32 + k * 22), 150 + k * 34, 24 + k * 18, 0, 0, 7); c.strokeStyle = "#7a5cff"; c.lineWidth = 1 + a; c.setLineDash([6, 7]); c.lineDashOffset = -t * 30 * s * d; c.stroke(); }); c.globalAlpha = 1; c.setLineDash([]); }
      for (let i = 0; i < 9; i++) { const x = x0 + i * 27; c.lineWidth = 6; c.beginPath(); c.ellipse(x, cy, 12, 44, 0, -1.57, 1.57); c.strokeStyle = "#f3cf9f"; c.stroke(); c.beginPath(); c.ellipse(x, cy, 12, 44, 0, 1.57, 4.71); c.strokeStyle = "#e08a2b"; c.stroke(); if (a) arrow(c, x - 11, cy - s * 14, x - 11, cy + s * 14, "#d93a47", 2.5); }
      ln(c, [[x0, cy + 44], [x0, 250], [300, 250]], "#8a86a8"); ln(c, [[x1, cy + 44], [x1, 250], [420, 250]], "#8a86a8"); rr(c, 300, 230, 120, 40, 8, "#ffd23f", INK); T(c, `전류 ${I === 0 ? "0" : (a) + "단계"}`, 360, 250, 17);
      if (a) { T(c, s > 0 ? "S" : "N", x0 - 34, cy - 44, 26, s > 0 ? N : P); T(c, s > 0 ? "N" : "S", x1 + 34, cy - 44, 26, s > 0 ? P : N); }
      [["L", 130, cy], ["R", 590, cy], ["U", 360, 40], ["D", 560, 270]].forEach(([id, x, y]) => {
        const dx = (x - cx) / 100, dy = (y - cy) / 100; let bx = 0, by = 0; if (a) [[1.1, 1], [-1.1, -1]].forEach(([p, q]) => { const ux = dx - p, r3 = Math.pow(ux * ux + dy * dy, 1.5); bx += s * q * ux / r3 * a; by += s * q * dy / r3 * a; }); const want = Math.atan2(by - .35, bx); ang[id] = ang[id] === undefined ? want : ang[id] + Math.atan2(Math.sin(want - ang[id]), Math.cos(want - ang[id])) * Math.min(1, dt * 5);
        c.beginPath(); c.arc(x, y, 26, 0, 7); c.fillStyle = "#fff"; c.fill(); c.strokeStyle = INK; c.lineWidth = 3; c.stroke(); const q = ang[id], ex = Math.cos(q) * 20, ey = Math.sin(q) * 20; ln(c, [[x, y], [x + ex, y + ey]], P, 6); ln(c, [[x, y], [x - ex, y - ey]], N, 6);
      });
      const pull = a * 9; ln(c, [[650, 60], [650 - pull * 1.6, 190 - pull * .4]], "#8a86a8", 2); rr(c, 641 - pull * 1.6, 188 - pull * .4, 18, 34, 8, null, "#5a6478", 4); T(c, "클립", 676, 208, 15);
      T(c, "나침반 바늘의 빨간 쪽이 N극이에요", 200, 305, 16, "#58547a");
    });
    box.append(h("div", { class: "controls" }, range("전류의 방향과 세기", -3, 3, 1, 0, "", v => { I = v; if (v > 0) task("plus"); if (v < 0) task("minus"); if (Math.abs(v) === 3) task("strong"); })));
  },
  /* 10차시: 자석과 코일 */
  swing(box, task) {
    let pole = 1, dir = 1, I = 0, th = 0, w = 0; const seen = {};
    stage(box, 720, 310, (c, dt) => {
      const f = -pole * dir * I, tg = f * .16; w += ((tg - th) * 14 - w * 2.4) * dt; th += w * dt; // 같은 극: 왼쪽(자석 반대편)으로 밀림
      const px = 300, py = 24, L = 170, x = px + Math.sin(th) * L, y = py + Math.cos(th) * L; ln(c, [[180, 24], [420, 24]], "#8a86a8", 8); ln(c, [[px - 26, py], [x - 26, y]], "#8a86a8", 3); ln(c, [[px + 26, py], [x + 26, y]], "#8a86a8", 3);
      for (let i = 0; i < 5; i++) { c.beginPath(); c.ellipse(x - 24 + i * 12, y + 30, 9, 40, 0, 0, 7); c.strokeStyle = "#e08a2b"; c.lineWidth = 6; c.stroke(); }
      if (I) { T(c, dir > 0 ? "N" : "S", x + 52, y + 30, 26, dir > 0 ? P : N); T(c, dir > 0 ? "S" : "N", x - 52, y + 30, 26, dir > 0 ? N : P); }
      rr(c, 500, 184, 80, 80, 8, pole > 0 ? P : N); rr(c, 580, 184, 80, 80, 8, pole > 0 ? N : P); T(c, pole > 0 ? "N" : "S", 540, 224, 32, "#fff"); T(c, pole > 0 ? "S" : "N", 620, 224, 32, "#fff"); T(c, "자석", 580, 282, 16);
      const same = pole === dir; T(c, I === 0 ? "전류가 흐르지 않아요" : same ? "같은 극끼리 마주 봄 → 밀어 낸다" : "다른 극끼리 마주 봄 → 끌어당긴다", 290, 296, 19, I === 0 ? "#58547a" : "#0b6b33");
    });
    const chk = () => { if (!I) return; task(pole === dir ? "push" : "pull"); seen[I] = 1; if (Object.keys(seen).length > 1) task("strong"); };
    box.append(seg([[1, "자석 N극이 코일 쪽"], [-1, "자석 S극이 코일 쪽"]], 1, v => { pole = v; chk(); }), seg([[1, "전류 방향 그대로"], [-1, "전류 방향 반대로"]], 1, v => { dir = v; chk(); }), seg([[0, "전류 끄기"], [1, "약하게"], [2, "세게"]], 0, v => { I = v; chk(); }));
  },
  /* 11차시: 전동기 */
  motor(box, task) {
    let I = 0, M = 1, comm = true, th = .5, w = 0;
    stage(box, 720, 300, (c, dt) => {
      const flip = comm ? Math.sign(Math.cos(th)) || 1 : 1, tq = I * M * Math.cos(th) * flip; w += (tq * 9 - w * (comm ? 1.1 : 1.6)) * dt; th += w * dt; const cx = 360, cy = 140;
      rr(c, 70, 90, 120, 100, 10, P); T(c, "N", 130, 140, 40, "#fff"); rr(c, 530, 90, 120, 100, 10, N); T(c, "S", 590, 140, 40, "#fff");
      for (let k = 0; k < M; k++) arrow(c, 205, 116 + k * 48 - (M - 1) * 0, 235, 116 + k * 48, "#8a86a8", 2);
      const dx = Math.sin(th) * 96, dy = -Math.cos(th) * 96; ln(c, [[cx - dx, cy - dy], [cx + dx, cy + dy]], "#e08a2b", 16); [[1, flip > 0], [-1, flip < 0]].forEach(([s, n]) => { c.beginPath(); c.arc(cx + s * dx, cy + s * dy, 24, 0, 7); c.fillStyle = I === 0 ? "#cfd3de" : n ? P : N; c.fill(); if (I) T(c, n ? "N" : "S", cx + s * dx, cy + s * dy, 22, "#fff"); });
      c.beginPath(); c.arc(cx, cy, 14, 0, 7); c.fillStyle = INK; c.fill(); const rpm = Math.abs(w) / 6.283; T(c, I === 0 ? "전류를 흘려 보세요" : comm ? `1초에 약 ${rpm.toFixed(1)}바퀴 회전` : Math.abs(w) < .4 ? "멈췄어요! 계속 돌지 못해요" : "흔들리다가…", 360, 278, 20, comm ? "#0b6b33" : "#c22f3a");
    });
    box.append(seg([[0, "전류 끄기"], [1, "전류 약하게"], [2, "전류 세게"]], 0, v => { I = v; if (v) task("i" + v); }), seg([[1, "보통 자석"], [2, "센 자석"]], 1, v => { M = v; if (v === 2 && I) task("m"); }), seg([[true, "전류의 방향이 주기적으로 바뀜"], [false, "바뀌지 않음"]], true, v => { comm = v; if (!v) task("c"); if (v) { th = .5; } }));
  }
};
export { stage, T, rr, ball, ln, arrow, seg, range, bulb, P, N, INK };
