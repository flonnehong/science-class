/* 통합 교사용 페이지: 차시 선택 → 반 → 현황 한눈에, 자동 진행/교사 컨트롤, 시트 기록 */
import { connect, ls, day, h, clock, fontControl, onAuthStateChanged, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, setPersistence, browserSessionPersistence, ref, get, set, update, remove, onValue } from "./fb.js";
import { UNITS, LESSONS, lessonOf, HOME } from "./catalog.js";
const ID = "teacher@science-class.example.com", BRIDGE = "https://script.google.com/macros/s/AKfycbyhtaCm2c_xI7PT_7rsvYYks-WDyg6GFWry774lU-Wkgw5XJGoSRoX5CqwYZ-2jYbMwYw/exec";
const STEPS = { "u5-1": 6, "u6-0": 5, "u6-1": 7, "u7-2": 6, "u7-12": 6, "u8-1": 6, "u8-2": 6, diary: 3 }, stepsOf = id => STEPS[id] || 5;
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
  clear(); crumb.textContent = ""; const pw = h("input", { type: "password", autocomplete: "current-password", placeholder: "교사 비밀번호 (8자 이상)", "aria-label": "교사 비밀번호" }), code = h("input", { type: "text", placeholder: "등록 코드", "aria-label": "등록 코드", autocomplete: "off" }), err = h("p", { class: "err", role: "alert" });
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
async function enter() { try { if (!(await get(R("cfg/admins/" + fb.auth.currentUser.uid))).exists()) { await signOut(fb.auth); login(true); return; } bridge = (await get(R("cfg/bridge"))).val() || ""; } catch (e) { login(); return; } lessons(0); }

/* ---------- 차시 선택 ---------- */
let lp = 0;
function lessons(page) {
  clear(); lp = page; crumb.textContent = "차시 선택"; const groups = [[5, 6], [7], [8, 0]], g = groups[page];
  view(h("div", { class: "pgt" }, btn("◀", () => lessons(page - 1), page ? "" : "off"), h("div", { class: "tabs" }, groups.map((x, i) => btn(["5·6단원", "7단원", "8단원·도구"][i], () => lessons(i), i === page ? "on" : ""))), btn("▶", () => lessons(page + 1), page < 2 ? "" : "off"), h("span", { class: "sp" }), btn("QR·주소", qr), btn(bridge ? "시트 연결됨 ✓" : "시트 연결하기", pair, bridge ? "" : "warn"), btn("로그아웃", async () => { clear(); await signOut(fb.auth); login(); })),
    h("div", { class: "units" }, g.map(n => { const u = UNITS.find(x => x.n === n), ls_ = LESSONS.filter(l => l.unit === n); return h("section", { style: `--c:${u.c}` }, h("h2", {}, n ? `${n}단원 ${u.t}` : u.t), h("div", { class: "lgrid" + (ls_.length > 4 ? " many" : "") }, ls_.map(l => btn([h("small", {}, /^\d+$/.test(l.no) ? l.no + "차시" : l.no), h("b", {}, l.title)], () => classes(l))))); })));
  $.querySelectorAll(".off").forEach(b => { b.disabled = true; });
}
function classes(l) {
  clear(); crumb.textContent = l.title; const st = {}, grid = h("div", { class: "cgrid" });
  const draw = () => { grid.textContent = ""; for (let c = 1; c <= 7; c++) { const v = st[c], o = v && v.sid && v.sid.slice(0, 8) === day(); grid.append(btn([h("b", {}, c + "반"), h("span", {}, o ? (v.open ? "🟢 수업 중" : "⚪ 오늘 마침") : "아직 열지 않음")], () => board(l, c), o && v.open ? "open" : "")); } };
  view(h("div", { class: "pgt" }, btn("◀ 차시 선택", () => lessons(l.unit === 7 ? 1 : l.unit === 8 || !l.unit ? 2 : 0)), h("h1", {}, l.title), h("span", { class: "sp" }), h("a", { class: "btn", href: l.url + (l.url.includes("?") ? "&" : "?") + "demo=1", target: "_blank", rel: "noopener" }, "학생 화면 미리 보기")), grid);
  for (let c = 1; c <= 7; c++) on(`live/${l.id}_${c}`, v => { st[c] = v; draw(); }); draw();
}

/* ---------- 현황판 ---------- */
function board(l, c) {
  clear(); const key = `${l.id}_${c}`, N = stepsOf(l.id); crumb.textContent = `${l.title} · ${c}반`;
  let live = null, sid = null, req = {}, st = {}, prog = {}, psh = {}, ans = {}, syn = {}, tab = "now", sel = null, sub = [], ap = 0, q = 0, dead = false, lastSync = "", syncing = false;
  const head = h("div", { class: "pgt" }), body = h("div", { class: "bd" }); view(head, body);
  const write = async (f) => { try { await f(); } catch (e) { toast("저장하지 못했어요. 다시 눌러 주세요.", true); } };
  const base = p => `${p}/${key}/${sid}`;
  const newSid = old => { const d = day(); if (!old || old.slice(0, 8) !== d) return d; const x = old[8]; return d + (x ? String.fromCharCode(Math.min(122, x.charCodeAt(0) + 1)) : "b"); };
  const isToday = () => live && live.sid && live.sid.slice(0, 8) === day();
  on(`live/${key}`, v => {
    live = v; const s = isToday() ? v.sid : null;
    if (s !== sid) { sid = s; sub.forEach(f => f()); sub = []; req = {}; st = {}; prog = {}; psh = {}; ans = {}; syn = {}; sel = null; if (sid) for (const [p, f] of [["req", v => { req = v; auto(); }], ["st", v => { st = v; }], ["prog", v => { prog = v; }], ["push", v => { psh = v; }], ["ans", v => { ans = v; }], ["sync", v => { syn = v; }]]) sub.push(onValue(R(base(p)), x => { f(x.val() || {}); draw(); }, () => {})); }
    draw();
  });
  const timer = setInterval(() => sync(false), 15000); offs.push(() => { dead = true; clearInterval(timer); sub.forEach(f => f()); });
  const list = () => Object.entries(req).map(([u, r]) => ({ u, n: r.n, s: st[u] || "wait", p: prog[u] || {}, t: r.t })).sort((a, b) => a.n - b.n);
  function auto() { if (!live || !live.auto || !live.open) return; const used = new Set(list().filter(x => x.s === "ok").map(x => x.n)), up = {}; list().filter(x => x.s === "wait").forEach(x => { if (!used.has(x.n)) { used.add(x.n); up[x.u] = "ok"; } }); if (Object.keys(up).length) write(() => update(R(base("st")), up)); }
  const mark = (us, v) => write(() => update(R(base("st")), Object.fromEntries(us.map(u => [u, v]))));
  const setLive = o => write(() => update(R("live/" + key), Object.assign({ t: Date.now() }, o)));
  async function open() { if (isToday()) { await setLive({ open: true }); return; } await write(() => set(R("live/" + key), { sid: newSid(null), open: true, mode: ls.get("tmode") || "auto", step: 0, auto: ls.get("tauto") === "1", t: Date.now() })); }
  async function fresh() { if (!confirm(`${c}반의 접속 명단을 비우고 처음부터 새로 시작할까요? 지금까지의 답은 남아 있어요.`)) return; await sync(true); await write(() => set(R("live/" + key), { sid: newSid(sid), open: true, mode: live.mode, step: 0, auto: !!live.auto, t: Date.now() })); }
  function draw() {
    if (dead) return; const on_ = isToday(), opened = on_ && live.open, L = list(), ok = L.filter(x => x.s === "ok"), wt = L.filter(x => x.s === "wait"), mode = on_ ? live.mode : ls.get("tmode") || "auto";
    head.textContent = ""; head.append(btn("◀ 반 선택", () => classes(l)), h("h1", {}, `${c}반`), h("span", { class: "chip" + (opened ? " g" : "") }, opened ? "수업 중" : on_ ? "마침" : "열기 전"), h("div", { class: "tabs" }, [["now", "현황"], ["ans", "답 보기"], ["qr", "QR"]].map(([k, t]) => btn(t, () => { tab = k; ap = 0; draw(); }, tab === k ? "on" : ""))), h("span", { class: "sp" }),
      opened ? btn("수업 끝내기", () => { if (confirm("수업을 끝낼까요? 답은 시트에 남아요.")) { setLive({ open: false }); sync(true); } }) : btn(on_ ? "다시 열기" : "수업 열기", open, "pri"), on_ ? btn("새로 시작", fresh) : null);
    if (document.activeElement && body.contains(document.activeElement) && /^(INPUT|TEXTAREA)$/.test(document.activeElement.tagName)) return;
    body.textContent = "";
    if (tab === "qr") { body.append(qrBox(l)); return; }
    if (tab === "ans") { answers(ok); return; }
    const seg = (cur, arr, f) => h("div", { class: "seg" }, arr.map(([v, t]) => btn(t, () => f(v), v === cur ? "on" : "")));
    const ctl = h("div", { class: "ctl" },
      h("div", { class: "row" }, h("b", {}, "진행"), seg(mode, [["auto", "자동 진행"], ["teacher", "교사 컨트롤"]], v => { ls.set("tmode", v); if (on_) { const o = { mode: v }; if (v === "teacher" && live.mode !== "teacher" && ok.length) { const cnt = {}; ok.forEach(x => { const s = x.p.step || 0; cnt[s] = (cnt[s] || 0) + 1; }); o.step = +Object.keys(cnt).sort((a, b) => cnt[b] - cnt[a] || a - b)[0]; } setLive(o); } else draw(); }),
        h("b", {}, "입장"), seg(on_ ? !!live.auto : ls.get("tauto") === "1", [[false, "수락 후"], [true, "자동 수락"]], v => { ls.set("tauto", v ? "1" : "0"); if (on_) setLive({ auto: v }).then(auto); else draw(); })),
      h("div", { class: "row st" }, btn("◀", () => setLive({ step: Math.max(0, live.step - 1) }), "nx"), Array.from({ length: N }, (_, i) => { const here = ok.filter(x => (x.p.step || 0) === i).length, fin = ok.filter(x => (x.p.done || 0) > i).length; return btn([h("b", {}, i + 1), h("small", {}, `지금 ${here} · 마침 ${fin}`)], () => setLive({ step: i }), "sb" + (opened && mode === "teacher" && live.step === i ? " on" : "")); }), btn("모두 다음 ▶", () => setLive({ step: Math.min(N - 1, live.step + 1) }), "nx pri")));
    ctl.querySelectorAll(".st button").forEach(b => { b.disabled = !opened || mode !== "teacher"; });
    const byN = {}; L.forEach(x => (byN[x.n] = byN[x.n] || []).push(x));
    const grid = h("div", { class: "grid" }, Array.from({ length: 30 }, (_, i) => { const n = i + 1, a = byN[n] || [], x = a.find(y => y.s === "ok") || a.find(y => y.s === "wait") || a[0], dup = a.filter(y => y.s !== "no").length > 1; const cl = !x ? "none" : x.s === "wait" ? "wait" : x.s === "no" ? "no" : x.p.on ? "on" : "off"; return btn([h("b", {}, n), h("span", {}, !x ? "" : x.s === "wait" ? "수락 대기" : x.s === "no" ? "거절됨" : (x.p.done || 0) >= N ? "모두 마침" : `${(x.p.step || 0) + 1}단계`), x && x.s === "ok" ? h("i", { class: "pb" }, h("u", { style: `width:${Math.min(100, (x.p.done || 0) / N * 100)}%` })) : null, dup ? h("em", {}, "⚠") : null], () => { sel = n; draw(); }, "s " + cl + (sel === n ? " sel" : "")); }));
    const sx = sel ? byN[sel] || [] : [];
    const side = h("div", { class: "side" }, sel && sx.length ? [h("b", {}, `${sel}번`), sx.length > 1 ? h("span", { class: "warnt" }, "같은 번호가 여러 기기에서 신청했어요") : null, sx.slice(0, 3).map(x => h("div", { class: "row" }, h("span", {}, x.s === "ok" ? (x.p.on ? "접속 중" : "나감") : x.s === "wait" ? "대기" : "거절"), x.s !== "ok" ? btn("수락", () => mark([x.u], "ok"), "pri") : btn("다음 단계 열기", () => write(() => set(R(`${base("push")}/${x.u}`), Math.min(N - 1, Math.max(psh[x.u] || 0, x.p.step || 0) + 1)))), x.s !== "no" ? btn(x.s === "ok" ? "내보내기" : "거절", () => { if (x.s === "wait" || confirm(`${sel}번을 내보낼까요?`)) mark([x.u], "no"); }) : null))] : h("span", {}, sel ? `${sel}번은 아직 로그인하지 않았어요.` : "번호를 누르면 수락·내보내기를 할 수 있어요."),
      h("span", { class: "sp" }), wt.length ? btn(`대기 ${wt.length}명 모두 수락`, () => { const used = new Set(ok.map(x => x.n)); const go = wt.filter(x => { if (used.has(x.n)) return false; used.add(x.n); return true; }); mark(go.map(x => x.u), "ok"); if (go.length < wt.length) toast("같은 번호로 겹친 신청은 빼고 수락했어요."); }, "pri") : null);
    const sum = h("div", { class: "sum" }, h("span", { class: "k on" }, `접속 ${ok.filter(x => x.p.on).length}`), h("span", { class: "k off" }, `나감 ${ok.filter(x => !x.p.on).length}`), h("span", { class: "k wait" }, `대기 ${wt.length}`), h("span", { class: "k none" }, `미로그인 ${30 - new Set(L.filter(x => x.s !== "no").map(x => x.n)).size}`), h("span", { class: "sp" }), h("span", { class: "sy" }, bridge ? lastSync || "시트: 자동 저장" : "시트: 연결 안 됨"), bridge ? btn("지금 시트에 저장", () => sync(true)) : btn("시트 연결하기", pair, "warn"));
    body.append(ctl, sum, grid, side);
  }
  function answers(ok) {
    const qs = {}; Object.values(ans).forEach(a => Object.entries(a || {}).forEach(([k, v]) => { if (!qs[k]) qs[k] = { l: v.l || k, o: v.o || 0 }; })); const ks = Object.keys(qs).sort((a, b) => qs[a].o - qs[b].o || (a < b ? -1 : 1));
    if (!ks.length) { body.append(h("p", { class: "empty" }, "아직 답이 없어요.")); return; }
    q = Math.max(0, Math.min(q, ks.length - 1)); const k = ks[q], rows = ok.filter(x => ans[x.u] && ans[x.u][k] && ans[x.u][k].v).map(x => ({ n: x.n, v: ans[x.u][k].v })), PER = 10, pgs = Math.max(1, Math.ceil(rows.length / PER)); ap = Math.max(0, Math.min(ap, pgs - 1));
    const hide = ls.get("thide") === "1";
    body.append(h("div", { class: "row aq" }, btn("◀ 이전 질문", () => { q--; ap = 0; draw(); }), h("b", {}, `${q + 1}/${ks.length} · ${qs[k].l}`), btn("다음 질문 ▶", () => { q++; ap = 0; draw(); })), h("div", { class: "alist" }, rows.slice(ap * PER, ap * PER + PER).map(r => h("div", {}, hide ? null : h("b", {}, r.n + "번"), h("span", {}, r.v)))), h("div", { class: "row aq" }, btn("◀", () => { ap--; draw(); }), h("span", {}, `${ap + 1}/${pgs}쪽 · ${rows.length}명`), btn("▶", () => { ap++; draw(); }), btn(hide ? "번호 보이기" : "번호 가리기", () => { ls.set("thide", hide ? "0" : "1"); draw(); })));
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
}

/* ---------- 시트 연결, QR ---------- */
function pair() {
  const pw = h("input", { type: "password", placeholder: "기록 시트 비밀번호", "aria-label": "기록 시트 비밀번호" }), err = h("p", { class: "err" }), d = h("dialog", {}, h("form", {}, h("h2", {}, "구글 시트 연결"), h("p", {}, "기록 시트의 메뉴 [수업 도구 → 교사 비밀번호 정하기]에서 정한 비밀번호를 한 번만 적어 주세요."), pw, err, h("div", { class: "row" }, h("button", { class: "pri", type: "submit" }, "연결"), btn("닫기", () => d.close()))));
  d.querySelector("form").onsubmit = async e => { e.preventDefault(); err.textContent = "연결하는 중…"; try { const b = new Uint8Array(32); crypto.getRandomValues(b); const t = [...b].map(x => x.toString(16).padStart(2, "0")).join(""), r = await post({ a: "pair", pw: pw.value, token: t }); if (!r.ok) { err.textContent = { wrong: "비밀번호가 맞지 않아요.", locked: "여러 번 틀려서 10분 동안 잠겼어요.", nopw: "시트에서 비밀번호를 먼저 정해 주세요." }[r.error] || "연결하지 못했어요."; return; } await set(R("cfg/bridge"), t); bridge = t; d.close(); toast("시트와 연결했어요."); if (crumb.textContent === "차시 선택") lessons(lp); } catch (x) { err.textContent = "서버에 연결하지 못했어요."; } };
  document.body.append(d); d.onclose = () => d.remove(); d.showModal();
}
function qrBox(l) { return h("div", { class: "qrb" }, h("img", { src: `qr/${l ? l.id : "home"}.svg`, alt: "학생 접속 QR코드" }), h("div", {}, h("h2", {}, l ? l.title : "학생 처음 화면"), h("p", { class: "url" }, (l ? new URL(l.url, "https://flonnehong.github.io").href : HOME).replace("https://", "")), h("p", {}, "카메라로 찍으면 로그인 화면이 열려요."))); }
function qr() { const d = h("dialog", {}, qrBox(null), h("div", { class: "row" }, btn("닫기", () => d.close(), "pri"))); document.body.append(d); d.onclose = () => d.remove(); d.showModal(); }
(async () => { try { await setPersistence(fb.auth, browserSessionPersistence); await fb.auth.authStateReady(); } catch (e) {} if (fb.auth.currentUser && !fb.auth.currentUser.isAnonymous) enter(); else login(); })();
