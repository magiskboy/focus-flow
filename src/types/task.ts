export type TaskStatus = 'todo' | 'in-progress' | 'completed';

export interface Subtask {
  id: string;
  title: string;
  completed: boolean;
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  status: TaskStatus;
  createdAt: number;
  updatedAt: number;
  completedAt?: number;
  dueDate?: number;
  tags?: string[];
  subtasks?: Subtask[];
  // For Pomodoro integration
  estimatedPomodoros?: number;
  completedPomodoros?: number;
  order?: number;
}
