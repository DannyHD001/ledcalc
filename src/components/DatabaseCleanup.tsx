import React, { useState } from 'react';
import { Trash2, AlertTriangle, Wrench } from 'lucide-react';
import { firestoreService } from '../services/firestore';
import { useAuth } from '../hooks/useAuth';

const DatabaseCleanup: React.FC = () => {
  const { isAdmin } = useAuth();
  const [isProcessing, setIsProcessing] = useState(false);
  const [lastCleanup, setLastCleanup] = useState<{ panelsDeleted: number; controllersDeleted: number } | null>(null);
  const [lastIdFix, setLastIdFix] = useState<{ panelsFixed: number; controllersFixed: number } | null>(null);

  const handleCleanup = async () => {
    if (!confirm('This will remove duplicate panels and controllers. Are you sure you want to proceed?')) {
      return;
    }

    setIsProcessing(true);
    try {
      const result = await firestoreService.cleanupDuplicates();
      setLastCleanup(result);
      
      if (result.panelsDeleted > 0 || result.controllersDeleted > 0) {
        alert(`Cleanup completed:\n- ${result.panelsDeleted} duplicate panels removed\n- ${result.controllersDeleted} duplicate controllers removed`);
      } else {
        alert('No duplicates found - database is clean!');
      }
    } catch (error) {
      console.error('Error during cleanup:', error);
      alert('Error during cleanup. Check console for details.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleIdFix = async () => {
    if (!confirm('This will fix ID field mismatches in the database. Are you sure you want to proceed?')) {
      return;
    }

    setIsProcessing(true);
    try {
      const result = await firestoreService.fixIdMismatches();
      setLastIdFix(result);
      
      if (result.panelsFixed > 0 || result.controllersFixed > 0) {
        alert(`ID fix completed:\n- ${result.panelsFixed} panels fixed\n- ${result.controllersFixed} controllers fixed`);
      } else {
        alert('No ID mismatches found - all IDs are correct!');
      }
    } catch (error) {
      console.error('Error during ID fix:', error);
      alert('Error during ID fix. Check console for details.');
    } finally {
      setIsProcessing(false);
    }
  };

  if (!isAdmin) {
    return null;
  }

  return (
    <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <AlertTriangle className="text-red-600" size={20} />
          <h3 className="text-lg font-semibold text-red-900">Database Maintenance</h3>
        </div>
      </div>

      <p className="text-red-800 mb-4">
        This tool removes duplicate panels and controllers from the database, and fixes ID field mismatches.
      </p>

      {lastCleanup && (
        <div className="bg-white border border-red-200 rounded p-3 mb-4">
          <h4 className="font-medium text-red-800 mb-2">Last Cleanup Results:</h4>
          <p className="text-sm text-red-700">
            • {lastCleanup.panelsDeleted} duplicate panels removed<br/>
            • {lastCleanup.controllersDeleted} duplicate controllers removed
          </p>
        </div>
      )}

      {lastIdFix && (
        <div className="bg-white border border-blue-200 rounded p-3 mb-4">
          <h4 className="font-medium text-blue-800 mb-2">Last ID Fix Results:</h4>
          <p className="text-sm text-blue-700">
            • {lastIdFix.panelsFixed} panels fixed<br/>
            • {lastIdFix.controllersFixed} controllers fixed
          </p>
        </div>
      )}

      <div className="flex space-x-3">
        <button
          onClick={handleIdFix}
          disabled={isProcessing}
          className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
        >
          <Wrench size={16} />
          <span>{isProcessing ? 'Fixing...' : 'Fix ID Mismatches'}</span>
        </button>

        <button
          onClick={handleCleanup}
          disabled={isProcessing}
          className="flex items-center space-x-2 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 disabled:opacity-50"
        >
          <Trash2 size={16} />
          <span>{isProcessing ? 'Cleaning...' : 'Remove Duplicates'}</span>
        </button>
      </div>
    </div>
  );
};

export default DatabaseCleanup;
