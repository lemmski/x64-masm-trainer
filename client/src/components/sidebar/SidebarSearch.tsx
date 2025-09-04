import React from 'react';
import { Search } from 'lucide-react';

interface SidebarSearchProps {
  searchValue: string;
  onSearchChange: (value: string) => void;
}

const SidebarSearch: React.FC<SidebarSearchProps> = ({
  searchValue,
  onSearchChange
}) => {
  return (
    <div className="relative px-4 pb-4">
      <Search className="w-4 h-4 absolute left-7 top-1/2 transform -translate-y-1/2 text-gray-400" />
      <input
        type="text"
        placeholder="Search lessons..."
        value={searchValue}
        onChange={(e) => onSearchChange(e.target.value)}
        className="w-full pl-10 pr-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
      />
    </div>
  );
};

export default SidebarSearch;
