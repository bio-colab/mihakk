// ============================================================================
//  مِحَكّ (MIHAKK) — نموذج البيانات الأساسي
//  Adversarial Robustness Benchmark for AI-Text Detectors
//  كل الأنواع مبنية على تصنيف البحث المرفق (الفصول 2–9).
// ============================================================================

/** عائلات الكشف الثلاث الكبرى (الفصل الثاني من البحث). */
export type DetectorFamily =
  | 'passive_statistical' // مقاييس إحصائية: perplexity / burstiness / GLTR
  | 'zero_shot'           // كواشف انعدام التدريب: DetectGPT / Binoculars
  | 'trained_classifier'  // مُصنِّفات مُدرَّبة: RoBERTa / Ghostbuster / RADAR
  | 'watermark'           // علامات مائية نشطة: KGW / SynthID-Text
  | 'retrieval'           // معتمد على الوصول: قاعدة بيانات المخرجات
  | 'commercial_hybrid';  // منصّات تجارية تدمج عدّة إشارات (Turnitin, GPTZero...)

/** أنواع النصوص التي يراعيها محرك التعديل (طلب المستخدم). */
export type TextType =
  | 'academic'      // بحثي / أكاديمي
  | 'legal'         // قانوني
  | 'scientific'    // علمي / تقني
  | 'professional'  // احترافي / مهني
  | 'commercial'    // تجاري / تسويقي
  | 'general'       // عام
  | 'auto';         // تصنيف تلقائي

/** عائلات الهجوم حسب الهدف (الفصل الثامن). */
export type AttackFamily =
  | 'scrubbing'   // تهرّب: جعل النص الآلي يبدو بشرياً
  | 'perturbation'// تشويش على مستوى المحرف
  | 'translation';// ترجمة ذهاباً وإياباً

/** الهجمات المدعومة. */
export type AttackId =
  | 'paraphrase'
  | 'recursive_paraphrase'
  | 'humanize'
  | 'back_translate'
  | 'homoglyph'
  | 'zero_width';

/** طريقة تنفيذ الهجوم. */
export type AttackKind = 'llm' | 'deterministic';

export interface DetectorDef {
  id: string;
  name: string;
  family: DetectorFamily;
  tier: 'enterprise' | 'commercial' | 'free' | 'research_open';
  /** عتبة القرار الافتراضية (٪): فوقها يُعدّ النص «مكشوفاً كآلي». */
  threshold: number;
  /** أبرز قيد/ثغرة من البحث. */
  weakness: string;
  hasPublicApi: boolean;
}

export interface TextTypeDef {
  id: TextType;
  label: string;
  hint: string;
  /** قيود المجال التي يجب على محرك التعديل الحفاظ عليها. */
  constraints: string;
}

export interface AttackDef {
  id: AttackId;
  label: string;
  family: AttackFamily;
  kind: AttackKind;
  /** المرجع من البحث. */
  origin: string;
  description: string;
  /** هل يحتاج مفتاح نموذج؟ */
  needsEngine: boolean;
}

/** مزوّدو نماذج الذكاء الاصطناعي المدعومون كمحرك تعديل. */
export type ProviderId =
  | 'anthropic'
  | 'openai'
  | 'google'
  | 'mistral'
  | 'deepseek'
  | 'zhipu'   // GLM
  | 'minimax'
  | 'openrouter';

export interface ProviderDef {
  id: ProviderId;
  name: string;
  defaultModel: string;
  models: string[];
  keyHint: string;
  /** هل يسمح المزوّد باستدعاء المتصفّح مباشرةً (CORS)؟ */
  browserCallable: 'yes' | 'header' | 'no';
  note?: string;
}

/** إعدادات مفتاح مزوّد واحد. */
export interface ProviderConfig {
  apiKey: string;
  model: string;
  enabled: boolean;
}

export interface Settings {
  activeProvider: ProviderId;
  providers: Record<ProviderId, ProviderConfig>;
  includeLiteraturePriors: boolean;
  recursiveRounds: number;
  backTranslatePivot: string;
}

/** نتيجة كاشفٍ واحد داخل تجربة. */
export interface DetectorResult {
  detectorId: string;
  scoreBefore: number; // ٪ ذكاء اصطناعي قبل الهجوم (يُدخلها المستخدم)
  scoreAfter: number;  // ٪ بعد الهجوم (يُدخلها المستخدم بعد إعادة الفحص)
}

/** تجربة بنشمارك كاملة. */
export interface Experiment {
  id: string;
  createdAt: number;
  textType: TextType;         // ما اختاره المستخدم (قد يكون auto)
  resolvedType: Exclude<TextType, 'auto'>; // النوع الفعلي بعد التصنيف
  attack: AttackId;
  attackFamily: AttackFamily;
  engineProvider: ProviderId | 'none';
  engineModel: string;
  originalText: string;
  transformedText: string;
  detectors: DetectorResult[];
  note?: string;
  /** مصدر البيانات: تجربة المستخدم أم مرجع من الأدبيات. */
  source: 'experiment' | 'literature';
}

/** صفٌّ في ترتيب الكواشف. */
export interface DetectorRankRow {
  detectorId: string;
  name: string;
  family: DetectorFamily;
  samples: number;
  meanRetention: number;   // 0..1 — كم احتفظ الكاشف بإشارته بعد الهجوم
  holdRate: number;        // 0..1 — نسبة بقائه فوق العتبة
  meanDelta: number;       // متوسط التغيّر في النسبة
  weakestAttack: AttackId | null;
  weakestRetention: number;
}

/** خلية في مصفوفة المتانة (كاشف × هجوم). */
export interface MatrixCell {
  detectorId: string;
  attack: AttackId;
  retention: number | null; // null = لا بيانات
  samples: number;
}
