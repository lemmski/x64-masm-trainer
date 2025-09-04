import React from 'react';
import { X } from 'lucide-react';

interface FilterOptions {
  difficulty: string;
  completed: boolean | null;
  search: string;
}

interface SidebarFiltersProps {
  filters: FilterOptions;
  onFiltersChange: (filters: FilterOptions) => void;
  hasActiveFilters: boolean;
  onClearFilters: () => void;
}

const SidebarFilters: React.FC<SidebarFiltersProps> = ({
  filters,
  onFiltersChange,
  hasActiveFilters,
  onClearFilters
}) => {
  return (
    <div className="px-4 pb-4">
      <div className="space-y-3">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Difficulty
          </label>
          <select
            value={filters.difficulty}
            onChange={(e) => onFiltersChange({ ...filters, difficulty: e.target.value })}
            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
          >
            <option value="all">All Levels</option>
            <option value="beginner">Beginner</option>
            <option value="intermediate">Intermediate</option>
            <option value="advanced">Advanced</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Status
          </label>
          <select
            value={filters.completed === null ? 'all' : filters.completed ? 'completed' : 'incomplete'}
            onChange={(e) => {
              const value = e.target.value;
              onFiltersChange({
                ...filters,
                completed: value === 'all' ? null : value === 'completed'
              });
            }}
            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
          >
            <option value="all">All Lessons</option>
            <option value="completed">Completed</option>
            <option value="incomplete">Not Started</option>
          </select>
        </div>

        {hasActiveFilters && (
          <button
            onClick={onClearFilters}
            className="flex items-center space-x-2 text-blue-400 hover:text-blue-300 text-sm"
          >
            <X className="w-4 h-4" />
            <span>Clear filters</span>
          </button>
        )}
      </div>
    </div>
  );
};

export default SidebarFilters;
