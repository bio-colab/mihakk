import type { DetectorDef, DetectorFamily } from '../types';

// ============================================================================
//  قائمة الفواحص — مبنية على الفصلين الثالث والسابع من البحث.
//  كل كاشف موسومٌ بعائلته وعتبته وأبرز ثغرة وثّقها البحث.
// ============================================================================

export const DETECTORS: DetectorDef[] = [
  // ---- منصّات تجارية / هجينة (الفصل السابع) ----
  {
    id: 'turnitin',
    name: 'Turnitin',
    family: 'commercial_hybrid',
    tier: 'enterprise',
    threshold: 20, // تكبت الدرجات تحت 20٪
    weakness: 'تحيّز ضد كتابة غير الناطقين بالإنجليزية؛ تكبت الدرجات تحت 20٪',
    hasPublicApi: false,
  },
  {
    id: 'gptzero',
    name: 'GPTZero',
    family: 'commercial_hybrid',
    tier: 'commercial',
    threshold: 50,
    weakness: 'هشٌّ أمام الأنسنة وإعادة الصياغة رغم التحديث الشهري',
    hasPublicApi: true,
  },
  {
    id: 'zerogpt',
    name: 'ZeroGPT',
    family: 'passive_statistical',
    tier: 'free',
    threshold: 50,
    weakness: 'إيجابيات كاذبة أعلى ~4× من Turnitin؛ ينهار مع أي تحريرٍ بسيط',
    hasPublicApi: false,
  },
  {
    id: 'originality',
    name: 'Originality.ai',
    family: 'commercial_hybrid',
    tier: 'commercial',
    threshold: 50,
    weakness: 'تعميمٌ ضعيف خارج التوزيع التدريبي',
    hasPublicApi: true,
  },
  {
    id: 'copyleaks',
    name: 'Copyleaks',
    family: 'commercial_hybrid',
    tier: 'commercial',
    threshold: 50,
    weakness: 'تعميمٌ خارج التوزيع؛ حساسية للمجال',
    hasPublicApi: true,
  },
  {
    id: 'pangram',
    name: 'Pangram',
    family: 'trained_classifier',
    tier: 'commercial',
    threshold: 50,
    weakness: 'white-box نسبياً؛ يحتاج معايرةً لكل نموذجٍ مستهدف',
    hasPublicApi: true,
  },
  {
    id: 'winston',
    name: 'Winston AI',
    family: 'commercial_hybrid',
    tier: 'commercial',
    threshold: 50,
    weakness: 'يعتمد إشاراتٍ إحصائيةً قابلةً للكسر بالأنسنة',
    hasPublicApi: true,
  },
  {
    id: 'sapling',
    name: 'Sapling',
    family: 'trained_classifier',
    tier: 'commercial',
    threshold: 50,
    weakness: 'هشاشة خارج التوزيع؛ حساسية للطول',
    hasPublicApi: true,
  },

  // ---- كواشف بحثية مفتوحة (الفصل الثالث) ----
  {
    id: 'binoculars',
    name: 'Binoculars',
    family: 'zero_shot',
    tier: 'research_open',
    threshold: 50,
    weakness: 'ينهار أمام إعادة الصياغة العودية والمتجانسات',
    hasPublicApi: false,
  },
  {
    id: 'fast_detectgpt',
    name: 'Fast-DetectGPT',
    family: 'zero_shot',
    tier: 'research_open',
    threshold: 50,
    weakness: 'يضعف أمام إعادة الصياغة؛ يحتاج نموذجاً مُعايِناً',
    hasPublicApi: false,
  },
  {
    id: 'detectgpt',
    name: 'DetectGPT',
    family: 'zero_shot',
    tier: 'research_open',
    threshold: 50,
    weakness: 'مكلفٌ حسابياً (~100 تمريرة)؛ يحتاج white-box',
    hasPublicApi: false,
  },
  {
    id: 'radar',
    name: 'RADAR',
    family: 'trained_classifier',
    tier: 'research_open',
    threshold: 50,
    weakness: 'أمتن أمام إعادة الصياغة لكنه ينهار أمام المتجانسات',
    hasPublicApi: false,
  },
  {
    id: 'ghostbuster',
    name: 'Ghostbuster',
    family: 'trained_classifier',
    tier: 'research_open',
    threshold: 50,
    weakness: 'white-box نسبياً؛ كاشفٌ لكل نموذج',
    hasPublicApi: false,
  },
  {
    id: 'gltr',
    name: 'GLTR',
    family: 'passive_statistical',
    tier: 'research_open',
    threshold: 50,
    weakness: 'أداةٌ تعليميةٌ بصرية؛ سهلة الكسر بإعادة الصياغة',
    hasPublicApi: false,
  },
  {
    id: 'openai_roberta',
    name: 'OpenAI RoBERTa Detector',
    family: 'trained_classifier',
    tier: 'research_open',
    threshold: 50,
    weakness: 'قديم؛ يعمّم بضعفٍ على النماذج الحديثة',
    hasPublicApi: false,
  },
];

export const DETECTOR_MAP: Record<string, DetectorDef> = Object.fromEntries(
  DETECTORS.map((d) => [d.id, d]),
);

export const FAMILY_LABEL: Record<DetectorFamily, string> = {
  passive_statistical: 'إحصائي سلبي',
  zero_shot: 'انعدام تدريب',
  trained_classifier: 'مُصنِّف مُدرَّب',
  watermark: 'علامة مائية',
  retrieval: 'استرجاع',
  commercial_hybrid: 'تجاري هجين',
};

export const FAMILY_COLOR: Record<DetectorFamily, string> = {
  passive_statistical: 'var(--fam-1)',
  zero_shot: 'var(--fam-2)',
  trained_classifier: 'var(--fam-3)',
  watermark: 'var(--fam-4)',
  retrieval: 'var(--fam-5)',
  commercial_hybrid: 'var(--fam-6)',
};
