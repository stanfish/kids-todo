'use client';

import React, { useState, useEffect, Suspense } from 'react';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import { useSearchParams, useRouter } from 'next/navigation';
import { avatars, getAvatarEmoji } from '@/constants/avatars';
import { motion } from 'framer-motion';
import Button from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';
import { Checkbox } from '@/components/ui/Checkbox';
import { useForm } from 'react-hook-form';
import { AddTaskForm, EditTaskForm, Task } from '@/types';
import { useTasks } from '@/hooks/useTasks';
import { kidsService } from '@/lib/firebaseServices';
import { createRecurringTaskInstances, ensureRecurringTasksExist } from '@/utils/recurringTasks';

function UndatedTasksPageContent() {
  const searchParams = useSearchParams()!;
  const router = useRouter();
  const kidId = searchParams?.get('id') || '';

  const [kid, setKid] = useState<any>(null);
  const [isAddTaskModalOpen, setIsAddTaskModalOpen] = useState(false);
  const [isEditTaskModalOpen, setIsEditTaskModalOpen] = useState(false);
  const [isDeleteTaskModalOpen, setIsDeleteTaskModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [deletingTask, setDeletingTask] = useState<Task | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Use Firebase hooks - for general tasks, we don't need a date parameter
  const {
    tasks,
    isLoading: tasksLoading,
    error: tasksError,
    addTask,
    updateTask,
    deleteTask,
    deleteAllRecurringTasks,
    toggleTaskCompletion,
    reload: reloadTasks
  } = useTasks(kidId, 'general'); // Using 'general' as a special identifier

  // Load kid data
  useEffect(() => {
    const loadKid = async () => {
      if (kidId) {
        try {
          const kids = await kidsService.getAllKids();
          const currentKid = kids.find(k => k.id === kidId);
          setKid(currentKid || null);
        } catch (error) {
          console.error('Error loading kid:', error);
        }
      }
    };

    loadKid();
  }, [kidId]);

  // Ensure recurring tasks exist when component mounts
  useEffect(() => {
    const ensureRecurringTasks = async () => {
      if (kidId && kid) {
        try {
          console.log('Ensuring recurring tasks exist for:', kidId);
          await ensureRecurringTasksExist(kidId, 'general');
        } catch (error) {
          console.error('Error ensuring recurring tasks exist:', error);
        }
      }
    };

    ensureRecurringTasks();
  }, [kidId, kid]);

  const handleAddTask = async (taskData: AddTaskForm) => {
    try {
      setIsLoading(true);
      await addTask({
        ...taskData,
        kidId,
        isCompleted: false,
        date: null, // Explicitly set to null for general tasks
      });
      setIsAddTaskModalOpen(false);
    } catch (error) {
      console.error('Error adding task:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditTask = async (taskData: EditTaskForm) => {
    if (!editingTask) return;

    try {
      setIsLoading(true);
      await updateTask(editingTask.id, taskData);
      setIsEditTaskModalOpen(false);
      setEditingTask(null);
    } catch (error) {
      console.error('Error updating task:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteTask = async () => {
    if (!deletingTask) return;

    try {
      setIsLoading(true);
      await deleteTask(deletingTask.id);
      setIsDeleteTaskModalOpen(false);
      setDeletingTask(null);
    } catch (error) {
      console.error('Error deleting task:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleCompletion = async (task: Task) => {
    try {
      await toggleTaskCompletion(task.id, !task.isCompleted);
    } catch (error) {
      console.error('Error toggling task completion:', error);
    }
  };

  const handleDeleteRecurringTasks = async (title: string) => {
    try {
      setIsLoading(true);
      await deleteAllRecurringTasks(title);
    } catch (error) {
      console.error('Error deleting recurring tasks:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const openEditModal = (task: Task) => {
    setEditingTask(task);
    setIsEditTaskModalOpen(true);
  };

  const openDeleteModal = (task: Task) => {
    setDeletingTask(task);
    setIsDeleteTaskModalOpen(true);
  };

  const navigateToDailyTodos = () => {
    router.push(`/kid?id=${kidId}`);
  };

  if (!kid) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading kid information...</p>
        </div>
      </div>
    );
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        {/* Header */}
        <div className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* Desktop/Tablet Layout */}
            <div className="hidden sm:flex justify-between items-center py-4 pr-24">
              <div className="flex items-center space-x-2 sm:space-x-4 min-w-0 flex-1">
                <Button
                  variant="fun"
                  size="sm"
                  onClick={() => router.push('/')}
                  className="flex items-center space-x-2 flex-shrink-0"
                >
                  <span>← </span>Back
                </Button>
                <div className="flex items-center space-x-2 sm:space-x-3 min-w-0">
                  <div className="text-2xl sm:text-3xl flex-shrink-0">
                    {getAvatarEmoji(kid.avatar)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <h1 className="text-lg sm:text-2xl font-bold text-gray-900 truncate">
                      {kid.name}
                    </h1>
                    <p className="text-sm sm:text-base text-gray-600 truncate">
                      General Tasks
                    </p>
                  </div>
                </div>
              </div>
              <div className="flex items-center space-x-2 flex-shrink-0">
                <Button
                  variant="fun"
                  size="sm"
                  onClick={navigateToDailyTodos}
                  className="flex items-center space-x-1 sm:space-x-2 whitespace-nowrap"
                >
                  <span className="text-sm sm:text-base">📅</span>
                  <span>Daily Todos</span>
                </Button>
              </div>
            </div>

            {/* Mobile Layout */}
            <div className="sm:hidden py-4 pr-20">
              <div className="flex flex-col space-y-3">
                {/* Top row - Back button and title */}
                <div className="flex items-center justify-between pr-16">
                  <Button
                    variant="fun"
                    size="sm"
                    onClick={() => router.push('/')}
                    className="flex items-center space-x-2"
                  >
                    <span>← </span>Back
                  </Button>
                  <Button
                    variant="fun"
                    size="sm"
                    onClick={navigateToDailyTodos}
                    className="flex items-center space-x-1"
                  >
                    <span>📅</span>
                    <span>Daily</span>
                  </Button>
                </div>

                {/* Bottom row - Avatar and info */}
                <div className="flex items-center space-x-3">
                  <div className="text-3xl flex-shrink-0">
                    {getAvatarEmoji(kid.avatar)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <h1 className="text-xl font-bold text-gray-900 truncate">
                      {kid.name}
                    </h1>
                    <p className="text-sm text-gray-600 truncate">
                      General Tasks
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {tasksError && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md">
              <p className="text-red-600">{tasksError}</p>
            </div>
          )}

          {tasksLoading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            </div>
          ) : tasks.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">📝</div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No general tasks yet</h3>
              <p className="text-gray-600 mb-6">
                Tasks without due dates will appear here. Add your first general task to get started!
              </p>
              <Button
                variant="fun-green"
                onClick={() => setIsAddTaskModalOpen(true)}
              >
                Add Your First Task
              </Button>
            </div>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="space-y-4"
            >
              {tasks.map((task, index) => (
                <motion.div
                  key={task.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                  className={`bg-white rounded-lg shadow-sm border p-4 hover:shadow-md transition-shadow cursor-pointer ${
                    task.isCompleted ? 'opacity-75' : ''
                  }`}
                  onClick={() => handleToggleCompletion(task)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <Checkbox
                        checked={task.isCompleted}
                        onChange={() => handleToggleCompletion(task)}
                      />
                      <div className="flex-1">
                        <h3 className={`font-medium ${task.isCompleted ? 'line-through text-gray-500' : 'text-gray-900'}`}>
                          {task.title}
                        </h3>
                        {task.description && (
                          <p className={`text-sm mt-1 ${task.isCompleted ? 'line-through text-gray-400' : 'text-gray-600'}`}>
                            {task.description}
                          </p>
                        )}
                        <div className="flex items-center space-x-4 mt-2">
                          {/* General tasks don't show points, category, or recurring badges */}
                        </div>
                      </div>
                    </div>
                  <div className="flex gap-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        openEditModal(task);
                      }}
                      className="p-2 text-blue-500 hover:text-blue-700 hover:bg-blue-50 rounded-full transition-colors cursor-pointer"
                      title="Edit task"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        openDeleteModal(task);
                      }}
                      className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-full transition-colors cursor-pointer"
                      title="Delete task"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          )}
        </div>

        {/* Add Task Button */}
        <motion.div
          className="text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <Button
            variant="fun-green"
            size="xl"
            onClick={() => setIsAddTaskModalOpen(true)}
            className="shadow-2xl"
          >
            <span className="text-2xl mr-2">➕</span>
            Add New Task
          </Button>
        </motion.div>

        {/* Add Task Modal */}
        <Modal
          isOpen={isAddTaskModalOpen}
          onClose={() => setIsAddTaskModalOpen(false)}
          title="Add General Task"
        >
          <form onSubmit={(e) => {
            e.preventDefault();
            const formData = new FormData(e.currentTarget);
            const taskData: AddTaskForm = {
              title: formData.get('title') as string,
              description: formData.get('description') as string,
              isRecurring: false, // Set to false for general tasks
              targetKids: [kidId], // Add the current kid ID to targetKids array
            };
            handleAddTask(taskData);
          }}>
            <div className="space-y-4">
              <div>
                <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                  Task Title *
                </label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
                  placeholder="Enter task title"
                />
              </div>
              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  id="description"
                  name="description"
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
                  placeholder="Enter task description (optional)"
                />
              </div>
            </div>
            <div className="flex justify-end space-x-3 mt-6">
              <Button
                type="button"
                variant="fun"
                onClick={() => setIsAddTaskModalOpen(false)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="fun-green"
                disabled={isLoading}
              >
                {isLoading ? 'Adding...' : 'Add Task'}
              </Button>
            </div>
          </form>
        </Modal>

        {/* Edit Task Modal */}
        <Modal
          isOpen={isEditTaskModalOpen}
          onClose={() => setIsEditTaskModalOpen(false)}
          title="Edit Task"
        >
          {editingTask && (
            <form onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.currentTarget);
              const taskData: EditTaskForm = {
                title: formData.get('title') as string,
                description: formData.get('description') as string,
              };
              handleEditTask(taskData);
            }}>
              <div className="space-y-4">
                <div>
                  <label htmlFor="editTitle" className="block text-sm font-medium text-gray-700 mb-1">
                    Task Title *
                  </label>
                  <input
                    type="text"
                    id="editTitle"
                    name="title"
                    required
                    defaultValue={editingTask.title}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:fun-none focus:ring-2 focus:ring-blue-500 text-black"
                  />
                </div>
                <div>
                  <label htmlFor="editDescription" className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <textarea
                    id="editDescription"
                    name="description"
                    rows={3}
                    defaultValue={editingTask.description || ''}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:fun-none focus:ring-2 focus:ring-blue-500 text-black"
                  />
                </div>
              </div>
              <div className="flex justify-end space-x-3 mt-6">
                <Button
                  type="button"
                  variant="fun"
                  onClick={() => setIsEditTaskModalOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="fun-green"
                  disabled={isLoading}
                >
                  {isLoading ? 'Updating...' : 'Update Task'}
                </Button>
              </div>
            </form>
          )}
        </Modal>

        {/* Delete Task Modal */}
        <Modal
          isOpen={isDeleteTaskModalOpen}
          onClose={() => setIsDeleteTaskModalOpen(false)}
          title="Delete Task"
        >
          {deletingTask && (
            <div>
              <p className="text-gray-700 mb-4">
                Are you sure you want to delete the task "{deletingTask.title}"?
                {deletingTask.isRecurring && (
                  <span className="block text-sm text-amber-600 mt-2">
                    This is a recurring task. Deleting it will remove all instances.
                  </span>
                )}
              </p>
              <div className="flex justify-end space-x-3">
                <Button
                  variant="fun"
                  onClick={() => setIsDeleteTaskModalOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  variant="fun-pink"
                  onClick={handleDeleteTask}
                  disabled={isLoading}
                >
                  {isLoading ? 'Deleting...' : 'Delete'}
                </Button>
              </div>
            </div>
          )}
        </Modal>
      </div>
    </ProtectedRoute>
  );
}

export default function UndatedTasksPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    }>
      <UndatedTasksPageContent />
    </Suspense>
  );
}
