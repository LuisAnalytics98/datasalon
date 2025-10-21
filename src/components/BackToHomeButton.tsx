import React from 'react';
import { Link } from 'react-router-dom';
import { Home, ArrowLeft } from 'lucide-react';

interface BackToHomeButtonProps {
  variant?: 'default' | 'minimal' | 'icon-only';
  className?: string;
}

const BackToHomeButton: React.FC<BackToHomeButtonProps> = ({ 
  variant = 'default', 
  className = '' 
}) => {
  const baseClasses = "inline-flex items-center transition-all duration-300 hover:scale-105";
  
  const variantClasses = {
    default: "bg-gradient-to-r from-yellow-400 to-yellow-600 text-black px-6 py-3 rounded-lg font-semibold hover:from-yellow-500 hover:to-yellow-700 shadow-lg shadow-yellow-400/25",
    minimal: "text-yellow-400 hover:text-yellow-300 border border-yellow-400 hover:border-yellow-300 px-4 py-2 rounded-lg font-medium",
    'icon-only': "bg-gray-800 hover:bg-gray-700 text-gray-300 hover:text-white p-3 rounded-full border border-gray-600 hover:border-yellow-400"
  };

  const iconSize = variant === 'icon-only' ? 'w-5 h-5' : 'w-4 h-4';
  const Icon = variant === 'icon-only' ? Home : ArrowLeft;

  return (
    <Link 
      to="/" 
      className={`${baseClasses} ${variantClasses[variant]} ${className}`}
      title="Volver al inicio"
    >
      <Icon className={`${iconSize} ${variant !== 'icon-only' ? 'mr-2' : ''}`} />
      {variant !== 'icon-only' && (
        <span>
          {variant === 'minimal' ? 'Inicio' : 'Volver al Inicio'}
        </span>
      )}
    </Link>
  );
};

export default BackToHomeButton;
