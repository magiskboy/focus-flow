export interface PomodoroSettings {
  workDuration: number; // Minutes
  shortBreakDuration: number; // Minutes
  longBreakDuration: number; // Minutes
  longBreakInterval: number; // Number of pomodoros before long break
  autoStartBreaks: boolean;
  autoStartPomodoros: boolean;
}

export interface ThemeSettings {
  mode: 'light' | 'dark' | 'system';
}

export interface AppSettings {
  pomodoro: PomodoroSettings;
  theme: ThemeSettings;
}

export const DEFAULT_SETTINGS: AppSettings = {
  pomodoro: {
    workDuration: 25,
    shortBreakDuration: 5,
    longBreakDuration: 15,
    longBreakInterval: 4,
    autoStartBreaks: false,
    autoStartPomodoros: false,
  },
  theme: {
    mode: 'system',
  },
};
