import React from 'react';
import { LucideIcon } from 'lucide-react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary';
  icon?: LucideIcon;
  children: React.ReactNode;
}

export default function Button({
  variant = 'primary',
  icon: Icon,
  children,
  className = '',
  ...props
}: ButtonProps) {
  const baseClasses = 'btn flex items-center justify-center gap-2';
  const variantClasses = variant === 'primary' ? 'btn-primary' : 'btn-secondary';

  return (
    <button className={`${baseClasses} ${variantClasses} ${className}`} {...props}>
      {Icon && <Icon size={20} />}
      {children}
    </button>
  );
}