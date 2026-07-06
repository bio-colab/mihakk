import { useMemo, useState } from 'react';
import type { Experiment, Settings, TextType, AttackId } from '../../types';
import {
  rankDetectors,
  strongestByTextType,
  retentionColor,
} from '../../lib/scoring';
import { DETECTOR_MAP } from '../../data/detectors';
import { TEXT_TYPES, TEXT_TYPE_LABEL } from '../../data/textTypes';
import { ATTACKS, ATTACK_MAP } from '../../data/attacks';
import { FamilyBadge, Meter } from '../ui/Bits';
import { RobustnessMatrix } from './RobustnessMatrix';

export function LeaderboardView({
  experiments,
  settings,
}: {
  experiments: Experiment[];
  settings: Settings;
}) {
  const [textType, setTextType] = useState<TextType | 'all'>('all');
  const [attack, setAttack] = useState<AttackId | 'all'>('all');
  const inc = settings.includeLiteraturePriors;

  const ranked = useMemo(
    () => rankDetectors(experiments, { textType, attack, includeLiterature: inc }),
    [experiments, textType, attack, inc],
  );
  const byType = useMemo(
    () => strongestByTextType(experiments, inc),
    [experiments, inc],
  );

  const totalSamples = ranked.reduce((a, r) => a + r.samples, 0);

  return (
    <div className="page">
      <div className="page-head">
        <div className="eyebrow">Robustness Leaderboard · لوحة صدارة المتانة</div>
        <h2>أيُّ الكواشف يصمد؟</h2>
        <p className="sub">
          الترتيب حسب <b>نسبة الاحتفاظ بالإشارة</b> بعد الهجوم: الأعلى = الأمتن (أصعب
          خداعاً). قسّم النتائج حسب نوع النص والهجوم لترى نقاط القوّة والضعف.
        </p>
      </div>

      {/* مرشّحات */}
      <div className="card" style={{ marginBottom: 18 }}>
        <div className="card-pad">
          <div className="row between">
            <div className="row">
              <span className="hint-inline">نوع النص:</span>
              <select
                className="select"
                style={{ width: 'auto' }}
                value={textType}
                onChange={(e) => setTextType(e.target.value as TextType | 'all')}
              >
                <option value="all">الكل</option>
                {TEXT_TYPES.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.label}
                  </option>
                ))}
              </select>
              <span className="hint-inline">الهجوم:</span>
              <select
                className="select"
                style={{ width: 'auto' }}
                value={attack}
                onChange={(e) => setAttack(e.target.value as AttackId | 'all')}
              >
                <option value="all">الكل</option>
                {ATTACKS.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.label}
                  </option>
                ))}
              </select>
            </div>
            <span className="badge mono">
              {totalSamples} قياس · {experiments.filter((e) => e.source === 'experiment').length}{' '}
              تجربة
              {inc && ' + مراجع'}
            </span>
          </div>
        </div>
      </div>

      {/* الترتيب */}
      <div className="card" style={{ marginBottom: 18 }}>
        <div className="card-head">
          <h3>ترتيب الكواشف</h3>
        </div>
        <div className="card-pad">
          {ranked.length === 0 ? (
            <div className="empty-state">
              <div className="big">لا نتائج بهذه المرشّحات</div>
              <p>غيّر المرشّحات أو أضِف تجارب من المِحَكّ.</p>
            </div>
          ) : (
            <div className="scroll-x">
              <table className="rank-table">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>الكاشف</th>
                    <th>العائلة</th>
                    <th>المتانة (احتفاظ)</th>
                    <th>بقاء فوق العتبة</th>
                    <th>متوسط التغيّر</th>
                    <th>أضعف أمام</th>
                    <th>عيّنات</th>
                  </tr>
                </thead>
                <tbody>
                  {ranked.map((r, i) => (
                    <tr key={r.detectorId}>
                      <td className="mono rank-num">{i + 1}</td>
                      <td className="rank-name">{r.name}</td>
                      <td>
                        <FamilyBadge family={r.family} />
                      </td>
                      <td className="meter-cell">
                        <Meter
                          value={r.meanRetention}
                          color={retentionColor(r.meanRetention)}
                        />
                        <span className="mono">
                          {(r.meanRetention * 100).toFixed(0)}%
                        </span>
                      </td>
                      <td className="mono">{(r.holdRate * 100).toFixed(0)}%</td>
                      <td
                        className="mono"
                        style={{
                          color:
                            r.meanDelta < 0
                              ? 'var(--sig-collapse)'
                              : 'var(--sig-strong)',
                        }}
                      >
                        {r.meanDelta > 0 ? '+' : ''}
                        {r.meanDelta.toFixed(0)}
                      </td>
                      <td>
                        {r.weakestAttack ? (
                          <span className="badge">
                            {ATTACK_MAP[r.weakestAttack].label}
                            <span className="mono" style={{ color: 'var(--sig-collapse)' }}>
                              {(r.weakestRetention * 100).toFixed(0)}%
                            </span>
                          </span>
                        ) : (
                          '—'
                        )}
                      </td>
                      <td className="mono hint-inline">{r.samples}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* المصفوفة */}
      <div className="card" style={{ marginBottom: 18 }}>
        <div className="card-head">
          <h3>مصفوفة المتانة — كاشف × هجوم</h3>
          <span className="spacer" />
          <span className="hint-inline">تجسيدٌ حيٌّ للفصل ٨٫٨ من البحث</span>
        </div>
        <div className="card-pad">
          <RobustnessMatrix
            experiments={experiments}
            textType={textType}
            includeLiterature={inc}
          />
        </div>
      </div>

      {/* الأقوى حسب نوع النص */}
      <div className="card">
        <div className="card-head">
          <h3>الأمتن في كل نوع نص</h3>
        </div>
        <div className="card-pad">
          <div className="type-grid">
            {byType.map((t) => (
              <div key={t.textType} className="type-cell">
                <div className="type-label">{TEXT_TYPE_LABEL[t.textType]}</div>
                {t.detectorId ? (
                  <>
                    <div className="type-winner">
                      {DETECTOR_MAP[t.detectorId]?.name}
                    </div>
                    <div
                      className="type-bar"
                      style={{ background: retentionColor(t.retention) }}
                    >
                      <span className="mono">{(t.retention * 100).toFixed(0)}%</span>
                    </div>
                    <div className="hint-inline mono">{t.samples} قياس</div>
                  </>
                ) : (
                  <div className="hint-inline">لا بيانات</div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
