import type { TextType } from '../types';

// ============================================================================
//  تصنيفٌ استدلاليٌّ خفيف لنوع النص (عند اختيار «تلقائي»).
//  ليس نموذجاً — مجرّد كلماتٍ مفتاحيةٍ مرجّحة، شفّافٌ وقابلٌ للتعديل.
// ============================================================================

const SIGNALS: Record<Exclude<TextType, 'auto' | 'general'>, string[]> = {
  academic: [
    'الدراسة', 'البحث', 'الفرضية', 'المنهجية', 'العيّنة', 'الأدبيات',
    'المرجع', 'الاقتباس', 'النتائج', 'الأطروحة', 'المتغيّر', 'abstract',
    'hypothesis', 'methodology', 'literature',
  ],
  legal: [
    'المادة', 'القانون', 'العقد', 'الطرف', 'الملزم', 'الدعوى', 'المحكمة',
    'اللائحة', 'المدّعي', 'المدّعى', 'بموجب', 'الفقرة', 'contract',
    'clause', 'plaintiff', 'statute',
  ],
  scientific: [
    'التجربة', 'القياس', 'المعادلة', 'الوحدة', 'العيّنة', 'الخوارزمية',
    'البروتوكول', 'الجزيء', 'التفاعل', 'measurement', 'equation',
    'algorithm', 'protocol',
  ],
  commercial: [
    'المنتج', 'العرض', 'الخصم', 'اشترِ', 'العميل', 'العلامة', 'التسويق',
    'السعر', 'الحملة', 'buy', 'offer', 'discount', 'brand', 'sale',
  ],
  professional: [
    'الاجتماع', 'التقرير', 'المقترح', 'الفريق', 'الموعد', 'المتابعة',
    'العميل', 'الإدارة', 'meeting', 'report', 'proposal', 'deadline',
  ],
};

export function classifyText(text: string): Exclude<TextType, 'auto'> {
  const lower = text.toLowerCase();
  let best: Exclude<TextType, 'auto'> = 'general';
  let bestScore = 1; // عتبة صغيرة قبل الخروج عن «عام»

  (Object.keys(SIGNALS) as Array<keyof typeof SIGNALS>).forEach((type) => {
    let score = 0;
    for (const kw of SIGNALS[type]) {
      if (lower.includes(kw.toLowerCase())) score++;
    }
    if (score > bestScore) {
      bestScore = score;
      best = type;
    }
  });
  return best;
}
