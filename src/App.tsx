import { useEffect, useMemo, useState } from 'react';
import type { Settings, Experiment } from './types';
import {
  loadSettings,
  saveSettings,
  loadExperiments,
  saveExperiments,
} from './lib/storage';
import { buildLiteraturePriors } from './data/literaturePriors';
import { TopNav, type ViewId } from './components/TopNav';
import { ConsoleView } from './components/console/ConsoleView';
import { LeaderboardView } from './components/leaderboard/LeaderboardView';
import { CorpusView } from './components/corpus/CorpusView';
import { SettingsView } from './components/settings/SettingsView';
import { MethodologyView } from './components/methodology/MethodologyView';

const PRIORS = buildLiteraturePriors();

export default function App() {
  const [view, setView] = useState<ViewId>('console');
  const [settings, setSettings] = useState<Settings>(() => loadSettings());
  const [experiments, setExperiments] = useState<Experiment[]>(() =>
    loadExperiments(),
  );

  useEffect(() => saveSettings(settings), [settings]);
  useEffect(() => saveExperiments(experiments), [experiments]);

  // التجارب المرئية للوحة = تجارب المستخدم + مراجع الأدبيات (إن فُعّلت).
  const visibleExperiments = useMemo<Experiment[]>(
    () =>
      settings.includeLiteraturePriors
        ? [...experiments, ...PRIORS]
        : experiments,
    [experiments, settings.includeLiteraturePriors],
  );

  function addExperiment(e: Experiment) {
    setExperiments((prev) => [e, ...prev]);
    setView('leaderboard');
  }
  function deleteExperiment(id: string) {
    setExperiments((prev) => prev.filter((e) => e.id !== id));
  }
  function importExperiments(imported: Experiment[]) {
    // دمجٌ بلا تكرارٍ حسب المعرّف، مع وسم المصدر كتجربة.
    setExperiments((prev) => {
      const ids = new Set(prev.map((e) => e.id));
      const fresh = imported
        .filter((e) => !ids.has(e.id))
        .map((e) => ({ ...e, source: 'experiment' as const }));
      return [...fresh, ...prev];
    });
  }

  return (
    <div className="app-shell">
      <TopNav view={view} onChange={setView} />
      {view === 'console' && (
        <ConsoleView
          settings={settings}
          onSave={addExperiment}
          onGotoSettings={() => setView('settings')}
        />
      )}
      {view === 'leaderboard' && (
        <LeaderboardView experiments={visibleExperiments} settings={settings} />
      )}
      {view === 'corpus' && (
        <CorpusView
          experiments={experiments}
          onDelete={deleteExperiment}
          onImport={importExperiments}
          onClearAll={() => setExperiments([])}
        />
      )}
      {view === 'methodology' && <MethodologyView />}
      {view === 'settings' && (
        <SettingsView settings={settings} onChange={setSettings} />
      )}
    </div>
  );
}
