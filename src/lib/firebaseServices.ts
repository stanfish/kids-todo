import { 
  collection, 
  doc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  getDocs, 
  query, 
  where, 
  orderBy,
  Timestamp,
  deleteField
} from 'firebase/firestore';
import { db, COLLECTIONS } from './firebase';
import { Kid, Task, Achievement } from '@/types';

// Kids Services
export const kidsService = {
  // Get all kids
  async getAllKids(): Promise<Kid[]> {
    try {
      console.log('Fetching kids from Firestore...');
      const kidsRef = collection(db, COLLECTIONS.KIDS);
      const q = query(kidsRef, orderBy('createdAt', 'desc'));
      const querySnapshot = await getDocs(q);
      
      console.log(`Found ${querySnapshot.docs.length} kids in Firestore`);
      
      const kids = querySnapshot.docs.map(doc => {
        const data = doc.data();
        console.log('Raw kid data from Firestore:', { id: doc.id, ...data });
        
        const kid = {
          id: doc.id,
          name: data.name || '',
          avatar: data.avatar || 'neutral1',
          createdAt: data.createdAt?.toDate ? data.createdAt.toDate() : new Date(),
          updatedAt: data.updatedAt?.toDate ? data.updatedAt.toDate() : new Date(),
        };
        
        console.log('Processed kid:', kid);
        return kid as Kid;
      });
      
      return kids;
    } catch (error) {
      console.error('Error getting kids:', error);
      throw error;
    }
  },

  // Add a new kid
  async addKid(kidData: Omit<Kid, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    try {
      console.log('Adding kid with data:', kidData);
      const kidsRef = collection(db, COLLECTIONS.KIDS);
      const now = Timestamp.now();
      const kidToAdd = {
        name: kidData.name,
        avatar: kidData.avatar || 'neutral1',
        createdAt: now,
        updatedAt: now,
      };
      console.log('Kid data being saved to Firestore:', kidToAdd);
      const docRef = await addDoc(kidsRef, kidToAdd);
      console.log('Successfully added kid with ID:', docRef.id);
      return docRef.id;
    } catch (error) {
      console.error('Error adding kid:', error);
      throw error;
    }
  },

  // Update a kid
  async updateKid(kidId: string, updates: Partial<Omit<Kid, 'id' | 'createdAt'>>): Promise<void> {
    try {
      console.log('Updating kid with ID:', kidId);
      console.log('Update data:', updates);
      const kidRef = doc(db, COLLECTIONS.KIDS, kidId);
      const updateData = {
        ...updates,
        updatedAt: Timestamp.now(),
      };
      console.log('Saving to Firestore:', updateData);
      await updateDoc(kidRef, updateData as any);
      console.log('Successfully updated kid in Firestore');
    } catch (error) {
      console.error('Error updating kid:', error);
      throw error;
    }
  },

  // Delete a kid and all their data
  async deleteKid(kidId: string): Promise<void> {
    try {
      // Delete all tasks for this kid
      const tasksRef = collection(db, COLLECTIONS.TASKS);
      const tasksQuery = query(tasksRef, where('kidId', '==', kidId));
      const tasksSnapshot = await getDocs(tasksQuery);
      const deleteTaskPromises = tasksSnapshot.docs.map(doc => deleteDoc(doc.ref));
      await Promise.all(deleteTaskPromises);

      // Delete all achievements for this kid
      const achievementsRef = collection(db, COLLECTIONS.ACHIEVEMENTS);
      const achievementsQuery = query(achievementsRef, where('kidId', '==', kidId));
      const achievementsSnapshot = await getDocs(achievementsQuery);
      const deleteAchievementPromises = achievementsSnapshot.docs.map(doc => deleteDoc(doc.ref));
      await Promise.all(deleteAchievementPromises);

      // Finally, delete the kid
      const kidRef = doc(db, COLLECTIONS.KIDS, kidId);
      await deleteDoc(kidRef);
    } catch (error) {
      console.error('Error deleting kid:', error);
      throw error;
    }
  },
};

// Tasks Services
export const tasksService = {
  // Get tasks for a specific kid and date
  async getTasksByKidAndDate(kidId: string, date: string): Promise<Task[]> {
    try {
      const tasksRef = collection(db, COLLECTIONS.TASKS);
      const q = query(
        tasksRef, 
        where('kidId', '==', kidId),
        where('date', '==', date),
        orderBy('createdAt', 'asc')
      );
      const querySnapshot = await getDocs(q);
      
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate() || new Date(),
        updatedAt: doc.data().updatedAt?.toDate() || new Date(),
        completedAt: doc.data().completedAt?.toDate() || undefined,
      })) as Task[];
    } catch (error) {
      console.error('Error getting tasks:', error);
      throw error;
    }
  },
  // Get undated tasks for a kid (tasks without a due date)
  async getUndatedTasksByKid(kidId: string): Promise<Task[]> {
    try {
      const tasksRef = collection(db, COLLECTIONS.TASKS);
      const q = query(
        tasksRef,
        where('kidId', '==', kidId),
        orderBy('createdAt', 'asc')
      );

      const querySnapshot = await getDocs(q);

      // Filter to only undated tasks (no date field)
      const undatedTasks = querySnapshot.docs
        .map(doc => {
          const data = doc.data();
          return {
            id: doc.id,
            ...data,
            createdAt: data.createdAt?.toDate() || new Date(),
            updatedAt: data.updatedAt?.toDate() || new Date(),
            completedAt: data.completedAt?.toDate() || undefined,
          } as Task;
        })
        .filter(task => !task.date); // Only tasks without a date

      return undatedTasks;
    } catch (error) {
      console.error('Error getting undated tasks:', error);
      throw error;
    }
  },
  // Get all tasks for a kid (for recurring task management)
  async getAllTasksByKid(kidId: string): Promise<Task[]> {
    try {
      const tasksRef = collection(db, COLLECTIONS.TASKS);
      const q = query(
        tasksRef, 
        where('kidId', '==', kidId),
        orderBy('date', 'desc'),
        orderBy('createdAt', 'asc')
      );
      const querySnapshot = await getDocs(q);
      
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate() || new Date(),
        updatedAt: doc.data().updatedAt?.toDate() || new Date(),
        completedAt: doc.data().completedAt?.toDate() || undefined,
      })) as Task[];
    } catch (error) {
      console.error('Error getting all tasks for kid:', error);
      throw error;
    }
  },

  // Add a new task
  async addTask(taskData: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    try {
      const tasksRef = collection(db, COLLECTIONS.TASKS);
      const docRef = await addDoc(tasksRef, {
        ...taskData,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
        completedAt: taskData.completedAt ? Timestamp.fromDate(taskData.completedAt) : null,
      });
      return docRef.id;
    } catch (error) {
      console.error('Error adding task:', error);
      throw error;
    }
  },

  // Update a task
  async updateTask(taskId: string, updates: Partial<Omit<Task, 'id' | 'createdAt'>>): Promise<void> {
    try {
      const taskRef = doc(db, COLLECTIONS.TASKS, taskId);
      const updateData: any = {
        ...updates,
        updatedAt: Timestamp.now(),
      };
      
      // Handle completedAt field
      if ('completedAt' in updates) {
        if (updates.completedAt) {
          // If completedAt is a Date, convert to Firestore Timestamp
          updateData.completedAt = Timestamp.fromDate(updates.completedAt);
        } else {
          // If completedAt is null/undefined, remove the field
          updateData.completedAt = deleteField();
        }
      }
      
      await updateDoc(taskRef, updateData);
    } catch (error) {
      console.error('Error updating task:', error);
      throw error;
    }
  },

  // Delete a single task
  async deleteTask(taskId: string): Promise<void> {
    try {
      const taskRef = doc(db, COLLECTIONS.TASKS, taskId);
      await deleteDoc(taskRef);
    } catch (error) {
      console.error('Error deleting task:', error);
      throw error;
    }
  },

  // Delete all recurring tasks with the same title for a kid
  async deleteAllRecurringTasks(kidId: string, title: string): Promise<void> {
    try {
      const tasksRef = collection(db, COLLECTIONS.TASKS);
      const q = query(
        tasksRef,
        where('kidId', '==', kidId),
        where('title', '==', title),
        where('isRecurring', '==', true)
      );
      const querySnapshot = await getDocs(q);
      
      const deletePromises = querySnapshot.docs.map(doc => deleteDoc(doc.ref));
      await Promise.all(deletePromises);
    } catch (error) {
      console.error('Error deleting recurring tasks:', error);
      throw error;
    }
  },
};

// Achievements Services
export const achievementsService = {
  // Get achievements for a kid
  async getAchievementsByKid(kidId: string): Promise<Achievement[]> {
    try {
      const achievementsRef = collection(db, COLLECTIONS.ACHIEVEMENTS);
      const q = query(
        achievementsRef,
        where('kidId', '==', kidId),
        orderBy('date', 'desc')
      );
      const querySnapshot = await getDocs(q);
      
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        earnedAt: doc.data().earnedAt?.toDate() || new Date(),
      })) as Achievement[];
    } catch (error) {
      console.error('Error getting achievements:', error);
      throw error;
    }
  },

  // Add an achievement
  async addAchievement(achievementData: Omit<Achievement, 'id' | 'earnedAt'>): Promise<string> {
    try {
      const achievementsRef = collection(db, COLLECTIONS.ACHIEVEMENTS);
      const docRef = await addDoc(achievementsRef, {
        ...achievementData,
        earnedAt: Timestamp.now(),
      });
      return docRef.id;
    } catch (error) {
      console.error('Error adding achievement:', error);
      throw error;
    }
  },
};
