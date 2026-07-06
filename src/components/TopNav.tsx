export type ViewId =
  | 'console'
  | 'leaderboard'
  | 'corpus'
  | 'settings'
  | 'methodology';

const TABS: Array<{ id: ViewId; label: string }> = [
  { id: 'console', label: 'المِحَكّ' },
  { id: 'leaderboard', label: 'لوحة الصدارة' },
  { id: 'corpus', label: 'المُدوّنة' },
  { id: 'methodology', label: 'المنهجية' },
  { id: 'settings', label: 'الإعدادات' },
];

/** شعارٌ يرمز لـ«حجر المِحَكّ»: خطّا إشارةٍ قبل/بعد يتقاطعان عند العتبة. */
function Logo() {
  return (
    <svg className="mark" viewBox="0 0 32 32" fill="none" aria-hidden="true">
      <rect x="1" y="1" width="30" height="30" rx="8" fill="#161b28" stroke="#2a3247" />
      <path d="M5 10 H27" stroke="#2a3247" strokeWidth="1" strokeDasharray="2 3" />
      <path d="M5 22 H27" stroke="#2a3247" strokeWidth="1" strokeDasharray="2 3" />
      <path d="M6 9 L14 11 L20 22 L26 24" stroke="#7d6cff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M6 24 L14 22 L20 12 L26 9" stroke="#33cdd6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" opacity="0.85" />
      <circle cx="17" cy="16.5" r="2.1" fill="#e04858" />
    </svg>
  );
}

export function TopNav({
  view,
  onChange,
}: {
  view: ViewId;
  onChange: (v: ViewId) => void;
}) {
  return (
    <nav className="topnav">
      <div className="brand">
        <Logo />
        <div>
          <div className="name">
            مِحَكّ <span className="tag">MIHAKK</span>
          </div>
        </div>
      </div>
      <div className="nav-tabs">
        {TABS.map((t) => (
          <button
            key={t.id}
            className={`nav-tab ${view === t.id ? 'active' : ''}`}
            onClick={() => onChange(t.id)}
          >
            {t.label}
          </button>
        ))}
      </div>
    </nav>
  );
}
