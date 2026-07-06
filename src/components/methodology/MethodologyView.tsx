import { REFERENCES } from '../../data/references';
import { ATTACKS } from '../../data/attacks';
import { FAMILY_LABEL, FAMILY_COLOR } from '../../data/detectors';
import type { DetectorFamily } from '../../types';

const FAMILIES: DetectorFamily[] = [
  'passive_statistical',
  'zero_shot',
  'trained_classifier',
  'watermark',
  'retrieval',
  'commercial_hybrid',
];

const FAMILY_DESC: Record<DetectorFamily, string> = {
  passive_statistical:
    'يقيس بصمةً إحصائيةً في النص (الحَيْرة/perplexity والتذبذب/burstiness). سهل الكسر بإعادة الصياغة والتشويش المحرفي.',
  zero_shot:
    'يستغلّ انحناء الاحتمال حول النص دون تدريبٍ مخصّص (DetectGPT, Binoculars). يضعف أمام إعادة الصياغة العودية.',
  trained_classifier:
    'مُصنِّفٌ مُدرَّبٌ على تمييز الآلي من البشري (RoBERTa, RADAR, Ghostbuster). يعمّم بضعفٍ خارج توزيعه التدريبي.',
  watermark:
    'علامةٌ مائيةٌ تُزرَع وقت التوليد (KGW, SynthID-Text). تُضعفها الترجمة وإعادة الصياغة، ويمكن سرقتها.',
  retrieval:
    'يخزّن مخرجات النموذج ويقارن بها. أمتن دفاع، لكن إعادة الصياغة العودية تُسقطه إلى ~٢٥٪.',
  commercial_hybrid:
    'منصّاتٌ تدمج عدّة إشارات (Turnitin, GPTZero…). أداؤها أفضل لكنها تعاني تحيّزاً ضد غير الناطقين بالإنجليزية.',
};

export function MethodologyView() {
  return (
    <div className="page">
      <div className="page-head">
        <div className="eyebrow">Methodology · الأساس البحثي</div>
        <h2>كيف يقيس المِحَكّ المتانة؟</h2>
        <p className="sub">
          المنصّة تجسيدٌ تطبيقيٌّ للبحث المرفق: تصنيف الكشف إلى عائلات، والهجمات التي
          تكسرها، ومصفوفة المتانة، ونتيجة الاستحالة النظرية. ما يلي يوضّح المنطق والتعريفات.
        </p>
      </div>

      {/* التعريفات */}
      <div className="card" style={{ marginBottom: 18 }}>
        <div className="card-head"><h3>المقاييس الأساسية</h3></div>
        <div className="card-pad stack-sm">
          <div className="def-row">
            <span className="def-term mono">retention (الاحتفاظ)</span>
            <span className="def-body">
              = النسبة بعد الهجوم ÷ النسبة قبله. يمثّل كم احتفظ الكاشف بإشارته. القيمة العليا
              (١) تعني صموداً تاماً، والدنيا (٠) انهياراً كاملاً. <b>هو محور ترتيب لوحة الصدارة.</b>
            </span>
          </div>
          <div className="def-row">
            <span className="def-term mono">held (الصمود)</span>
            <span className="def-body">
              = هل بقيت النسبة بعد الهجوم فوق عتبة قرار الكاشف؟ إن بقيت فالكاشف ما زال يكشف
              النص كآلي رغم الهجوم.
            </span>
          </div>
          <div className="def-row">
            <span className="def-term mono">delta (التغيّر)</span>
            <span className="def-body">
              = النسبة بعد − النسبة قبل. سالبٌ يعني أن الهجوم نجح في خفض ثقة الكاشف.
            </span>
          </div>
        </div>
      </div>

      {/* دورة القياس */}
      <div className="card" style={{ marginBottom: 18 }}>
        <div className="card-head"><h3>دورة القياس</h3></div>
        <div className="card-pad">
          <ol className="flow">
            <li>تُدخِل نصاً مولّداً وتحدّد نوعه (أو يُصنَّف تلقائياً).</li>
            <li>يطبّق المِحَكّ هجوماً عدائياً يراعي قيود نوع النص عبر محرّكك الذكي، أو تحويلاً حتمياً في المتصفّح.</li>
            <li>تنسخ النص المُحوّل وتعيد فحصه بالكاشف نفسه خارج المنصّة.</li>
            <li>تُدخِل النسبة الجديدة، فيحسب المِحَكّ الاحتفاظ والصمود والتغيّر.</li>
            <li>تتراكم النتائج في لوحة الصدارة والمصفوفة، مقسّمةً حسب الكاشف ونوع النص والهجوم.</li>
          </ol>
          <div className="callout" style={{ marginTop: 6 }}>
            <span className="t">لماذا الإدخال اليدوي للنتيجة؟</span> لأن أغلب الفواحص
            (Turnitin خصوصاً) بلا واجهةٍ برمجيةٍ عامة، وبعضها يحجب استدعاء المتصفّح. الصدق
            التقني يقتضي أن تكون أنت الفاحص، والمنصّة أداة القياس والتحليل.
          </div>
        </div>
      </div>

      {/* عائلات الكشف */}
      <div className="card" style={{ marginBottom: 18 }}>
        <div className="card-head"><h3>عائلات الكشف الستّ</h3></div>
        <div className="card-pad">
          <div className="fam-grid">
            {FAMILIES.map((f) => (
              <div key={f} className="fam-cell">
                <div className="row" style={{ gap: 8 }}>
                  <span className="dot" style={{ background: FAMILY_COLOR[f], width: 10, height: 10, borderRadius: '50%' }} />
                  <b>{FAMILY_LABEL[f]}</b>
                </div>
                <p className="hint-inline" style={{ marginTop: 6 }}>{FAMILY_DESC[f]}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* الهجمات */}
      <div className="card" style={{ marginBottom: 18 }}>
        <div className="card-head"><h3>الهجمات المدعومة</h3></div>
        <div className="card-pad stack-sm">
          {ATTACKS.map((a) => (
            <div key={a.id} className="atk-row">
              <div className="row between">
                <b>{a.label}</b>
                <span className="badge mono">
                  {a.kind === 'deterministic' ? 'حتمي' : 'محرك ذكي'} · {a.origin}
                </span>
              </div>
              <p className="hint-inline" style={{ marginTop: 4 }}>{a.description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* نتيجة الاستحالة */}
      <div className="card" style={{ marginBottom: 18 }}>
        <div className="card-head"><h3>الحدّ النظري</h3></div>
        <div className="card-pad">
          <p>
            يبرهن البحث أنه كلما اقترب توزيع النص الآلي من البشري، انهار سقف أداء أي كاشف نحو
            التخمين العشوائي. الحدّ الأعلى للأداء محكومٌ بمسافة التغيّر الكلّي بين التوزيعين:
          </p>
          <div className="formula mono">AUROC ≤ ½ + ½ · TV(𝑀, 𝐻)</div>
          <p className="hint-inline">
            حيث TV مسافة التغيّر الكلّي بين توزيع الآلة 𝑀 والإنسان 𝐻. عملياً: لا كاشف يصمد
            للأبد، والقرار السليم لا يُبنى على كاشفٍ واحد، ويجب الانتباه لتحيّز الكواشف ضد
            كتابة غير الناطقين بالإنجليزية.
          </p>
        </div>
      </div>

      {/* المصادر */}
      <div className="card">
        <div className="card-head"><h3>مصادر مختارة</h3></div>
        <div className="card-pad">
          <ol className="refs">
            {REFERENCES.map((r) => (
              <li key={r.n}>
                <span className="mono ref-n">[{r.n}]</span>{' '}
                {r.url ? (
                  <a href={r.url} target="_blank" rel="noreferrer">{r.cite}</a>
                ) : (
                  r.cite
                )}
              </li>
            ))}
          </ol>
        </div>
      </div>
    </div>
  );
}
