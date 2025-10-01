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

function KidTaskPageContent() {
  const searchParams = useSearchParams()!; // Non-null assertion as this will be available in the browser
  const router = useRouter();
  const kidId = searchParams?.get('id') || '';
  
  const [kid, setKid] = useState<any>(null);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [isAddTaskModalOpen, setIsAddTaskModalOpen] = useState(false);
  const [isEditTaskModalOpen, setIsEditTaskModalOpen] = useState(false);
  const [isDeleteTaskModalOpen, setIsDeleteTaskModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [deletingTask, setDeletingTask] = useState<Task | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Use Firebase hooks
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
  } = useTasks(kidId, selectedDate);

  // Ensure recurring tasks exist when date changes
  useEffect(() => {
    const ensureRecurringTasks = async () => {
      if (kidId && selectedDate && kid) {
        try {
          console.log('Ensuring recurring tasks exist for:', kidId, selectedDate);
          await ensureRecurringTasksExist(kidId, selectedDate);
          // Note: We don't call reloadTasks here to avoid infinite loop
          // The useTasks hook will automatically reload when kidId/selectedDate changes
        } catch (error) {
          console.error('Error ensuring recurring tasks exist:', error);
        }
      }
    };

    ensureRecurringTasks();
  }, [kidId, selectedDate, kid]);

  const { register: registerAdd, handleSubmit: handleSubmitAdd, reset: resetAdd, formState: { errors: errorsAdd } } = useForm<AddTaskForm>();
  const { register: registerEdit, handleSubmit: handleSubmitEdit, reset: resetEdit, formState: { errors: errorsEdit } } = useForm<EditTaskForm>();

  const today = new Date().toISOString().split('T')[0];
  const isToday = selectedDate === today;
  const allTasksCompleted = tasks.length > 0 && tasks.every(task => task.isCompleted);

  // Load kid data
  useEffect(() => {
    const loadKid = async () => {
      console.log('Loading kid with ID:', kidId);
      
      if (!kidId) {
        console.log('No kidId provided, redirecting to home');
        router.push('/');
        return;
      }

      try {
        console.log('Fetching all kids...');
        const kids = await kidsService.getAllKids();
        console.log('Found kids:', kids);
        
        const currentKid = kids.find(k => k.id === kidId);
        if (currentKid) {
          console.log('Found current kid:', currentKid);
          setKid(currentKid);
        } else {
          console.log('Kid not found, redirecting to home');
          // Kid not found, redirect back
          router.push('/');
        }
      } catch (error) {
        console.error('Error loading kid:', error);
        router.push('/');
      }
    };

    if (kidId !== undefined) {
      loadKid();
    }
  }, [kidId, router]);


  const formatDate = (dateString: string) => {
    const [year, month, day] = dateString.split('-').map(Number);
    const date = new Date(year, month - 1, day); // <-- local midnight
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const handleTaskToggle = async (taskId: string) => {
    try {
      const task = tasks.find(t => t.id === taskId);
      if (task) {
        await toggleTaskCompletion(taskId, !task.isCompleted);
      }
    } catch (error) {
      console.error('Error toggling task:', error);
    }
  };

  const handleEditTask = (task: Task) => {
    setEditingTask(task);
    resetEdit({ title: task.title, description: task.description || '' });
    setIsEditTaskModalOpen(true);
  };

  const handleDeleteTask = (task: Task) => {
    setDeletingTask(task);
    setIsDeleteTaskModalOpen(true);
  };

  const confirmDeleteTask = async (deleteAllRecurring: boolean = false) => {
    if (!deletingTask) return;
    
    setIsLoading(true);
    try {
      if (deleteAllRecurring && deletingTask.isRecurring) {
        // Delete all recurring tasks with the same title for this kid
        await deleteAllRecurringTasks(deletingTask.title);
      } else {
        // Delete only this specific task
        await deleteTask(deletingTask.id);
      }
      
      setIsDeleteTaskModalOpen(false);
      setDeletingTask(null);
    } catch (error) {
      console.error('Error deleting task:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const onSubmitAdd = async (data: AddTaskForm) => {
    setIsLoading(true);
    try {
      const taskData = {
        kidId,
        title: data.title,
        description: data.description,
        isCompleted: false,
        date: selectedDate,
        isRecurring: data.isRecurring,
        recurringDays: data.recurringDays || [],
      };

      // Add the task for the current date
      await addTask(taskData);
      
      // If it's a recurring task, create instances for future dates
      if (data.isRecurring) {
        await createRecurringTaskInstances(taskData, selectedDate);
      }
      
      setIsAddTaskModalOpen(false);
      resetAdd();
    } catch (error) {
      console.error('Error adding task:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const onSubmitEdit = async (data: EditTaskForm) => {
    if (!editingTask) return;
    
    setIsLoading(true);
    try {
      await updateTask(editingTask.id, data);
      
      setIsEditTaskModalOpen(false);
      setEditingTask(null);
      resetEdit();
    } catch (error) {
      console.error('Error editing task:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Show loading state while kid data is loading
  if (!kidId) {
    return (
      <div className="min-h-screen p-6 tablet:p-8 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-500 text-lg">No kid ID provided. Redirecting...</p>
        </div>
      </div>
    );
  }

  if (!kid) {
    return (
      <div className="min-h-screen p-6 tablet:p-8 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-700 text-lg">Loading kid data...</p>
          <p className="text-gray-500 text-sm mt-2">Kid ID: {kidId}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6 tablet:p-8">
      <div className="max-w-4xl mx-auto">
        {/* Error Message */}
        {tasksError && (
          <motion.div
            className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-xl mb-6"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <p className="font-medium">Error: {tasksError}</p>
          </motion.div>
        )}

        {/* Header */}
        <motion.div
          className="bg-white rounded-3xl p-6 mb-6 shadow-2xl border-4 border-white/20"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="flex items-center justify-between mb-4">
            <Button
              variant="fun-blue"
              size="md"
              onClick={() => router.push('/')}
            >
              ← Back to Kids
            </Button>
            <div className="text-center">
              <div className="flex flex-col items-center">
                <div className="text-6xl mb-2">
                  {getAvatarEmoji(kid.avatar)}
                </div>
                <h1 className="text-3xl tablet:text-4xl font-bold text-gray-800">
                  {kid.name}'s Tasks
                </h1>
              </div>
              <p className="text-2xl text-gray-600">
                {formatDate(selectedDate)}
              </p>
            </div>
            <div className="w-24 flex items-center">
              <Button
                variant="fun-purple"
                size="sm"
                onClick={() => router.push(`/kid/general?id=${kidId}`)}
                className="text-sm"
              >
                📝 General
              </Button>
            </div>
          </div>

          {/* Date Navigation */}
          <div className="flex items-center justify-center gap-4">
            <Button
              variant="fun-orange"
              size="sm"
              onClick={() => {
                const date = new Date(selectedDate);
                date.setDate(date.getDate() - 1);
                setSelectedDate(date.toISOString().split('T')[0]);
              }}
            >
              ← Previous
            </Button>
            
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="px-4 py-2 text-lg border-2 border-gray-300 rounded-xl focus:border-blue-500 focus:outline-none text-gray-800"
            />
            
            <Button
              variant="fun-purple"
              size="sm"
              onClick={() => {
                const date = new Date(selectedDate);
                date.setDate(date.getDate() + 1);
                setSelectedDate(date.toISOString().split('T')[0]);
              }}
            >
              Next →
            </Button>
            
            {!isToday && (
              <Button
                variant="fun-yellow"
                size="sm"
                onClick={() => setSelectedDate(today)}
              >
                Today
              </Button>
            )}
          </div>
        </motion.div>

        {/* Achievement Badge */}
        {allTasksCompleted && (
          <motion.div
            className="bg-gradient-to-r from-yellow-400 via-orange-500 to-pink-500 text-white rounded-3xl p-6 mb-6 text-center shadow-2xl border-4 border-white/30"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
          >
            <div className="text-6xl mb-2">🏆</div>
            <h2 className="text-2xl font-bold drop-shadow-lg">Excellent Work!</h2>
            <p className="text-lg drop-shadow-md">All tasks completed for {formatDate(selectedDate)}</p>
          </motion.div>
        )}

        {/* Tasks List */}
        <motion.div
          className="space-y-4 mb-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          {tasksLoading ? (
            <div className="bg-white rounded-3xl p-8 text-center shadow-2xl border-4 border-white/20">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
              <p className="text-gray-600 font-medium">Loading tasks...</p>
            </div>
          ) : tasks.length === 0 ? (
            <div className="bg-white rounded-3xl p-8 text-center shadow-2xl border-4 border-white/20">
              <div className="text-6xl mb-4">📝</div>
              <h3 className="text-2xl font-bold text-gray-800 mb-2">No tasks yet</h3>
              <p className="text-gray-600 font-medium">Add your first task to get started!</p>
            </div>
          ) : (
            tasks.map((task, index) => (
              <motion.div
                key={task.id}
                className="bg-white rounded-3xl p-6 shadow-2xl border-4 border-white/20"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
              >
                <div className="flex items-center gap-4">
                  <Checkbox
                    checked={task.isCompleted}
                    onChange={() => handleTaskToggle(task.id)}
                    size={24}
                    color="success"
                  />
                  <div 
                    className="flex-1 cursor-pointer"
                    onClick={() => handleTaskToggle(task.id)}
                  >
                    <h3 className={`text-xl font-semibold ${task.isCompleted ? 'line-through text-gray-500' : 'text-gray-800'}`}>
                      {task.title}
                      {task.isRecurring && (
                        <span className="ml-2 text-sm bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                          🔄 Daily
                        </span>
                      )}
                    </h3>
                    {task.description && (
                      <p className={`text-gray-600 ${task.isCompleted ? 'line-through' : ''}`}>
                        {task.description}
                      </p>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEditTask(task);
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
                        handleDeleteTask(task);
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
            ))
          )}
        </motion.div>

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
          title="Add New Task"
          size="lg"
          footer={
            <div className="flex gap-3">
              <Button
                variant="fun-orange"
                onClick={() => setIsAddTaskModalOpen(false)}
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button
                variant="fun-green"
                onClick={handleSubmitAdd(onSubmitAdd)}
                isLoading={isLoading}
              >
                Add Task
              </Button>
            </div>
          }
        >
          <form onSubmit={handleSubmitAdd(onSubmitAdd)} className="space-y-6">
            <div>
              <label htmlFor="title" className="block text-lg font-semibold text-gray-700 mb-2">
                Task Title
              </label>
              <input
                {...registerAdd('title', { required: 'Title is required' })}
                type="text"
                id="title"
                className="w-full px-4 py-3 text-lg border-2 border-gray-300 rounded-xl focus:border-blue-500 focus:outline-none transition-colors text-gray-800"
                placeholder="What needs to be done?"
              />
              {errorsAdd.title && (
                <p className="text-red-500 text-sm mt-1">{errorsAdd.title.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="description" className="block text-lg font-semibold text-gray-700 mb-2">
                Description (Optional)
              </label>
              <textarea
                {...registerAdd('description')}
                id="description"
                rows={3}
                className="w-full px-4 py-3 text-lg border-2 border-gray-300 rounded-xl focus:border-blue-500 focus:outline-none transition-colors text-gray-800"
                placeholder="Add more details..."
              />
            </div>

            <div>
              <label className="flex items-center gap-3">
                <input
                  {...registerAdd('isRecurring')}
                  type="checkbox"
                  className="w-5 h-5 text-blue-500 rounded focus:ring-blue-500"
                />
                <span className="text-lg font-semibold text-gray-700">
                  Make this a recurring daily task
                </span>
              </label>
            </div>
          </form>
        </Modal>

        {/* Edit Task Modal */}
        <Modal
          isOpen={isEditTaskModalOpen}
          onClose={() => setIsEditTaskModalOpen(false)}
          title="Edit Task"
          size="md"
          footer={
            <div className="flex gap-3">
              <Button
                variant="fun-orange"
                onClick={() => setIsEditTaskModalOpen(false)}
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button
                variant="fun-green"
                onClick={handleSubmitEdit(onSubmitEdit)}
                isLoading={isLoading}
              >
                Save Changes
              </Button>
            </div>
          }
        >
          <form onSubmit={handleSubmitEdit(onSubmitEdit)} className="space-y-6">
            <div>
              <label htmlFor="edit-title" className="block text-lg font-semibold text-gray-700 mb-2">
                Task Title
              </label>
              <input
                {...registerEdit('title', { required: 'Title is required' })}
                type="text"
                id="edit-title"
                className="w-full px-4 py-3 text-lg border-2 border-gray-300 rounded-xl focus:border-blue-500 focus:outline-none transition-colors text-gray-800"
              />
              {errorsEdit.title && (
                <p className="text-red-500 text-sm mt-1">{errorsEdit.title.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="edit-description" className="block text-lg font-semibold text-gray-700 mb-2">
                Description
              </label>
              <textarea
                {...registerEdit('description')}
                id="edit-description"
                rows={3}
                className="w-full px-4 py-3 text-lg border-2 border-gray-300 rounded-xl focus:border-blue-500 focus:outline-none transition-colors text-gray-800"
              />
            </div>
          </form>
        </Modal>

        {/* Delete Task Modal */}
        <Modal
          isOpen={isDeleteTaskModalOpen}
          onClose={() => setIsDeleteTaskModalOpen(false)}
          title="Delete Task"
          size="md"
          footer={
            <div className="flex gap-3">
              <Button
                variant="fun-orange"
                onClick={() => setIsDeleteTaskModalOpen(false)}
                disabled={isLoading}
              >
                Cancel
              </Button>
              {deletingTask?.isRecurring && (
                <Button
                  variant="fun-yellow"
                  onClick={() => confirmDeleteTask(false)}
                  isLoading={isLoading}
                >
                  Delete This Task Only
                </Button>
              )}
              <Button
                variant="fun-pink"
                onClick={() => confirmDeleteTask(deletingTask?.isRecurring || false)}
                isLoading={isLoading}
              >
                {deletingTask?.isRecurring ? 'Delete All Recurring Tasks' : 'Delete Task'}
              </Button>
            </div>
          }
        >
          <div className="space-y-4">
            <div className="text-center">
              <div className="text-6xl mb-4">🗑️</div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">
                Delete "{deletingTask?.title}"?
              </h3>
            </div>
            
            {deletingTask?.isRecurring ? (
              <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
                <p className="text-yellow-800 font-medium mb-2">
                  This is a recurring daily task. What would you like to delete?
                </p>
                <ul className="text-yellow-700 space-y-1">
                  <li>• <strong>Delete This Task Only:</strong> Remove just this one task for today</li>
                  <li>• <strong>Delete All Recurring Tasks:</strong> Remove this task from all days</li>
                </ul>
              </div>
            ) : (
              <p className="text-gray-600 text-center">
                This task will be permanently deleted. This action cannot be undone.
              </p>
            )}
          </div>
        </Modal>
      </div>
    </div>
  );
}

function KidTaskPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen p-6 tablet:p-8 flex items-center justify-center bg-gradient-to-b from-blue-50 to-purple-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-700 text-lg">Loading page...</p>
        </div>
      </div>
    }>
      <KidTaskPageContent />
    </Suspense>
  );
}

export default function ProtectedKidTaskPage() {
  return (
    <ProtectedRoute>
      <KidTaskPage />
    </ProtectedRoute>
  );
}