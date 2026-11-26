/* 통합 교사용 페이지
   첫 화면: 단원별 모든 차시 (스크롤) → 차시를 고르면 한 화면에
   [왼쪽 위: 반 고르기] [오른쪽 위: 진행 단추·참여 학생 번호]
   [왼쪽 아래: 고른 학생의 진행 상황·답] [오른쪽 아래: 학생 화면 (미리 보기)] */
import { connect, ls, day, h, clock, fontControl, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, setPersistence, browserSessionPersistence, ref, get, set, update, remove, onValue } from "./fb.js";
import { UNITS, LESSONS, HOME } from "./catalog.js";
import { DATA } from "./data.js";
const ID = "teacher@science-class.example.com", BRIDGE = "https://script.google.com/macros/s/AKfycbyhtaCm2c_xI7PT_7rsvYYks-WDyg6GFWry774lU-Wkgw5XJGoSRoX5CqwYZ-2jYbMwYw/exec";
const STEPS = { "u5-1": 6, "u6-1": 7, "u7-2": 6, "u7-12": 6, "u8-1": 6, "u8-2": 6 };
const stepsOf = id => DATA[id] ? DATA[id].length : STEPS[id] || 5, titlesOf = id => DATA[id] ? DATA[id].map(s => s.t) : null;
const noOf = l => /^\d+$/.test(l.no) ? l.no + "차시" : l.no;
const fb = connect("teacher"), R = p => ref(fb.db, p), $ = h("main", { class: "tp" }); let offs = [], bridge = "";
const font = fontControl(v => document.documentElement.style.setProperty("--fs", v), "tfont"); document.documentElement.style.setProperty("--fs", font.value);
const crumb = h("div", { class: "crumb" });
document.body.append(h("header", { class: "tbar" }, h("b", {}, "통합 교사용"), crumb, h("span", { class: "sp" }), font.el, clock(h("time", { class: "sc-clock", "aria-label": "지금 시각" }))), $);
const btn = (t, f, c) => h("button", { type: "button", class: c, onclick: f }, t);
const clear = () => { offs.forEach(f => f()); offs = []; }, on = (p, f) => offs.push(onValue(R(p), s => f(s.val()), () => f(null)));
function view(...k) { $.textContent = ""; $.append(...k.filter(Boolean)); }
let toastT; function toast(t, bad) { document.querySelector(".toast")?.remove(); const e = h("div", { class: "toast" + (bad ? " bad" : ""), role: "status" }, t); document.body.append(e); clearTimeout(toastT); toastT = setTimeout(() => e.remove(), 3500); }
async function post(o) { const ac = new AbortController(), t = setTimeout(() => ac.abort(), 40000); try { const r = await fetch(BRIDGE, { method: "POST", headers: { "Content-Type": "text/plain;charset=utf-8" }, body: JSON.stringify(o), signal: ac.signal }); return await r.json(); } finally { clearTimeout(t); } }

/* ---------- 로그인 ---------- */
function login(first) {
  clear(); $.className = "tp"; crumb.textContent = ""; const pw = h("input", { type: "password", autocomplete: "current-password", placeholder: "교사 비밀번호 (8자 이상)", "aria-label": "교사 비밀번호" }), code = h("input", { type: "text", placeholder: "등록 코드", "aria-label": "등록 코드", autocomplete: "off" }), err = h("p", { class: "err", role: "alert" });
  const f = h("form", { class: "lg" }, h("h1", {}, first ? "처음 설정" : "교사 로그인"), first ? h("p", {}, "등록 코드는 선생님 컴퓨터의 ‘비밀키 → 과학수업앱_교사등록코드.txt’에 있어요. 쓸 비밀번호를 정해 주세요.") : null, first ? code : null, pw, h("button", { class: "pri big", type: "submit" }, first ? "등록하고 시작" : "들어가기"), err, btn(first ? "로그인으로 돌아가기" : "처음이신가요? 처음 설정", () => login(!first), "ln"));
  f.onsubmit = async e => {
    e.preventDefault(); err.textContent = "확인하는 중…";
    try {
      await setPersistence(fb.auth, browserSessionPersistence);
      if (first) {
        if (pw.value.length < 8) { err.textContent = "비밀번호를 8자 이상으로 정해 주세요."; return; }
        let u; try { u = (await createUserWithEmailAndPassword(fb.auth, ID, pw.value)).user; } catch (x) { if (x.code !== "auth/email-already-in-use") throw x; u = (await signInWithEmailAndPassword(fb.auth, ID, pw.value)).user; }
        try { await set(R("cfg/admins/" + u.uid), code.value.trim()); await remove(R("cfg/claim")); } catch (x) { if (!(await get(R("cfg/admins/" + u.uid))).exists()) { await signOut(fb.auth); err.textContent = "등록 코드가 맞지 않거나 이미 사용되었어요."; return; } }
      } else await signInWithEmailAndPassword(fb.auth, ID, pw.value);
      enter();
    } catch (x) { err.textContent = { "auth/invalid-credential": "비밀번호가 맞지 않거나 아직 등록하지 않았어요.", "auth/wrong-password": "비밀번호가 맞지 않아요. 이미 등록했다면 그때 정한 비밀번호를 쓰세요.", "auth/too-many-requests": "여러 번 틀렸어요. 잠시 뒤 다시 해 주세요." }[x.code] || "서버에 연결하지 못했어요. 인터넷을 확인해 주세요."; }
  };
  view(f);
}
async function enter() { try { if (!(await get(R("cfg/admins/" + fb.auth.currentUser.uid))).exists()) { await signOut(fb.auth); login(true); return; } bridge = (await get(R("cfg/bridge"))).val() || ""; } catch (e) { login(); return; } lessons(); }

/* ---------- 첫 화면: 단원별 모든 차시 ---------- */
function lessons() {
  clear(); $.className = "tp scroll"; crumb.textContent = "차시 선택";
  view(h("div", { class: "pgt" }, h("h1", {}, "오늘 수업할 차시를 골라 주세요"), h("span", { class: "sp" }), btn("QR·주소", qr), btn(bridge ? "시트 연결됨 ✓" : "시트 연결하기", pair, bridge ? "" : "warn"), btn("로그아웃", async () => { clear(); await signOut(fb.auth); login(); })),
    ...[5, 6, 7, 8, 0].map(n => { const u = UNITS.find(x => x.n === n), ls_ = LESSONS.filter(l => l.unit === n); return h("section", { class: "unit", style: `--c:${u.c}` }, h("h2", {}, n ? `${n}단원 · ${u.t}` : u.t), h("div", { class: "lgrid" }, ls_.map(l => btn([h("small", {}, noOf(l)), h("b", {}, l.title)], () => lesson(l))))); }));
}

/* ---------- 차시 화면 ---------- */
function lesson(l) {
  clear(); $.className = "tp"; crumb.textContent = l.title;
  const st = {}, N = stepsOf(l.id), TT = titlesOf(l.id); let c = 0, kill = null, picked = false;
  const clsBox = h("div", { class: "cls" }), stu = h("div", { class: "stu" }), det = h("div", { class: "det" });
  const frame = h("iframe", { title: "학생 화면 미리 보기", tabindex: "-1" }), fw = h("div", { class: "fw" }, frame), pinfo = h("span", { class: "pinfo" });
  const bigBtn = btn("크게 보기", () => { bw.classList.toggle("bigpeek"); bigBtn.textContent = bw.classList.contains("bigpeek") ? "작게 보기" : "크게 보기"; fitFrame(); });
  const peek = h("div", { class: "peek" }, h("div", { class: "ph" }, h("b", {}, "학생 화면"), pinfo, h("span", { class: "sp" }), bigBtn, btn("닫기", () => setPeek(false))), fw);
  const low = h("div", { class: "low" }, det, peek), bw = h("div", { class: "bw" }, clsBox, stu, low);
  const peekBtn = btn("", () => setPeek(!bw.classList.contains("pk")), "pri");
  view(h("div", { class: "pgt" }, btn("◀ 차시 선택", lessons), h("span", { class: "chip" }, `${l.unit ? l.unit + "단원 " : ""}${noOf(l)}`), h("h1", {}, l.title), h("span", { class: "sp" }), peekBtn), bw);
  // 학생 화면: 너비 1200px 화면을 줄여서 보여 준다 (미리 보기라 저장되지 않음)
  let src = "", want = 0, who0 = "";
  function fitFrame() { const w = fw.clientWidth, hh = fw.clientHeight; if (!w || !hh) return; const VW = 1200, VH = Math.round(Math.max(640, Math.min(900, VW * hh / w))), k = Math.min(w / VW, hh / VH); frame.style.width = VW + "px"; frame.style.height = VH + "px"; frame.style.transform = `translate(${(w - VW * k) / 2}px,${(hh - VH * k) / 2}px) scale(${k})`; }
  new ResizeObserver(fitFrame).observe(fw);
  function peekTo(step, who) { want = step; who0 = who || ""; pinfo.textContent = who ? `${who} 화면 · ${step + 1}단계${TT ? " " + TT[step] : ""} (미리 보기, 답은 저장되지 않아요)` : `${step + 1}단계${TT ? " " + TT[step] : ""} (미리 보기, 답은 저장되지 않아요)`; if (!bw.classList.contains("pk")) return; const u = l.url + (l.url.includes("?") ? "&" : "?") + "demo=1" + (step ? "&step=" + step : ""); if (u !== src) { src = u; frame.src = u; } }
  function setPeek(v) { bw.classList.toggle("pk", v); ls.set("tpeek", v ? "1" : "0"); peekBtn.textContent = v ? "학생 화면 닫기" : "👀 학생 화면 보기"; if (!v) { bw.classList.remove("bigpeek"); bigBtn.textContent = "크게 보기"; } else peekTo(want, who0); setTimeout(fitFrame, 30); }
  setPeek(ls.get("tpeek") === "1");
  offs.push(() => { if (kill) kill(); });
  function drawCls() {
    clsBox.textContent = ""; clsBox.append(h("b", { class: "cap" }, "수업하는 반"));
    for (let n = 1; n <= 7; n++) { const v = st[n], o = v && v.sid && v.sid.slice(0, 8) === day(); clsBox.append(btn([h("b", {}, n + "반"), h("span", {}, o ? (v.open ? "● 수업 중" : "마침") : "")], () => choose(n), (n === c ? "on " : "") + (o && v.open ? "open" : ""))); }
  }
  function choose(n) {
    c = n; picked = true; drawCls(); if (kill) kill();
    kill = board(l, n, { stu, det, bw, N, TT, peekTo });
  }
  for (let n = 1; n <= 7; n++) on(`live/${l.id}_${n}`, v => { st[n] = v; drawCls(); if (!picked) { const o = Object.keys(st).find(k => st[k] && st[k].open && st[k].sid && st[k].sid.slice(0, 8) === day()); if (o) choose(+o); } });
  drawCls(); stu.append(h("p", { class: "empty" }, "◀ 왼쪽에서 수업하는 반을 골라 주세요.")); det.append(h("p", { class: "empty sm" }, "반을 고르고 학생 번호를 누르면 진행 상황이 여기에 보여요.")); peekTo(0);
}

/* ---------- 한 반의 현황 ---------- */
function board(l, c, U) {
  const { stu, det, bw, N, TT, peekTo } = U, key = `${l.id}_${c}`, subs = [];
  let live = null, sid = null, req = {}, st = {}, prog = {}, psh = {}, ans = {}, syn = {}, tab = "now", sel = null, sub = [], ap = 0, q = 0, dead = false, lastSync = "", syncing = false;
  const write = async (f) => { try { await f(); } catch (e) { toast("저장하지 못했어요. 다시 눌러 주세요.", true); } };
  const base = p => `${p}/${key}/${sid}`;
  const newSid = old => { const d = day(); if (!old || old.slice(0, 8) !== d) return d; const x = old[8]; return d + (x ? String.fromCharCode(Math.min(122, x.charCodeAt(0) + 1)) : "b"); };
  const isToday = () => live && live.sid && live.sid.slice(0, 8) === day();
  subs.push(onValue(R(`live/${key}`), s => {
    const v = s.val(); live = v; const x = isToday() ? v.sid : null;
    if (x !== sid) { sid = x; sub.forEach(f => f()); sub = []; req = {}; st = {}; prog = {}; psh = {}; ans = {}; syn = {}; sel = null; if (sid) for (const [p, f] of [["req", v => { req = v; auto(); }], ["st", v => { st = v; }], ["prog", v => { prog = v; }], ["push", v => { psh = v; }], ["ans", v => { ans = v; }], ["sync", v => { syn = v; }]]) sub.push(onValue(R(base(p)), y => { f(y.val() || {}); draw(); }, () => {})); }
    draw();
  }, () => {}));
  const timer = setInterval(() => sync(false), 15000);
  const list = () => Object.entries(req).map(([u, r]) => ({ u, n: r.n, s: st[u] || "wait", p: prog[u] || {}, t: r.t })).sort((a, b) => a.n - b.n);
  function auto() { if (!live || !live.auto || !live.open) return; const used = new Set(list().filter(x => x.s === "ok").map(x => x.n)), up = {}; list().filter(x => x.s === "wait").forEach(x => { if (!used.has(x.n)) { used.add(x.n); up[x.u] = "ok"; } }); if (Object.keys(up).length) write(() => update(R(base("st")), up)); }
  const mark = (us, v) => write(() => update(R(base("st")), Object.fromEntries(us.map(u => [u, v]))));
  const setLive = o => write(() => update(R("live/" + key), Object.assign({ t: Date.now() }, o)));
  async function open(o) { if (isToday()) { await setLive({ open: true }); return; } await write(() => set(R("live/" + key), Object.assign({ sid: newSid(null), open: true, mode: "auto", step: 0, auto: true, t: Date.now() }, o))); }
  async function fresh() { if (!confirm(`${c}반의 접속 명단을 비우고 처음부터 새로 시작할까요? 지금까지의 답은 남아 있어요.`)) return; await sync(true); await write(() => set(R("live/" + key), { sid: newSid(sid), open: true, mode: "auto", step: 0, auto: true, t: Date.now() })); }
  const best = a => a.slice().sort((x, y) => !!y.p.on - !!x.p.on || (y.p.t || 0) - (x.p.t || 0))[0];
  const stepName = i => `${i + 1}단계` + (TT && TT[i] ? " " + TT[i].replace(/^[①-⑳]\s*/, "") : "");
  function draw() {
    if (dead) return; const on_ = isToday(), opened = on_ && live.open, L = list(), okAll = L.filter(x => x.s === "ok"), ok = [...new Set(okAll.map(x => x.n))].map(n => best(okAll.filter(x => x.n === n))), wt = L.filter(x => x.s === "wait"), mode = on_ ? live.mode : "auto";
    if (document.activeElement && stu.contains(document.activeElement) && /^(INPUT|TEXTAREA)$/.test(document.activeElement.tagName)) return;
    bw.classList.toggle("wide", tab !== "now");
    const head = h("div", { class: "row hd" }, h("h2", {}, `${c}반`), h("span", { class: "chip" + (opened ? " g" : "") }, opened ? "수업 중" : on_ ? "마침" : "자동 대기"), h("div", { class: "tabs" }, [["now", "현황"], ["ans", "답 모아 보기"], ["qr", "QR"]].map(([k, t]) => btn(t, () => { tab = k; ap = 0; draw(); }, tab === k ? "on" : ""))), h("span", { class: "sp" }),
      h("span", { class: "sy" }, bridge ? lastSync || "시트: 자동 저장" : "시트: 연결 안 됨"), bridge ? btn("시트에 저장", () => sync(true)) : btn("시트 연결하기", pair, "warn"),
      opened ? btn("수업 끝내기", () => { if (confirm("수업을 끝낼까요? 답은 시트에 남아요.")) { setLive({ open: false }); sync(true); } }) : btn(on_ ? "다시 열기" : "수업 열기", () => open(), "pri"), on_ ? btn("새로 시작", fresh) : null);
    stu.textContent = ""; stu.append(head);
    if (tab === "qr") { stu.append(qrBox(l)); return; }
    if (tab === "ans") { answers(okAll); return; }
    const seg = (cur, arr, f) => h("div", { class: "seg" }, arr.map(([v, t]) => btn(t, () => f(v), v === cur ? "on" : "")));
    const ctl = h("div", { class: "ctl" },
      h("div", { class: "row" }, h("b", {}, "진행"), seg(mode, [["auto", "자동 진행"], ["teacher", "교사 컨트롤"]], v => { if (on_) { const o = { mode: v }; if (v === "teacher" && live.mode !== "teacher" && ok.length) { const cnt = {}; ok.forEach(x => { const s = x.p.step || 0; cnt[s] = (cnt[s] || 0) + 1; }); o.step = +Object.keys(cnt).sort((a, b) => cnt[b] - cnt[a] || a - b)[0]; } setLive(o); } else open({ mode: v }); }),
        h("b", {}, "입장"), seg(on_ ? !!live.auto : true, [[true, "자동 입장"], [false, "수락 후"]], v => { if (on_) setLive({ auto: v }).then(auto); else open({ auto: v }); }),
        h("span", { class: "sp" }), h("span", { class: "k on" }, `접속 ${ok.filter(x => x.p.on).length}`), h("span", { class: "k off" }, `나감 ${ok.filter(x => !x.p.on).length}`), h("span", { class: "k wait" }, `대기 ${wt.length}`),
        wt.length ? btn(`대기 ${wt.length}명 모두 수락`, () => { const used = new Set(okAll.map(x => x.n)); const go = wt.filter(x => { if (used.has(x.n)) return false; used.add(x.n); return true; }); mark(go.map(x => x.u), "ok"); if (go.length < wt.length) toast("같은 번호로 겹친 신청은 빼고 수락했어요."); }, "pri") : null),
      h("div", { class: "row st" }, btn("◀", () => setLive({ step: Math.max(0, live.step - 1) }), "nx"), Array.from({ length: N }, (_, i) => { const here = ok.filter(x => (x.p.step || 0) === i).length, fin = ok.filter(x => (x.p.done || 0) > i).length; return btn([h("b", {}, i + 1), h("small", {}, `지금 ${here} · 마침 ${fin}`)], () => setLive({ step: i }), "sb" + (opened && mode === "teacher" && live.step === i ? " on" : "")); }), btn("모두 다음 ▶", () => setLive({ step: Math.min(N - 1, live.step + 1) }), "nx pri")));
    ctl.querySelectorAll(".st button").forEach(b => { b.disabled = !opened || mode !== "teacher"; b.title = mode !== "teacher" ? "교사 컨트롤일 때 단계를 넘길 수 있어요" : ""; });
    const byN = {}; L.forEach(x => (byN[x.n] = byN[x.n] || []).push(x));
    const M = Math.max(25, ...L.map(x => x.n));
    const grid = h("div", { class: "grid", style: `--cols:${Math.ceil(M / 2)};--n:${M}` }, Array.from({ length: M }, (_, i) => { const n = i + 1, a = byN[n] || [], x = best(a.filter(y => y.s === "ok")) || a.find(y => y.s === "wait") || a[0], dup = a.filter(y => y.s === "wait" || (y.s === "ok" && y.p.on)).length > 1; const cl = !x ? "none" : x.s === "wait" ? "wait" : x.s === "no" ? "no" : x.p.on ? "on" : "off"; return btn([h("b", {}, n), h("span", {}, !x ? "" : x.s === "wait" ? "대기" : x.s === "no" ? "거절" : (x.p.done || 0) >= N ? "마침" : `${(x.p.step || 0) + 1}단계`), x && x.s === "ok" ? h("i", { class: "pb" }, h("u", { style: `width:${Math.min(100, (x.p.done || 0) / N * 100)}%` })) : null, dup ? h("em", {}, "⚠") : null], () => { sel = sel === n ? null : n; draw(); }, "s " + cl + (sel === n ? " sel" : "")); }));
    stu.append(ctl, h("div", { class: "glab" }, h("b", {}, "참여 학생"), h("span", { class: "hint" }, "번호를 누르면 아래에 그 학생의 진행 상황이 보여요"), h("span", { class: "sp" }), h("span", { class: "k none" }, `미로그인 ${M - new Set(L.filter(x => x.s !== "no").map(x => x.n)).size}`)), grid);
    detail(byN, ok);
    const me = sel && ok.find(x => x.n === sel);
    if (me) { peekTo(Math.min(N - 1, me.p.step || 0), `${sel}번`); }
    else peekTo(opened && mode === "teacher" ? Math.min(N - 1, live.step || 0) : 0, "");
  }
  function detail(byN, ok) {
    det.textContent = "";
    if (!sel) { det.append(h("p", { class: "empty sm" }, "학생 번호를 누르면 진행 상황과 답을 한 번에 볼 수 있어요.")); return; }
    const sa = byN[sel] || [], cur = best(sa.filter(x => x.s === "ok")), sx = sa.filter(x => x === cur || x.s === "wait" || (x.s === "ok" && x.p.on) || (!cur && x.s === "no")).sort((x, y) => (y === cur) - (x === cur));
    if (!sx.length) { det.append(h("div", { class: "row hd" }, h("h2", {}, `${sel}번`), h("span", { class: "chip" }, "아직 로그인하지 않았어요"))); return; }
    const x = sx[0], p = x.p || {}, d = p.done || 0, now = p.step || 0;
    det.append(h("div", { class: "row hd" }, h("h2", {}, `${sel}번`), h("span", { class: "chip" + (x.s === "ok" && p.on ? " g" : "") }, x.s === "ok" ? (p.on ? "접속 중" : "나감") : x.s === "wait" ? "수락 대기" : "거절됨"), x.s === "ok" ? h("span", {}, `지금 ${now + 1}단계 · 마친 단계 ${Math.min(d, N)}/${N}`) : null, h("span", { class: "sp" }),
      ...sx.slice(0, 2).map(y => [y.s !== "ok" ? btn("수락", () => mark([y.u], "ok"), "pri") : btn("다음 단계 열기", () => write(() => set(R(`${base("push")}/${y.u}`), Math.min(N - 1, Math.max(psh[y.u] || 0, y.p.step || 0) + 1)))), y.s !== "no" ? btn(y.s === "ok" ? "내보내기" : "거절", () => { if (y.s === "wait" || confirm(`${sel}번을 내보낼까요?`)) mark([y.u], "no"); }) : null])),
      sx.length > 1 ? h("p", { class: "warnt" }, "같은 번호가 여러 기기에서 신청했어요") : "");
    if (x.s !== "ok") return;
    det.append(h("div", { class: "track" }, Array.from({ length: N }, (_, i) => h("span", { class: i < d ? "fin" : i === now ? "now" : "" }, (i < d ? "✓ " : i === now ? "▶ " : "") + stepName(i)))));
    const a = ans[x.u] || {}, ks = Object.keys(a).filter(k => a[k] && a[k].v !== "").sort((m, n) => (a[m].o || 0) - (a[n].o || 0));
    det.append(ks.length ? h("div", { class: "alist2" }, ks.map(k => h("div", {}, h("b", {}, a[k].l || k), h("span", {}, a[k].v)))) : h("p", { class: "empty sm" }, "아직 저장된 답이 없어요."));
  }
  function answers(ok) {
    const qs = {}; Object.values(ans).forEach(a => Object.entries(a || {}).forEach(([k, v]) => { if (!qs[k]) qs[k] = { l: v.l || k, o: v.o || 0 }; })); const ks = Object.keys(qs).sort((a, b) => qs[a].o - qs[b].o || (a < b ? -1 : 1));
    if (!ks.length) { stu.append(h("p", { class: "empty" }, "아직 답이 없어요.")); return; }
    q = Math.max(0, Math.min(q, ks.length - 1)); const k = ks[q], rows = ok.filter(x => ans[x.u] && ans[x.u][k] && ans[x.u][k].v).map(x => ({ n: x.n, v: ans[x.u][k].v })), PER = 10, pgs = Math.max(1, Math.ceil(rows.length / PER)); ap = Math.max(0, Math.min(ap, pgs - 1));
    const hide = ls.get("thide") === "1";
    stu.append(h("div", { class: "row aq" }, btn("◀ 이전 질문", () => { q--; ap = 0; draw(); }), h("b", {}, `${q + 1}/${ks.length} · ${qs[k].l}`), btn("다음 질문 ▶", () => { q++; ap = 0; draw(); })), h("div", { class: "alist" }, rows.slice(ap * PER, ap * PER + PER).map(r => h("div", {}, hide ? null : h("b", {}, r.n + "번"), h("span", {}, r.v)))), h("div", { class: "row aq" }, btn("◀", () => { ap--; draw(); }), h("span", {}, `${ap + 1}/${pgs}쪽 · ${rows.length}명`), btn("▶", () => { ap++; draw(); }), btn(hide ? "번호 보이기" : "번호 가리기", () => { ls.set("thide", hide ? "0" : "1"); draw(); })));
  }
  async function sync(force) {
    if (!bridge || !sid || syncing) return; const ss = sid, L = list().filter(x => x.s === "ok"), tm = x => Math.max(x.p.t || 0, ...Object.values(ans[x.u] || {}).map(v => v.t || 0)), need = L.filter(x => force || tm(x) > (syn[x.u] || 0)).slice(0, 60); if (!need.length) { if (force) toast("저장할 새 답이 없어요."); return; }
    syncing = true; const cols = {}; need.forEach(x => Object.entries(ans[x.u] || {}).forEach(([k, v]) => { cols[k] = [v.l || k, v.o || 0]; }));
    try {
      const f = t => t ? new Intl.DateTimeFormat("ko-KR", { timeZone: "Asia/Seoul", hour: "2-digit", minute: "2-digit", second: "2-digit", hourCycle: "h23" }).format(t) : "";
      const r = await post({ a: "sync", token: bridge, sheet: l.sheet, cols: Object.entries(cols).sort((a, b) => a[1][1] - b[1][1]).map(([k, v]) => [k, v[0]]), rows: need.map(x => ({ id: `${ss}-${c}-${x.u.slice(0, 10)}`, date: `${ss.slice(0, 4)}-${ss.slice(4, 6)}-${ss.slice(6, 8)}${ss.slice(8)}`, cls: c, n: x.n, step: (x.p.step || 0) + 1, done: x.p.done || 0, time: f(tm(x)), ans: Object.fromEntries(Object.entries(ans[x.u] || {}).map(([k, v]) => [k, v.v])) })) });
      if (!r.ok) throw new Error(r.error); await update(R(`sync/${key}/${ss}`), Object.fromEntries(need.map(x => [x.u, tm(x)]))); lastSync = `시트: ${f(Date.now())} 저장 ✓`; if (force) toast(`${need.length}명의 결과를 시트에 저장했어요.`);
    } catch (e) { lastSync = "시트: 저장하지 못함"; if (e.message === "auth") { toast("시트 연결을 다시 해 주세요.", true); } else if (force) toast("시트에 저장하지 못했어요. 잠시 뒤 자동으로 다시 해요.", true); }
    syncing = false; if (!dead) draw();
  }
  draw();
  return () => { dead = true; clearInterval(timer); subs.forEach(f => f()); sub.forEach(f => f()); bw.classList.remove("wide"); };
}

/* ---------- 시트 연결, QR ---------- */
function pair() {
  const pw = h("input", { type: "password", placeholder: "기록 시트 비밀번호", "aria-label": "기록 시트 비밀번호" }), err = h("p", { class: "err" }), d = h("dialog", {}, h("form", {}, h("h2", {}, "구글 시트 연결"), h("p", {}, "기록 시트의 메뉴 [수업 도구 → 교사 비밀번호 정하기]에서 정한 비밀번호를 한 번만 적어 주세요."), pw, err, h("div", { class: "row" }, h("button", { class: "pri", type: "submit" }, "연결"), btn("닫기", () => d.close()))));
  d.querySelector("form").onsubmit = async e => { e.preventDefault(); err.textContent = "연결하는 중…"; try { const b = new Uint8Array(32); crypto.getRandomValues(b); const t = [...b].map(x => x.toString(16).padStart(2, "0")).join(""), r = await post({ a: "pair", pw: pw.value, token: t }); if (!r.ok) { err.textContent = { wrong: "비밀번호가 맞지 않아요.", locked: "여러 번 틀려서 10분 동안 잠겼어요.", nopw: "시트에서 비밀번호를 먼저 정해 주세요." }[r.error] || "연결하지 못했어요."; return; } await set(R("cfg/bridge"), t); bridge = t; d.close(); toast("시트와 연결했어요."); if (crumb.textContent === "차시 선택") lessons(); } catch (x) { err.textContent = "서버에 연결하지 못했어요."; } };
  document.body.append(d); d.onclose = () => d.remove(); d.showModal();
}
function qrBox(l) { return h("div", { class: "qrb" }, h("img", { src: `qr/${l ? l.id : "home"}.svg`, alt: "학생 접속 QR코드" }), h("div", {}, h("h2", {}, l ? l.title : "학생 처음 화면"), h("p", { class: "url" }, (l ? new URL(l.url, "https://flonnehong.github.io").href : HOME).replace("https://", "")), h("p", {}, "카메라로 찍으면 로그인 화면이 열려요."))); }
function qr() { const d = h("dialog", {}, qrBox(null), h("div", { class: "row" }, btn("닫기", () => d.close(), "pri"))); document.body.append(d); d.onclose = () => d.remove(); d.showModal(); }
(async () => { try { await setPersistence(fb.auth, browserSessionPersistence); await fb.auth.authStateReady(); } catch (e) {} if (fb.auth.currentUser && !fb.auth.currentUser.isAnonymous) enter(); else login(); })();
