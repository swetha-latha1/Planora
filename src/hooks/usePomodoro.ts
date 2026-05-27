'use client';
import { useState, useEffect, useRef, useCallback } from 'react';
import type { PomodoroMode, PomodoroSettings } from '@/types';

const DEFAULTS: PomodoroSettings = {
  workMinutes: 25,
  shortBreakMinutes: 5,
  longBreakMinutes: 15,
  sessionsBeforeLongBreak: 4,
};

export function usePomodoro(settings: PomodoroSettings = DEFAULTS) {
  const [mode, setMode] = useState<PomodoroMode>('work');
  const [secondsLeft, setSecondsLeft] = useState(settings.workMinutes * 60);
  const [running, setRunning] = useState(false);
  const [sessions, setSessions] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const totalSeconds =
    mode === 'work'
      ? settings.workMinutes * 60
      : mode === 'short'
      ? settings.shortBreakMinutes * 60
      : settings.longBreakMinutes * 60;

  const reset = useCallback(
    (m: PomodoroMode = mode) => {
      setRunning(false);
      setMode(m);
      const secs =
        m === 'work'
          ? settings.workMinutes * 60
          : m === 'short'
          ? settings.shortBreakMinutes * 60
          : settings.longBreakMinutes * 60;
      setSecondsLeft(secs);
    },
    [mode, settings]
  );

  useEffect(() => {
    if (running) {
      intervalRef.current = setInterval(() => {
        setSecondsLeft((s) => {
          if (s <= 1) {
            clearInterval(intervalRef.current!);
            setRunning(false);
            if (mode === 'work') {
              const next = sessions + 1;
              setSessions(next);
              reset(next % settings.sessionsBeforeLongBreak === 0 ? 'long' : 'short');
            } else {
              reset('work');
            }
            return 0;
          }
          return s - 1;
        });
      }, 1000);
    } else {
      clearInterval(intervalRef.current!);
    }
    return () => clearInterval(intervalRef.current!);
  }, [running, mode, sessions, reset, settings.sessionsBeforeLongBreak]);

  const minutes = String(Math.floor(secondsLeft / 60)).padStart(2, '0');
  const seconds = String(secondsLeft % 60).padStart(2, '0');
  const progress = 1 - secondsLeft / totalSeconds;

  return { mode, minutes, seconds, running, sessions, progress, setRunning, reset };
}
