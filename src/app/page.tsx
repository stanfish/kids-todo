'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { useRouter } from 'next/navigation';
import { useKids } from '@/hooks/useKids';
import { AddKidForm } from '@/types';
import Button from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';
import { avatars } from '@/constants/avatars';
import ProtectedRoute from '@/components/auth/ProtectedRoute';

function HomeContent() {
  const { 
    kids, 
    isLoading: kidsLoading, 
    error: kidsError, 
    addKid, 
    updateKid,
    deleteKid 
  } = useKids();
  
  const [isAddKidModalOpen, setIsAddKidModalOpen] = useState(false);
  const [isDeleteKidModalOpen, setIsDeleteKidModalOpen] = useState(false);
  const [isEditKidModalOpen, setIsEditKidModalOpen] = useState(false);
  const [deletingKid, setDeletingKid] = useState<any>(null);
  const [editingKid, setEditingKid] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

  const { 
    register, 
    handleSubmit, 
    reset, 
    setValue,
    watch,
    formState: { errors } 
  } = useForm<AddKidForm>({
    defaultValues: {
      avatar: 'boy1' as const
    }
  });
  
  const selectedAvatar = watch('avatar', 'boy1');

  const handleEditKid = (kid: any) => {
    setEditingKid(kid);
    setValue('name', kid.name);
    setValue('avatar', kid.avatar);
    setIsEditKidModalOpen(true);
  };

  const handleDeleteKid = (kid: any) => {
    setDeletingKid(kid);
    setIsDeleteKidModalOpen(true);
  };

  const confirmDeleteKid = async () => {
    if (!deletingKid) return;
    
    setIsLoading(true);
    try {
      await deleteKid(deletingKid.id);
      setIsDeleteKidModalOpen(false);
      setDeletingKid(null);
    } catch (error) {
      console.error('Error deleting kid:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const onSubmit = async (data: AddKidForm) => {
    setIsLoading(true);
    try {
      if (editingKid) {
        await updateKid(editingKid.id, { name: data.name, avatar: data.avatar });
        setIsEditKidModalOpen(false);
        setEditingKid(null);
      } else {
        await addKid({ name: data.name, avatar: data.avatar });
        setIsAddKidModalOpen(false);
      }
      reset();
    } catch (error) {
      console.error('Error saving kid:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKidClick = (kidId: string) => {
    window.location.href = `/kid/general?id=${kidId}`;
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-blue-50 to-purple-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <motion.h1 
            className="text-4xl md:text-6xl font-bold text-gray-900 mb-4"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            👋 Welcome to Kids Todo!
          </motion.h1>
          <motion.p 
            className="text-lg text-gray-600"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            Manage your kids' tasks and achievements in one place
          </motion.p>
        </div>

        {kidsLoading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            <p className="mt-4 text-gray-600">Loading kids...</p>
          </div>
        ) : kidsError ? (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-500" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-700">
                  Error loading kids: {kidsError}
                </p>
              </div>
            </div>
          </div>
        ) : (
          <>
            <motion.div
              className="grid grid-cols-1 tablet:grid-cols-2 gap-6 mb-8"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              {kids.map((kid, index) => (
                <motion.div
                  key={kid.id}
                  className="bg-white rounded-3xl p-8 shadow-2xl hover:shadow-3xl transition-all duration-300 border-4 border-white/20 relative"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: index * 0.1 }}
                  whileHover={{ scale: 1.02, rotateY: 5 }}
                >
                  <div className="absolute top-4 right-4 flex gap-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEditKid(kid);
                      }}
                      className="p-2 text-blue-500 hover:text-blue-700 hover:bg-blue-50 rounded-full transition-colors cursor-pointer"
                      title="Edit kid"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </button>
                    
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteKid(kid);
                      }}
                      className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-full transition-colors cursor-pointer"
                      title="Delete kid"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>

                  <div 
                    className="text-center cursor-pointer"
                    onClick={() => handleKidClick(kid.id)}
                  >
                    <div className="text-6xl mb-4">
                      {avatars.find(a => a.id === kid.avatar)?.emoji || '👤'}
                    </div>
                    <h2 className="text-3xl font-bold text-gray-800 mb-2">{kid.name}</h2>
                    <p className="text-gray-600 font-medium">Click to see tasks</p>
                  </div>
                </motion.div>
              ))}
            </motion.div>

            <motion.div
              className="text-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              <Button
                variant="fun"
                size="xl"
                onClick={() => {
                  const resetForm = () => {
                    reset({ name: '', avatar: 'neutral1' });
                    setEditingKid(null);
                  };
                  resetForm();
                  setIsAddKidModalOpen(true);
                }}
                className="shadow-2xl"
              >
                <span className="text-2xl mr-2">➕</span>
                Add New Kid
              </Button>
            </motion.div>
          </>
        )}
      </div>

      {/* Add Kid Modal */}
      <Modal
        isOpen={isAddKidModalOpen}
        onClose={() => setIsAddKidModalOpen(false)}
        title="Add New Kid"
        size="md"
        footer={
          <div className="flex gap-3">
            <Button
              variant="fun-orange"
              onClick={() => setIsAddKidModalOpen(false)}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              variant="fun-green"
              onClick={handleSubmit(onSubmit)}
              isLoading={isLoading}
            >
              Add Kid
            </Button>
          </div>
        }
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div>
            <label htmlFor="name" className="block text-lg font-semibold text-gray-700 mb-2">
              Kid's Name
            </label>
            <input
              {...register('name', { 
                required: 'Name is required',
                minLength: { value: 2, message: 'Name must be at least 2 characters' }
              })}
              type="text"
              id="name"
              className="w-full px-4 py-3 text-lg border-2 border-gray-300 rounded-xl focus:outline-none focus:border-blue-500 transition-colors"
              placeholder="Enter kid's name"
              disabled={isLoading}
            />
            {errors.name && (
              <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>
            )}
          </div>
          
          <div>
            <label className="block text-lg font-semibold text-gray-700 mb-2">
              Choose an Avatar
            </label>
            <div className="grid grid-cols-3 gap-4">
              {avatars.map((avatar) => (
                <label 
                  key={avatar.id}
                  className={`flex flex-col items-center justify-center p-3 border-2 rounded-xl cursor-pointer transition-all ${
                    selectedAvatar === avatar.id 
                      ? 'border-blue-500 bg-blue-50' 
                      : 'border-gray-200 hover:border-blue-300'
                  }`}
                >
                  <input
                    type="radio"
                    className="sr-only"
                    value={avatar.id}
                    {...register('avatar')}
                  />
                  <span className="text-4xl mb-1">{avatar.emoji}</span>
                  <span className="text-sm text-gray-600">{avatar.label}</span>
                </label>
              ))}
            </div>
            {errors.avatar && (
              <p className="text-red-500 text-sm mt-1">{errors.avatar.message}</p>
            )}
          </div>
        </form>
      </Modal>

      {/* Delete Kid Modal */}
      <Modal
        isOpen={isDeleteKidModalOpen}
        onClose={() => setIsDeleteKidModalOpen(false)}
        title="Delete Kid"
        size="md"
        footer={
          <div className="flex gap-3">
            <Button
              variant="fun-orange"
              onClick={() => setIsDeleteKidModalOpen(false)}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              variant="fun-pink"
              onClick={confirmDeleteKid}
              isLoading={isLoading}
            >
              Delete Kid
            </Button>
          </div>
        }
      >
        <div className="space-y-4">
          <div className="text-center">
            <div className="text-6xl mb-4">😢</div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">
              Delete "{deletingKid?.name}"?
            </h3>
          </div>
          
          <div className="bg-red-50 border border-red-200 rounded-xl p-4">
            <p className="text-red-800 font-medium mb-2">
              ⚠️ Warning: This action cannot be undone!
            </p>
            <ul className="text-red-700 space-y-1 text-sm">
              <li>• All tasks for this kid will be permanently deleted</li>
              <li>• All achievements will be lost</li>
              <li>• This action cannot be reversed</li>
            </ul>
          </div>
          
          <p className="text-gray-600 text-center">
            Are you sure you want to delete <strong>{deletingKid?.name}</strong> and all their data?
          </p>
        </div>
      </Modal>

      {/* Edit Kid Modal */}
      <Modal
        isOpen={isEditKidModalOpen}
        onClose={() => {
          setIsEditKidModalOpen(false);
          setEditingKid(null);
          reset();
        }}
        title="Edit Kid's Profile"
        size="md"
        footer={
          <div className="flex gap-3">
            <Button
              variant="fun-orange"
              onClick={() => {
                setIsEditKidModalOpen(false);
                setEditingKid(null);
                reset();
              }}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              variant="fun-green"
              onClick={handleSubmit(onSubmit)}
              isLoading={isLoading}
            >
              Save Changes
            </Button>
          </div>
        }
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div>
            <label htmlFor="edit-name" className="block text-lg font-semibold text-gray-700 mb-2">
              Kid's Name
            </label>
            <input
              {...register('name', { 
                required: 'Name is required',
                minLength: { value: 2, message: 'Name must be at least 2 characters' }
              })}
              id="edit-name"
              type="text"
              className={`w-full px-4 py-3 text-lg text-black border-2 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 ${
                errors.name ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Enter kid's name"
              disabled={isLoading}
            />
            {errors.name && (
              <p className="mt-1 text-sm text-red-600">{errors.name.message as string}</p>
            )}
          </div>
          
          <div>
            <label className="block text-lg font-semibold text-gray-700 mb-2">
              Choose an Avatar
            </label>
            <div className="grid grid-cols-3 gap-4">
              {avatars.map((avatar) => (
                <label 
                  key={avatar.id}
                  className={`flex flex-col items-center justify-center p-3 border-2 rounded-xl cursor-pointer transition-all ${
                    selectedAvatar === avatar.id 
                      ? 'border-blue-500 bg-blue-50' 
                      : 'border-gray-200 hover:border-blue-300'
                  }`}
                >
                  <input
                    type="radio"
                    className="sr-only"
                    value={avatar.id}
                    {...register('avatar')}
                  />
                  <span className="text-4xl mb-1">{avatar.emoji}</span>
                  <span className="text-sm text-gray-600">{avatar.label}</span>
                </label>
              ))}
            </div>
            {errors.avatar && (
              <p className="text-red-500 text-sm mt-1">{errors.avatar.message}</p>
            )}
          </div>
        </form>
      </Modal>
    </main>
  );
}

export default function Home() {
  return (
    <ProtectedRoute>
      <HomeContent />
    </ProtectedRoute>
  );
}
