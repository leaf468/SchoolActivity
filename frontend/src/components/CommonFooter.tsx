import React from 'react';

const CommonFooter: React.FC = () => {
  return (
    <footer className="bg-white border-t border-gray-100 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="text-center">
          <p className="text-sm text-gray-600 mb-2">SchoolActivity</p>
          <p className="text-xs text-gray-500">AI 기반 생활기록부 작성 서비스</p>
          <p className="text-xs text-gray-400 mt-3">© 2025 SchoolActivity. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default CommonFooter;
