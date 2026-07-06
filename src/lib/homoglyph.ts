// ============================================================================
//  هجمات التشويش الحتمية (deterministic) — منفّذة فعلياً بلا حاجة لأي نموذج.
//  مبنية على SilverSpeak (الفصل 8.3): استبدال محارف بمتجانساتٍ بصرية،
//  وحقن محارف صفرية العرض لكسر التقطيع (Tokenization).
// ============================================================================

// خريطة متجانساتٍ لاتيني ↔ سيريلي/يوناني (تبدو مطابقةً بصرياً).
const LATIN_TO_CONFUSABLE: Record<string, string> = {
  a: 'а', // Cyrillic a (U+0430)
  c: 'с', // Cyrillic es
  e: 'е', // Cyrillic ie
  o: 'о', // Cyrillic o
  p: 'р', // Cyrillic er
  x: 'х', // Cyrillic ha
  y: 'у', // Cyrillic u
  A: 'А',
  B: 'В',
  C: 'С',
  E: 'Е',
  H: 'Н',
  K: 'К',
  M: 'М',
  O: 'О',
  P: 'Р',
  T: 'Т',
  X: 'Х',
  Y: 'У',
};

// أرقام عربية-هندية تبدو قريبةً في بعض الخطوط (اختياري خفيف).
const ZERO_WIDTH = ['\u200b', '\u200c', '\u200d']; // ZWSP, ZWNJ, ZWJ

/**
 * هجوم المتجانسات البصرية: يستبدل نسبةً من المحارف اللاتينية بمتجانساتها.
 * يعمل على الأحرف اللاتينية داخل النص العربي أيضاً (مصطلحات إنجليزية).
 */
export function applyHomoglyph(text: string, rate = 0.6): string {
  let seed = 1337;
  const rand = () => {
    seed = (seed * 1103515245 + 12345) & 0x7fffffff;
    return seed / 0x7fffffff;
  };
  return Array.from(text)
    .map((ch) => {
      const sub = LATIN_TO_CONFUSABLE[ch];
      if (sub && rand() < rate) return sub;
      return ch;
    })
    .join('');
}

/**
 * هجوم المحارف الخفيّة: يحقن محرفاً صفري العرض بعد كل عددٍ من الأحرف.
 * غير مرئيٍّ للقارئ لكنه يكسر التقطيع لدى الكاشف.
 */
export function applyZeroWidth(text: string, every = 4): string {
  let seed = 4242;
  const rand = () => {
    seed = (seed * 1103515245 + 12345) & 0x7fffffff;
    return seed / 0x7fffffff;
  };
  const out: string[] = [];
  const chars = Array.from(text);
  chars.forEach((ch, i) => {
    out.push(ch);
    // لا نحقن داخل المسافات لتقليل خطر إفساد المحاذاة
    if (ch !== ' ' && ch !== '\n' && i % every === every - 1) {
      out.push(ZERO_WIDTH[Math.floor(rand() * ZERO_WIDTH.length)]);
    }
  });
  return out.join('');
}

/** إحصاءات موجزة عن التحويل (لعرضها للمستخدم). */
export function perturbationStats(original: string, transformed: string) {
  const zwCount = (transformed.match(/[\u200b\u200c\u200d]/g) || []).length;
  let swapped = 0;
  const a = Array.from(original);
  const b = Array.from(transformed.replace(/[\u200b\u200c\u200d]/g, ''));
  const len = Math.min(a.length, b.length);
  for (let i = 0; i < len; i++) if (a[i] !== b[i]) swapped++;
  return { zeroWidthInjected: zwCount, charsSwapped: swapped };
}
