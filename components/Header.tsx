import React from 'react';
import { Wrench, Bell } from 'lucide-react';

export const Header: React.FC = () => {
  return (
    <header className="bg-white border-b border-gray-200 h-16 flex items-center justify-between px-6 sticky top-0 z-10">
      <div className="flex items-center gap-3">
        <div className="bg-blue-600 p-2 rounded-lg">
          <Wrench className="w-6 h-6 text-white" />
        </div>
        <h1 className="text-xl font-bold text-gray-800">ServicePart Pro</h1>
      </div>
      <div className="flex items-center gap-4">
        <button className="relative p-2 text-gray-500 hover:bg-gray-100 rounded-full">
          <Bell className="w-5 h-5" />
          <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
        </button>
        <div className="w-8 h-8 bg-slate-800 rounded-full flex items-center justify-center text-white font-medium text-sm">
          A
        </div>
      </div>
    </header>
  );
};
