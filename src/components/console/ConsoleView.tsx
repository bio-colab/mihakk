import { useMemo, useState } from 'react';
import type {
  Settings,
  Experiment,
  TextType,
  AttackId,
  DetectorResult,
} from '../../types';
import { TEXT_TYPES, TEXT_TYPE_LABEL } from '../../data/textTypes';
import { ATTACKS, ATTACK_MAP } from '../../data/attacks';
import { DETECTORS, DETECTOR_MAP } from '../../data/detectors';
import { PROVIDER_MAP } from '../../data/providers';
import { classifyText } from '../../lib/textClassify';
import { applyHomoglyph, applyZeroWidth, perturbationStats } from '../../lib/homoglyph';
import { runEngineAttack, type EngineError } from '../../lib/aiEngine';
import { newId } from '../../lib/storage';
import { FamilyBadge } from '../ui/Bits';
import { ResultTrace } from './ResultTrace';

interface Props {
  settings: Settings;
  onSave: (e: Experiment) => void;
  onGotoSettings: () => void;
}

type Stage = 'compose' | 'transformed';

export function ConsoleView({ settings, onSave, onGotoSettings }: Props) {
  const [text, setText] = useState('');
  const [textType, setTextType] = useState<TextType>('auto');
  const [attack, setAttack] = useState<AttackId>('paraphrase');
  const [picked, setPicked] = useState<string[]>(['gptzero']);
  const [before, setBefore] = useState<Record<string, number>>({ gptzero: 90 });
  const [after, setAfter] = useState<Record<string, number>>({});
  const [note, setNote] = useState('');

  const [stage, setStage] = useState<Stage>('compose');
  const [transformed, setTransformed] = useState('');
  const [running, setRunning] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const attackDef = ATTACK_MAP[attack];
  const resolvedType = useMemo<Exclude<TextType, 'auto'>>(
    () => (textType === 'auto' ? classifyText(text) : textType),
    [textType, text],
  );
  const provider = settings.activeProvider;
  const providerCfg = settings.providers[provider];
  const hasKey = !!providerCfg?.apiKey;

  function togglePick(id: string) {
    setPicked((prev) => {
      const on = prev.includes(id);
      const next = on ? prev.filter((x) => x !== id) : [...prev, id];
      if (!on && before[id] === undefined) {
        setBefore((b) => ({ ...b, [id]: 90 }));
      }
      return next;
    });
  }

  async function handleTransform() {
    setErr(null);
    if (text.trim().length < 20) {
      setErr('أدخل نصاً مولّداً بطولٍ معقول (٢٠ حرفاً على الأقل).');
      return;
    }
    setRunning(true);
    try {
      let result: string;
      if (attackDef.kind === 'deterministic') {
        result =
          attack === 'homoglyph'
            ? applyHomoglyph(text)
            : applyZeroWidth(text);
      } else {
        if (!hasKey) {
          setErr('هذا الهجوم يحتاج محركاً. أضِف مفتاح النموذج في الإعدادات أوّلاً.');
          setRunning(false);
          return;
        }
        result = await runEngineAttack({
          attack,
          resolvedType,
          provider,
          config: providerCfg,
          text,
          recursiveRounds: settings.recursiveRounds,
          pivot: settings.backTranslatePivot,
        });
      }
      setTransformed(result);
      setStage('transformed');
      // تهيئة نسب «بعد» بقيمة «قبل» كنقطة بداية للمستخدم.
      setAfter(() => {
        const seed: Record<string, number> = {};
        for (const id of picked) seed[id] = before[id] ?? 90;
        return seed;
      });
    } catch (e) {
      const ee = e as EngineError;
      setErr(ee?.message || 'تعذّر تنفيذ التحويل.');
    } finally {
      setRunning(false);
    }
  }

  function handleSave() {
    const detectors: DetectorResult[] = picked.map((id) => ({
      detectorId: id,
      scoreBefore: clampScore(before[id] ?? 0),
      scoreAfter: clampScore(after[id] ?? 0),
    }));
    const exp: Experiment = {
      id: newId(),
      createdAt: Date.now(),
      textType,
      resolvedType,
      attack,
      attackFamily: attackDef.family,
      engineProvider: attackDef.kind === 'deterministic' ? 'none' : provider,
      engineModel:
        attackDef.kind === 'deterministic' ? 'deterministic' : providerCfg.model,
      originalText: text,
      transformedText: transformed,
      detectors,
      note: note.trim() || undefined,
      source: 'experiment',
    };
    onSave(exp);
    resetAll();
  }

  function resetAll() {
    setText('');
    setTransformed('');
    setStage('compose');
    setAfter({});
    setNote('');
    setErr(null);
  }

  const previewResults: DetectorResult[] = picked.map((id) => ({
    detectorId: id,
    scoreBefore: clampScore(before[id] ?? 0),
    scoreAfter: clampScore(after[id] ?? before[id] ?? 0),
  }));

  return (
    <div className="page">
      <div className="page-head">
        <div className="eyebrow">Adversarial Console · لوحة الاختبار العدائي</div>
        <h2>المِحَكّ</h2>
        <p className="sub">
          أدخِل نصاً مولّداً، طبّق هجوماً عدائياً مراعياً لنوع النص، أعد فحصه بالكاشف،
          ثم سجّل النتيجة لتتراكم في لوحة الصدارة. المنصّة لا تفحص نيابةً عنك — أنت الفاحص،
          وهي تقيس المتانة.
        </p>
      </div>

      <div className="grid two-col">
        {/* ============ العمود الأيمن: التأليف ============ */}
        <div className="stack-sm">
          {/* 1) النص */}
          <div className="card">
            <div className="card-head">
              <span className="idx">١</span>
              <h3>النص المولّد</h3>
              <span className="spacer" />
              <span className="badge">
                النوع: {TEXT_TYPE_LABEL[resolvedType]}
                {textType === 'auto' && ' (مُصنَّف تلقائياً)'}
              </span>
            </div>
            <div className="card-pad">
              <textarea
                className="textarea"
                placeholder="ألصق هنا النص المولّد بالذكاء الاصطناعي..."
                value={text}
                onChange={(e) => {
                  setText(e.target.value);
                  if (stage === 'transformed') setStage('compose');
                }}
              />
              <div className="row" style={{ marginTop: 12 }}>
                <span className="hint-inline">نوع النص:</span>
                <select
                  className="select"
                  style={{ width: 'auto', minWidth: 170 }}
                  value={textType}
                  onChange={(e) => setTextType(e.target.value as TextType)}
                >
                  <option value="auto">تلقائي (تصنيف ذكي)</option>
                  {TEXT_TYPES.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.label}
                    </option>
                  ))}
                </select>
                <span className="hint-inline mono">
                  {Array.from(text).length} حرف
                </span>
              </div>
            </div>
          </div>

          {/* 2) الهجوم */}
          <div className="card">
            <div className="card-head">
              <span className="idx">٢</span>
              <h3>الهجوم العدائي</h3>
              <span className="spacer" />
              <span className={`badge ${attackDef.kind === 'deterministic' ? '' : ''}`}>
                {attackDef.kind === 'deterministic' ? 'حتمي · بلا مفتاح' : 'محرك ذكي'}
              </span>
            </div>
            <div className="card-pad">
              <div className="chips">
                {ATTACKS.map((a) => (
                  <button
                    key={a.id}
                    className={`chip ${attack === a.id ? 'active' : ''}`}
                    onClick={() => setAttack(a.id)}
                  >
                    {a.label}
                    <span className="chip-sub">{a.origin}</span>
                  </button>
                ))}
              </div>
              <div className="callout" style={{ marginTop: 14 }}>
                {attackDef.description}
              </div>
              {attack === 'recursive_paraphrase' && (
                <div className="hint-inline" style={{ marginTop: 8 }}>
                  عدد الجولات الحالي: <b className="mono">{settings.recursiveRounds}</b>{' '}
                  (يُضبط من الإعدادات)
                </div>
              )}
              {attackDef.needsEngine && (
                <div className="hint-inline" style={{ marginTop: 8 }}>
                  المحرك:{' '}
                  {hasKey ? (
                    <b>
                      {PROVIDER_MAP[provider].name} · {providerCfg.model}
                    </b>
                  ) : (
                    <button className="btn btn-sm btn-ghost" onClick={onGotoSettings}>
                      لا يوجد مفتاح — اضبط المحرك
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* 3) الكواشف ونسب «قبل» */}
          <div className="card">
            <div className="card-head">
              <span className="idx">٣</span>
              <h3>الكواشف ونِسَب ما قبل الهجوم</h3>
            </div>
            <div className="card-pad">
              <p className="hint-inline" style={{ marginBottom: 12 }}>
                اختر الكواشف التي استخدمتها، وأدخِل نسبة الذكاء الاصطناعي التي أعطاها كلٌّ
                منها <b>قبل</b> الهجوم.
              </p>
              <div className="detector-grid">
                {DETECTORS.map((d) => {
                  const on = picked.includes(d.id);
                  return (
                    <div
                      key={d.id}
                      className={`detector-row ${on ? 'on' : ''}`}
                    >
                      <label className="det-check">
                        <input
                          type="checkbox"
                          checked={on}
                          onChange={() => togglePick(d.id)}
                        />
                        <span className="det-name">{d.name}</span>
                        <FamilyBadge family={d.family} />
                      </label>
                      {on && (
                        <div className="det-score">
                          <input
                            className="input score-input mono"
                            type="number"
                            min={0}
                            max={100}
                            value={before[d.id] ?? 0}
                            onChange={(e) =>
                              setBefore((b) => ({
                                ...b,
                                [d.id]: clampScore(+e.target.value),
                              }))
                            }
                          />
                          <span className="hint-inline">٪</span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {err && <div className="callout danger">{err}</div>}

          <button
            className="btn btn-primary"
            style={{ width: '100%', justifyContent: 'center', padding: 13 }}
            disabled={running || picked.length === 0 || text.trim().length < 20}
            onClick={handleTransform}
          >
            {running ? 'جارٍ التحويل…' : 'طبّق الهجوم وحوّل النص ←'}
          </button>
        </div>

        {/* ============ العمود الأيسر: الناتج والتسجيل ============ */}
        <div className="stack-sm">
          {stage === 'compose' ? (
            <div className="card">
              <div className="card-head">
                <span className="idx">◇</span>
                <h3>الناتج</h3>
              </div>
              <div className="card-pad">
                <div className="empty-state">
                  <div className="big">لم يُحوَّل نصٌّ بعد</div>
                  <p>
                    أكمِل الخطوات الثلاث على اليمين ثم اضغط «طبّق الهجوم». سيظهر هنا النص
                    المُحوّل لتنسخه وتعيد فحصه.
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <>
              {/* النص المُحوّل */}
              <div className="card">
                <div className="card-head">
                  <span className="idx">٤</span>
                  <h3>النص المُحوّل — انسخه وأعد فحصه</h3>
                  <span className="spacer" />
                  <button
                    className="btn btn-sm"
                    onClick={() => {
                      navigator.clipboard?.writeText(transformed);
                      setCopied(true);
                      setTimeout(() => setCopied(false), 1500);
                    }}
                  >
                    {copied ? 'نُسخ ✓' : 'نسخ'}
                  </button>
                </div>
                <div className="card-pad">
                  <textarea
                    className="textarea mono-area"
                    value={transformed}
                    onChange={(e) => setTransformed(e.target.value)}
                  />
                  {attackDef.kind === 'deterministic' && (
                    <DeterministicStats original={text} transformed={transformed} />
                  )}
                </div>
              </div>

              {/* نسب «بعد» */}
              <div className="card">
                <div className="card-head">
                  <span className="idx">٥</span>
                  <h3>نِسَب ما بعد الهجوم</h3>
                </div>
                <div className="card-pad">
                  <p className="hint-inline" style={{ marginBottom: 12 }}>
                    افحص النص المُحوّل بالكاشف نفسه، ثم أدخِل النسبة الجديدة.
                  </p>
                  {picked.map((id) => {
                    const d = DETECTOR_MAP[id];
                    if (!d) return null;
                    return (
                      <div key={id} className="after-row">
                        <span className="det-name">{d.name}</span>
                        <span className="mono hint-inline">
                          قبل: {before[id] ?? 0}٪
                        </span>
                        <span className="arrow">←</span>
                        <div className="det-score">
                          <input
                            className="input score-input mono"
                            type="number"
                            min={0}
                            max={100}
                            value={after[id] ?? 0}
                            onChange={(e) =>
                              setAfter((a) => ({
                                ...a,
                                [id]: clampScore(+e.target.value),
                              }))
                            }
                          />
                          <span className="hint-inline">٪</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* معاينة المسار */}
              <div className="card">
                <div className="card-head">
                  <span className="idx">◈</span>
                  <h3>مسار التهرّب</h3>
                </div>
                <div className="card-pad">
                  <ResultTrace results={previewResults} />
                </div>
              </div>

              {/* ملاحظة + حفظ */}
              <div className="card">
                <div className="card-pad">
                  <div className="field" style={{ marginBottom: 12 }}>
                    <label>ملاحظة (اختياري)</label>
                    <input
                      className="input"
                      placeholder="مثال: نص فصلٍ من رسالة ماجستير، نموذج التوليد GPT-4o…"
                      value={note}
                      onChange={(e) => setNote(e.target.value)}
                    />
                  </div>
                  <div className="row">
                    <button className="btn btn-primary" onClick={handleSave}>
                      احفظ التجربة في المُدوّنة
                    </button>
                    <button className="btn btn-ghost" onClick={resetAll}>
                      تجربة جديدة
                    </button>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function DeterministicStats({
  original,
  transformed,
}: {
  original: string;
  transformed: string;
}) {
  const s = perturbationStats(original, transformed);
  return (
    <div className="hint-inline" style={{ marginTop: 10 }}>
      محارف مُستبدَلة:{' '}
      <b className="mono">{s.charsSwapped}</b> · محارف خفيّة محقونة:{' '}
      <b className="mono">{s.zeroWidthInjected}</b> — النص يبدو مطابقاً للعين لكن تقطيعه
      تغيّر.
    </div>
  );
}

function clampScore(n: number): number {
  if (Number.isNaN(n)) return 0;
  return Math.max(0, Math.min(100, Math.round(n)));
}
