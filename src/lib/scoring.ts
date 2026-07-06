import type {
  Experiment,
  DetectorResult,
  DetectorRankRow,
  MatrixCell,
  AttackId,
  TextType,
} from '../types';
import { DETECTOR_MAP } from '../data/detectors';
import { ATTACKS } from '../data/attacks';

// ============================================================================
//  منطق القياس — يحوّل التجارب إلى ترتيبٍ ومصفوفةٍ ومؤشّرات.
//
//  التعريفات:
//   retention  = scoreAfter / scoreBefore   ← كم احتفظ الكاشف بإشارته بعد الهجوم
//                (1 = صمد تماماً، 0 = انهار). عالٍ ⇒ الكاشف أمتن (أصعب خداعاً).
//   held       = scoreAfter ≥ عتبة الكاشف   ← هل بقي يكشف النص كآلي؟
//   delta      = scoreAfter − scoreBefore   ← التغيّر المطلق في النسبة.
//
//  فلسفة الليدربورد: كلما قاوم الكاشفُ الهجومَ (retention عالٍ)، ارتفع ترتيبه.
// ============================================================================

export function clamp01(x: number): number {
  return Math.max(0, Math.min(1, x));
}

export function retentionOf(r: DetectorResult): number {
  if (r.scoreBefore <= 0) return r.scoreAfter > 0 ? 1 : 0;
  return clamp01(r.scoreAfter / r.scoreBefore);
}

export function heldOf(r: DetectorResult): boolean {
  const th = DETECTOR_MAP[r.detectorId]?.threshold ?? 50;
  return r.scoreAfter >= th;
}

export interface Filters {
  textType?: TextType | 'all';
  attack?: AttackId | 'all';
  includeLiterature: boolean;
}

/** تسطيح التجارب إلى صفوف (كاشف × تجربة) بعد تطبيق المرشّحات. */
interface FlatRow {
  detectorId: string;
  attack: AttackId;
  textType: Exclude<TextType, 'auto'>;
  retention: number;
  held: boolean;
  delta: number;
  source: 'experiment' | 'literature';
}

export function flatten(exps: Experiment[], f: Filters): FlatRow[] {
  const out: FlatRow[] = [];
  for (const e of exps) {
    if (!f.includeLiterature && e.source === 'literature') continue;
    if (f.textType && f.textType !== 'all' && e.resolvedType !== f.textType)
      continue;
    if (f.attack && f.attack !== 'all' && e.attack !== f.attack) continue;
    for (const d of e.detectors) {
      if (!DETECTOR_MAP[d.detectorId]) continue;
      out.push({
        detectorId: d.detectorId,
        attack: e.attack,
        textType: e.resolvedType,
        retention: retentionOf(d),
        held: heldOf(d),
        delta: d.scoreAfter - d.scoreBefore,
        source: e.source,
      });
    }
  }
  return out;
}

function mean(xs: number[]): number {
  return xs.length ? xs.reduce((a, b) => a + b, 0) / xs.length : 0;
}

/** ترتيب الكواشف حسب المتانة (retention تنازلياً). */
export function rankDetectors(exps: Experiment[], f: Filters): DetectorRankRow[] {
  const rows = flatten(exps, f);
  const byDet = new Map<string, FlatRow[]>();
  for (const r of rows) {
    const arr = byDet.get(r.detectorId) ?? [];
    arr.push(r);
    byDet.set(r.detectorId, arr);
  }

  const result: DetectorRankRow[] = [];
  for (const [detectorId, arr] of byDet) {
    const def = DETECTOR_MAP[detectorId];
    if (!def) continue;

    // أضعف هجوم: أدنى متوسط retention.
    const byAttack = new Map<AttackId, number[]>();
    for (const r of arr) {
      const a = byAttack.get(r.attack) ?? [];
      a.push(r.retention);
      byAttack.set(r.attack, a);
    }
    let weakestAttack: AttackId | null = null;
    let weakestRetention = Infinity;
    for (const [a, vals] of byAttack) {
      const m = mean(vals);
      if (m < weakestRetention) {
        weakestRetention = m;
        weakestAttack = a;
      }
    }

    result.push({
      detectorId,
      name: def.name,
      family: def.family,
      samples: arr.length,
      meanRetention: mean(arr.map((r) => r.retention)),
      holdRate: mean(arr.map((r) => (r.held ? 1 : 0))),
      meanDelta: mean(arr.map((r) => r.delta)),
      weakestAttack,
      weakestRetention: weakestRetention === Infinity ? 0 : weakestRetention,
    });
  }

  return result.sort((a, b) => b.meanRetention - a.meanRetention);
}

/** مصفوفة المتانة: كاشف × هجوم (متوسط retention لكل خلية). */
export function robustnessMatrix(
  exps: Experiment[],
  f: Filters,
): { detectorIds: string[]; attacks: AttackId[]; cells: MatrixCell[] } {
  const rows = flatten(exps, { ...f, attack: 'all' });
  const detectorIds = Array.from(new Set(rows.map((r) => r.detectorId)));
  const attacks = ATTACKS.map((a) => a.id);
  const cells: MatrixCell[] = [];

  for (const detectorId of detectorIds) {
    for (const attack of attacks) {
      const subset = rows.filter(
        (r) => r.detectorId === detectorId && r.attack === attack,
      );
      cells.push({
        detectorId,
        attack,
        retention: subset.length ? mean(subset.map((r) => r.retention)) : null,
        samples: subset.length,
      });
    }
  }
  return { detectorIds, attacks, cells };
}

/** لكل نوع نص: الكاشف الأمتن. */
export function strongestByTextType(
  exps: Experiment[],
  includeLiterature: boolean,
): Array<{ textType: Exclude<TextType, 'auto'>; detectorId: string | null; retention: number; samples: number }> {
  const types: Array<Exclude<TextType, 'auto'>> = [
    'academic',
    'legal',
    'scientific',
    'professional',
    'commercial',
    'general',
  ];
  return types.map((textType) => {
    const ranked = rankDetectors(exps, {
      textType,
      attack: 'all',
      includeLiterature,
    });
    const total = ranked.reduce((a, r) => a + r.samples, 0);
    const top = ranked[0];
    return {
      textType,
      detectorId: top ? top.detectorId : null,
      retention: top ? top.meanRetention : 0,
      samples: total,
    };
  });
}

/** لون خلية حسب retention (منخفض=أحمر «انهار» → عالٍ=أخضر «صمد»). */
export function retentionColor(r: number | null): string {
  if (r === null) return 'var(--cell-empty)';
  // تدرّج مبني على معنى الكشف: أحمر (انهار) → كهرماني → أخضر (صمد)
  if (r < 0.25) return 'var(--sig-collapse)';
  if (r < 0.45) return 'var(--sig-weak)';
  if (r < 0.65) return 'var(--sig-mid)';
  if (r < 0.8) return 'var(--sig-hold)';
  return 'var(--sig-strong)';
}
