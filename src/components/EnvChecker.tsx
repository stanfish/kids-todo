'use client';

export default function EnvChecker() {
  const envVars = {
    'NEXT_PUBLIC_FIREBASE_API_KEY': process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    'NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN': process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    'NEXT_PUBLIC_FIREBASE_PROJECT_ID': process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    'NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET': process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    'NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID': process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    'NEXT_PUBLIC_FIREBASE_APP_ID': process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  };

  const allSet = Object.values(envVars).every(value => value && value !== 'your_api_key_here' && value !== 'your_project_id_here' && value !== 'your_sender_id_here' && value !== 'your_app_id_here');

  return (
    <div className="bg-white rounded-3xl p-6 shadow-2xl border-4 border-white/20 mb-6">
      <h3 className="text-2xl font-bold text-gray-800 mb-4">🔧 Environment Variables Check</h3>
      
      <div className="space-y-2">
        {Object.entries(envVars).map(([key, value]) => {
          const isSet = value && !value.includes('your_') && !value.includes('demo-');
          return (
            <div key={key} className="flex items-center gap-3">
              <span className={`w-3 h-3 rounded-full ${isSet ? 'bg-green-500' : 'bg-red-500'}`}></span>
              <span className="font-mono text-sm">{key}:</span>
              <span className={`text-sm ${isSet ? 'text-green-700' : 'text-red-700'}`}>
                {isSet ? '✅ Set' : '❌ Missing or placeholder'}
              </span>
            </div>
          );
        })}
      </div>
      
      <div className={`mt-4 p-3 rounded-xl ${
        allSet 
          ? 'bg-green-100 border border-green-400 text-green-700' 
          : 'bg-red-100 border border-red-400 text-red-700'
      }`}>
        <p className="font-medium">
          {allSet 
            ? '✅ All environment variables are properly configured!' 
            : '❌ Some environment variables are missing or contain placeholder values. Please check your .env.local file.'
          }
        </p>
      </div>
    </div>
  );
}

