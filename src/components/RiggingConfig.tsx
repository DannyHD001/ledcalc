import React from 'react';
import { Link } from 'lucide-react';
import { RiggingConfig as RiggingConfigType } from '../types/panel';

interface RiggingConfigProps {
  config: RiggingConfigType;
  onChange: (config: RiggingConfigType) => void;
}

const RiggingConfigPanel: React.FC<RiggingConfigProps> = ({ config, onChange }) => {
  return (
    <div className="space-y-4">
      <h3 className="flex items-center gap-2 font-medium text-gray-700">
        <Link className="w-5 h-5 text-indigo-600" />
        Rigging Configuration
      </h3>
      
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="block text-sm text-gray-600">Attachment Type</label>
          <div className="flex gap-4">
            <label className="flex items-center gap-2">
              <input
                type="radio"
                checked={config.type === 'shackle'}
                onChange={() => onChange({ ...config, type: 'shackle' })}
                className="text-indigo-600 focus:ring-indigo-500"
              />
              <span className="text-sm">Shackle</span>
            </label>
            <label className="flex items-center gap-2">
              <input
                type="radio"
                checked={config.type === 'clamp'}
                onChange={() => onChange({ ...config, type: 'clamp' })}
                className="text-indigo-600 focus:ring-indigo-500"
              />
              <span className="text-sm">Clamp</span>
            </label>
          </div>
        </div>

        <div className="space-y-2">
          <label className="block text-sm text-gray-600">Rigging Points</label>
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={config.doubleRiggingPoints}
              onChange={(e) => onChange({ ...config, doubleRiggingPoints: e.target.checked })}
              className="rounded text-indigo-600 focus:ring-indigo-500"
            />
            <span className="text-sm">Double rigging points per header</span>
          </label>
        </div>
      </div>
    </div>
  );
}

export default RiggingConfigPanel;