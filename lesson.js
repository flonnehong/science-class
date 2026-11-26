import { h } from "./fb.js";
import { run } from "./core.js";
import { lessonOf } from "./catalog.js";
import { DATA } from "./data.js";
import { SIMS as S1 } from "./sims.js";
import { SIMS2 } from "./sims2.js";
import { SIMS3 } from "./sims3.js";
const SIMS = { ...S1, ...SIMS2, ...SIMS3 };
const id = new URLSearchParams(location.search).get("l") || "", D = DATA[id], L = lessonOf(id);
if (!D || !L) location.replace("./");
else {
  document.title = L.title;
  const main = h("main"), all = [], change = () => dispatchEvent(new Event("sc-change"));
  let CTX = null; const waits = []; const withCtx = f => CTX ? f(CTX) : waits.push(f);
  const K = {
    h: b => ({ el: h("h2", {}, b.t) }), p: b => ({ el: h("p", { class: "sc-with", html: b.h }) }), con: b => ({ el: h("div", { class: "concept", html: b.h }) }),
    img: b => ({ el: h("img", { class: "pic", src: b.src, alt: b.alt }) }),
    duo(b) { const a = b.a.map(make), c = b.b.map(make); return { el: h("div", { class: "duo", "data-keep": true }, h("div", {}, a.map(x => x.el)), h("div", {}, c.map(x => x.el))), done: () => c.every(x => !x.done || x.done()), need: "하나를 골라 보세요." }; },
    poll(b) {
      let pick = -1; const after = h("p", { class: "after" }), bars = b.o.map(() => h("i")), ns = b.o.map(() => h("em"));
      const bs = b.o.map((t, i) => h("button", { type: "button", class: "pl", onclick: () => { pick = i; show(); withCtx(c => c.vote(b.id, i)); change(); } }, bars[i], h("span", {}, t), ns[i]));
      const show = () => { bs.forEach((x, i) => { x.classList.toggle("on", i === pick); x.setAttribute("aria-pressed", i === pick); }); after.textContent = pick >= 0 && b.after ? b.after : ""; };
      withCtx(c => c.poll(b.id, (vs, mine) => { if (mine !== undefined && pick < 0) pick = mine; show(); if (pick >= 0) b.o.forEach((_, i) => { const k = vs.filter(v => v === i).length; bars[i].style.width = vs.length ? k / vs.length * 100 + "%" : 0; ns[i].textContent = k + "명"; }); }));
      return { el: h("div", { class: "card poll", "data-keep": true }, h("b", {}, b.q), bs, after), done: () => pick >= 0, need: "하나를 골라 보세요.", val: () => [{ k: b.id, l: b.q, v: pick >= 0 ? b.o[pick] : "" }] };
    },
    sim(b) {
      const did = new Set(), lis = b.tasks.map(([k, t]) => h("li", {}, t)), box = h("div", { class: "card simbox", "data-keep": true });
      const task = k => { const i = b.tasks.findIndex(x => x[0] === k); if (i >= 0 && !did.has(k)) { did.add(k); lis[i].classList.add("y"); change(); } };
      box.append(h("ul", { class: "todo" }, lis)); SIMS[b.name](box, task);
      withCtx(c => { const s = c.saved("sim_" + b.name); if (s) b.tasks.forEach(([k, t]) => { if (s.includes(t)) task(k); }); });
      return { el: box, done: () => did.size === b.tasks.length, need: "할 일을 모두 해 보세요.", val: () => [{ k: "sim_" + b.name, l: "탐구 활동", v: b.tasks.filter(t => did.has(t[0])).map(t => t[1]).join(", ") }] };
    },
    fill(b) {
      let tries = 0, ok = false; const msg = h("p", { class: "msg" }), sel = b.rows.map(r => h("select", { "aria-label": r[0], onchange: () => { ok = false; } }, h("option", { value: "" }, "선택"), r[1].map((o, i) => h("option", { value: i }, o))));
      const btn = h("button", { type: "button", class: "tg pri", onclick: () => { if (sel.some(s => s.value === "")) { msg.textContent = "빈칸을 모두 골라 보세요."; return; } tries++; const good = sel.map((s, i) => +s.value === b.rows[i][2]); sel.forEach((s, i) => { s.className = good[i] ? "good" : "bad"; }); ok = good.every(Boolean); msg.textContent = ok ? "⭕ 모두 맞았어요!" : `❌ ${good.filter(Boolean).length}개 맞았어요. 빨간 칸을 다시 생각해 보세요.`; change(); } }, "확인");
      withCtx(c => { const v = c.saved(b.id); if (v && v.startsWith("모두")) { b.rows.forEach((r, i) => { sel[i].value = r[2]; sel[i].className = "good"; }); ok = true; tries = 1; change(); } });
      return { el: h("div", { class: "card fills" }, b.rows.map((r, i) => h("p", {}, "· " + r[0] + " ", sel[i], " " + r[3])), h("div", { class: "controls" }, btn), msg), done: () => ok || tries >= 4, need: "빈칸을 채우고 확인을 눌러 보세요.", val: () => [{ k: b.id, l: "개념 빈칸", v: tries ? (ok ? "모두 맞음" : "수정 중") + ` (확인 ${tries}번)` : "" }] };
    },
    sort(b) {
      const at = b.items.map(() => -1); let tries = 0, ok = false; const msg = h("p", { class: "msg" });
      const rows = b.items.map(([t], i) => { const bs = b.bins.map((n, j) => h("button", { type: "button", class: "bin", onclick: () => { at[i] = j; ok = false; row.classList.remove("good", "bad"); bs.forEach((x, k) => x.classList.toggle("on", k === j)); change(); } }, n)); const row = h("div", { class: "srow" }, h("b", {}, t), h("span", {}, bs)); row.bs = bs; return row; });
      const btn = h("button", { type: "button", class: "tg pri", onclick: () => { if (at.includes(-1)) { msg.textContent = "모두 골라 보세요."; return; } tries++; const g = at.map((v, i) => v === b.items[i][1]); rows.forEach((r, i) => { r.classList.toggle("good", g[i]); r.classList.toggle("bad", !g[i]); }); ok = g.every(Boolean); msg.textContent = ok ? "⭕ 모두 맞았어요!" : `❌ ${g.filter(Boolean).length}개 맞았어요. 다시 골라 보세요.`; change(); } }, "확인");
      withCtx(c => { const v = c.saved(b.id); if (v && v.startsWith("모두")) { b.items.forEach((x, i) => { at[i] = x[1]; rows[i].bs.forEach((y, k) => y.classList.toggle("on", k === x[1])); rows[i].classList.add("good"); }); ok = true; tries = 1; change(); } });
      return { el: h("div", { class: "card sorts" }, h("b", {}, b.q), h("div", { class: "srows" + (b.bins.length > 3 ? " one" : "") }, rows), h("div", { class: "controls" }, btn), msg), done: () => ok || tries >= 4, need: "모두 고르고 확인을 눌러 보세요.", val: () => [{ k: b.id, l: "분류 활동", v: tries ? (ok ? "모두 맞음" : "수정 중") + ` (확인 ${tries}번)` : "" }] };
    },
    quiz(b) {
      const ans = b.qs.map(() => -1), els = b.qs.map((q, i) => { const fb = h("p", { class: "fb" }), bs = q.c.map((t, j) => h("button", { type: "button", class: "ch", onclick: () => pick(j) }, "①②③④"[j] + " " + t)); function pick(j) { if (ans[i] >= 0) return; ans[i] = j; bs[j].classList.add(j === q.a ? "correct" : "wrong"); bs[q.a].classList.add("correct"); fb.textContent = (j === q.a ? "⭕ 정답! " : "❌ 아쉬워요. ") + q.e; change(); } const e = h("div", { class: "card q" }, h("b", {}, `${i + 1}. ${q.q}`), h("div", { class: "chs" + (q.c.some(t => t.length > 16) ? " long" : "") }, bs), fb); e.pick = pick; return e; });
      withCtx(c => { const v = c.saved("quiz"); if (v) v.split("(")[0].trim().split(" ").forEach((x, i) => { if (/^[1-4]$/.test(x) && els[i]) els[i].pick(x - 1); }); });
      const good = () => ans.filter((v, i) => v === b.qs[i].a).length;
      return { el: h("div", { class: "quiz" }, els), done: () => !ans.includes(-1), need: "모든 문제를 풀어 보세요.", val: () => [{ k: "quiz", l: "퀴즈 답", v: ans.some(v => v >= 0) ? ans.map(v => v < 0 ? "-" : v + 1).join(" ") : "" }, { k: "quiz_score", l: "퀴즈 점수", v: ans.includes(-1) ? "" : `${good()}/${ans.length}` }] };
    },
    short(b) {
      const ta = h("textarea", { maxlength: 500, placeholder: b.ph || "", "aria-label": b.q, oninput: change }); withCtx(c => { const v = c.saved(b.id); if (v && !ta.value) ta.value = v; });
      return { el: h("div", { class: "card" }, h("b", {}, b.q), ta, b.ans ? h("details", {}, h("summary", {}, "예시 답안 (쓴 뒤에 보기)"), h("p", {}, b.ans)) : null), done: () => ta.value.trim().length >= 2, need: "내 생각을 써 보세요.", val: () => [{ k: b.id, l: b.q, v: ta.value.trim() }] };
    },
    fig: b => ({ el: h("figure", { class: "fig" }, h("div", { class: "figsvg", html: b.h }), b.cap ? h("figcaption", {}, b.cap) : null) }),
    calc(b) {
      let tries = 0, ok = false; const msg = h("p", { class: "msg" }), sol = h("div", { class: "sol", hidden: true, html: "<b>풀이</b> " + b.e });
      const inp = h("input", { type: "text", inputmode: "decimal", class: "num", "aria-label": "답", placeholder: "답", oninput: () => { ok = false; } });
      const check = () => { const v = parseFloat(String(inp.value).replace(/,/g, "")); if (isNaN(v)) { msg.textContent = "숫자로 답을 써 보세요."; return; } tries++; ok = Math.abs(v - b.a) <= (b.tol || 1e-9) + Math.abs(b.a) * 1e-9; inp.className = "num " + (ok ? "good" : "bad"); msg.textContent = ok ? "⭕ 정답이에요!" : tries >= 2 ? `❌ 정답은 ${b.a} ${b.u}예요. 풀이를 보고 다시 생각해 보세요.` : "❌ 다시 계산해 보세요. " + (b.hint || ""); sol.hidden = !(ok || tries >= 2); change(); };
      inp.onkeydown = e => { if (e.key === "Enter") check(); };
      withCtx(c => { const v = c.saved(b.id); if (v) { inp.value = String(v).split(" ")[0]; if (/정답/.test(v)) { ok = true; tries = 1; inp.className = "num good"; sol.hidden = false; msg.textContent = "⭕ 정답이에요!"; } change(); } });
      return { el: h("div", { class: "card calc" }, h("b", { html: b.q }), h("div", { class: "controls left" }, inp, h("span", { class: "unit" }, b.u), h("button", { type: "button", class: "tg pri", onclick: check }, "확인")), msg, sol), done: () => ok || tries >= 2, need: "계산 문제를 풀고 확인을 눌러 보세요.", val: () => [{ k: b.id, l: (b.l || b.q.replace(/<[^>]+>/g, "")).slice(0, 50), v: inp.value.trim() ? `${inp.value.trim()} ${b.u}${ok ? " (정답)" : ""} (확인 ${tries}번)` : "" }] };
    },
    order(b) {
      const n = b.items.length; let mix = b.items.map((_, i) => i).sort((x, y) => ((x * 7 + 3) % 11) - ((y * 7 + 3) % 11)); if (mix.every((v, i) => v === i)) mix.reverse();
      let seq = [], tries = 0, ok = false; const msg = h("p", { class: "msg" }), slots = h("ol", { class: "oslots" }), pool = h("div", { class: "opool" });
      const draw = () => {
        slots.textContent = ""; pool.textContent = "";
        for (let i = 0; i < n; i++) { const j = seq[i]; slots.append(h("li", { class: j === undefined ? "empty" : "" }, j === undefined ? "여기에 놓여요" : h("button", { type: "button", class: "oi on", onclick: () => { seq.splice(i, 1); ok = false; draw(); change(); } }, b.items[j]))); }
        mix.filter(j => !seq.includes(j)).forEach(j => pool.append(h("button", { type: "button", class: "oi", onclick: () => { seq.push(j); ok = false; msg.textContent = ""; draw(); change(); } }, b.items[j])));
        if (!pool.children.length) pool.append(h("span", { class: "hint" }, "모두 놓았어요. 확인을 눌러 보세요. (놓은 카드를 누르면 다시 빠져요)"));
      };
      const btn = h("button", { type: "button", class: "tg pri", onclick: () => { if (seq.length < n) { msg.textContent = "카드를 모두 순서대로 놓아 보세요."; return; } tries++; const g = seq.map((j, i) => j === i); ok = g.every(Boolean); [...slots.children].forEach((li, i) => { li.className = g[i] ? "good" : "bad"; }); msg.textContent = ok ? "⭕ 순서가 모두 맞았어요! " + (b.e || "") : `❌ ${g.filter(Boolean).length}개가 제자리예요. 빨간 카드를 눌러 빼고 다시 놓아 보세요.`;
        if (!ok && tries >= 3) { seq = b.items.map((_, i) => i); draw(); [...slots.children].forEach(li => { li.className = "good"; }); msg.textContent = "정답 순서를 보여 줄게요. 위에서부터 차례로 읽어 보세요. " + (b.e || ""); } change(); } }, "확인");
      withCtx(c => { const v = c.saved(b.id); if (v && v.startsWith("모두")) { seq = b.items.map((_, i) => i); ok = true; tries = 1; draw(); [...slots.children].forEach(li => { li.className = "good"; }); msg.textContent = "⭕ 순서가 모두 맞았어요!"; change(); } });
      draw();
      return { el: h("div", { class: "card order", "data-keep": true }, h("b", {}, b.q), h("div", { class: "ogrid" }, h("div", {}, h("small", {}, "카드를 누르면 아래 칸에 차례로 놓여요"), pool), slots), h("div", { class: "controls" }, btn), msg), done: () => ok || tries >= 3, need: "카드를 순서대로 놓고 확인을 눌러 보세요.", val: () => [{ k: b.id, l: b.q.slice(0, 50), v: tries ? (ok ? "모두 맞음" : "수정 중") + ` (확인 ${tries}번)` : "" }] };
    },
    multi(b) {
      const on = new Set(); let ok = null; const msg = h("p", { class: "msg" }), why = b.why ? h("input", { type: "text", maxlength: 200, placeholder: "그렇게 생각한 까닭", "aria-label": "까닭", oninput: change }) : null;
      const bs = b.o.map((t, i) => h("button", { type: "button", class: "bin", onclick: () => { on.has(i) ? on.delete(i) : on.add(i); bs[i].classList.toggle("on", on.has(i)); ok = null; change(); } }, t));
      const btn = b.a ? h("button", { type: "button", class: "tg pri", onclick: () => { if (!on.size) { msg.textContent = "골라 보세요."; return; } const g = b.a.every(x => on.has(x)); ok = g && on.size === b.a.length; msg.textContent = ok ? "⭕ 잘 연결했어요! " + (b.e || "") : "정답 예시: " + b.a.map(x => b.o[x]).join(", ") + ". " + (b.e || "다른 기관계도 까닭이 알맞으면 좋은 생각이에요."); change(); } }, "확인") : null;
      withCtx(c => { const v = c.saved(b.id); if (v) { b.o.forEach((t, i) => { if (v.split(", ").includes(t)) { on.add(i); bs[i].classList.add("on"); } }); if (b.a) ok = true; const w = c.saved(b.id + "_why"); if (w && why) why.value = w; change(); } });
      return { el: h("div", { class: "card multi", "data-keep": true }, h("b", {}, b.q), h("div", { class: "bins" }, bs), why, btn ? h("div", { class: "controls" }, btn) : null, msg), done: () => on.size > 0 && (!b.a || ok !== null), need: "고르고 확인해 보세요.", val: () => [{ k: b.id, l: b.q, v: [...on].sort().map(i => b.o[i]).join(", ") }, ...(why ? [{ k: b.id + "_why", l: b.q.slice(0, 30) + " 까닭", v: why.value.trim() }] : [])] };
    }
  };
  function make(b) { const x = K[b.k](b); all.push(x); return x; }
  const steps = D.map(s => {
    const xs = s.b.map(make); let kids = xs.map(x => x.el);
    if (s.c) { const head = [], rest = []; s.b.forEach((b, i) => ((b.k === "h" || b.k === "p" || b.top) && !rest.length ? head : rest).push(kids[i])); kids = [...head, h("div", { class: "cols" + (s.c === 3 ? " c3" : "") + (s.w ? " " + s.w : "") }, rest)]; }
    main.append(h("section", {}, h("span", { class: "tag" }, s.t), kids)); return xs;
  });
  document.body.append(main);
  run({ lesson: id, main, titles: D.map(s => s.t),
    done: i => { const t = steps[i].filter(x => x.done); return t.length ? t.every(x => x.done()) : null; },
    need: i => { const t = steps[i].find(x => x.done && !x.done()); return t ? t.need || "" : ""; },
    collect: () => all.filter(x => x.val).flatMap(x => x.val()),
    ready: c => { CTX = c; waits.forEach(f => f(c)); } });
}
