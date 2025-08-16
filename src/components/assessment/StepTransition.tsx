import React from 'react';

interface StepTransitionProps {
  isVisible: boolean;
  children: React.ReactNode;
  direction?: 'left' | 'right';
}

export const StepTransition: React.FC<StepTransitionProps> = ({ 
  isVisible, 
  children, 
  direction = 'right' 
}) => {
  const directionClasses = {
    left: 'translate-x-full',
    right: '-translate-x-full'
  };

  return (
    <div 
      className={`transition-all duration-500 ease-in-out ${
        isVisible 
          ? 'opacity-100 translate-x-0' 
          : `opacity-0 ${directionClasses[direction]}`
      }`}
    >
      {children}
    </div>
  );
};

export const FadeIn: React.FC<{ children: React.ReactNode; delay?: number }> = ({ 
  children, 
  delay = 0 
}) => {
  return (
    <div 
      className="animate-fade-in"
      style={{ animationDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
};

export const SlideUp: React.FC<{ children: React.ReactNode; delay?: number }> = ({ 
  children, 
  delay = 0 
}) => {
  return (
    <div 
      className="animate-slide-up"
      style={{ animationDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
}; 