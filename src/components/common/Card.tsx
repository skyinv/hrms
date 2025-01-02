import React from 'react';

interface CardProps {
  title?: string;
  children: React.ReactNode;
  className?: string;
}

export default function Card({ title, children, className = '' }: CardProps) {
  return (
    <div className={`card ${className}`}>
      {title && <h2 className="text-2xl font-bold mb-6">{title}</h2>}
      {children}
    </div>
  );
}