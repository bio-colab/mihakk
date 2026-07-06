import type { ProviderDef, ProviderId, Settings } from '../types';

// ============================================================================
//  مزوّدو نماذج الذكاء الاصطناعي — محرك التعديل الذكي.
//  browserCallable: هل يسمح المزوّد باستدعاء المتصفّح مباشرةً؟
//   yes    = يسمح
//   header = يسمح مع ترويسة خاصّة
//   no     = يحجب CORS ويحتاج بروكسي (موثّق في README)
// ============================================================================

export const PROVIDERS: ProviderDef[] = [
  {
    id: 'anthropic',
    name: 'Claude (Anthropic)',
    defaultModel: 'claude-sonnet-4-5',
    models: ['claude-opus-4-1', 'claude-sonnet-4-5', 'claude-3-5-haiku-latest'],
    keyHint: 'sk-ant-...',
    browserCallable: 'header',
    note: 'يتطلّب ترويسة anthropic-dangerous-direct-browser-access (مضافة تلقائياً).',
  },
  {
    id: 'openai',
    name: 'GPT (OpenAI)',
    defaultModel: 'gpt-4o',
    models: ['gpt-4o', 'gpt-4o-mini', 'gpt-4.1'],
    keyHint: 'sk-...',
    browserCallable: 'yes',
  },
  {
    id: 'google',
    name: 'Gemini (Google)',
    defaultModel: 'gemini-2.0-flash',
    models: ['gemini-2.0-flash', 'gemini-1.5-pro', 'gemini-1.5-flash'],
    keyHint: 'AIza...',
    browserCallable: 'yes',
  },
  {
    id: 'mistral',
    name: 'Mistral',
    defaultModel: 'mistral-large-latest',
    models: ['mistral-large-latest', 'mistral-small-latest', 'open-mistral-nemo'],
    keyHint: '...',
    browserCallable: 'yes',
  },
  {
    id: 'deepseek',
    name: 'DeepSeek',
    defaultModel: 'deepseek-chat',
    models: ['deepseek-chat', 'deepseek-reasoner'],
    keyHint: 'sk-...',
    browserCallable: 'yes',
  },
  {
    id: 'zhipu',
    name: 'GLM (Zhipu)',
    defaultModel: 'glm-4-plus',
    models: ['glm-4-plus', 'glm-4-air', 'glm-4-flash'],
    keyHint: '...',
    browserCallable: 'yes',
  },
  {
    id: 'minimax',
    name: 'MiniMax',
    defaultModel: 'abab6.5s-chat',
    models: ['abab6.5s-chat', 'abab6.5-chat'],
    keyHint: '...',
    browserCallable: 'yes',
    note: 'قد يتطلّب GroupId إضافةً للمفتاح حسب حسابك.',
  },
  {
    id: 'openrouter',
    name: 'OpenRouter (بوّابة موحّدة)',
    defaultModel: 'anthropic/claude-sonnet-4.5',
    models: [
      'anthropic/claude-sonnet-4.5',
      'openai/gpt-4o',
      'google/gemini-2.0-flash-001',
      'deepseek/deepseek-chat',
      'mistralai/mistral-large',
    ],
    keyHint: 'sk-or-...',
    browserCallable: 'yes',
    note: 'أسهل خيارٍ لتجربة عدّة نماذج بمفتاحٍ واحد.',
  },
];

export const PROVIDER_MAP: Record<ProviderId, ProviderDef> = Object.fromEntries(
  PROVIDERS.map((p) => [p.id, p]),
) as Record<ProviderId, ProviderDef>;

export function defaultSettings(): Settings {
  const providers = Object.fromEntries(
    PROVIDERS.map((p) => [
      p.id,
      { apiKey: '', model: p.defaultModel, enabled: false },
    ]),
  ) as Settings['providers'];

  return {
    activeProvider: 'openrouter',
    providers,
    includeLiteraturePriors: true,
    recursiveRounds: 3,
    backTranslatePivot: 'الإنجليزية',
  };
}
