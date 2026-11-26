/* 차시 목록: 학생용·교사용이 함께 쓴다. sheet = 구글 시트 탭 이름 */
const B = location.hostname.endsWith("github.io") ? "https://flonnehong.github.io" : "";
const L = (id, unit, no, title, path) => ({ id, unit, no, title, sheet: `${id} ${title}`.slice(0, 60), url: B + path });
const C = id => `/science-class/lesson.html?l=${id}`;
export const UNITS = [
  { n: 5, t: "식물과 에너지", c: "#3ddc7a" }, { n: 6, t: "동물과 에너지", c: "#ff8f45" },
  { n: 7, t: "전기와 자기", c: "#ffc400" }, { n: 8, t: "별과 우주", c: "#a48dff" }, { n: 0, t: "수업 도구", c: "#5fd0f5" }
];
export const LESSONS = [
  L("u5-1", 5, "1", "광합성에 영향을 주는 요인", "/photosynthesis-factors/"),
  L("u6-0", 6, "도입", "어느 기관계일까?", C("u6-0")),
  L("u6-1", 6, "1", "소화 스티커 탐험", "/digestion-enzymes/"),
  L("u7-1", 7, "1", "마찰하면 생기는 전기", C("u7-1")),
  L("u7-2", 7, "2", "정전기 유도", "/electrostatic-induction/"),
  L("u7-3", 7, "3", "전하의 흐름, 전류", C("u7-3")),
  L("u7-4", 7, "4", "전압과 저항 탐구", C("u7-4")),
  L("u7-5", 7, "5", "옴의 법칙과 물질의 저항", C("u7-5")),
  L("u7-6", 7, "6", "저항의 직렬연결과 병렬연결", C("u7-6")),
  L("u7-7", 7, "7", "전기 에너지와 소비 전력", C("u7-7")),
  L("u7-8", 7, "8", "전기 에너지의 효율적 사용", C("u7-8")),
  L("u7-9", 7, "9", "코일 주위의 자기장", C("u7-9")),
  L("u7-10", 7, "10", "코일이 받는 힘", C("u7-10")),
  L("u7-11", 7, "11", "전동기와 활용", C("u7-11")),
  { ...L("u7-12", 7, "종합", "전류의 자기 작용", "/magnetic-effect-of-current/"), hidden: true }, // 목록에서 뺌 (주소로 열면 그대로 동작)
  L("u8-1", 8, "1", "시차와 연주 시차", "/stellar-parallax/"),
  L("u8-2", 8, "2", "빛의 밝기와 거리", "/light-brightness-distance/"),
  L("diary", 0, "일기", "과학수업일기", C("diary"))
];
export const lessonOf = id => LESSONS.find(l => l.id === id);
export const HOME = B + "/science-class/";
