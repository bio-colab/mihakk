import type { Settings, Experiment } from '../types';
import { defaultSettings } from '../data/providers';

// ============================================================================
//  التخزين المحلي — يحفظ الإعدادات والتجارب في localStorage.
//  ملاحظة: يعمل عند تشغيل التطبيق محلياً أو بعد بنائه، لا داخل بيئة معاينةٍ مقيّدة.
// ============================================================================

const K_SETTINGS = 'mihakk.settings.v1';
const K_EXPERIMENTS = 'mihakk.experiments.v1';

export function loadSettings(): Settings {
  try {
    const raw = localStorage.getItem(K_SETTINGS);
    if (!raw) return defaultSettings();
    const parsed = JSON.parse(raw) as Partial<Settings>;
    // دمجٌ آمنٌ مع الافتراضيات (لتحمّل التوسّع المستقبلي).
    const base = defaultSettings();
    return {
      ...base,
      ...parsed,
      providers: { ...base.providers, ...(parsed.providers ?? {}) },
    };
  } catch {
    return defaultSettings();
  }
}

export function saveSettings(s: Settings): void {
  try {
    localStorage.setItem(K_SETTINGS, JSON.stringify(s));
  } catch {
    /* تجاهل بهدوء */
  }
}

export function loadExperiments(): Experiment[] {
  try {
    const raw = localStorage.getItem(K_EXPERIMENTS);
    if (!raw) return [];
    return JSON.parse(raw) as Experiment[];
  } catch {
    return [];
  }
}

export function saveExperiments(exps: Experiment[]): void {
  try {
    localStorage.setItem(K_EXPERIMENTS, JSON.stringify(exps));
  } catch {
    /* تجاهل بهدوء */
  }
}

export function exportJson(exps: Experiment[]): string {
  return JSON.stringify(
    { platform: 'MIHAKK', version: 1, exportedAt: Date.now(), experiments: exps },
    null,
    2,
  );
}

export function importJson(text: string): Experiment[] {
  const data = JSON.parse(text);
  const arr = Array.isArray(data) ? data : data.experiments;
  if (!Array.isArray(arr)) throw new Error('صيغة غير صالحة');
  return arr as Experiment[];
}

export function newId(): string {
  return `exp-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}
