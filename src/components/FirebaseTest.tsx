'use client';

import { useState } from 'react';
import { kidsService } from '@/lib/firebaseServices';
import Button from '@/components/ui/Button';

export default function FirebaseTest() {
  const [testResult, setTestResult] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);

  const testFirebaseConnection = async () => {
    setIsLoading(true);
    setTestResult('Testing Firebase connection...');
    
    try {
      // Test reading from Firebase
      const kids = await kidsService.getAllKids();
      setTestResult(`✅ Firebase connection successful! Found ${kids.length} kids in database.`);
    } catch (error) {
      console.error('Firebase test error:', error);
      setTestResult(`❌ Firebase connection failed: ${(error as any)?.message || 'Unknown error'}`);
    } finally {
      setIsLoading(false);
    }
  };

  const testAddKid = async () => {
    setIsLoading(true);
    setTestResult('Testing adding a kid...');
    
    try {
      const kidId = await kidsService.addKid({ 
        name: 'Test Kid',
        avatar: 'boy1' // Adding default avatar as required by the Kid type
      });
      setTestResult(`✅ Successfully added test kid with ID: ${kidId}`);
    } catch (error) {
      console.error('Add kid test error:', error);
      setTestResult(`❌ Failed to add kid: ${(error as any)?.message || 'Unknown error'}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-3xl p-6 shadow-2xl border-4 border-white/20 mb-6">
      <h3 className="text-2xl font-bold text-gray-800 mb-4">🔥 Firebase Connection Test</h3>
      
      <div className="space-y-4">
        <div className="flex gap-3">
          <Button
            variant="fun-blue"
            onClick={testFirebaseConnection}
            isLoading={isLoading}
            disabled={isLoading}
          >
            Test Connection
          </Button>
          
          <Button
            variant="fun-green"
            onClick={testAddKid}
            isLoading={isLoading}
            disabled={isLoading}
          >
            Test Add Kid
          </Button>
        </div>
        
        {testResult && (
          <div className={`p-4 rounded-xl ${
            testResult.includes('✅') 
              ? 'bg-green-100 border border-green-400 text-green-700' 
              : 'bg-red-100 border border-red-400 text-red-700'
          }`}>
            <p className="font-medium">{testResult}</p>
          </div>
        )}
      </div>
    </div>
  );
}

