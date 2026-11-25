/* 파이어베이스 연결과 공통 도구 (학생용·교사용) */
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-app.js";
import { getAuth, onAuthStateChanged, signInAnonymously, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, setPersistence, browserLocalPersistence, browserSessionPersistence } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-auth.js";
import { getDatabase, ref, get, set, update, remove, onValue, onDisconnect, serverTimestamp, goOffline } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-database.js";
export { onAuthStateChanged, signInAnonymously, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, setPersistence, browserLocalPersistence, browserSessionPersistence, ref, get, set, update, remove, onValue, onDisconnect, serverTimestamp, goOffline };
/* 웹 앱 설정값은 공개되어도 되는 값이다. 접근 제한은 데이터베이스 보안 규칙이 맡는다. */
const conf = { apiKey: "AIzaSyDb69EgTBkiKZcu78kB0PLHxHJcZsbfXEc", authDomain: "science-9b9c8.firebaseapp.com", projectId: "science-9b9c8", appId: "1:695481409019:web:494354c965585d29cd3f5e", databaseURL: "https://science-9b9c8-default-rtdb.asia-southeast1.firebasedatabase.app" };
export function connect(name) { const app = initializeApp(conf, name); return { auth: getAuth(app), db: getDatabase(app) }; }
export const ls = {
  get(k) { try { return localStorage.getItem("sc-" + k); } catch (e) { return null; } },
  set(k, v) { try { localStorage.setItem("sc-" + k, v); } catch (e) {} },
  del(k) { try { localStorage.removeItem("sc-" + k); } catch (e) {} }
};
export const day = () => new Intl.DateTimeFormat("sv-SE", { timeZone: "Asia/Seoul" }).format(new Date()).replace(/-/g, "");
export function h(tag, props, ...kids) {
  const e = document.createElement(tag);
  for (const [k, v] of Object.entries(props || {})) { if (v === undefined || v === null || v === false) continue; if (k === "class") e.className = v; else if (k === "html") e.innerHTML = v; else if (k.startsWith("on")) e[k] = v; else if (k === "style") e.style.cssText = v; else e.setAttribute(k, v === true ? "" : v); }
  kids.flat(Infinity).forEach(c => { if (c !== null && c !== undefined && c !== false) e.append(c); }); return e;
}
export function clock(el) { const f = new Intl.DateTimeFormat("ko-KR", { timeZone: "Asia/Seoul", hour: "2-digit", minute: "2-digit", second: "2-digit", hourCycle: "h23" }); const t = () => { el.textContent = f.format(new Date()); }; t(); setInterval(t, 1000); return el; }
export const SIZES = [0.8, 0.9, 1, 1.15, 1.3, 1.5, 1.75];
export function fontControl(onChange, key = "font") {
  let i = SIZES.indexOf(+ls.get(key)); if (i < 0) i = 2;
  const lab = h("span", { class: "sc-fs" }), go = d => { i = Math.max(0, Math.min(SIZES.length - 1, i + d)); ls.set(key, SIZES[i]); show(); onChange(SIZES[i]); };
  const a = h("button", { type: "button", "aria-label": "글자 작게", onclick: () => go(-1) }, "가−"), b = h("button", { type: "button", "aria-label": "글자 크게", onclick: () => go(1) }, "가+");
  function show() { lab.textContent = Math.round(SIZES[i] * 100) + "%"; a.disabled = i === 0; b.disabled = i === SIZES.length - 1; }
  show(); return { el: h("div", { class: "sc-font", role: "group", "aria-label": "글자 크기" }, a, lab, b), get value() { return SIZES[i]; } };
}
