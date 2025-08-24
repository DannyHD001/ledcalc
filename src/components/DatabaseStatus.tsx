import { useState, useEffect } from 'react';
import { Database, Cloud, CloudOff, Upload, Trash2 } from 'lucide-react';
import { databaseService } from '../services/database';
import { dataMigrationService } from '../services/dataMigration';

export function DatabaseStatus() {
  const [isUsingFirestore, setIsUsingFirestore] = useState(false);
  const [dataCount, setDataCount] = useState({ panels: 0, controllers: 0 });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);

  useEffect(() => {
    checkStatus();
  }, []);

  const checkStatus = async () => {
    setIsUsingFirestore(databaseService.isUsingFirestore());
    
    try {
      const count = await dataMigrationService.checkDataExists();
      setDataCount(count);
    } catch (error) {
      console.error('Failed to check data count:', error);
    }
  };

  const handleMigration = async () => {
    setLoading(true);
    setMessage('');
    
    try {
      if (!isUsingFirestore) {
        // If using localStorage, migrate directly to localStorage
        await dataMigrationService.migrateDefaultData();
        setMessage('✅ Default data added to local storage successfully!');
      } else {
        // Try Firestore first
        await dataMigrationService.migrateDefaultData();
        setMessage('✅ Default data migrated to Firestore successfully!');
      }
      await checkStatus();
    } catch (error) {
      const errorMessage = (error as Error).message;
      if (errorMessage.includes('Missing or insufficient permissions')) {
        setMessage('⚠️ Firestore permissions issue detected. Switching to local storage mode.');
        databaseService.enableFirestore = () => {}; // Disable retry
        await checkStatus();
      } else {
        setMessage('❌ Migration failed: ' + errorMessage);
      }
    }
    
    setLoading(false);
  };

  const handleClearData = async () => {
    if (!window.confirm('Are you sure you want to clear all data? This cannot be undone.')) {
      return;
    }

    setLoading(true);
    setMessage('');
    
    try {
      await dataMigrationService.clearAllData();
      setMessage('✅ All data cleared successfully!');
      await checkStatus();
    } catch (error) {
      setMessage('❌ Clear failed: ' + (error as Error).message);
    }
    
    setLoading(false);
  };

  const handleCleanupDuplicates = () => {
    setLoading(true);
    setMessage('');
    
    try {
      // Clear localStorage to force re-read with deduplication
      localStorage.removeItem('ledcalc_panels');
      localStorage.removeItem('ledcalc_controllers');
      setMessage('✅ Duplicate data cleaned up successfully!');
      setTimeout(() => {
        checkStatus();
        setLoading(false);
      }, 500);
    } catch (error) {
      setMessage('❌ Cleanup failed: ' + (error as Error).message);
      setLoading(false);
    }
  };

  const retryFirestore = () => {
    databaseService.enableFirestore();
    setMessage('🔄 Retrying Firestore connection...');
    checkStatus();
  };

  return (
    <div className="relative">
      {/* Compact Status Icon */}
      <button
        onClick={() => setShowDropdown(!showDropdown)}
        className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium transition-colors ${
          isUsingFirestore 
            ? 'bg-green-100 text-green-700 hover:bg-green-200' 
            : 'bg-orange-100 text-orange-700 hover:bg-orange-200'
        }`}
        title={`Database: ${isUsingFirestore ? 'Firestore' : 'Local Storage'} • ${dataCount.panels} panels, ${dataCount.controllers} controllers`}
      >
        {isUsingFirestore ? (
          <Cloud className="w-3 h-3" />
        ) : (
          <CloudOff className="w-3 h-3" />
        )}
        <span className="hidden sm:inline">
          {isUsingFirestore ? 'Cloud' : 'Local'}
        </span>
      </button>

      {/* Dropdown Panel */}
      {showDropdown && (
        <div className="absolute top-full right-0 mt-1 w-80 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
          <div className="p-4">
            <div className="flex items-center gap-2 mb-3">
              <Database className="w-4 h-4 text-blue-600" />
              <h3 className="text-sm font-semibold text-gray-800">Database Status</h3>
            </div>

            <div className="space-y-3">
              {/* Connection Status */}
              <div className="flex items-center gap-2">
                {isUsingFirestore ? (
                  <>
                    <Cloud className="w-4 h-4 text-green-600" />
                    <span className="text-sm font-medium text-green-700">Connected to Firestore</span>
                  </>
                ) : (
                  <>
                    <CloudOff className="w-4 h-4 text-orange-600" />
                    <span className="text-sm font-medium text-orange-700">Using Local Storage</span>
                    <button
                      onClick={retryFirestore}
                      className="text-xs bg-blue-500 text-white px-2 py-1 rounded hover:bg-blue-600"
                    >
                      Retry
                    </button>
                  </>
                )}
              </div>

              {/* Data Count */}
              <div className="text-sm text-gray-600">
                <div>Panels: <span className="font-medium">{dataCount.panels}</span></div>
                <div>Controllers: <span className="font-medium">{dataCount.controllers}</span></div>
              </div>

              {/* Actions */}
              {/* <div className="flex gap-2 pt-2 flex-wrap">
                <button
                  onClick={handleMigration}
                  disabled={loading}
                  className="flex items-center gap-1 px-2 py-1 text-xs bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
                >
                  <Upload className="w-3 h-3" />
                  {loading ? 'Adding...' : 'Add Default Data'}
                </button>
                
                <button
                  onClick={handleCleanupDuplicates}
                  disabled={loading}
                  className="flex items-center gap-1 px-2 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
                >
                  🧹 Clean
                </button>
                
                {(dataCount.panels > 0 || dataCount.controllers > 0) && (
                  <button
                    onClick={handleClearData}
                    disabled={loading}
                    className="flex items-center gap-1 px-2 py-1 text-xs bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50"
                  >
                    <Trash2 className="w-3 h-3" />
                    Clear All
                  </button>
                )}
              </div> */}

              {/* Message */}
              {message && (
                <div className={`text-xs p-2 rounded border ${
                  message.includes('⚠️') ? 'bg-yellow-50 border-yellow-200 text-yellow-800' :
                  message.includes('❌') ? 'bg-red-50 border-red-200 text-red-800' :
                  'bg-green-50 border-green-200 text-green-800'
                }`}>
                  {message}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
      
      {/* Click outside to close */}
      {showDropdown && (
        <div 
          className="fixed inset-0 z-40" 
          onClick={() => setShowDropdown(false)}
        />
      )}
    </div>
  );
}