import { useState, useEffect, useCallback } from 'react';
import { tasksService } from '@/lib/firebaseServices';
import { Task } from '@/types';

export const useTasks = (kidId: string, date: string) => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadTasks = useCallback(async () => {
    if (!kidId) {
      setIsLoading(false);
      setTasks([]);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      console.log('Loading tasks for kidId:', kidId, 'date:', date);

      let tasksData: Task[];
      if (date === 'general') {
        // Load general tasks (tasks without due dates)
        tasksData = await tasksService.getUndatedTasksByKid(kidId);
      } else if (date) {
        // Load tasks for a specific date
        tasksData = await tasksService.getTasksByKidAndDate(kidId, date);
      } else {
        // No date provided, return empty array
        tasksData = [];
      }

      console.log('Loaded tasks:', tasksData);
      setTasks(tasksData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load tasks');
      console.error('Error loading tasks:', err);
    } finally {
      setIsLoading(false);
    }
  }, [kidId, date]);

  const addTask = async (taskData: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> => {
    try {
      setError(null);
      const taskId = await tasksService.addTask(taskData);
      await loadTasks(); // Reload the list
      return taskId;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to add task';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  const updateTask = async (taskId: string, updates: Partial<Omit<Task, 'id' | 'createdAt'>>) => {
    try {
      setError(null);
      await tasksService.updateTask(taskId, updates);
      await loadTasks(); // Reload the list
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update task';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  const deleteTask = async (taskId: string) => {
    try {
      setError(null);
      await tasksService.deleteTask(taskId);
      await loadTasks(); // Reload the list
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete task';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  const deleteAllRecurringTasks = async (title: string) => {
    try {
      setError(null);
      await tasksService.deleteAllRecurringTasks(kidId, title);
      await loadTasks(); // Reload the list
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete recurring tasks';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  const toggleTaskCompletion = async (taskId: string, isCompleted: boolean) => {
    try {
      setError(null);
      await tasksService.updateTask(taskId, {
        isCompleted,
        completedAt: isCompleted ? new Date() : undefined,
      });
      await loadTasks(); // Reload the list
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update task';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  useEffect(() => {
    loadTasks();
  }, [loadTasks]);

  return {
    tasks,
    isLoading,
    error,
    addTask,
    updateTask,
    deleteTask,
    deleteAllRecurringTasks,
    toggleTaskCompletion,
    reload: loadTasks,
  };
};

