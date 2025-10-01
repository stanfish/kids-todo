import { Task } from '@/types';
import { tasksService } from '@/lib/firebaseServices';

/**
 * Utility functions for managing recurring tasks
 */

/**
 * Get the next date string in YYYY-MM-DD format
 */
export const getNextDateString = (dateString: string): string => {
    const date = new Date(dateString);
    date.setDate(date.getDate() + 1);
    return date.toISOString().split('T')[0];
};

/**
 * Get date string for a specific number of days from now
 */
export const getDateStringFromToday = (daysFromToday: number): string => {
    const date = new Date();
    date.setDate(date.getDate() + daysFromToday);
    return date.toISOString().split('T')[0];
};

/**
 * Check if a date matches the recurring days pattern
 * @param dateString - Date in YYYY-MM-DD format
 * @param recurringDays - Array of day numbers (0=Sunday, 1=Monday, etc.)
 */
export const shouldRecurOnDate = (dateString: string, recurringDays?: number[]): boolean => {
    if (!recurringDays || recurringDays.length === 0) {
        // If no specific days are set, recur daily
        return true;
    }

    const date = new Date(dateString);
    const dayOfWeek = date.getDay(); // 0=Sunday, 1=Monday, etc.
    return recurringDays.includes(dayOfWeek);
};

/**
 * Create recurring task instances for the next 30 days
 * This function should be called when a new recurring task is created
 */
export const createRecurringTaskInstances = async (
    baseTask: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>,
    startDate?: string
): Promise<void> => {
    if (!baseTask.isRecurring) {
        return;
    }

    const today = startDate || new Date().toISOString().split('T')[0];
    const tasksToCreate: Array<Omit<Task, 'id' | 'createdAt' | 'updatedAt'>> = [];

    // Create tasks for the next 30 days
    for (let i = 1; i <= 30; i++) {
        const targetDate = getDateStringFromToday(i);

        // Check if this task should recur on this day
        if (shouldRecurOnDate(targetDate, baseTask.recurringDays)) {
            // Check if a task with the same title already exists for this date
            const existingTasks = await tasksService.getTasksByKidAndDate(baseTask.kidId, targetDate);
            const taskExists = existingTasks.some(task =>
                task.title === baseTask.title && task.isRecurring
            );

            if (!taskExists) {
                tasksToCreate.push({
                    ...baseTask,
                    date: targetDate,
                    isCompleted: false,
                    completedAt: undefined,
                });
            }
        }
    }

    // Create all tasks in batch
    const createPromises = tasksToCreate.map(task => tasksService.addTask(task));
    await Promise.all(createPromises);
};

/**
 * Extend recurring tasks when viewing future dates
 * This ensures that recurring tasks are always available for future dates
 */
export const ensureRecurringTasksExist = async (
    kidId: string,
    targetDate: string
): Promise<void> => {
    const today = new Date().toISOString().split('T')[0];
    const target = new Date(targetDate);
    const todayDate = new Date(today);

    // Only extend for future dates
    if (target <= todayDate) {
        return;
    }

    // Get all recurring tasks for this kid
    const allTasks = await tasksService.getAllTasksByKid(kidId);
    const recurringTasks = allTasks.filter(task => task.isRecurring);

    // Group by title to get unique recurring task templates
    const recurringTaskTemplates = new Map<string, Task>();
    recurringTasks.forEach(task => {
        const existing = recurringTaskTemplates.get(task.title);
        if (!existing || (task.date && existing.date && new Date(task.date) > new Date(existing.date))) {
            recurringTaskTemplates.set(task.title, task);
        }
    });

    // Check if tasks exist for the target date
    const existingTasksForDate = await tasksService.getTasksByKidAndDate(kidId, targetDate);
    const existingTitles = new Set(existingTasksForDate.map(task => task.title));

    const tasksToCreate: Array<Omit<Task, 'id' | 'createdAt' | 'updatedAt'>> = [];

    // Create missing recurring tasks for the target date
    recurringTaskTemplates.forEach(template => {
        if (!existingTitles.has(template.title) &&
            shouldRecurOnDate(targetDate, template.recurringDays)) {
            tasksToCreate.push({
                kidId: template.kidId,
                title: template.title,
                description: template.description,
                isCompleted: false,
                date: targetDate,
                isRecurring: true,
                recurringDays: template.recurringDays,
            });
        }
    });

    // Create the missing tasks
    const createPromises = tasksToCreate.map(task => tasksService.addTask(task));
    await Promise.all(createPromises);
};

/**
 * Clean up old recurring tasks (older than 30 days)
 * This should be called periodically to prevent database bloat
 */
export const cleanupOldRecurringTasks = async (kidId: string): Promise<void> => {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - 30);
    const cutoffDateString = cutoffDate.toISOString().split('T')[0];

    const allTasks = await tasksService.getAllTasksByKid(kidId);
    const oldTasks = allTasks.filter(task =>
        task.isRecurring && task.date && task.date < cutoffDateString
    );

    const deletePromises = oldTasks.map(task => tasksService.deleteTask(task.id));
    await Promise.all(deletePromises);
};