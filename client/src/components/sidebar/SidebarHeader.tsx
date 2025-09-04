import React from 'react';
import { BookOpen, Filter } from 'lucide-react';

interface SidebarHeaderProps {
  showFilters: boolean;
  onToggleFilters: () => void;
}

const SidebarHeader: React.FC<SidebarHeaderProps> = ({
  showFilters,
  onToggleFilters
}) => {
  return (
    <div className="p-4 border-b border-gray-700">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold flex items-center">
          <BookOpen className="w-5 h-5 mr-2" />
          Learning Path
        </h2>
        <button
          onClick={onToggleFilters}
          className={`p-2 rounded-lg transition-colors ${
            showFilters ? 'bg-blue-600 text-white' : 'hover:bg-gray-700 text-gray-400'
          }`}
          title="Toggle filters"
        >
          <Filter className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export default SidebarHeader;
