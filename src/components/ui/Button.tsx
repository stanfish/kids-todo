import React from 'react';
import { motion } from 'framer-motion';

interface ButtonProps extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'onDrag' | 'onDragStart' | 'onDragEnd'> {
  variant?: 'primary' | 'secondary' | 'success' | 'warning' | 'fun' | 'fun-pink' | 'fun-purple' | 'fun-orange' | 'fun-yellow' | 'fun-green' | 'fun-blue';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  children: React.ReactNode;
  isLoading?: boolean;
  fullWidth?: boolean;
}

const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'lg',
  children,
  isLoading = false,
  fullWidth = false,
  className = '',
  disabled,
  onClick,
  type = 'button',
  ...restProps
}) => {
  const baseClasses = 'font-semibold rounded-2xl transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-opacity-50 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer';
  
  const variantClasses = {
    primary: 'bg-primary-500 hover:bg-primary-600 text-white focus:ring-primary-300 shadow-lg hover:shadow-xl',
    secondary: 'bg-secondary-500 hover:bg-secondary-600 text-white focus:ring-secondary-300 shadow-lg hover:shadow-xl',
    success: 'bg-success-500 hover:bg-success-600 text-white focus:ring-success-300 shadow-lg hover:shadow-xl',
    warning: 'bg-warning-500 hover:bg-warning-600 text-white focus:ring-warning-300 shadow-lg hover:shadow-xl',
    fun: 'bg-gradient-to-r from-pink-500 to-purple-500 hover:from-purple-500 hover:to-blue-500 text-white focus:ring-purple-300 shadow-lg hover:shadow-xl',
    'fun-pink': 'bg-pink-500 hover:bg-pink-600 text-white focus:ring-pink-300 shadow-lg hover:shadow-xl',
    'fun-purple': 'bg-purple-500 hover:bg-purple-600 text-white focus:ring-purple-300 shadow-lg hover:shadow-xl',
    'fun-orange': 'bg-orange-500 hover:bg-orange-600 text-white focus:ring-orange-300 shadow-lg hover:shadow-xl',
    'fun-yellow': 'bg-yellow-400 hover:bg-yellow-500 text-gray-800 focus:ring-yellow-300 shadow-lg hover:shadow-xl',
    'fun-green': 'bg-green-500 hover:bg-green-600 text-white focus:ring-green-300 shadow-lg hover:shadow-xl',
    'fun-blue': 'bg-blue-500 hover:bg-blue-600 text-white focus:ring-blue-300 shadow-lg hover:shadow-xl',
  };

  const sizeClasses = {
    sm: 'px-4 py-2 text-sm',
    md: 'px-6 py-3 text-base',
    lg: 'px-8 py-4 text-lg',
    xl: 'px-10 py-5 text-xl',
  };

  const widthClasses = fullWidth ? 'w-full' : '';

  const classes = `${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${widthClasses} ${className}`;

  return (
    <motion.button
      className={classes}
      disabled={disabled || isLoading}
      onClick={onClick}
      type={type}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      transition={{ type: "spring", stiffness: 400, damping: 17 }}
    >
      {isLoading ? (
        <div className="flex items-center justify-center">
          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
          <span className="ml-2">Loading...</span>
        </div>
      ) : (
        children
      )}
    </motion.button>
  );
};

export default Button;
