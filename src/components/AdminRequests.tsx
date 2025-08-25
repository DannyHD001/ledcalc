import React, { useState, useEffect } from 'react';
import { Check, X, Clock, User, Calendar } from 'lucide-react';
import { PanelRequest, ControllerRequest } from '../types/request';
import { firestoreService } from '../services/firestore';
import { databaseService } from '../services/database';
import { useAuth } from '../hooks/useAuth';

interface AdminRequestsProps {
  onPanelApproved: () => void;
  onControllerApproved: () => void;
}

const AdminRequests: React.FC<AdminRequestsProps> = ({
  onPanelApproved,
  onControllerApproved
}) => {
  const { isAdmin, userEmail } = useAuth();
  const [panelRequests, setPanelRequests] = useState<PanelRequest[]>([]);
  const [controllerRequests, setControllerRequests] = useState<ControllerRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);

  useEffect(() => {
    if (isAdmin) {
      loadRequests();
    }
  }, [isAdmin]);

  const loadRequests = async () => {
    try {
      setLoading(true);
      const [panels, controllers] = await Promise.all([
        firestoreService.getPanelRequests(),
        firestoreService.getControllerRequests()
      ]);
      
      // Filter to show only pending requests
      setPanelRequests(panels.filter(req => req.status === 'pending'));
      setControllerRequests(controllers.filter(req => req.status === 'pending'));
    } catch (error) {
      console.error('Error loading requests:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApprovePanelRequest = async (request: PanelRequest) => {
    setProcessingId(request.id);
    try {
      // Check if panel already exists
      const existingPanels = await databaseService.getPanels();
      const duplicatePanel = existingPanels.find(panel => 
        panel.name.toLowerCase() === request.requestedPanel.name.toLowerCase() &&
        panel.manufacturer.toLowerCase() === request.requestedPanel.manufacturer.toLowerCase()
      );

      if (duplicatePanel) {
        alert(`Panel "${request.requestedPanel.name}" by ${request.requestedPanel.manufacturer} already exists in the database.`);
        return;
      }

      // Create the panel in the main collection
      const newPanel = request.requestedPanel;
      await databaseService.createPanel(newPanel);
      
      // Update request status
      await firestoreService.updatePanelRequestStatus(
        request.id,
        'approved',
        `Approved and added to panels collection by ${userEmail}`,
        userEmail
      );
      
      // Refresh requests and notify parent
      await loadRequests();
      onPanelApproved();
    } catch (error) {
      console.error('Error approving panel request:', error);
      if (error instanceof Error) {
        alert(`Error approving panel: ${error.message}`);
      }
    } finally {
      setProcessingId(null);
    }
  };

  const handleRejectPanelRequest = async (request: PanelRequest, reason: string) => {
    setProcessingId(request.id);
    try {
      await firestoreService.updatePanelRequestStatus(
        request.id,
        'rejected',
        reason,
        userEmail
      );
      await loadRequests();
    } catch (error) {
      console.error('Error rejecting panel request:', error);
    } finally {
      setProcessingId(null);
    }
  };

  const handleApproveControllerRequest = async (request: ControllerRequest) => {
    setProcessingId(request.id);
    try {
      // Check if controller already exists
      const existingControllers = await databaseService.getControllers();
      const duplicateController = existingControllers.find(controller => 
        controller.name.toLowerCase() === request.requestedController.name.toLowerCase() &&
        controller.manufacturer.toLowerCase() === request.requestedController.manufacturer.toLowerCase()
      );

      if (duplicateController) {
        alert(`Controller "${request.requestedController.name}" by ${request.requestedController.manufacturer} already exists in the database.`);
        return;
      }

      // Create the controller in the main collection
      const newController = request.requestedController;
      await databaseService.createController(newController);
      
      // Update request status
      await firestoreService.updateControllerRequestStatus(
        request.id,
        'approved',
        `Approved and added to controllers collection by ${userEmail}`,
        userEmail
      );
      
      // Refresh requests and notify parent
      await loadRequests();
      onControllerApproved();
    } catch (error) {
      console.error('Error approving controller request:', error);
      if (error instanceof Error) {
        alert(`Error approving controller: ${error.message}`);
      }
    } finally {
      setProcessingId(null);
    }
  };

  const handleRejectControllerRequest = async (request: ControllerRequest, reason: string) => {
    setProcessingId(request.id);
    try {
      await firestoreService.updateControllerRequestStatus(
        request.id,
        'rejected',
        reason,
        userEmail
      );
      await loadRequests();
    } catch (error) {
      console.error('Error rejecting controller request:', error);
    } finally {
      setProcessingId(null);
    }
  };

  if (!isAdmin) {
    return null;
  }

  if (loading) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
        <div className="flex items-center space-x-2">
          <Clock className="text-yellow-600" size={20} />
          <span className="text-yellow-800">Loading pending requests...</span>
        </div>
      </div>
    );
  }

  const totalPendingRequests = panelRequests.length + controllerRequests.length;

  if (totalPendingRequests === 0) {
    return (
      <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
        <div className="flex items-center space-x-2">
          <Check className="text-green-600" size={20} />
          <span className="text-green-800">No pending requests at this time</span>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 mb-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <Clock className="text-orange-600" size={20} />
          <h3 className="text-lg font-semibold text-orange-900">
            Pending Requests ({totalPendingRequests})
          </h3>
        </div>
      </div>

      {panelRequests.length > 0 && (
        <div className="mb-6">
          <h4 className="font-medium text-orange-800 mb-3">Panel Requests ({panelRequests.length})</h4>
          <div className="space-y-3">
            {panelRequests.map((request) => (
              <div key={request.id} className="bg-white border border-orange-200 rounded-lg p-4">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h5 className="font-semibold text-gray-900">{request.requestedPanel.name}</h5>
                    <p className="text-sm text-gray-600">by {request.requestedPanel.manufacturer}</p>
                  </div>
                  <div className="text-right text-sm text-gray-500">
                    <div className="flex items-center space-x-1">
                      <User size={14} />
                      <span>{request.requestedBy}</span>
                    </div>
                    <div className="flex items-center space-x-1 mt-1">
                      <Calendar size={14} />
                      <span>{request.requestedAt.toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4 text-sm mb-3">
                  <div>
                    <span className="font-medium">Size:</span> {request.requestedPanel.width}×{request.requestedPanel.height}mm
                  </div>
                  <div>
                    <span className="font-medium">Pitch:</span> {request.requestedPanel.pixelPitch}mm
                  </div>
                  <div>
                    <span className="font-medium">Weight:</span> {request.requestedPanel.weight}kg
                  </div>
                  <div>
                    <span className="font-medium">Power:</span> {request.requestedPanel.power}W
                  </div>
                </div>

                {request.requestNotes && (
                  <div className="mb-3">
                    <span className="font-medium text-sm">Notes:</span>
                    <p className="text-sm text-gray-600 mt-1">{request.requestNotes}</p>
                  </div>
                )}

                <div className="flex space-x-2">
                  <button
                    onClick={() => handleApprovePanelRequest(request)}
                    disabled={processingId === request.id}
                    className="flex items-center space-x-2 px-3 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 disabled:opacity-50"
                  >
                    <Check size={16} />
                    <span>{processingId === request.id ? 'Approving...' : 'Approve'}</span>
                  </button>
                  <button
                    onClick={() => {
                      const reason = prompt('Reason for rejection (optional):');
                      if (reason !== null) {
                        handleRejectPanelRequest(request, reason || 'No reason provided');
                      }
                    }}
                    disabled={processingId === request.id}
                    className="flex items-center space-x-2 px-3 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 disabled:opacity-50"
                  >
                    <X size={16} />
                    <span>Reject</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {controllerRequests.length > 0 && (
        <div>
          <h4 className="font-medium text-orange-800 mb-3">Controller Requests ({controllerRequests.length})</h4>
          <div className="space-y-3">
            {controllerRequests.map((request) => (
              <div key={request.id} className="bg-white border border-orange-200 rounded-lg p-4">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h5 className="font-semibold text-gray-900">{request.requestedController.name}</h5>
                    <p className="text-sm text-gray-600">by {request.requestedController.manufacturer}</p>
                  </div>
                  <div className="text-right text-sm text-gray-500">
                    <div className="flex items-center space-x-1">
                      <User size={14} />
                      <span>{request.requestedBy}</span>
                    </div>
                    <div className="flex items-center space-x-1 mt-1">
                      <Calendar size={14} />
                      <span>{request.requestedAt.toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4 text-sm mb-3">
                  <div>
                    <span className="font-medium">Ports:</span> {request.requestedController.ports}
                  </div>
                  <div>
                    <span className="font-medium">Pixels/Port:</span> {request.requestedController.pixelsPerPort}
                  </div>
                  <div>
                    <span className="font-medium">Output Type:</span> {request.requestedController.outputType}
                  </div>
                  {request.requestedController.maxPixelsTotal && (
                    <div>
                      <span className="font-medium">Max Total:</span> {request.requestedController.maxPixelsTotal}
                    </div>
                  )}
                </div>

                {request.requestedController.description && (
                  <div className="mb-3">
                    <span className="font-medium text-sm">Description:</span>
                    <p className="text-sm text-gray-600 mt-1">{request.requestedController.description}</p>
                  </div>
                )}

                {request.requestNotes && (
                  <div className="mb-3">
                    <span className="font-medium text-sm">Notes:</span>
                    <p className="text-sm text-gray-600 mt-1">{request.requestNotes}</p>
                  </div>
                )}

                <div className="flex space-x-2">
                  <button
                    onClick={() => handleApproveControllerRequest(request)}
                    disabled={processingId === request.id}
                    className="flex items-center space-x-2 px-3 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 disabled:opacity-50"
                  >
                    <Check size={16} />
                    <span>{processingId === request.id ? 'Approving...' : 'Approve'}</span>
                  </button>
                  <button
                    onClick={() => {
                      const reason = prompt('Reason for rejection (optional):');
                      if (reason !== null) {
                        handleRejectControllerRequest(request, reason || 'No reason provided');
                      }
                    }}
                    disabled={processingId === request.id}
                    className="flex items-center space-x-2 px-3 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 disabled:opacity-50"
                  >
                    <X size={16} />
                    <span>Reject</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminRequests;
