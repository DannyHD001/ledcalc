import React from 'react';
import { Panel } from '../types/panel';
import { Download } from 'lucide-react';

interface DatabaseDebugProps {
  panels: Panel[];
  apiStatus: 'connected' | 'disconnected' | 'error';
  error: string | null;
}

export function DatabaseDebug({ panels, apiStatus, error }: DatabaseDebugProps) {
  const handleDownloadDB = () => {
    const data = JSON.stringify(panels, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'led-panel-database.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <div className="bg-white p-4 rounded-lg shadow-sm">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium text-gray-900">Database Status</h3>
          <button
            onClick={handleDownloadDB}
            className="inline-flex items-center px-3 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
          >
            <Download className="w-4 h-4 mr-2" />
            Download DB
          </button>
        </div>
        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-500">Connection Status:</span>
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
              apiStatus === 'connected' 
                ? 'bg-green-100 text-green-800'
                : apiStatus === 'error'
                  ? 'bg-red-100 text-red-800'
                  : 'bg-yellow-100 text-yellow-800'
            }`}>
              {apiStatus}
            </span>
          </div>
          {error && (
            <div className="text-sm text-red-600">
              Error: {error}
            </div>
          )}
        </div>
      </div>

      <div className="bg-white p-4 rounded-lg shadow-sm">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Database Contents</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Manufacturer</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Size</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Pixel Pitch</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {panels.map((panel) => (
                <tr key={panel.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-500">{panel.id}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{panel.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{panel.manufacturer}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{panel.width}x{panel.height}mm</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{panel.pixelPitch}mm</td>
                </tr>
              ))}
              {panels.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-center">
                    No panels in database
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="bg-white p-4 rounded-lg shadow-sm">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Raw Database Contents</h3>
        <pre className="bg-gray-50 p-4 rounded-lg overflow-x-auto">
          <code className="text-sm text-gray-800">
            {JSON.stringify(panels, null, 2)}
          </code>
        </pre>
      </div>
    </div>
  );
}