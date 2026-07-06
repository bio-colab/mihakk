import type { Experiment, AttackId } from '../types';
import { ATTACK_MAP } from './attacks';

// ============================================================================
//  بيانات مرجعية من الأدبيات — تمثيلٌ عدديٌّ لمصفوفة المتانة (الفصل 8.8).
//  الغرض: جعل الليدربورد ذا معنىً منذ اللحظة الأولى، وربطه بالبحث مباشرةً.
//  هذه ليست تجارب المستخدم؛ تُوسَم source='literature' وتُميَّز بصرياً،
//  ويمكن إخفاؤها من الإعدادات.
//
//  القراءة: كل خلية = «نسبة احتفاظ» تقديرية (retention) للكاشف بعد الهجوم،
//  مشتقّة من توصيف البحث النوعي:
//    ينهار        ≈ 0.15
//    ينهار (~25٪) ≈ 0.25
//    ينهار (100٪) ≈ 0.05
//    يضعف         ≈ 0.55
//    يقاوم / يصمد ≈ 0.85
//  نُحوّلها إلى scoreBefore=90 و scoreAfter=90*retention لتتوافق مع محرك الحساب.
// ============================================================================

interface PriorCell {
  detectorId: string;
  attack: AttackId;
  retention: number;
}

// مشتقّة حرفياً من جدول 8.8 + النصوص المحيطة به.
const CELLS: PriorCell[] = [
  // إعادة صياغة واحدة
  { detectorId: 'zerogpt', attack: 'paraphrase', retention: 0.15 },
  { detectorId: 'gltr', attack: 'paraphrase', retention: 0.15 },
  { detectorId: 'gptzero', attack: 'paraphrase', retention: 0.2 },
  { detectorId: 'openai_roberta', attack: 'paraphrase', retention: 0.2 },
  { detectorId: 'ghostbuster', attack: 'paraphrase', retention: 0.2 },
  { detectorId: 'binoculars', attack: 'paraphrase', retention: 0.35 },
  { detectorId: 'fast_detectgpt', attack: 'paraphrase', retention: 0.35 },
  { detectorId: 'radar', attack: 'paraphrase', retention: 0.8 }, // يصمد نسبياً

  // إعادة صياغة عودية — انهيارٌ شامل
  { detectorId: 'zerogpt', attack: 'recursive_paraphrase', retention: 0.1 },
  { detectorId: 'gptzero', attack: 'recursive_paraphrase', retention: 0.12 },
  { detectorId: 'binoculars', attack: 'recursive_paraphrase', retention: 0.18 },
  { detectorId: 'fast_detectgpt', attack: 'recursive_paraphrase', retention: 0.18 },
  { detectorId: 'radar', attack: 'recursive_paraphrase', retention: 0.3 },
  { detectorId: 'turnitin', attack: 'recursive_paraphrase', retention: 0.25 },

  // أنسنة (الأثر شبيهٌ بإعادة الصياغة مع ميلٍ لكسر المقاييس الإحصائية)
  { detectorId: 'zerogpt', attack: 'humanize', retention: 0.18 },
  { detectorId: 'gptzero', attack: 'humanize', retention: 0.25 },
  { detectorId: 'turnitin', attack: 'humanize', retention: 0.45 },
  { detectorId: 'gltr', attack: 'humanize', retention: 0.2 },
  { detectorId: 'pangram', attack: 'humanize', retention: 0.65 }, // مقاومة أنسنة
  { detectorId: 'radar', attack: 'humanize', retention: 0.7 },

  // متجانسات/محارف خفيّة — ~100٪ تهرّب ضد الإحصائي والمُصنِّفات
  { detectorId: 'zerogpt', attack: 'homoglyph', retention: 0.05 },
  { detectorId: 'gltr', attack: 'homoglyph', retention: 0.05 },
  { detectorId: 'binoculars', attack: 'homoglyph', retention: 0.08 },
  { detectorId: 'gptzero', attack: 'homoglyph', retention: 0.1 },
  { detectorId: 'radar', attack: 'homoglyph', retention: 0.1 },
  { detectorId: 'turnitin', attack: 'homoglyph', retention: 0.15 },
  { detectorId: 'openai_roberta', attack: 'homoglyph', retention: 0.08 },

  { detectorId: 'zerogpt', attack: 'zero_width', retention: 0.08 },
  { detectorId: 'gptzero', attack: 'zero_width', retention: 0.12 },
  { detectorId: 'binoculars', attack: 'zero_width', retention: 0.1 },
  { detectorId: 'turnitin', attack: 'zero_width', retention: 0.18 },

  // ترجمة عكسية — تُضعف أغلب الإشارات
  { detectorId: 'gptzero', attack: 'back_translate', retention: 0.3 },
  { detectorId: 'binoculars', attack: 'back_translate', retention: 0.4 },
  { detectorId: 'radar', attack: 'back_translate', retention: 0.5 },
  { detectorId: 'turnitin', attack: 'back_translate', retention: 0.4 },
];

export function buildLiteraturePriors(): Experiment[] {
  return CELLS.map((c, i) => {
    const scoreBefore = 90;
    const scoreAfter = Math.round(90 * c.retention);
    return {
      id: `lit-${i}`,
      createdAt: 0,
      textType: 'academic',
      resolvedType: 'academic',
      attack: c.attack,
      attackFamily: ATTACK_MAP[c.attack].family,
      engineProvider: 'none',
      engineModel: 'literature',
      originalText: '',
      transformedText: '',
      detectors: [{ detectorId: c.detectorId, scoreBefore, scoreAfter }],
      source: 'literature',
      note: 'مرجعٌ من الفصل 8.8',
    } satisfies Experiment;
  });
}
