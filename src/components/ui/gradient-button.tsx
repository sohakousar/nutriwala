import React from 'react';
import { cn } from "@/lib/utils";

interface AdvancedButtonProps {
  children: React.ReactNode;
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
  variant?: 'primary' | 'secondary' | 'ghost' | 'gradient';
  size?: 'small' | 'medium' | 'large';
  disabled?: boolean;
  className?: string;
  type?: 'button' | 'submit' | 'reset';
}

export const AdvancedButton: React.FC<AdvancedButtonProps> = ({ 
  children, 
  onClick, 
  variant = 'primary',
  size = 'medium',
  disabled = false,
  className = '',
  type = 'button'
}) => {
  const sizeClasses = {
    small: 'px-4 py-2 text-sm',
    medium: 'px-6 py-3 text-base',
    large: 'px-8 py-4 text-lg'
  };

  const variantClasses = {
    primary: 'bg-accent/20 text-accent border border-accent/30 hover:bg-accent/30',
    secondary: 'bg-white/5 text-foreground border border-white/20 hover:bg-white/10',
    ghost: 'bg-transparent text-foreground border border-transparent hover:bg-white/5',
    gradient: 'bg-accent/20 text-accent border border-accent/30 hover:bg-accent/30'
  };

  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      className={cn(
        "relative overflow-hidden rounded-xl font-semibold transition-colors duration-200",
        sizeClasses[size],
        variantClasses[variant],
        disabled && "opacity-50 cursor-not-allowed",
        className
      )}
    >
      <span className="relative z-10 font-bold">
        {children}
      </span>
    </button>
  );
};

export default AdvancedButton;
