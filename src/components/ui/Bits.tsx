import type { DetectorFamily } from '../../types';
import { FAMILY_LABEL, FAMILY_COLOR } from '../../data/detectors';

export function FamilyBadge({ family }: { family: DetectorFamily }) {
  return (
    <span className="badge">
      <span className="dot" style={{ background: FAMILY_COLOR[family] }} />
      {FAMILY_LABEL[family]}
    </span>
  );
}

export function Meter({ value, color }: { value: number; color: string }) {
  const pct = Math.max(0, Math.min(100, value * 100));
  return (
    <div className="meter" title={`${pct.toFixed(0)}%`}>
      <span style={{ width: `${pct}%`, background: color }} />
    </div>
  );
}

export function Pct({ v }: { v: number }) {
  return <span className="mono">{v.toFixed(0)}%</span>;
}

/** رقمٌ كبير بلكنةٍ أحادية، لعرض المقاييس. */
export function Stat({
  label,
  value,
  color,
  sub,
}: {
  label: string;
  value: string;
  color?: string;
  sub?: string;
}) {
  return (
    <div className="stat">
      <div className="stat-label">{label}</div>
      <div className="stat-value mono" style={color ? { color } : undefined}>
        {value}
      </div>
      {sub && <div className="stat-sub">{sub}</div>}
    </div>
  );
}
