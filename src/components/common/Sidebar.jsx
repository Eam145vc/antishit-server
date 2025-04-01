import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useSocket } from '../../hooks/useSocket';

const Sidebar = () => {
  const location = useLocation();
  const { connected, realtimeData } = useSocket();
  
  // Navigation items with icons
  const navigationItems = [
    {
      name: 'Dashboard',
      path: '/',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
          <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
        </svg>
      )
    },
    {
      name: 'Monitoring',
      path: '/monitoring',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
          <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
          <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
        </svg>
      )
    },
    {
      name: 'Forensics',
      path: '/forensics',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
        </svg>
      )
    },
    {
      name: 'Control Panel',
      path: '/control-panel',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
        </svg>
      )
    },
    {
      name: 'Alerts',
      path: '/alerts',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
        </svg>
      ),
      alert: realtimeData.alertsCount > 0
    }
  ];
  
  return (
    <div className="hidden md:flex md:flex-shrink-0">
      <div className="flex flex-col w-64">
        {/* Sidebar component */}
        <div className="flex flex-col h-0 flex-1 bg-dark-700">
          <div className="flex-1 flex flex-col pt-5 pb-4 overflow-y-auto">
            {/* Connected status */}
            <div className="flex items-center flex-shrink-0 px-4 mb-3">
              <div className={`w-3 h-3 rounded-full mr-2 ${connected ? 'bg-success-500' : 'bg-danger-500'}`}></div>
              <span className="text-sm font-medium text-white">
                {connected ? 'Connected' : 'Disconnected'}
              </span>
            </div>
            
            {/* Stats summary */}
            <div className="px-4 mb-5">
              <div className="grid grid-cols-2 gap-2">
                <div className="bg-dark-600 rounded-md p-3">
                  <p className="text-xs font-medium text-gray-400">Active Devices</p>
                  <p className="text-lg font-semibold text-white">{realtimeData.devices.length}</p>
                </div>
                <div className="bg-dark-600 rounded-md p-3">
                  <p className="text-xs font-medium text-gray-400">Alerts</p>
                  <p className="text-lg font-semibold text-white">{realtimeData.alertsCount}</p>
                </div>
              </div>
            </div>
            
            {/* Navigation */}
            <nav className="mt-5 flex-1 px-2 space-y-1">
              {navigationItems.map((item) => {
                const isActive = location.pathname === item.path || 
                  (item.path !== '/' && location.pathname.startsWith(item.path));
                
                return (
                  <NavLink
                    key={item.name}
                    to={item.path}
                    className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md ${
                      isActive
                        ? 'bg-dark-600 text-white'
                        : 'text-gray-300 hover:bg-dark-600 hover:text-white'
                    }`}
                  >
                    <div className="relative mr-3 flex-shrink-0">
                      {item.icon}
                      {item.alert && (
                        <span className="absolute top-0 right-0 block h-2 w-2 rounded-full bg-danger-500 ring-1 ring-dark-700"></span>
                      )}
                    </div>
                    {item.name}
                  </NavLink>
                );
              })}
            </nav>
          </div>
          
          {/* Bottom section */}
          <div className="flex-shrink-0 flex bg-dark-800 p-4">
            <div className="flex items-center">
              <div className="ml-3">
                <p className="text-sm font-medium text-white">System Status</p>
                <div className="flex items-center text-xs text-gray-400">
                  <span>Anti-Cheat Client v1.4.2</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;