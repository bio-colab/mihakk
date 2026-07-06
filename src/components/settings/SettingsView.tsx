import { useState } from 'react';
import type { Settings, ProviderId } from '../../types';
import { PROVIDERS, PROVIDER_MAP } from '../../data/providers';

export function SettingsView({
  settings,
  onChange,
}: {
  settings: Settings;
  onChange: (s: Settings) => void;
}) {
  const [reveal, setReveal] = useState<Record<string, boolean>>({});

  function setProvider(id: ProviderId, patch: Partial<Settings['providers'][ProviderId]>) {
    onChange({
      ...settings,
      providers: {
        ...settings.providers,
        [id]: { ...settings.providers[id], ...patch },
      },
    });
  }

  const corsLabel: Record<string, string> = {
    yes: 'يسمح باستدعاء المتصفّح',
    header: 'يسمح بترويسةٍ خاصّة',
    no: 'يحجب CORS — يحتاج بروكسي',
  };

  return (
    <div className="page">
      <div className="page-head">
        <div className="eyebrow">Settings · إعدادات المحرك</div>
        <h2>الإعدادات</h2>
        <p className="sub">
          مفاتيح النماذج تُحفَظ محلياً في متصفّحك فقط (localStorage) ولا تُرسَل إلى أي خادمٍ
          سوى مزوّد النموذج مباشرةً. اختر محركاً واحداً فعّالاً لتنفيذ هجمات إعادة الصياغة
          والأنسنة والترجمة.
        </p>
      </div>

      <div className="callout warn" style={{ marginBottom: 18 }}>
        <span className="t">تنبيه CORS:</span> بعض المزوّدين يحجبون الاستدعاء المباشر من
        المتصفّح. إن فشل الاتصال، استخدم <b>OpenRouter</b> (بوّابة موحّدة تسمح باستدعاء
        المتصفّح)، أو شغّل البروكسي الصغير الموثّق في <b>README</b>. الهجمات الحتمية
        (المتجانسات/المحارف الخفيّة) تعمل دائماً بلا مفتاح.
      </div>

      {/* المحرك الفعّال + خيارات */}
      <div className="card" style={{ marginBottom: 18 }}>
        <div className="card-head">
          <h3>المحرك الفعّال والخيارات</h3>
        </div>
        <div className="card-pad">
          <div className="field">
            <label>المزوّد الفعّال (يُستخدم في الهجمات التي تحتاج نموذجاً)</label>
            <select
              className="select"
              value={settings.activeProvider}
              onChange={(e) =>
                onChange({ ...settings, activeProvider: e.target.value as ProviderId })
              }
            >
              {PROVIDERS.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>

          <div className="row" style={{ gap: 22 }}>
            <div className="field" style={{ flex: 1, minWidth: 200 }}>
              <label>جولات إعادة الصياغة العودية</label>
              <input
                className="input mono"
                type="number"
                min={2}
                max={6}
                value={settings.recursiveRounds}
                onChange={(e) =>
                  onChange({
                    ...settings,
                    recursiveRounds: Math.max(2, Math.min(6, +e.target.value || 2)),
                  })
                }
              />
              <span className="desc">٢–٦ جولات (أكثر = تهرّبٌ أعلى، جودةٌ أقل).</span>
            </div>
            <div className="field" style={{ flex: 1, minWidth: 200 }}>
              <label>لغة الترجمة المحورية</label>
              <input
                className="input"
                value={settings.backTranslatePivot}
                onChange={(e) =>
                  onChange({ ...settings, backTranslatePivot: e.target.value })
                }
              />
              <span className="desc">تُستخدم في هجوم الترجمة العكسية.</span>
            </div>
          </div>

          <div className="divider" />
          <label className="det-check" style={{ cursor: 'pointer' }}>
            <input
              type="checkbox"
              checked={settings.includeLiteraturePriors}
              onChange={(e) =>
                onChange({ ...settings, includeLiteraturePriors: e.target.checked })
              }
            />
            <span className="det-name">تضمين مراجع الأدبيات في لوحة الصدارة</span>
          </label>
          <p className="hint-inline" style={{ marginTop: 6 }}>
            بياناتٌ مرجعيةٌ مشتقّةٌ من مصفوفة المتانة (الفصل ٨٫٨) تجعل اللوحة ذات معنىً قبل
            تراكم تجاربك. تُميَّز بصرياً وتُفصَل عند إيقافها.
          </p>
        </div>
      </div>

      {/* المفاتيح لكل مزوّد */}
      <div className="card">
        <div className="card-head">
          <h3>مفاتيح المزوّدين</h3>
          <span className="spacer" />
          <span className="hint-inline">يمكنك ضبط أكثر من مزوّد والتبديل بينها</span>
        </div>
        <div className="card-pad stack-sm">
          {PROVIDERS.map((p) => {
            const cfg = settings.providers[p.id];
            const active = settings.activeProvider === p.id;
            return (
              <div key={p.id} className={`provider-row ${active ? 'active' : ''}`}>
                <div className="row between">
                  <div className="row">
                    <b>{p.name}</b>
                    {active && <span className="badge">فعّال</span>}
                    <span className="badge">{corsLabel[p.browserCallable]}</span>
                  </div>
                  {cfg.apiKey && <span className="badge mono">مفتاحٌ مُخزَّن ✓</span>}
                </div>
                {p.note && <p className="hint-inline" style={{ margin: '6px 0' }}>{p.note}</p>}
                <div className="row" style={{ marginTop: 8, gap: 10 }}>
                  <input
                    className="input mono"
                    style={{ flex: 2, minWidth: 200 }}
                    type={reveal[p.id] ? 'text' : 'password'}
                    placeholder={`المفتاح (${p.keyHint})`}
                    value={cfg.apiKey}
                    onChange={(e) => setProvider(p.id, { apiKey: e.target.value })}
                  />
                  <button
                    className="btn btn-sm btn-ghost"
                    onClick={() =>
                      setReveal((r) => ({ ...r, [p.id]: !r[p.id] }))
                    }
                  >
                    {reveal[p.id] ? 'إخفاء' : 'إظهار'}
                  </button>
                  <select
                    className="select"
                    style={{ flex: 1, minWidth: 150 }}
                    value={cfg.model}
                    onChange={(e) => setProvider(p.id, { model: e.target.value })}
                  >
                    {PROVIDER_MAP[p.id].models.map((m) => (
                      <option key={m} value={m}>
                        {m}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
