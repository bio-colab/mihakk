import type { AttackDef, AttackId } from '../types';

// ============================================================================
//  الهجمات العدائية — مبنية على الفصل الثامن من البحث.
//  كل هجومٍ إمّا LLM (يحتاج محركاً) أو deterministic (منفّذٌ في الكود).
// ============================================================================

export const ATTACKS: AttackDef[] = [
  {
    id: 'paraphrase',
    label: 'إعادة صياغة (مستوى الخطاب)',
    family: 'scrubbing',
    kind: 'llm',
    origin: 'DIPPER — Krishna et al. 2023 [21]',
    description:
      'إعادة كتابة على مستوى الفقرة لا الجملة، تُحطّم أنماط perplexity/burstiness ' +
      'وتُزيح الرموز عن القوائم الخضراء. أقوى هجومٍ تهرّبي مفرد.',
    needsEngine: true,
  },
  {
    id: 'recursive_paraphrase',
    label: 'إعادة صياغة عودية',
    family: 'scrubbing',
    kind: 'llm',
    origin: 'Sadasivan et al. 2023 [11]',
    description:
      'تطبيق إعادة الصياغة مراتٍ متتالية. تُسقط حتى الكاشف المعتمد على الاسترجاع إلى ~25٪ ' +
      'بعد خمس جولات، بثمنٍ ضئيلٍ في الجودة.',
    needsEngine: true,
  },
  {
    id: 'humanize',
    label: 'أنسنة (حقن تذبذب)',
    family: 'scrubbing',
    kind: 'llm',
    origin: 'الفصل 1.4 + تحيّز اللغة الثانية 8.7 [14]',
    description:
      'رفع الحَيْرة والتذبذب صناعياً: تنويع طول الجُمل وثراء المفردات وإدخال لا-انتظامٍ بشري ' +
      'يدفع النص خارج النطاق «الأملس» الذي يكشفه المقياس.',
    needsEngine: true,
  },
  {
    id: 'back_translate',
    label: 'ترجمة عكسية',
    family: 'translation',
    kind: 'llm',
    origin: 'قيود SynthID-Text 6.2 [6]',
    description:
      'ترجمة النص إلى لغةٍ محورية ثم إعادته للعربية/الأصل. تُضعف العلامات المائية وتشوّش البصمة الإحصائية.',
    needsEngine: true,
  },
  {
    id: 'homoglyph',
    label: 'متجانسات بصرية',
    family: 'perturbation',
    kind: 'deterministic',
    origin: 'SilverSpeak — Creo & Pu 2024 [25]',
    description:
      'استبدال محارف بأخرى تبدو مطابقةً بصرياً من جداول Unicode مختلفة، فتُحطّم التقطيع (Tokenization) ' +
      'وترفع الحَيْرة صناعياً. تهرّبٌ يقارب 100٪ دون مفتاح.',
    needsEngine: false,
  },
  {
    id: 'zero_width',
    label: 'محارف خفيّة صفرية العرض',
    family: 'perturbation',
    kind: 'deterministic',
    origin: 'SilverSpeak (whitespace) [25]',
    description:
      'حقن محارف صفرية العرض بين الرموز لكسر التقطيع دون أي أثرٍ مرئي للقارئ البشري.',
    needsEngine: false,
  },
];

export const ATTACK_MAP: Record<AttackId, AttackDef> = Object.fromEntries(
  ATTACKS.map((a) => [a.id, a]),
) as Record<AttackId, AttackDef>;

export const ATTACK_LABEL: Record<AttackId, string> = Object.fromEntries(
  ATTACKS.map((a) => [a.id, a.label]),
) as Record<AttackId, AttackId extends never ? never : string>;
