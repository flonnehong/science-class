/* 이미 만든 수업 자료에 로그인·쪽 넘김·시계·글자 크기·기록을 붙인다.  <script type="module" src="/science-class/adapt.js?l=차시&p=저장앞글자"> */
import { run } from "./core.js";
const q = new URL(import.meta.url).searchParams, id = q.get("l"), base = new URL(".", import.meta.url).href;
if (!document.querySelector("link[data-sc]")) { const l = document.createElement("link"); l.rel = "stylesheet"; l.href = base + "class.css"; l.dataset.sc = "1"; document.head.append(l); await new Promise(r => { l.onload = l.onerror = r; setTimeout(r, 3000); }); }
const main = document.querySelector("main"), secs = [...main.querySelectorAll(":scope > section")];
const nav = [...document.querySelectorAll("nav.steps a")], clean = t => (t || "").replace(/\s+/g, " ").trim();
const titles = secs.map((s, i) => clean((nav[i] || s.querySelector("h2") || {}).textContent) || `${i + 1}단계`);
const near = e => { // 답 이름: 가까운 라벨·제목
  const lab = e.id && document.querySelector(`label[for="${e.id}"]`); if (lab) return clean(lab.textContent);
  const box = e.closest(".card,.concept,td,section"), t = e.getAttribute("aria-label") || e.placeholder || (box && box.querySelector("b,h3,h2") && box.querySelector("b,h3,h2").textContent);
  return clean(t) || "답";
};
const key = (p, s) => (p + "_" + String(s)).replace(/[^a-zA-Z0-9_]/g, "").slice(0, 40);
const fields = () => [...main.querySelectorAll("textarea,select,input")].filter(e => !/^(range|checkbox|radio|button|submit)$/.test(e.type) && !e.closest(".sc-gate"));
const name = (e, i) => e.id ? key("f", e.id) : key("n", secs.findIndex(s => s.contains(e)) + "x" + i);
function collect() {
  const out = [];
  fields().forEach((e, i) => out.push({ k: name(e, i), l: near(e), v: e.tagName === "SELECT" && e.value ? clean(e.options[e.selectedIndex].textContent) : clean(e.value) }));
  main.querySelectorAll(".opts,.seg").forEach((g, i) => { if (g.closest(".sc-card,.q") || /Type$/.test(g.id)) return; const on = g.querySelector(".picked,.on"); out.push({ k: key("p", g.id || (g.closest("[id]") || {}).id + "x" + i), l: "선택: " + clean((g.closest(".card,section").querySelector("b,h2") || {}).textContent).slice(0, 40), v: on ? clean(on.textContent) : "" }); });
  const qs = [...main.querySelectorAll(".quiz .q")]; if (qs.length) { const r = qs.map(x => x.querySelector(".correct,.right") ? (x.querySelector(".wrong") ? "X" : "O") : "-"); out.push({ k: "quiz", l: "퀴즈 결과", v: r.some(v => v !== "-") ? r.join(" ") : "" }, { k: "quiz_score", l: "퀴즈 점수", v: r.includes("-") ? "" : `${r.filter(v => v === "O").length}/${r.length}` }); }
  const slots = main.querySelectorAll(".slot"); if (slots.length) out.push({ k: "stickers", l: "붙인 스티커", v: `${main.querySelectorAll(".slot.filled").length}/${slots.length}` });
  const seen = {}; out.forEach(x => { const l = x.l.slice(0, 52), n = seen[l] = (seen[l] || 0) + 1; x.l = n > 1 ? l + " (" + n + ")" : l; });
  return out;
}
run({
  lesson: id, main, titles, prefix: q.get("p") || "",
  done: i => { const a = [...secs[i].querySelectorAll(".quiz .q")]; return a.length ? a.every(x => x.querySelector(".correct,.right")) : null; },
  need: () => "모든 문제를 풀어 보세요. (다음 장에 더 있을 수 있어요)",
  collect,
  ready: c => { if (c.demo) return; fields().forEach((e, i) => { const v = c.saved(name(e, i)); if (v && !e.value) { if (e.tagName === "SELECT") { const o = [...e.options].find(x => clean(x.textContent) === v); if (o) e.value = o.value; } else e.value = v; e.dispatchEvent(new Event("input", { bubbles: true })); e.dispatchEvent(new Event("change", { bubbles: true })); } }); }
});
