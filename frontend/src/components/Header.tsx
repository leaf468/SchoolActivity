import React from 'react';
import { useNavigate } from 'react-router-dom';

const Header: React.FC = () => {
  const navigate = useNavigate();

  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <button
            onClick={() => navigate('/')}
            className="text-xl font-bold text-green-600 hover:text-green-700 transition-colors"
          >
            SchoolActivity
          </button>

          <nav className="flex items-center space-x-4">
            <button
              onClick={() => navigate('/')}
              className="text-sm text-gray-600 hover:text-gray-900 transition-colors"
            >
              처음으로
            </button>
          </nav>
        </div>
      </div>
    </header>
  );
};

export default Header;
