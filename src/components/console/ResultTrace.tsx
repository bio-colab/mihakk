import type { DetectorResult } from '../../types';
import { DETECTOR_MAP, FAMILY_COLOR } from '../../data/detectors';
import { retentionOf, heldOf } from '../../lib/scoring';

// ============================================================================
//  العنصر التوقيعي للمنصّة: «مسار التهرّب».
//  لكل كاشف، خطٌّ يهبط أو يصعد من نسبته قبل الهجوم إلى نسبته بعده،
//  مع خطّ العتبة (threshold) الذي يفصل «مكشوف» عن «متهرّب».
//  يجسّد بصرياً مفهوم انهيار الكشف (الفصل 8) على مستوى التجربة الواحدة.
// ============================================================================

export function ResultTrace({ results }: { results: DetectorResult[] }) {
  const valid = results.filter((r) => DETECTOR_MAP[r.detectorId]);
  if (valid.length === 0) return null;

  const W = 560;
  const H = 40 + valid.length * 46;
  const padL = 118;
  const padR = 58;
  const plotW = W - padL - padR;
  const x = (score: number) => padL + (score / 100) * plotW;

  return (
    <div className="scroll-x">
      <svg
        viewBox={`0 0 ${W} ${H}`}
        width="100%"
        style={{ minWidth: 420, display: 'block' }}
        role="img"
        aria-label="مسار التهرّب لكل كاشف"
      >
        {/* شبكة عمودية 0..100 */}
        {[0, 25, 50, 75, 100].map((g) => (
          <g key={g}>
            <line
              x1={x(g)}
              x2={x(g)}
              y1={22}
              y2={H - 14}
              stroke="var(--line-soft)"
              strokeWidth={1}
            />
            <text
              x={x(g)}
              y={14}
              fill="var(--faint)"
              fontSize={10}
              textAnchor="middle"
              fontFamily="var(--mono)"
            >
              {g}
            </text>
          </g>
        ))}

        {valid.map((r, i) => {
          const def = DETECTOR_MAP[r.detectorId];
          const y = 40 + i * 46;
          const color = FAMILY_COLOR[def.family];
          const held = heldOf(r);
          const ret = retentionOf(r);
          const xb = x(r.scoreBefore);
          const xa = x(r.scoreAfter);
          const th = def.threshold;

          return (
            <g key={r.detectorId}>
              {/* اسم الكاشف */}
              <text
                x={padL - 12}
                y={y + 4}
                fill="var(--ink-2)"
                fontSize={12.5}
                textAnchor="end"
                fontFamily="var(--font)"
              >
                {def.name}
              </text>

              {/* عتبة الكاشف */}
              <line
                x1={x(th)}
                x2={x(th)}
                y1={y - 15}
                y2={y + 15}
                stroke="var(--sig-weak)"
                strokeWidth={1}
                strokeDasharray="3 3"
                opacity={0.65}
              />

              {/* المسار قبل→بعد */}
              <line
                x1={xb}
                x2={xa}
                y1={y}
                y2={y}
                stroke={color}
                strokeWidth={2}
                opacity={0.55}
              />
              {/* نقطة «قبل» */}
              <circle cx={xb} cy={y} r={4.5} fill="var(--panel)" stroke={color} strokeWidth={2} />
              {/* نقطة «بعد» */}
              <circle
                cx={xa}
                cy={y}
                r={5.5}
                fill={held ? 'var(--sig-strong)' : 'var(--sig-collapse)'}
                stroke="var(--bg)"
                strokeWidth={1.5}
              />

              {/* قيمة الاحتفاظ */}
              <text
                x={W - padR + 10}
                y={y + 4}
                fill={held ? 'var(--sig-strong)' : 'var(--sig-collapse)'}
                fontSize={12}
                fontFamily="var(--mono)"
              >
                {(ret * 100).toFixed(0)}%
              </text>
            </g>
          );
        })}
      </svg>

      <div className="trace-legend">
        <span>
          <i className="lg-dot before" /> قبل الهجوم
        </span>
        <span>
          <i className="lg-dot held" /> صمد (فوق العتبة)
        </span>
        <span>
          <i className="lg-dot collapse" /> انهار (تحت العتبة)
        </span>
        <span>
          <i className="lg-line th" /> عتبة الكاشف
        </span>
        <span className="hint-inline">اليمين ٪ = نسبة الاحتفاظ بالإشارة</span>
      </div>
    </div>
  );
}
