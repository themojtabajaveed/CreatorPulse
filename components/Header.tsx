
import React from 'react';

const Header: React.FC = () => {
  return (
    <header className="bg-brand-surface border-b border-slate-200">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <svg className="h-8 w-auto text-brand-primary" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <h1 className="ml-3 text-2xl font-bold text-brand-text-primary tracking-tight">CreatorPulse</h1>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
