import React, { useState } from 'react';
import { Plus, Send } from 'lucide-react';
import PanelRequestForm from './PanelRequestForm';
import ControllerRequestForm from './ControllerRequestForm';

const UserRequestPanel: React.FC = () => {
  const [showPanelRequestForm, setShowPanelRequestForm] = useState(false);
  const [showControllerRequestForm, setShowControllerRequestForm] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handlePanelRequestSuccess = () => {
    setSuccessMessage('Panel request submitted successfully! An admin will review it soon.');
    setTimeout(() => setSuccessMessage(null), 5000);
  };

  const handleControllerRequestSuccess = () => {
    setSuccessMessage('Controller request submitted successfully! An admin will review it soon.');
    setTimeout(() => setSuccessMessage(null), 5000);
  };

  return (
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
      <div className="flex items-center justify-between mb-3">
        <div>
          <h3 className="text-lg font-semibold text-blue-900">Need a New Panel or Controller?</h3>
          <p className="text-blue-700 text-sm">Can't find what you're looking for? Request it and an admin will review your submission.</p>
        </div>
        <Send className="text-blue-600" size={24} />
      </div>

      {successMessage && (
        <div className="mb-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded">
          {successMessage}
        </div>
      )}

      <div className="flex space-x-3">
        <button
          onClick={() => setShowPanelRequestForm(true)}
          className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <Plus size={16} />
          <span>Request Panel</span>
        </button>
        
        <button
          onClick={() => setShowControllerRequestForm(true)}
          className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500"
        >
          <Plus size={16} />
          <span>Request Controller</span>
        </button>
      </div>

      <PanelRequestForm
        isOpen={showPanelRequestForm}
        onClose={() => setShowPanelRequestForm(false)}
        onSuccess={handlePanelRequestSuccess}
      />

      <ControllerRequestForm
        isOpen={showControllerRequestForm}
        onClose={() => setShowControllerRequestForm(false)}
        onSuccess={handleControllerRequestSuccess}
      />
    </div>
  );
};

export default UserRequestPanel;
