import React from 'react';
import { LucideIcon } from 'lucide-react';

interface InputFieldProps {
  label: string;
  value: string | number;
  onChange: (value: any) => void;
  type?: string;
  icon?: LucideIcon;
  unit?: string;
  required?: boolean;
  min?: number;
  max?: number;
  step?: string | number;
}

const InputField: React.FC<InputFieldProps> = ({
  label,
  value,
  onChange,
  type = 'text',
  icon: Icon,
  unit,
  required = false,
  min,
  max,
  step,
}) => {
  return (
    <div className="form-control">
      <label className="label">
        <span className="label-text">{label}</span>
      </label>
      <div className="relative">
        {Icon && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Icon className="h-5 w-5 text-gray-400" />
          </div>
        )}
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(type === 'number' ? Number(e.target.value) : e.target.value)}
          className={`input input-bordered w-full ${Icon ? 'pl-10' : ''} ${
            unit ? 'pr-12' : ''
          }`}
          required={required}
          min={min}
          max={max}
          step={step}
        />
        {unit && (
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
            <span className="text-gray-500">{unit}</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default InputField;