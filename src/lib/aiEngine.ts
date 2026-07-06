import type {
  ProviderId,
  ProviderConfig,
  AttackId,
  TextType,
} from '../types';
import { TEXT_TYPE_MAP } from '../data/textTypes';

// ============================================================================
//  محرك التعديل الذكي — عميلٌ موحّدٌ لعدّة مزوّدين.
//  يستدعي نموذج المستخدم المختار بمفتاحه لتنفيذ هجمات إعادة الصياغة/الأنسنة/الترجمة.
//  التحويلات الحتمية (متجانسات/محارف خفيّة) لا تمرّ من هنا.
// ============================================================================

export interface EngineError {
  kind: 'no_key' | 'network' | 'cors' | 'api' | 'empty';
  message: string;
}

/** بناء موجّه النظام حسب الهجوم ونوع النص (مع قيود المجال). */
export function buildPrompt(
  attack: AttackId,
  resolvedType: Exclude<TextType, 'auto'>,
  pivot: string,
): { system: string; instruction: string } {
  const constraints = TEXT_TYPE_MAP[resolvedType].constraints;

  const base =
    'أنت محرك تعديلٍ نصّيٍّ بحثيٌّ ضمن منصّة قياس متانة كواشف النصوص المولّدة بالذكاء الاصطناعي. ' +
    'مهمّتك تحويل النص المُدخل وفق الاستراتيجية المطلوبة مع احترام قيود نوع النص. ' +
    'أعد النص المُحوّل فقط، دون أي مقدّمةٍ أو شرحٍ أو علاماتٍ إضافية. حافظ على لغة النص الأصلية.';

  const domain = `قيود نوع النص (${resolvedType}): ${constraints}`;

  const strategies: Record<AttackId, string> = {
    paraphrase:
      'أعد صياغة النص على مستوى الخطاب لا الجملة: أعد ترتيب الأفكار عبر الفقرات، ' +
      'غيّر التراكيب والمفردات مع الحفاظ الكامل على المعنى. الهدف كسر الأنماط الإحصائية المنتظمة.',
    recursive_paraphrase:
      'أعد صياغةً عميقةً على مستوى الخطاب. هذه جولةٌ ضمن سلسلةٍ عودية، ' +
      'فأبعِد الصياغة أكثر عن الأصل مع الحفاظ الصارم على المعنى والوقائع.',
    humanize:
      'حوّل النص ليقارب الكتابة البشرية: نوّع طول الجُمل بشدّة (جملٌ قصيرةٌ حادّةٌ تتلوها طويلة)، ' +
      'ارفع ثراء المفردات، أدخِل لا-انتظامٍ طبيعياً في الإيقاع، وقلّل التكرار البنيوي. ' +
      'الهدف رفع الحَيْرة والتذبذب (perplexity/burstiness) خارج النطاق الآلي «الأملس».',
    back_translate:
      `ترجم النص إلى ${pivot} ترجمةً دقيقةً وطبيعية، ثم أعد ترجمة الناتج إلى لغة النص الأصلية. ` +
      'أعد النسخة النهائية المُعادة فقط. الحفاظ على المعنى أولوية.',
    homoglyph: '', // حتمي — لا يُستخدم هنا
    zero_width: '', // حتمي — لا يُستخدم هنا
  };

  return {
    system: `${base}\n\n${domain}`,
    instruction: strategies[attack],
  };
}

interface CallArgs {
  provider: ProviderId;
  config: ProviderConfig;
  system: string;
  user: string;
}

/** استدعاءٌ منخفض المستوى لكل مزوّد. يُعيد النص أو يرمي EngineError. */
async function callProvider({
  provider,
  config,
  system,
  user,
}: CallArgs): Promise<string> {
  if (!config.apiKey) {
    throw { kind: 'no_key', message: 'لا يوجد مفتاح لهذا المزوّد.' } as EngineError;
  }
  const model = config.model;

  try {
    if (provider === 'anthropic') {
      const res = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
          'x-api-key': config.apiKey,
          'anthropic-version': '2023-06-01',
          'anthropic-dangerous-direct-browser-access': 'true',
        },
        body: JSON.stringify({
          model,
          max_tokens: 4000,
          system,
          messages: [{ role: 'user', content: user }],
        }),
      });
      const data = await res.json();
      if (!res.ok) throw apiErr(data);
      const text = (data.content || [])
        .filter((b: { type: string }) => b.type === 'text')
        .map((b: { text: string }) => b.text)
        .join('\n');
      return ensure(text);
    }

    if (provider === 'google') {
      const url =
        `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=` +
        encodeURIComponent(config.apiKey);
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          systemInstruction: { parts: [{ text: system }] },
          contents: [{ role: 'user', parts: [{ text: user }] }],
        }),
      });
      const data = await res.json();
      if (!res.ok) throw apiErr(data);
      const text =
        data.candidates?.[0]?.content?.parts
          ?.map((p: { text: string }) => p.text)
          .join('\n') ?? '';
      return ensure(text);
    }

    // بقية المزوّدين متوافقون مع مخطط OpenAI Chat Completions.
    const endpoints: Partial<Record<ProviderId, string>> = {
      openai: 'https://api.openai.com/v1/chat/completions',
      mistral: 'https://api.mistral.ai/v1/chat/completions',
      deepseek: 'https://api.deepseek.com/v1/chat/completions',
      zhipu: 'https://open.bigmodel.cn/api/paas/v4/chat/completions',
      minimax: 'https://api.minimax.chat/v1/text/chatcompletion_v2',
      openrouter: 'https://openrouter.ai/api/v1/chat/completions',
    };
    const endpoint = endpoints[provider];
    if (!endpoint) throw { kind: 'api', message: 'مزوّد غير مدعوم.' } as EngineError;

    const res = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        authorization: `Bearer ${config.apiKey}`,
      },
      body: JSON.stringify({
        model,
        messages: [
          { role: 'system', content: system },
          { role: 'user', content: user },
        ],
        temperature: 0.9,
        max_tokens: 4000,
      }),
    });
    const data = await res.json();
    if (!res.ok) throw apiErr(data);
    const text = data.choices?.[0]?.message?.content ?? '';
    return ensure(text);
  } catch (e) {
    if (isEngineError(e)) throw e;
    // فشل fetch عادةً = CORS أو شبكة
    throw {
      kind: 'cors',
      message:
        'فشل الاتصال بالمزوّد (غالباً حجب CORS من المتصفّح أو انقطاع الشبكة). ' +
        'راجع قسم البروكسي في README، أو جرّب OpenRouter.',
    } as EngineError;
  }
}

function apiErr(data: unknown): EngineError {
  const msg =
    (data as { error?: { message?: string } })?.error?.message ||
    JSON.stringify(data).slice(0, 200);
  return { kind: 'api', message: `خطأ من المزوّد: ${msg}` };
}
function ensure(text: string): string {
  const t = (text || '').trim();
  if (!t) throw { kind: 'empty', message: 'أعاد النموذج نصاً فارغاً.' } as EngineError;
  return t;
}
function isEngineError(e: unknown): e is EngineError {
  return typeof e === 'object' && e !== null && 'kind' in e && 'message' in e;
}

export interface RunArgs {
  attack: AttackId;
  resolvedType: Exclude<TextType, 'auto'>;
  provider: ProviderId;
  config: ProviderConfig;
  text: string;
  recursiveRounds: number;
  pivot: string;
}

/** تشغيل هجومٍ يعتمد على المحرك (LLM). يُعيد النص المُحوّل. */
export async function runEngineAttack(args: RunArgs): Promise<string> {
  const { attack, resolvedType, provider, config, text, recursiveRounds, pivot } =
    args;
  const { system, instruction } = buildPrompt(attack, resolvedType, pivot);

  const once = async (input: string) =>
    callProvider({
      provider,
      config,
      system,
      user: `${instruction}\n\n=== النص ===\n${input}`,
    });

  if (attack === 'recursive_paraphrase') {
    let current = text;
    const rounds = Math.max(2, Math.min(6, recursiveRounds));
    for (let i = 0; i < rounds; i++) {
      current = await once(current);
    }
    return current;
  }
  return once(text);
}
