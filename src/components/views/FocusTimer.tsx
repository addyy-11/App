import React, { useState, useEffect, useRef, useMemo } from 'react';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  Coffee, 
  CheckCircle, 
  Clock, 
  Volume2, 
  VolumeX, 
  BookOpen, 
  Sparkles 
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { FocusModeType } from '../../types';
import { getTodayDateString } from '../../utils/storage';
import { soundManager } from '../../utils/audio';

export const FocusTimer: React.FC = () => {
  const { 
    settings, 
    updateSettings, 
    logFocusSession, 
    focusSessions, 
    assignments, 
    exams 
  } = useApp();

  // Presets (in minutes)
  const [studyPresetMinutes, setStudyPresetMinutes] = useState(25);
  const [breakPresetMinutes, setBreakPresetMinutes] = useState(5);
  const [mode, setMode] = useState<'study' | 'break'>('study');
  const [currentType, setCurrentType] = useState<FocusModeType>('pomodoro');
  const [selectedSubject, setSelectedSubject] = useState<string>('General Study');
  const [sessionNotes, setSessionNotes] = useState<string>('');

  // Timestamp-based accurate timer state
  const [isRunning, setIsRunning] = useState(false);
  const [totalSeconds, setTotalSeconds] = useState(25 * 60);
  const [secondsRemaining, setSecondsRemaining] = useState(25 * 60);

  // References for timestamp delta calculation
  const targetEndTimeRef = useRef<number | null>(null);
  const timerIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const sessionStartTimeRef = useRef<string | null>(null);

  // Available subjects from assignments and exams
  const availableSubjects = useMemo(() => {
    const set = new Set<string>(['General Study']);
    assignments.forEach(a => { if (a.subject) set.add(a.subject); });
    exams.forEach(e => { if (e.subject) set.add(e.subject); });
    return Array.from(set);
  }, [assignments, exams]);

  // Handle Preset Selection
  const applyPreset = (studyMins: number, breakMins: number, typeName: FocusModeType) => {
    pauseTimer();
    setStudyPresetMinutes(studyMins);
    setBreakPresetMinutes(breakMins);
    setCurrentType(typeName);
    setMode('study');
    const sec = studyMins * 60;
    setTotalSeconds(sec);
    setSecondsRemaining(sec);
  };

  // Start or resume timer using exact timestamps
  const startTimer = () => {
    if (isRunning) return;

    if (!sessionStartTimeRef.current) {
      sessionStartTimeRef.current = new Date().toISOString();
    }

    const now = Date.now();
    targetEndTimeRef.current = now + secondsRemaining * 1000;
    setIsRunning(true);
  };

  // Pause timer
  const pauseTimer = () => {
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
      timerIntervalRef.current = null;
    }
    if (targetEndTimeRef.current) {
      const remaining = Math.max(0, Math.ceil((targetEndTimeRef.current - Date.now()) / 1000));
      setSecondsRemaining(remaining);
      targetEndTimeRef.current = null;
    }
    setIsRunning(false);
  };

  // Reset timer
  const resetTimer = () => {
    pauseTimer();
    sessionStartTimeRef.current = null;
    const targetMins = mode === 'study' ? studyPresetMinutes : breakPresetMinutes;
    setTotalSeconds(targetMins * 60);
    setSecondsRemaining(targetMins * 60);
  };

  // Timestamp ticker effect
  useEffect(() => {
    if (!isRunning) return;

    timerIntervalRef.current = setInterval(() => {
      if (!targetEndTimeRef.current) return;

      const remainingMs = targetEndTimeRef.current - Date.now();
      const remainingSec = Math.max(0, Math.ceil(remainingMs / 1000));

      setSecondsRemaining(remainingSec);

      if (remainingSec <= 0) {
        // Timer completed!
        clearInterval(timerIntervalRef.current!);
        timerIntervalRef.current = null;
        targetEndTimeRef.current = null;
        setIsRunning(false);

        handleSessionCompletion();
      }
    }, 500);

    return () => {
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
      }
    };
  }, [isRunning, mode, studyPresetMinutes, breakPresetMinutes, selectedSubject, currentType, sessionNotes]);

  // Handle Session End / Switch
  const handleSessionCompletion = () => {
    if (mode === 'study') {
      // Log completed study session
      logFocusSession({
        date: getTodayDateString(),
        startTime: sessionStartTimeRef.current || new Date().toISOString(),
        durationMinutes: studyPresetMinutes,
        type: currentType,
        subject: selectedSubject,
        completed: true,
        notes: sessionNotes.trim() || undefined,
      });

      // Switch to break mode
      setMode('break');
      const breakSec = breakPresetMinutes * 60;
      setTotalSeconds(breakSec);
      setSecondsRemaining(breakSec);
      sessionStartTimeRef.current = null;
    } else {
      // Break finished
      if (settings.soundEnabled) soundManager.playReminderChime(settings.soundVolume);
      setMode('study');
      const studySec = studyPresetMinutes * 60;
      setTotalSeconds(studySec);
      setSecondsRemaining(studySec);
      sessionStartTimeRef.current = null;
    }
  };

  // Format MM:SS
  const minutes = Math.floor(secondsRemaining / 60);
  const seconds = secondsRemaining % 60;
  const timeFormatted = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

  // Circular progress calculation
  const progressPercent = totalSeconds > 0 ? ((totalSeconds - secondsRemaining) / totalSeconds) * 100 : 0;
  const strokeDashoffset = 440 - (440 * progressPercent) / 100;

  // Study summary metrics
  const todayStr = getTodayDateString();
  const todayFocusMinutes = useMemo(() => {
    return focusSessions
      .filter(s => s.date === todayStr && s.completed)
      .reduce((sum, s) => sum + s.durationMinutes, 0);
  }, [focusSessions, todayStr]);

  const weeklyFocusMinutes = useMemo(() => {
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    return focusSessions
      .filter(s => new Date(s.date) >= weekAgo && s.completed)
      .reduce((sum, s) => sum + s.durationMinutes, 0);
  }, [focusSessions]);

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-neutral-200 dark:border-neutral-800">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-neutral-900 dark:text-neutral-100">
            Focus Timer &amp; Study Sessions
          </h1>
          <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
            Timestamp-accurate Pomodoro sessions resilient to window minimization and system sleep.
          </p>
        </div>

        {/* Audio Mute Quick Toggle */}
        <button
          onClick={() => updateSettings({ soundEnabled: !settings.soundEnabled })}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-neutral-200 dark:border-neutral-800 text-xs text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 self-start sm:self-auto"
        >
          {settings.soundEnabled ? (
            <>
              <Volume2 className="w-3.5 h-3.5 text-indigo-500" />
              <span>Chimes On</span>
            </>
          ) : (
            <>
              <VolumeX className="w-3.5 h-3.5 text-neutral-400" />
              <span>Chimes Muted</span>
            </>
          )}
        </button>
      </div>

      {/* Mode & Preset Selection Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        {/* Preset Selector */}
        <div className="flex items-center gap-1 p-1 bg-neutral-100 dark:bg-neutral-900 rounded-lg text-xs">
          <button
            onClick={() => applyPreset(25, 5, 'pomodoro')}
            className={`px-3 py-1 font-medium rounded-md transition-colors ${
              studyPresetMinutes === 25 && currentType === 'pomodoro'
                ? 'bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 shadow-xs'
                : 'text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-300'
            }`}
          >
            25m / 5m Pomodoro
          </button>
          <button
            onClick={() => applyPreset(50, 10, 'deep_work')}
            className={`px-3 py-1 font-medium rounded-md transition-colors ${
              studyPresetMinutes === 50 && currentType === 'deep_work'
                ? 'bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 shadow-xs'
                : 'text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-300'
            }`}
          >
            50m / 10m Deep Work
          </button>
          <button
            onClick={() => applyPreset(90, 15, 'custom')}
            className={`px-3 py-1 font-medium rounded-md transition-colors ${
              studyPresetMinutes === 90 && currentType === 'custom'
                ? 'bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 shadow-xs'
                : 'text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-300'
            }`}
          >
            90m Intensive
          </button>
        </div>

        {/* Current State indicator */}
        <div className="flex items-center gap-2 text-xs font-semibold">
          <span className={mode === 'study' ? 'text-indigo-600 dark:text-indigo-400' : 'text-neutral-400'}>
            Study Block
          </span>
          <span className="text-neutral-300 dark:text-neutral-700">/</span>
          <span className={mode === 'break' ? 'text-emerald-600 dark:text-emerald-400' : 'text-neutral-400'}>
            Rest Break
          </span>
        </div>
      </div>

      {/* Timer Circular Display Card */}
      <div className="p-8 rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 shadow-xs flex flex-col items-center justify-center space-y-6">
        {/* Subject selector tagger */}
        <div className="flex items-center gap-2 text-xs">
          <BookOpen className="w-3.5 h-3.5 text-neutral-400" />
          <span className="text-neutral-400">Subject:</span>
          <select
            value={selectedSubject}
            onChange={(e) => setSelectedSubject(e.target.value)}
            disabled={isRunning}
            className="bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-md px-2.5 py-1 text-xs text-neutral-800 dark:text-neutral-200 focus:outline-hidden"
          >
            {availableSubjects.map(sub => (
              <option key={sub} value={sub}>{sub}</option>
            ))}
          </select>
        </div>

        {/* Circular Display */}
        <div className="relative w-64 h-64 flex items-center justify-center">
          <svg className="w-full h-full -rotate-90" viewBox="0 0 160 160">
            {/* Background ring */}
            <circle
              cx="80"
              cy="80"
              r="70"
              fill="transparent"
              stroke="currentColor"
              strokeWidth="6"
              className="text-neutral-100 dark:text-neutral-800"
            />
            {/* Animated progress ring */}
            <circle
              cx="80"
              cy="80"
              r="70"
              fill="transparent"
              stroke="currentColor"
              strokeWidth="6"
              strokeDasharray="440"
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              className={`transition-all duration-500 ${
                mode === 'study' ? 'text-indigo-600 dark:text-indigo-500' : 'text-emerald-500'
              }`}
            />
          </svg>

          {/* Center Digital Clock */}
          <div className="absolute flex flex-col items-center">
            <span className="text-5xl font-bold font-mono tracking-tighter tabular-nums text-neutral-900 dark:text-neutral-100">
              {timeFormatted}
            </span>
            <span className="text-xs font-medium uppercase tracking-widest text-neutral-400 mt-1">
              {mode === 'study' ? 'Focus Session' : 'Rest Break'}
            </span>
          </div>
        </div>

        {/* Play / Pause / Reset Controls */}
        <div className="flex items-center gap-3">
          <button
            onClick={resetTimer}
            title="Reset Session"
            className="p-2.5 rounded-full border border-neutral-200 dark:border-neutral-700 text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-100 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          {!isRunning ? (
            <button
              onClick={startTimer}
              className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-full shadow-xs flex items-center gap-2 transition-all transform active:scale-95"
            >
              <Play className="w-4 h-4 fill-white" />
              <span>Start Focus</span>
            </button>
          ) : (
            <button
              onClick={pauseTimer}
              className="px-6 py-2.5 bg-neutral-900 dark:bg-neutral-100 text-white dark:text-neutral-900 font-semibold rounded-full shadow-xs flex items-center gap-2 transition-all transform active:scale-95"
            >
              <Pause className="w-4 h-4 fill-current" />
              <span>Pause</span>
            </button>
          )}

          <button
            onClick={() => {
              handleSessionCompletion();
            }}
            title="Skip to next phase"
            className="p-2.5 rounded-full border border-neutral-200 dark:border-neutral-700 text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-100 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
          >
            <Coffee className="w-4 h-4" />
          </button>
        </div>

        {/* Optional notes input */}
        <div className="w-full max-w-sm">
          <input
            type="text"
            placeholder="Focus objective (e.g. Implement Raft heartbeat logic)..."
            value={sessionNotes}
            onChange={(e) => setSessionNotes(e.target.value)}
            className="w-full text-center text-xs px-3 py-1.5 bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-md text-neutral-700 dark:text-neutral-300 focus:outline-hidden"
          />
        </div>
      </div>

      {/* Focus Summary KPIs & Session History */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* KPI Strip */}
        <div className="p-4 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 shadow-xs space-y-3">
          <div className="text-xs font-semibold text-neutral-800 dark:text-neutral-200">
            Focused Time Statistics
          </div>
          <div className="grid grid-cols-2 gap-4 pt-1">
            <div>
              <div className="text-2xl font-bold font-mono tabular-nums text-neutral-900 dark:text-neutral-100">
                {Math.floor(todayFocusMinutes / 60)}h {todayFocusMinutes % 60}m
              </div>
              <div className="text-[11px] text-neutral-400 mt-0.5">Today's Focus</div>
            </div>
            <div>
              <div className="text-2xl font-bold font-mono tabular-nums text-neutral-900 dark:text-neutral-100">
                {Math.floor(weeklyFocusMinutes / 60)}h {weeklyFocusMinutes % 60}m
              </div>
              <div className="text-[11px] text-neutral-400 mt-0.5">Past 7 Days Total</div>
            </div>
          </div>
        </div>

        {/* Recent Session Logs */}
        <div className="p-4 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 shadow-xs space-y-2">
          <div className="text-xs font-semibold text-neutral-800 dark:text-neutral-200">
            Recent Completed Sessions ({focusSessions.length})
          </div>
          <div className="max-h-28 overflow-y-auto divide-y divide-neutral-100 dark:divide-neutral-800 pr-1">
            {focusSessions.length === 0 ? (
              <div className="text-neutral-400 text-xs py-3 text-center">
                No recorded study sessions yet.
              </div>
            ) : (
              focusSessions.slice(0, 5).map(session => (
                <div key={session.id} className="py-1.5 flex items-center justify-between text-xs">
                  <div>
                    <span className="font-medium text-neutral-800 dark:text-neutral-200">
                      {session.subject || 'General Study'}
                    </span>
                    <span className="text-neutral-400 text-[11px] ml-2 font-mono">
                      {session.date}
                    </span>
                  </div>
                  <span className="font-mono text-neutral-600 dark:text-neutral-400 tabular-nums">
                    {session.durationMinutes}m
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
