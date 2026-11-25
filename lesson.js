import { h } from "./fb.js";
import { run } from "./core.js";
import { lessonOf } from "./catalog.js";
import { DATA } from "./data.js";
import { SIMS } from "./sims.js";
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
      return { el: h("div", { class: "card sorts" }, h("b", {}, b.q), h("div", { class: "srows" }, rows), h("div", { class: "controls" }, btn), msg), done: () => ok || tries >= 4, need: "모두 고르고 확인을 눌러 보세요.", val: () => [{ k: b.id, l: "분류 활동", v: tries ? (ok ? "모두 맞음" : "수정 중") + ` (확인 ${tries}번)` : "" }] };
    },
    quiz(b) {
      const ans = b.qs.map(() => -1), els = b.qs.map((q, i) => { const fb = h("p", { class: "fb" }), bs = q.c.map((t, j) => h("button", { type: "button", class: "ch", onclick: () => pick(j) }, "①②③④"[j] + " " + t)); function pick(j) { if (ans[i] >= 0) return; ans[i] = j; bs[j].classList.add(j === q.a ? "correct" : "wrong"); bs[q.a].classList.add("correct"); fb.textContent = (j === q.a ? "⭕ 정답! " : "❌ 아쉬워요. ") + q.e; change(); } const e = h("div", { class: "card q" }, h("b", {}, `${i + 1}. ${q.q}`), bs, fb); e.pick = pick; return e; });
      withCtx(c => { const v = c.saved("quiz"); if (v) v.split("(")[0].trim().split(" ").forEach((x, i) => { if (/^[1-4]$/.test(x) && els[i]) els[i].pick(x - 1); }); });
      const good = () => ans.filter((v, i) => v === b.qs[i].a).length;
      return { el: h("div", { class: "quiz" }, els), done: () => !ans.includes(-1), need: "모든 문제를 풀어 보세요. (다음 장에 더 있을 수 있어요)", val: () => [{ k: "quiz", l: "퀴즈 답", v: ans.some(v => v >= 0) ? ans.map(v => v < 0 ? "-" : v + 1).join(" ") : "" }, { k: "quiz_score", l: "퀴즈 점수", v: ans.includes(-1) ? "" : `${good()}/${ans.length}` }] };
    },
    short(b) {
      const ta = h("textarea", { maxlength: 500, placeholder: b.ph || "", "aria-label": b.q, oninput: change }); withCtx(c => { const v = c.saved(b.id); if (v && !ta.value) ta.value = v; });
      return { el: h("div", { class: "card" }, h("b", {}, b.q), ta, b.ans ? h("details", {}, h("summary", {}, "예시 답안 (쓴 뒤에 보기)"), h("p", {}, b.ans)) : null), done: () => ta.value.trim().length >= 2, need: "내 생각을 써 보세요.", val: () => [{ k: b.id, l: b.q, v: ta.value.trim() }] };
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
  const steps = D.map(s => { const xs = s.b.map(make); main.append(h("section", {}, h("span", { class: "tag" }, s.t), xs.map(x => x.el))); return xs; });
  document.body.append(main);
  run({ lesson: id, main, titles: D.map(s => s.t),
    done: i => { const t = steps[i].filter(x => x.done); return t.length ? t.every(x => x.done()) : null; },
    need: i => { const t = steps[i].find(x => x.done && !x.done()); return t ? t.need || "" : ""; },
    collect: () => all.filter(x => x.val).flatMap(x => x.val()),
    ready: c => { CTX = c; waits.forEach(f => f(c)); } });
}
