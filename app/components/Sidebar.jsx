"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import Image from 'next/image';

// 导航图标组件
const NavIcon = ({ icon, active = false }) => (
  <div className={`w-6 h-6 flex items-center justify-center ${active ? 'text-blue-500' : 'text-gray-500'}`}>
    {icon}
  </div>
);

export default function Sidebar({ isLoggedIn, user, onLogout }) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  // 响应式折叠
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) {
        setCollapsed(true);
      } else {
        setCollapsed(false);
      }
    };

    window.addEventListener('resize', handleResize);
    handleResize(); // 初始化

    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const navItems = [
    {
      name: '首页',
      path: '/',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
        </svg>
      )
    },
    {
      name: '航班地图',
      path: '/flight-map',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
        </svg>
      )
    },
    {
      name: '出行备忘录',
      path: '/travel-memo',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
        </svg>
      )
    },
    {
      name: '出行随记',
      path: '/travel-journal',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
        </svg>
      )
    },
    {
      name: '机场信息',
      path: '/airport-info',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      )
    },
  ];

  return (
    <div className={`h-full flex flex-col bg-white bg-opacity-70 backdrop-filter backdrop-blur-md border-r border-gray-200 transition-all duration-300 ${collapsed ? 'w-16' : 'w-64'}`}>
      {/* 顶部Logo区域 */}
      <div className="h-16 flex items-center justify-center border-b border-gray-200 px-4">
        <div className="flex items-center space-x-2">
          <svg className="h-8 w-8 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
          </svg>
          {!collapsed && <span className="text-xl font-bold text-blue-500">飞行日志</span>}
        </div>
      </div>

      {/* 导航菜单 */}
      <div className="flex-1 py-6 overflow-y-auto">
        <ul className="space-y-2">
          {navItems.map((item) => {
            const isActive = pathname === item.path;
            return (
              <li key={item.name}>
                <Link href={item.path}>
                  <div className={`flex items-center ${collapsed ? 'justify-center' : 'px-4'} py-3 ${isActive ? 'bg-blue-50 text-blue-500 border-r-4 border-blue-500' : 'text-gray-600 hover:bg-gray-50'}`}>
                    <NavIcon icon={item.icon} active={isActive} />
                    {!collapsed && <span className={`ml-3 ${isActive ? 'font-medium' : ''}`}>{item.name}</span>}
                  </div>
                </Link>
              </li>
            );
          })}
        </ul>
      </div>

      {/* 底部用户信息 */}
      <div className="border-t border-gray-200 p-4">
        {isLoggedIn ? (
          <div className={`flex ${collapsed ? 'justify-center' : 'justify-between'} items-center`}>
            <Link href="/user-profile">
              <div className={`flex items-center ${collapsed ? '' : ''} cursor-pointer hover:opacity-80 transition-opacity`}>
                <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-500 font-bold overflow-hidden">
                  {user?.avatar ? (
                    <img src={user.avatar} alt={user?.username} className="w-full h-full object-cover" />
                  ) : (
                    user?.username?.[0]?.toUpperCase() || 'U'
                  )}
                </div>
                {!collapsed && <span className="ml-2 text-sm font-medium text-gray-700">{user?.username || '用户'}</span>}
              </div>
            </Link>
            <button
              onClick={onLogout}
              className="text-gray-500 hover:text-blue-500"
              title="登出"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
            </button>
          </div>
        ) : (
          <div className={`flex ${collapsed ? 'flex-col' : 'justify-between'} items-center`}>
            {!collapsed && <span className="text-sm text-gray-500">未登录</span>}
            <Link href="/login">
              <div className="text-blue-500 hover:text-blue-600 p-1">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                </svg>
              </div>
            </Link>
          </div>
        )}
      </div>

      {/* 控制折叠按钮 */}
      <button 
        onClick={() => setCollapsed(!collapsed)}
        className="absolute top-4 -right-3 bg-white border border-gray-200 rounded-full p-1 shadow-md text-gray-500 hover:text-blue-500"
      >
        {collapsed ? (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" />
          </svg>
        ) : (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
          </svg>
        )}
      </button>
    </div>
  );
} 