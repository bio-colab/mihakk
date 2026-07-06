import type { Experiment, TextType } from '../../types';
import { robustnessMatrix, retentionColor } from '../../lib/scoring';
import { DETECTOR_MAP } from '../../data/detectors';
import { ATTACK_MAP } from '../../data/attacks';

// مصفوفة الفصل 8.8، لكن مبنيّةً من بياناتٍ حيّة (تجارب المستخدم + الأدبيات).
export function RobustnessMatrix({
  experiments,
  textType,
  includeLiterature,
}: {
  experiments: Experiment[];
  textType: TextType | 'all';
  includeLiterature: boolean;
}) {
  const { detectorIds, attacks, cells } = robustnessMatrix(experiments, {
    textType,
    includeLiterature,
  });

  if (detectorIds.length === 0) {
    return (
      <div className="empty-state">
        <div className="big">لا بيانات لعرض المصفوفة</div>
        <p>أضِف تجارب من المِحَكّ، أو فعّل «مراجع الأدبيات» في الإعدادات.</p>
      </div>
    );
  }

  const cellOf = (det: string, atk: string) =>
    cells.find((c) => c.detectorId === det && c.attack === atk);

  return (
    <div className="scroll-x">
      <table className="matrix">
        <thead>
          <tr>
            <th className="corner">الكاشف \ الهجوم</th>
            {attacks.map((a) => (
              <th key={a} className="matrix-col">
                {ATTACK_MAP[a].label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {detectorIds.map((det) => (
            <tr key={det}>
              <th className="matrix-row-h">{DETECTOR_MAP[det]?.name ?? det}</th>
              {attacks.map((a) => {
                const c = cellOf(det, a);
                const r = c?.retention ?? null;
                return (
                  <td
                    key={a}
                    className="matrix-cell"
                    style={{ background: retentionColor(r) }}
                    title={
                      r === null
                        ? 'لا بيانات'
                        : `احتفاظ ${(r * 100).toFixed(0)}٪ · عيّنات ${c?.samples ?? 0}`
                    }
                  >
                    {r === null ? '·' : (
                      <span className="mono">{(r * 100).toFixed(0)}</span>
                    )}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>

      <div className="matrix-legend">
        <span>انهار الكشف</span>
        <i style={{ background: 'var(--sig-collapse)' }} />
        <i style={{ background: 'var(--sig-weak)' }} />
        <i style={{ background: 'var(--sig-mid)' }} />
        <i style={{ background: 'var(--sig-hold)' }} />
        <i style={{ background: 'var(--sig-strong)' }} />
        <span>صمد الكاشف</span>
        <span className="hint-inline">الرقم = نسبة الاحتفاظ بالإشارة بعد الهجوم</span>
      </div>
    </div>
  );
}
