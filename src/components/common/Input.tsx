import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
}

export default function Input({ label, className = '', ...props }: InputProps) {
  return (
    <div>
      <label className="block font-bold mb-2">{label}</label>
      <input className={`input ${className}`} {...props} />
    </div>
  );
}