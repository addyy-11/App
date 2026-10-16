import React, { useState, useMemo } from 'react';
import { 
  Droplets, 
  Coffee, 
  Moon, 
  Smile, 
  RotateCcw, 
  Plus, 
  Bell, 
  Eye, 
  Activity, 
  ShieldAlert, 
  Info,
  Check
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { getTodayDateString } from '../../utils/storage';

export const HealthWellness: React.FC = () => {
  const { 
    settings, 
    updateSettings, 
    hydration, 
    logWater, 
    undoLastHydration, 
    getTodayHydrationTotal,
    wellness,
    logWellness,
    getTodayWellness,
    addNotification 
  } = useApp();

  const todayStr = getTodayDateString();
  const todayWellness = getTodayWellness();

  // Hydration state
  const [customMl, setCustomMl] = useState(300);
  const todayTotalWater = getTodayHydrationTotal();
  const dailyGoal = settings.dailyWaterGoalMl || 2000;
  const hydrationPercent = Math.min(100, Math.round((todayTotalWater / dailyGoal) * 100));

  // Today's hydration logs
  const todayLogs = useMemo(() => {
    return hydration.filter(h => h.date === todayStr);
  }, [hydration, todayStr]);

  // Wellness form state
  const [sleepHours, setSleepHours] = useState(todayWellness?.sleepHours || 7.5);
  const [wellbeingRating, setWellbeingRating] = useState(todayWellness?.rating || 4);
  const [wellnessNote, setWellnessNote] = useState(todayWellness?.note || '');
  const [wellnessSavedMessage, setWellnessSavedMessage] = useState(false);

  const handleSaveWellness = (e: React.FormEvent) => {
    e.preventDefault();
    logWellness({
      date: todayStr,
      sleepHours: Number(sleepHours),
      rating: wellbeingRating,
      note: wellnessNote.trim() || undefined,
    });
    setWellnessSavedMessage(true);
    setTimeout(() => setWellnessSavedMessage(false), 2500);
  };

  const handleTestBreakReminder = () => {
    addNotification(
      'Study Break & Eye Rest',
      'Take 30 seconds to look 20 feet away (20-20-20 rule), stretch your shoulders, and stand up.',
      'break'
    );
  };

  const handleTestHydrationReminder = () => {
    addNotification(
      'Hydration Check-in',
      `You're at ${todayTotalWater} ml today. Grab a glass of water to keep your mind energized.`,
      'hydration'
    );
  };

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="pb-3 border-b border-neutral-200 dark:border-neutral-800">
        <h1 className="text-xl font-bold tracking-tight text-neutral-900 dark:text-neutral-100">
          Student Health &amp; Daily Wellness
        </h1>
        <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
          Maintain physical stamina, hydration, eye comfort, and cognitive freshness during intensive academic semesters.
        </p>
      </div>

      {/* Grid: Hydration (Left) & Break / Wellbeing (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Hydration Section (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="p-5 rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 shadow-xs space-y-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Droplets className="w-4 h-4 text-sky-500" />
                <h2 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
                  Daily Hydration Tracker
                </h2>
              </div>
              <div className="flex items-center gap-1.5 text-xs text-neutral-400">
                <span className="font-mono tabular-nums">{todayTotalWater} / {dailyGoal} ml</span>
                <span className="font-mono font-bold text-sky-600 dark:text-sky-400">({hydrationPercent}%)</span>
              </div>
            </div>

            {/* Progress Bar & Water Level */}
            <div className="space-y-2">
              <div className="w-full bg-neutral-100 dark:bg-neutral-800 h-3 rounded-full overflow-hidden p-0.5 border border-neutral-200/60 dark:border-neutral-700/60">
                <div 
                  className="bg-sky-500 h-full rounded-full transition-all duration-300"
                  style={{ width: `${hydrationPercent}%` }}
                />
              </div>
              <div className="flex justify-between text-[11px] text-neutral-400 font-mono">
                <span>0 ml</span>
                <span>{Math.round(dailyGoal / 2)} ml</span>
                <span>Goal: {dailyGoal} ml</span>
              </div>
            </div>

            {/* Quick Add Buttons */}
            <div>
              <label className="block text-xs font-medium text-neutral-600 dark:text-neutral-400 mb-2">
                Quick Log Water
              </label>
              <div className="grid grid-cols-3 gap-3">
                <button
                  onClick={() => logWater(150)}
                  className="p-3 border border-neutral-200 dark:border-neutral-700 hover:border-sky-500 dark:hover:border-sky-500 hover:bg-sky-50/50 dark:hover:bg-sky-950/20 rounded-xl flex flex-col items-center gap-1 transition-all"
                >
                  <Droplets className="w-4 h-4 text-sky-500" />
                  <span className="font-semibold text-xs text-neutral-800 dark:text-neutral-200">+150 ml</span>
                  <span className="text-[10px] text-neutral-400">Espresso / Small Cup</span>
                </button>

                <button
                  onClick={() => logWater(250)}
                  className="p-3 border border-neutral-200 dark:border-neutral-700 hover:border-sky-500 dark:hover:border-sky-500 hover:bg-sky-50/50 dark:hover:bg-sky-950/20 rounded-xl flex flex-col items-center gap-1 transition-all"
                >
                  <Droplets className="w-4 h-4 text-sky-500" />
                  <span className="font-semibold text-xs text-neutral-800 dark:text-neutral-200">+250 ml</span>
                  <span className="text-[10px] text-neutral-400">Glass of Water</span>
                </button>

                <button
                  onClick={() => logWater(500)}
                  className="p-3 border border-neutral-200 dark:border-neutral-700 hover:border-sky-500 dark:hover:border-sky-500 hover:bg-sky-50/50 dark:hover:bg-sky-950/20 rounded-xl flex flex-col items-center gap-1 transition-all"
                >
                  <Droplets className="w-4 h-4 text-sky-500" />
                  <span className="font-semibold text-xs text-neutral-800 dark:text-neutral-200">+500 ml</span>
                  <span className="text-[10px] text-neutral-400">Desk Bottle</span>
                </button>
              </div>
            </div>

            {/* Custom Amount + Undo */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-neutral-100 dark:border-neutral-800">
              <div className="flex items-center gap-2 text-xs">
                <input
                  type="number"
                  step="25"
                  min="50"
                  max="1500"
                  value={customMl}
                  onChange={(e) => setCustomMl(Number(e.target.value))}
                  className="w-24 px-2.5 py-1 bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-md font-mono"
                />
                <span className="text-neutral-400">ml</span>
                <button
                  onClick={() => logWater(customMl)}
                  className="px-3 py-1 bg-sky-600 hover:bg-sky-500 text-white font-medium rounded-md shadow-xs transition-colors"
                >
                  Log
                </button>
              </div>

              {todayLogs.length > 0 && (
                <button
                  onClick={undoLastHydration}
                  className="flex items-center gap-1 text-xs text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200 transition-colors"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Undo last entry</span>
                </button>
              )}
            </div>

            {/* Today's Intake Log */}
            <div>
              <div className="text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-2">
                Today's Recorded Sips ({todayLogs.length})
              </div>
              <div className="max-h-36 overflow-y-auto space-y-1 pr-1 text-xs font-mono">
                {todayLogs.length === 0 ? (
                  <div className="text-neutral-400 py-3 text-center">
                    No water recorded yet today. Click a button above to log your first sip!
                  </div>
                ) : (
                  todayLogs.map(item => (
                    <div 
                      key={item.id} 
                      className="p-2 rounded bg-neutral-50 dark:bg-neutral-800/40 flex items-center justify-between text-neutral-700 dark:text-neutral-300"
                    >
                      <span className="font-semibold text-sky-600 dark:text-sky-400">+{item.amountMl} ml</span>
                      <span className="text-neutral-400 text-[11px]">
                        {new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Disclaimer */}
            <div className="p-3 bg-neutral-50 dark:bg-neutral-800/40 border border-neutral-100 dark:border-neutral-800 rounded-lg flex items-start gap-2 text-[11px] text-neutral-500 leading-relaxed">
              <Info className="w-4 h-4 text-neutral-400 shrink-0 mt-0.5" />
              <span>
                Hydration targets are user preferences for study productivity, not universal medical prescriptions. Adjust based on climate and activity.
              </span>
            </div>
          </div>
        </div>

        {/* Break Reminders & Sleep/Wellbeing (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          {/* Break & Posture Coach */}
          <div className="p-5 rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Coffee className="w-4 h-4 text-amber-500" />
                <h2 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
                  Break &amp; Eye Rest Coach
                </h2>
              </div>
              <input
                type="checkbox"
                checked={settings.breakReminders}
                onChange={(e) => updateSettings({ breakReminders: e.target.checked })}
                className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500"
              />
            </div>

            <p className="text-xs text-neutral-500 dark:text-neutral-400">
              Desk ergonomic nudges to protect your vision, posture, and mental endurance during revision.
            </p>

            <div className="space-y-2.5 text-xs">
              <div className="p-2.5 rounded-lg border border-neutral-100 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-800/40 space-y-1">
                <div className="font-semibold text-neutral-800 dark:text-neutral-200 flex items-center gap-1.5">
                  <Eye className="w-3.5 h-3.5 text-indigo-500" />
                  <span>20-20-20 Eye Rest Rule</span>
                </div>
                <p className="text-[11px] text-neutral-500">
                  Every 20 minutes, look at an object 20 feet away for 20 seconds to relax ocular muscles.
                </p>
              </div>

              <div className="p-2.5 rounded-lg border border-neutral-100 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-800/40 space-y-1">
                <div className="font-semibold text-neutral-800 dark:text-neutral-200 flex items-center gap-1.5">
                  <Activity className="w-3.5 h-3.5 text-emerald-500" />
                  <span>Posture &amp; Spine Decompression</span>
                </div>
                <p className="text-[11px] text-neutral-500">
                  Unclench shoulders, align neck with monitors, and stand up for a 60-second stretch.
                </p>
              </div>
            </div>

            <div className="pt-2 flex items-center justify-between">
              <div className="text-xs text-neutral-400">
                Interval: every {settings.breakIntervalMinutes}m
              </div>
              <button
                onClick={handleTestBreakReminder}
                className="px-2.5 py-1 text-xs border border-neutral-200 dark:border-neutral-700 rounded-md hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-700 dark:text-neutral-300"
              >
                Send Test Alert
              </button>
            </div>
          </div>

          {/* Sleep & Daily Wellbeing Journal */}
          <div className="p-5 rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 shadow-xs space-y-4">
            <div className="flex items-center gap-2">
              <Moon className="w-4 h-4 text-purple-500" />
              <h2 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
                Sleep &amp; Daily Reflection
              </h2>
            </div>

            <p className="text-xs text-neutral-500 dark:text-neutral-400">
              Private local log to monitor recovery and prevent exam burnout.
            </p>

            <form onSubmit={handleSaveWellness} className="space-y-3 text-xs">
              <div>
                <label className="block text-neutral-600 dark:text-neutral-400 font-medium mb-1">
                  Last Night's Sleep: <span className="font-mono font-bold text-neutral-800 dark:text-neutral-200">{sleepHours} hours</span>
                </label>
                <input
                  type="range"
                  min="3"
                  max="12"
                  step="0.5"
                  value={sleepHours}
                  onChange={(e) => setSleepHours(Number(e.target.value))}
                  className="w-full accent-indigo-600"
                />
              </div>

              <div>
                <label className="block text-neutral-600 dark:text-neutral-400 font-medium mb-1">
                  Daily Energy &amp; Focus Rating
                </label>
                <div className="flex items-center gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setWellbeingRating(star)}
                      className={`flex-1 py-1 rounded text-xs font-mono font-semibold transition-colors ${
                        wellbeingRating === star
                          ? 'bg-indigo-600 text-white'
                          : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-200'
                      }`}
                    >
                      {star} {star === 1 ? 'Low' : star === 5 ? 'High' : ''}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-neutral-600 dark:text-neutral-400 font-medium mb-1">
                  Daily Thought / Reflection (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Good morning focus, rested well after evening walk..."
                  value={wellnessNote}
                  onChange={(e) => setWellnessNote(e.target.value)}
                  className="w-full px-3 py-1.5 bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-md text-neutral-800 dark:text-neutral-200"
                />
              </div>

              <div className="flex items-center justify-between pt-1">
                {wellnessSavedMessage && (
                  <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium flex items-center gap-1">
                    <Check className="w-3.5 h-3.5" />
                    <span>Saved locally</span>
                  </span>
                )}
                <button
                  type="submit"
                  className="ml-auto px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white font-medium rounded-md shadow-xs transition-colors"
                >
                  Save Reflection
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};
