/* 학생용 공통 프로그램: 로그인, 쪽 넘김(스크롤 없음), 글자 크기, 시계, 실시간 진행, 답 저장 */
import { connect, ls, day, h, clock, fontControl, onAuthStateChanged, signInAnonymously, signOut, ref, get, set, update, onValue, onDisconnect, serverTimestamp, goOffline } from "./fb.js";
import { lessonOf, HOME } from "./catalog.js";

/**
 * o.lesson  차시 id
 * o.main    수업 내용을 담은 요소 (안의 section 이 한 단계)
 * o.titles  단계 이름들
 * o.done(i) 단계를 마쳤는지: true/false, 정해진 활동이 없으면 null
 * o.need(i) 아직 못 마쳤을 때 안내 문구
 * o.collect() → [{k,l,v}] 저장할 답
 * o.ready(ctx) 수락된 뒤 한 번. ctx.poll(q, cb), ctx.vote(q, i), ctx.saved(k)
 * o.prefix  이 수업이 쓰는 localStorage 앞글자 (다른 학생이 쓰면 지움)
 * o.zoom    기본 글자 배율 (예전 수업 자료는 1.1)
 */
export function run(o) {
  const L = lessonOf(o.lesson), qs = new URLSearchParams(location.search), demo = qs.get("demo") === "1", Z = o.zoom || 1;
  const secs = [...o.main.querySelectorAll(":scope > section")];
  document.documentElement.classList.add("sc-on"); document.documentElement.classList.remove("sc-wait");
  const $bar = h("header", { class: "sc-bar" }), $stage = h("div", { class: "sc-stage" }), $foot = h("footer", { class: "sc-foot" }), $gate = h("div", { class: "sc-gate" });
  const font = fontControl(() => paginate()), $who = h("span", { class: "sc-who" }), $net = h("i", { class: "sc-net", title: "연결 상태" });
  $bar.append(h("a", { class: "sc-home", href: HOME, "aria-label": "처음 화면으로" }, "⌂"), h("b", { class: "sc-title" }, L ? L.title : ""), $who, $net, font.el, clock(h("time", { class: "sc-clock", "aria-label": "지금 시각" })));
  const $prev = h("button", { type: "button", class: "sc-nav", onclick: () => prev() }, "◀ 이전"), $next = h("button", { type: "button", class: "sc-nav main", onclick: () => next() }, "다음 ▶");
  const $steps = h("div", { class: "sc-steps", "aria-label": "단계" }), $msg = h("div", { class: "sc-msg", role: "status" }), $stay = h("button", { type: "button", class: "sc-stay", hidden: true, onclick: () => { held = step; stop(); foot(); } }, "더 보기");
  $foot.append($prev, h("div", { class: "sc-mid" }, $steps, $msg), $stay, $next);
  const $scale = h("div", { class: "sc-scale" });
  document.body.append($bar, $stage, $foot, $gate);
  $stage.append($scale); $scale.append(o.main); o.main.classList.add("sc-main");
  const dots = secs.map((s, i) => { const b = h("button", { type: "button", title: o.titles[i], "aria-label": o.titles[i], onclick: () => { if (i <= limit()) go(i, 0); } }, String(i + 1)); $steps.append(b); return b; });

  /* ---------- 쪽 나누기: 한 단계는 한 화면에. 너무 작아질 때(작은 휴대폰 등)만 여러 장으로 나눈다 ---------- */
  const ONE = 0.66, S = () => font.value * Z;
  let step = 0, page = 0, pages = [[]], k = 1, ready = demo, boxes = [];
  const SPLIT = ".card,.quiz,.grid2,.split,#scenes,#quizBox,ol,ul,.concept,.blocks,.two,.cols";
  const vis = e => e.nodeType === 1 && e.getClientRects().length > 0 && e.getBoundingClientRect().height > 1;
  function paginate(keep) {
    const sec = secs[step]; if (!sec) return;
    const firstNow = keep !== false && pages[page] && pages[page][0];
    secs.forEach((s, i) => s.classList.toggle("sc-off", i !== step));
    sec.querySelectorAll(".sc-hide").forEach(e => e.classList.remove("sc-hide"));
    const s = S(), W = $stage.clientWidth, H = $stage.clientHeight; if (!W || !H) return;
    const wide = Math.min(1240, W / s - 24); $scale.style.width = wide + "px"; $scale.style.transform = "none"; k = s;
    const kOne = Math.min(s, (H - 4) / Math.max(1, sec.offsetHeight), (W - 4) / Math.max(1, $scale.offsetWidth));
    if (kOne >= s * ONE) { pages = [[...sec.children].filter(vis)]; boxes = []; page = 0; showPage(); return; }
    const budget = (H / s - 12) / 0.85, at = []; boxes = [];
    (function walk(el) {
      [...el.children].filter(vis).forEach(c => {
        const hgt = c.getBoundingClientRect().height, kids = [...c.children].filter(vis);
        if (hgt > budget && kids.length > 1 && !c.hasAttribute("data-keep") && (c.matches(SPLIT) || (hgt > budget * 1.2 && kids.length > 2 && c.matches("div") && !c.querySelector("canvas,.slot,svg")))) { boxes.push(c); walk(c); }
        else at.push(c);
      });
    })(sec);
    const r = at.map(e => e.getBoundingClientRect()), glue = i => {
      const a = at[i], b = at[i + 1]; if (!b) return false;
      if (a.matches("h1,h2,h3,h4,.tag,.sc-with")) return true;
      if (a.matches("figure,.pic") && b.matches("p,figcaption,h3,h4,.question") && r[i + 1].bottom - r[i].top < budget) return true; // 그림과 바로 뒤 설명은 한 장에
      return b.matches(".controls,.readout,.zones,.todo,.msg,.opts") && !!(a.matches("canvas,.scroll,.controls,.readout,.todo") || a.querySelector("canvas"));
    };
    pages = [[]]; let top = null, i = 0;
    while (i < at.length) {
      let j = i; while (glue(j)) j++;
      const bottom = r[j].bottom;
      if (top === null) top = r[i].top;
      if (bottom - top > budget && pages[pages.length - 1].length) { pages.push([]); top = r[i].top; }
      for (; i <= j; i++) pages[pages.length - 1].push(at[i]);
    }
    for (let x = pages.length - 1; x > 0; x--) { // 한두 줄만 남은 쪽은 앞쪽에 합친다
      const hOf = g => r[at.indexOf(g[g.length - 1])].bottom - r[at.indexOf(g[0])].top;
      if (hOf(pages[x]) < budget * .2 && hOf(pages[x - 1]) + hOf(pages[x]) < budget * 1.22) { pages[x - 1].push(...pages[x]); pages.splice(x, 1); }
    }
    let p = page; if (firstNow) { const f = pages.findIndex(g => g.includes(firstNow)); if (f >= 0) p = f; }
    page = Math.max(0, Math.min(p, pages.length - 1)); showPage();
  }
  function showPage() {
    const on = new Set(pages[page]);
    pages.flat().forEach(e => e.classList.toggle("sc-hide", !on.has(e)));
    boxes.forEach(b => b.classList.toggle("sc-hide", ![...on].some(e => b.contains(e))));
    fit(); foot();
    dispatchEvent(new Event("sc-page"));
  }
  function fit() {
    const sec = secs[step], s = S(), H = $stage.clientHeight, W = $stage.clientWidth;
    const hh = sec.offsetHeight, ww = $scale.offsetWidth; if (!hh) return;
    k = Math.max(0.3, Math.min(s, (H - 4) / hh, (W - 4) / ww));
    $scale.style.transform = `translate(${Math.max(0, (W - ww * k) / 2)}px,${Math.max(2, Math.min(40, (H - hh * k) / 2))}px) scale(${k})`;
  }
  let tm = null; const later = (f, ms) => { clearTimeout(tm); tm = setTimeout(f, ms); };
  new ResizeObserver(() => later(() => paginate(), 120)).observe($stage);
  const ro = new ResizeObserver(() => { fit(); if (k < S() * ONE * 0.97 && pages[page].length > 1) later(() => paginate(), 200); }); secs.forEach(s => ro.observe(s));
  new MutationObserver(ms => { if (ms.some(m => m.type === "childList" && [...m.addedNodes].some(n => n.nodeType === 1) && m.target.closest && m.target.closest(".quiz,#scenes,.split"))) later(() => paginate(), 150); }).observe(o.main, { childList: true, subtree: true });
  if (document.fonts) document.fonts.ready.then(() => paginate());
  addEventListener("load", () => paginate());
  o.main.addEventListener("toggle", () => later(() => paginate(), 60), true);

  /* ---------- 단계 진행 ---------- */
  let live = null, pushTo = 0, doneN = 0, count = null, left = 0, held = -1, fresh = -1, over = false;
  const last = secs.length - 1;
  const isDone = i => i < doneN || o.done(i) === true;
  function limit() { if (demo) return last; let n = 0; while (n < last && isDone(n)) n++; return Math.min(last, Math.max(live && live.mode === "teacher" ? live.step : n, pushTo)); }
  function stop() { clearInterval(count); count = null; }
  function go(i, p) { stop(); const was = step; step = Math.max(0, Math.min(last, i)); page = p; paginate(false); if (p > 0) { page = Math.min(p, pages.length - 1); showPage(); } if (was !== step) report(); }
  function prev() { stop(); if (page > 0) { page--; showPage(); } else if (step > 0) { go(step - 1, 999); } }
  function next() {
    stop();
    if (page < pages.length - 1) { page++; showPage(); return; }
    if (o.done(step) === false && step >= doneN && !demo) { foot(); $msg.classList.add("shake"); setTimeout(() => $msg.classList.remove("shake"), 500); return; }
    if (doneN <= step) { doneN = step + 1; report(); }
    if (step < last && step < limit()) go(step + 1, 0); else foot();
  }
  function foot() {
    const lim = limit(), end = page === pages.length - 1, d = o.done(step), ok = step < doneN || d === true;
    dots.forEach((b, i) => { b.classList.toggle("on", i === step); b.classList.toggle("fin", isDone(i)); b.disabled = i > lim; });
    $prev.disabled = step === 0 && page === 0;
    $next.disabled = end && (step === last ? doneN > last : ok && step >= lim);
    $next.textContent = !end ? "다음 장 ▶" : step === last ? "마치기 ✓" : "다음 단계 ▶";
    const pg = pages.length > 1 ? `${page + 1}/${pages.length}쪽 · ` : "";
    $stay.hidden = count === null;
    $msg.textContent = over ? "수업이 끝났어요. 수고했어요!" : count !== null ? `이 단계를 마쳤어요! ${left}초 뒤 넘어가요.` : doneN > last ? "모든 활동을 마쳤어요. 수고했어요!" : end && ok && step >= lim && step < last ? "잘했어요! 선생님이 넘길 때까지 기다려요." : end && d === false && !ok ? (o.need ? o.need(step) : "") || "활동을 마치면 넘어갈 수 있어요." : pg + o.titles[step];
    if (!demo && ready && !over && live && live.mode === "auto" && d === true && end && step < lim && step >= doneN && count === null && held !== step && fresh === step) {
      left = 8; $stay.hidden = false; count = setInterval(() => { if (document.hidden) return; left--; if (left <= 0) { fresh = -1; next(); } else foot(); }, 1000); foot();
    }
    if (d === false) fresh = step;
  }
  document.addEventListener("focusin", e => { if (count !== null && e.target.tagName === "TEXTAREA") { held = step; stop(); foot(); } });
  addEventListener("keydown", e => { if (/^(INPUT|TEXTAREA|SELECT)$/.test(e.target.tagName) || !ready) return; if (e.key === "PageDown") { e.preventDefault(); next(); } if (e.key === "PageUp") { e.preventDefault(); prev(); } });

  /* ---------- 시연(저장 안 함) ---------- */
  if (demo) { $who.textContent = "미리 보기"; $net.hidden = true; $gate.hidden = true; if (o.ready) o.ready({ demo: true, poll() {}, vote() {}, saved: () => undefined }); const st0 = +qs.get("step") || 0; if (st0 > 0) go(Math.min(last, st0), 0); else paginate(); return { refresh: foot }; }

  /* ---------- 로그인 ---------- */
  const fb = connect("student"); let uid = null, me = null, path = null, offs = [], accepted = false, sid = null, saved = {}, offsAll = [];
  try { const m = JSON.parse(ls.get("me") || "null"); if (m && m.day === day()) me = m; } catch (e) {}
  const on = (p, f) => { const off = onValue(ref(fb.db, p), s => f(s.val()), () => f(null)); offs.push(off); };
  const clear = () => { offs.forEach(f => f()); offs = []; };
  function gate(view) {
    $gate.hidden = false; $gate.textContent = ""; const card = h("div", { class: "sc-card" }, h("small", {}, `${L.unit ? L.unit + "단원 · " : ""}${L.no}차시`.replace("일기차시", "수업 도구").replace("도입차시", "도입").replace("종합차시", "종합")), h("h1", {}, L.title), ...view);
    $gate.append(h("div", { class: "sc-gtop" }, h("a", { class: "sc-home", href: HOME, "aria-label": "처음 화면으로" }, "⌂"), clock(h("time", { class: "sc-clock" }))), card);
  }
  function form(note) {
    clear(); let c = me ? me.cls : 0; const err = h("p", { class: "sc-err", role: "alert" }, note || "");
    const cb = [1, 2, 3, 4, 5, 6, 7].map(n => h("button", { type: "button", class: n === c ? "on" : "", onclick: e => { c = n; cb.forEach(x => x.classList.toggle("on", x === e.currentTarget)); } }, n + "반"));
    const num = h("input", { type: "number", min: 1, max: 30, inputmode: "numeric", placeholder: "번호", "aria-label": "번호", value: me ? me.n : "" });
    const f = h("form", {}, h("div", { class: "sc-cls" }, cb), num, h("button", { class: "sc-go", type: "submit" }, "로그인"), err, h("p", { class: "sc-note" }, "반·번호와 활동 답이 선생님께 저장돼요. 이름이나 개인 정보는 쓰지 마세요."));
    f.onsubmit = async e => {
      e.preventDefault(); const n = +num.value;
      if (!c) { err.textContent = "반을 골라 주세요."; return; } if (!Number.isInteger(n) || n < 1 || n > 30) { err.textContent = "번호(1~30)를 적어 주세요."; return; }
      const old = me; me = { cls: c, n, day: day() }; wait("로그인하는 중…");
      try { if (fb.auth.currentUser && old && (old.cls !== c || old.n !== n)) { await signOut(fb.auth); } if (!fb.auth.currentUser) await signInAnonymously(fb.auth); uid = fb.auth.currentUser.uid; ls.set("me", JSON.stringify(me)); enter(); }
      catch (x) { form("서버에 연결하지 못했어요. 인터넷을 확인하고 다시 눌러 주세요."); }
    };
    gate([f]);
  }
  function wait(title, sub, extra) { gate([h("p", { class: "sc-me" }, `2학년 ${me.cls}반 ${me.n}번`), h("div", { class: "sc-spin", "aria-hidden": true }), h("p", { class: "sc-big", role: "status" }, title), h("p", { class: "sc-note" }, sub || ""), h("div", { class: "sc-row" }, extra, h("button", { type: "button", onclick: logout }, "반·번호 바꾸기"))]); }
  async function logout() { const was = accepted; clear(); ready = false; accepted = false; ls.del("me"); ls.del("bk"); me = null; try { if (path) await update(ref(fb.db, "prog/" + path), { on: false }); } catch (e) {} try { await signOut(fb.auth); } catch (e) {} path = null; if (was) location.reload(); else form(); }
  $who.onclick = () => { if (ready && confirm("로그아웃할까요? 저장된 답은 선생님께 남아 있어요.")) { logout(); } };
  async function enter() {
    clear(); const key = `${o.lesson}_${me.cls}`, who = me; wait("수업을 확인하는 중…");
    // 선생님이 아직 열지 않았으면 '자동 진행·자동 입장'으로 오늘 수업을 시작한다
    const lr = ref(fb.db, "live/" + key); try { const v = (await get(lr)).val(); if (!v || !v.sid || String(v.sid).slice(0, 8) !== day()) await set(lr, { sid: day(), open: true, mode: "auto", step: 0, auto: true, t: serverTimestamp() }); } catch (e) {}
    if (me !== who) return; clear();
    on("live/" + key, async v => {
      const good = v && v.sid && String(v.sid).slice(0, 8) === day();
      if (accepted && good && v.sid === sid) { const old = live; live = v; over = !v.open; moved(old); return; }
      if (accepted && (!good || v.sid !== sid)) { location.reload(); return; }
      if (!good || !v.open) { live = v; wait(good ? "수업이 끝났어요" : "아직 수업이 열리지 않았어요", "선생님이 수업을 열면 자동으로 들어가요."); return; }
      live = v; if (sid !== v.sid) { sid = v.sid; path = `${key}/${sid}/${uid}`; ask(); }
    });
  }
  async function ask() {
    const p = path, auto = !!live.auto;
    if (auto) wait("들어가는 중…"); else wait("선생님의 수락을 기다리고 있어요", "이 화면을 그대로 두면 자동으로 넘어가요.");
    on("st/" + p, async s => {
      if (p !== path) return;
      if (s === "ok") { if (!accepted) begin(); }
      else if (s === "no") { if (accepted) { location.reload(); return; } wait("선생님이 수락하지 않았어요", "반과 번호가 맞는지 확인하고 선생님께 말씀드려 주세요."); }
      else if (accepted) location.reload();
    });
    try { const s = (await get(ref(fb.db, "st/" + p))).val(); if (s !== "ok") await set(ref(fb.db, "req/" + p), { n: me.n, t: serverTimestamp() }); if (s === null && auto) try { await set(ref(fb.db, "st/" + p), "ok"); } catch (e) { if (p === path && !accepted) wait("선생님의 수락을 기다리고 있어요", "이 화면을 그대로 두면 자동으로 넘어가요."); } }
    catch (e) { wait("신청하지 못했어요", "잠시 뒤 다시 해 보세요.", h("button", { type: "button", onclick: ask }, "다시 신청")); }
  }
  async function begin() {
    accepted = true;
    const own = uid + sid, mark = "own-" + o.lesson;
    if (ls.get(mark) !== own) { // 이 기기를 쓰던 다른 학생의 기록을 지운다
      let hit = false; if (o.prefix) try { Object.keys(localStorage).filter(x => x.startsWith(o.prefix) && !x.endsWith("theme")).forEach(x => { localStorage.removeItem(x); hit = true; }); } catch (e) {}
      ls.set(mark, own); if (hit) { location.reload(); return; }
    }
    try { const [a, p] = await Promise.all([get(ref(fb.db, "ans/" + path)), get(ref(fb.db, "prog/" + path))]); saved = a.val() || {}; if (p.val()) { doneN = p.val().done || 0; step = Math.min(last, p.val().step || 0); } } catch (e) {}
    try { const b = JSON.parse(ls.get("bk") || "null"); if (b && b.p === path) { b.a.forEach(([q, v]) => { if (!saved[q] || saved[q].v !== v) saved[q] = { v, pend: true }; }); if (b.d > doneN) { doneN = b.d; step = Math.min(last, Math.max(step, b.s)); } } } catch (e) {}
    on("push/" + path, v => { const was = pushTo; pushTo = +v || 0; if (ready && pushTo > was && step < pushTo) go(Math.min(pushTo, limit()), 0); else if (ready) foot(); });
    on(".info/connected", v => { $net.classList.toggle("ok", !!v); if (v) { onDisconnect(ref(fb.db, `prog/${path}/on`)).set(false); report(true); } });
    $who.textContent = `${me.cls}반 ${me.n}번`; $who.title = "누르면 로그아웃"; ready = true; $gate.hidden = true;
    const key = `${o.lesson}_${me.cls}/${sid}`;
    if (o.ready) o.ready({
      demo: false, saved: q => saved[q] && saved[q].v,
      poll(q, cb) { onValue(ref(fb.db, `poll/${key}/${q}`), s => cb(Object.values(s.val() || {}), (s.val() || {})[uid])); },
      vote(q, i) { set(ref(fb.db, `poll/${key}/${q}/${uid}`), i).catch(() => {}); }
    });
    if (live.mode === "teacher") step = Math.min(last, live.step); else step = Math.min(step, limit());
    page = 0; paginate(false); report(true); setInterval(flush, 2500);
    addEventListener("input", () => { dirty = true; foot(); }); addEventListener("click", () => { dirty = true; setTimeout(foot, 60); }); addEventListener("visibilitychange", () => { if (document.hidden) flush(); });
    addEventListener("sc-change", () => { dirty = true; foot(); });
  }
  function moved(old) {
    if (!ready) return;
    if (live.mode === "teacher" && live.open && (!old || old.mode !== "teacher" || old.step !== live.step)) go(Math.max(Math.min(last, live.step), Math.min(pushTo, step)), 0);
    else { if (live.mode !== "auto") stop(); if (step > limit()) go(limit(), 0); else foot(); }
  }
  let rep = "", dirty = true, sent = {}, busy = false;
  function report(force) { if (demo || !accepted || !path) return; const v = JSON.stringify([step, doneN]); if (!force && v === rep) return; rep = v; set(ref(fb.db, "prog/" + path), { n: me.n, step, done: doneN, on: true, t: Date.now() }).catch(() => {}); dirty = true; }
  // 아직 보내지 못한 답은 이 기기에 잠시 보관했다가 다시 열면 이어서 보낸다
  function backup() { if (!ready || !path) return; try { ls.set("bk", JSON.stringify({ p: path, d: doneN, s: step, a: o.collect().filter(x => x.v !== "" && x.v !== undefined).map(x => [x.k, String(x.v).slice(0, 600)]) })); } catch (e) {} }
  async function flush() {
    if (!ready || !dirty || busy) return; dirty = false; busy = true; backup();
    try {
      const up = {}; let i = 0;
      for (const a of o.collect()) { i++; const v = String(a.v === undefined || a.v === null ? "" : a.v).slice(0, 600); if (!/^[a-zA-Z0-9_]{1,40}$/.test(a.k) || (v === "" && !sent[a.k] && !saved[a.k])) continue; if (sent[a.k] === v || (sent[a.k] === undefined && saved[a.k] && !saved[a.k].pend && saved[a.k].v === v)) continue; up[a.k] = { v, l: String(a.l || a.k).replace(/\s+/g, " ").trim().slice(0, 60), o: Math.min(999, i), t: Date.now() }; }
      if (Object.keys(up).length) { await update(ref(fb.db, "ans/" + path), up); for (const q in up) sent[q] = up[q].v; $net.title = "저장됨"; }
    } catch (e) { dirty = true; $net.title = "저장하지 못했어요. 다시 시도해요."; }
    busy = false;
  }
  addEventListener("pagehide", () => { if (dirty) backup(); goOffline(fb.db); }); addEventListener("pageshow", e => { if (e.persisted) location.reload(); });
  onAuthStateChanged(fb.auth, u => { if (u) uid = u.uid; });
  (async () => { try { await fb.auth.authStateReady(); } catch (e) {} if (me && fb.auth.currentUser) { uid = fb.auth.currentUser.uid; enter(); } else form(); })();
  paginate();
  return { refresh: foot };
}
