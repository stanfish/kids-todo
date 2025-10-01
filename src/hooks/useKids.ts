import { useState, useEffect, useCallback } from 'react';
import { kidsService } from '@/lib/firebaseServices';
import { Kid } from '@/types';

export const useKids = () => {
  const [kids, setKids] = useState<Kid[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadKids = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      console.log('Fetching kids data...');
      const kidsData = await kidsService.getAllKids();
      console.log('Received kids data:', kidsData);
      setKids(kidsData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load kids');
      console.error('Error loading kids:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const addKid = async (kidData: Omit<Kid, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> => {
    try {
      setError(null);
      console.log('Adding new kid:', kidData);
      const kidId = await kidsService.addKid(kidData);
      console.log('Kid added with ID:', kidId);
      await loadKids(); // Reload the list
      return kidId;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to add kid';
      setError(errorMessage);
      console.error('Error adding kid:', err);
      throw new Error(errorMessage);
    }
  };

  const updateKid = async (kidId: string, updates: Partial<Omit<Kid, 'id' | 'createdAt'>>): Promise<void> => {
    try {
      setError(null);
      await kidsService.updateKid(kidId, {
        ...updates,
        updatedAt: new Date(),
      });
      await loadKids(); // Reload the list
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update kid';
      setError(errorMessage);
      console.error('Error updating kid:', err);
      throw new Error(errorMessage);
    }
  };

  const deleteKid = async (kidId: string): Promise<void> => {
    try {
      setError(null);
      await kidsService.deleteKid(kidId);
      await loadKids(); // Reload the list
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete kid';
      setError(errorMessage);
      console.error('Error deleting kid:', err);
      throw new Error(errorMessage);
    }
  };

  useEffect(() => {
    loadKids();
  }, [loadKids]);

  return {
    kids,
    isLoading,
    error,
    addKid,
    updateKid,
    deleteKid,
    refreshKids: loadKids,
  };
};
