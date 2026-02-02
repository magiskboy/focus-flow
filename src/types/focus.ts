export type FocusSessionStatus = 'running' | 'paused' | 'completed' | 'interrupted';

export interface FocusSession {
  id: string;
  taskId?: string; // Optional linkage to a task
  startTime: number;
  endTime?: number;
  duration: number; // In seconds
  status: FocusSessionStatus;
  notes?: string;
}
