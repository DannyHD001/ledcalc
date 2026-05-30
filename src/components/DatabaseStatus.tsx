import { useState, useEffect } from 'react';
import { Cloud, CloudOff } from 'lucide-react';
import { databaseService } from '../services/database';

export function DatabaseStatus() {
  const [isUsingFirestore, setIsUsingFirestore] = useState(false);

  useEffect(() => {
    setIsUsingFirestore(databaseService.isUsingFirestore());
  }, []);

  return (
    <div
      title={isUsingFirestore ? 'Connected to Firestore' : 'Using Local Storage'}
      className={`flex items-center justify-center w-7 h-7 rounded-full ${
        isUsingFirestore ? 'text-green-500' : 'text-red-500'
      }`}
    >
      {isUsingFirestore ? (
        <Cloud className="w-5 h-5" />
      ) : (
        <CloudOff className="w-5 h-5" />
      )}
    </div>
  );
}
