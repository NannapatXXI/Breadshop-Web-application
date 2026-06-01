// [Claude] Boyer-Moore String Search Algorithm
// ใช้ 2 heuristics: Bad Character + Good Suffix
// - Bad Character: เมื่อเจอตัวอักษรที่ไม่ตรง ให้เลื่อน pattern ไปจนตัวอักษรนั้นตรงกับตำแหน่งสุดท้ายใน pattern
// - Good Suffix:   เมื่อ suffix ที่ match แล้วไม่ต่อเนื่อง ให้ใช้ข้อมูล suffix ที่ซ้ำกันใน pattern มา shift

// ─── Bad Character Table ────────────────────────────────
// เก็บ index สุดท้ายของแต่ละตัวอักษรใน pattern
function buildBadCharTable(pattern) {
  const table = {};
  for (let i = 0; i < pattern.length; i++) {
    table[pattern[i]] = i;
  }
  return table;
}

// ─── Good Suffix Table ──────────────────────────────────
// preprocess pattern เพื่อสร้าง shift table จาก suffix ที่ match
function buildGoodSuffixTable(pattern) {
  const m = pattern.length;
  const shift = new Array(m + 1).fill(0);
  const border = new Array(m + 1).fill(0);

  // Phase 1: หา border ของแต่ละ suffix (จากขวาไปซ้าย)
  let i = m;
  let j = m + 1;
  border[i] = j;

  while (i > 0) {
    while (j <= m && pattern[i - 1] !== pattern[j - 1]) {
      if (shift[j] === 0) shift[j] = j - i;
      j = border[j];
    }
    border[--i] = --j;
  }

  // Phase 2: fill ค่าที่เหลือด้วย border ของทั้ง pattern
  j = border[0];
  for (i = 0; i <= m; i++) {
    if (shift[i] === 0) shift[i] = j;
    if (i === j) j = border[j];
  }

  return shift;
}

// ─── Boyer-Moore Contains ───────────────────────────────
// คืนค่า true ถ้า text มี pattern อยู่ (case-insensitive)
export function boyerMooreContains(text, pattern) {
  if (!pattern || pattern.length === 0) return true; // search ว่าง = แสดงทั้งหมด
  if (!text) return false;

  // normalize เป็น lowercase เพื่อ case-insensitive
  const t = text.toLowerCase();
  const p = pattern.toLowerCase();

  const n = t.length;
  const m = p.length;

  if (n < m) return false;

  const badChar  = buildBadCharTable(p);
  const goodSuffix = buildGoodSuffixTable(p);

  let s = 0; // offset ของ pattern บน text

  while (s <= n - m) {
    let j = m - 1;

    // เปรียบเทียบจากขวาไปซ้าย
    while (j >= 0 && p[j] === t[s + j]) {
      j--;
    }

    if (j < 0) return true; // พบ pattern

    // คำนวณ shift จากทั้งสอง heuristic แล้วเลือกค่าที่มากกว่า
    const bcShift = j - (badChar[t[s + j]] !== undefined ? badChar[t[s + j]] : -1);
    const gsShift = goodSuffix[j + 1];

    s += Math.max(bcShift, gsShift);
  }

  return false; // ไม่พบ pattern
}
