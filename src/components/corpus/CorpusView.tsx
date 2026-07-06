import { useRef } from 'react';
import type { Experiment } from '../../types';
import { DETECTOR_MAP } from '../../data/detectors';
import { ATTACK_MAP } from '../../data/attacks';
import { TEXT_TYPE_LABEL } from '../../data/textTypes';
import { retentionOf, heldOf, retentionColor } from '../../lib/scoring';
import { exportJson, importJson } from '../../lib/storage';

export function CorpusView({
  experiments,
  onDelete,
  onImport,
  onClearAll,
}: {
  experiments: Experiment[];
  onDelete: (id: string) => void;
  onImport: (exps: Experiment[]) => void;
  onClearAll: () => void;
}) {
  const fileRef = useRef<HTMLInputElement>(null);
  const mine = experiments.filter((e) => e.source === 'experiment');

  function download() {
    const blob = new Blob([exportJson(mine)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `mihakk-corpus-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const parsed = importJson(String(reader.result));
        onImport(parsed);
      } catch {
        alert('تعذّر قراءة الملف — تأكّد أنه ملف تصديرٍ صالح من مِحَكّ.');
      }
    };
    reader.readAsText(f);
    e.target.value = '';
  }

  return (
    <div className="page">
      <div className="page-head">
        <div className="eyebrow">Corpus · مُدوّنة التجارب</div>
        <h2>المُدوّنة</h2>
        <p className="sub">
          كل تجربةٍ سجّلتها، مع نصّها المُحوّل ونتائج كواشفها. تُحفَظ محلياً في متصفّحك،
          ويمكنك تصديرها ومشاركتها أو استيراد مُدوّنةٍ أخرى.
        </p>
      </div>

      <div className="row between" style={{ marginBottom: 18 }}>
        <span className="badge mono">{mine.length} تجربة محفوظة</span>
        <div className="row">
          <button className="btn btn-sm" onClick={download} disabled={mine.length === 0}>
            تصدير JSON
          </button>
          <button className="btn btn-sm" onClick={() => fileRef.current?.click()}>
            استيراد
          </button>
          <input
            ref={fileRef}
            type="file"
            accept="application/json"
            hidden
            onChange={handleFile}
          />
          {mine.length > 0 && (
            <button
              className="btn btn-sm btn-ghost btn-danger"
              onClick={() => {
                if (confirm('حذف كل التجارب المحفوظة؟ لا يمكن التراجع.')) onClearAll();
              }}
            >
              مسح الكل
            </button>
          )}
        </div>
      </div>

      {mine.length === 0 ? (
        <div className="card">
          <div className="card-pad">
            <div className="empty-state">
              <div className="big">لا تجارب بعد</div>
              <p>اذهب إلى المِحَكّ، شغّل هجوماً على نص، وسجّل النتيجة لتظهر هنا.</p>
            </div>
          </div>
        </div>
      ) : (
        <div className="stack-sm">
          {mine
            .slice()
            .sort((a, b) => b.createdAt - a.createdAt)
            .map((e) => (
              <ExperimentCard key={e.id} exp={e} onDelete={() => onDelete(e.id)} />
            ))}
        </div>
      )}
    </div>
  );
}

function ExperimentCard({ exp, onDelete }: { exp: Experiment; onDelete: () => void }) {
  const date = new Date(exp.createdAt).toLocaleString('ar', {
    dateStyle: 'medium',
    timeStyle: 'short',
  });
  return (
    <div className="card">
      <div className="card-pad">
        <div className="row between" style={{ marginBottom: 10 }}>
          <div className="row">
            <span className="badge">{ATTACK_MAP[exp.attack]?.label ?? exp.attack}</span>
            <span className="badge">{TEXT_TYPE_LABEL[exp.resolvedType]}</span>
            {exp.engineProvider !== 'none' && (
              <span className="badge mono">{exp.engineModel}</span>
            )}
          </div>
          <div className="row">
            <span className="hint-inline mono">{date}</span>
            <button className="btn btn-sm btn-ghost btn-danger" onClick={onDelete}>
              حذف
            </button>
          </div>
        </div>

        {exp.note && <p className="hint-inline" style={{ marginBottom: 10 }}>{exp.note}</p>}

        <div className="corpus-detectors">
          {exp.detectors.map((d) => {
            const def = DETECTOR_MAP[d.detectorId];
            if (!def) return null;
            const ret = retentionOf(d);
            const held = heldOf(d);
            return (
              <div key={d.detectorId} className="corpus-det">
                <span className="det-name">{def.name}</span>
                <span className="mono">
                  {d.scoreBefore}٪ <span className="arrow">←</span>{' '}
                  <b style={{ color: held ? 'var(--sig-strong)' : 'var(--sig-collapse)' }}>
                    {d.scoreAfter}٪
                  </b>
                </span>
                <span
                  className="corpus-ret mono"
                  style={{ color: retentionColor(ret) }}
                >
                  احتفاظ {(ret * 100).toFixed(0)}٪
                </span>
              </div>
            );
          })}
        </div>

        <details className="corpus-texts">
          <summary>عرض النصّين (الأصلي والمُحوّل)</summary>
          <div className="grid two-col" style={{ marginTop: 10 }}>
            <div>
              <div className="hint-inline" style={{ marginBottom: 4 }}>الأصلي</div>
              <div className="text-snip">{exp.originalText || '—'}</div>
            </div>
            <div>
              <div className="hint-inline" style={{ marginBottom: 4 }}>المُحوّل</div>
              <div className="text-snip mono">{exp.transformedText || '—'}</div>
            </div>
          </div>
        </details>
      </div>
    </div>
  );
}
