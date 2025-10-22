
import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
}

export const Card: React.FC<CardProps> = ({ children, className = '' }) => {
  return (
    <div className={`bg-brand-surface border border-slate-200 rounded-lg shadow-sm p-6 ${className}`}>
      {children}
    </div>
  );
};
