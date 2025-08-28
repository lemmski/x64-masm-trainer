import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  Menu,
  Code,
  BookOpen,
  User,
  Settings,
  LogOut,
  HelpCircle,
  Home,
  Target,
  TrendingUp,
  Bell
} from 'lucide-react';

interface HeaderProps {
  onToggleSidebar: () => void;
  sidebarOpen: boolean;
  onOpenHelp: () => void;
  onOpenApiDocs: () => void;
  onOpenAssemblyRef: () => void;
}

const Header: React.FC<HeaderProps> = ({
  onToggleSidebar,
  sidebarOpen,
  onOpenHelp,
  onOpenApiDocs,
  onOpenAssemblyRef
}) => {
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const location = useLocation();

  const navigationItems = [
    { path: '/', label: 'Dashboard', icon: Home },
    { path: '/learn', label: 'Learn', icon: BookOpen },
    { path: '/practice', label: 'Practice', icon: Target },
    { path: '/progress', label: 'Progress', icon: TrendingUp }
  ];

  return (
    <header className="bg-gray-800 border-b border-gray-700 px-4 py-3 shadow-lg">
      <div className="flex items-center justify-between">
        {/* Left Section */}
        <div className="flex items-center space-x-4">
          <button
            onClick={onToggleSidebar}
            className="p-2 rounded-lg hover:bg-gray-700 transition-colors md:hidden"
            title={sidebarOpen ? 'Close sidebar' : 'Open sidebar'}
          >
            <Menu className="w-5 h-5" />
          </button>

          <Link to="/" className="flex items-center space-x-3 hover:opacity-80 transition-opacity">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
              <Code className="w-6 h-6 text-white" />
            </div>
            <div className="hidden sm:block">
              <h1 className="text-xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                x64 MASM Trainer
              </h1>
              <p className="text-xs text-gray-400">Learn Assembly Programming</p>
            </div>
          </Link>
        </div>

        {/* Center Section - Navigation */}
        <nav className="hidden md:flex items-center space-x-1">
          {navigationItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;

            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors ${
                  isActive
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span className="font-medium">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Right Section */}
        <div className="flex items-center space-x-2">
          {/* Documentation Buttons */}
          <div className="flex items-center space-x-1">
            <button
              onClick={onOpenHelp}
              className="p-2 rounded-lg hover:bg-gray-700 transition-colors text-gray-300 hover:text-white"
              title="Help Center"
            >
              <HelpCircle className="w-5 h-5" />
            </button>

            <button
              onClick={onOpenAssemblyRef}
              className="p-2 rounded-lg hover:bg-gray-700 transition-colors text-gray-300 hover:text-white"
              title="Assembly Reference"
            >
              <Book className="w-5 h-5" />
            </button>

            <button
              onClick={onOpenApiDocs}
              className="p-2 rounded-lg hover:bg-gray-700 transition-colors text-gray-300 hover:text-white"
              title="API Documentation"
            >
              <Code className="w-5 h-5" />
            </button>
          </div>

          {/* Notifications */}
          <div className="relative">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="p-2 rounded-lg hover:bg-gray-700 transition-colors text-gray-300 hover:text-white relative"
              title="Notifications"
            >
              <Bell className="w-5 h-5" />
              {/* Notification Badge */}
              <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full text-xs flex items-center justify-center">
                <span className="text-white text-xs">3</span>
              </span>
            </button>

            {/* Notifications Dropdown */}
            {showNotifications && (
              <div className="absolute right-0 mt-2 w-80 bg-gray-800 border border-gray-700 rounded-lg shadow-lg z-50">
                <div className="p-4 border-b border-gray-700">
                  <h3 className="font-medium text-white">Notifications</h3>
                </div>
                <div className="max-h-64 overflow-y-auto">
                  <div className="p-3 border-b border-gray-700 hover:bg-gray-700">
                    <div className="flex items-start space-x-3">
                      <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                      <div>
                        <p className="text-sm text-white">Exercise completed!</p>
                        <p className="text-xs text-gray-400">You earned 15 points for "Basic Arithmetic"</p>
                        <p className="text-xs text-gray-500">2 minutes ago</p>
                      </div>
                    </div>
                  </div>
                  <div className="p-3 border-b border-gray-700 hover:bg-gray-700">
                    <div className="flex items-start space-x-3">
                      <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                      <div>
                        <p className="text-sm text-white">New lesson available</p>
                        <p className="text-xs text-gray-400">"Working with Registers" is now unlocked</p>
                        <p className="text-xs text-gray-500">1 hour ago</p>
                      </div>
                    </div>
                  </div>
                  <div className="p-3 hover:bg-gray-700">
                    <div className="flex items-start space-x-3">
                      <div className="w-2 h-2 bg-yellow-500 rounded-full mt-2"></div>
                      <div>
                        <p className="text-sm text-white">Weekly goal reached!</p>
                        <p className="text-xs text-gray-400">You've completed 5 exercises this week</p>
                        <p className="text-xs text-gray-500">1 day ago</p>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="p-3 border-t border-gray-700">
                  <button className="text-sm text-blue-400 hover:text-blue-300">
                    View all notifications
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* User Menu */}
          <div className="relative">
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-700 transition-colors"
              title="User Menu"
            >
              <div className="w-8 h-8 bg-gradient-to-br from-green-400 to-blue-500 rounded-full flex items-center justify-center">
                <User className="w-4 h-4 text-white" />
              </div>
              <div className="hidden lg:block text-left">
                <p className="text-sm font-medium text-white">Student</p>
                <p className="text-xs text-gray-400">Level 5</p>
              </div>
            </button>

            {/* User Dropdown */}
            {showUserMenu && (
              <div className="absolute right-0 mt-2 w-56 bg-gray-800 border border-gray-700 rounded-lg shadow-lg z-50">
                <div className="p-4 border-b border-gray-700">
                  <p className="font-medium text-white">Student Account</p>
                  <p className="text-sm text-gray-400">student@example.com</p>
                  <div className="flex items-center space-x-2 mt-2">
                    <div className="flex-1 bg-gray-700 rounded-full h-2">
                      <div className="bg-blue-500 h-2 rounded-full" style={{ width: '65%' }}></div>
                    </div>
                    <span className="text-xs text-gray-400">65%</span>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">Progress to Level 6</p>
                </div>

                <div className="py-2">
                  <Link
                    to="/profile"
                    className="flex items-center space-x-3 px-4 py-2 text-gray-300 hover:bg-gray-700 hover:text-white transition-colors"
                  >
                    <User className="w-4 h-4" />
                    <span>Profile</span>
                  </Link>
                  <Link
                    to="/settings"
                    className="flex items-center space-x-3 px-4 py-2 text-gray-300 hover:bg-gray-700 hover:text-white transition-colors"
                  >
                    <Settings className="w-4 h-4" />
                    <span>Settings</span>
                  </Link>
                  <Link
                    to="/progress"
                    className="flex items-center space-x-3 px-4 py-2 text-gray-300 hover:bg-gray-700 hover:text-white transition-colors"
                  >
                    <TrendingUp className="w-4 h-4" />
                    <span>Progress</span>
                  </Link>
                </div>

                <div className="border-t border-gray-700 py-2">
                  <button className="flex items-center space-x-3 px-4 py-2 text-red-400 hover:bg-gray-700 hover:text-red-300 transition-colors w-full text-left">
                    <LogOut className="w-4 h-4" />
                    <span>Sign Out</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      <div className="md:hidden mt-3 pt-3 border-t border-gray-700">
        <nav className="flex items-center justify-around">
          {navigationItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;

            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex flex-col items-center space-y-1 p-2 rounded-lg transition-colors ${
                  isActive
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-400 hover:text-white hover:bg-gray-700'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className="text-xs font-medium">{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
};

export default Header;