"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from './Sidebar';
import axios from 'axios';
import Link from 'next/link';

export default function AppLayout({ children }) {
  const router = useRouter();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null);
  
  // 检查用户认证状态
  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        setIsLoggedIn(false);
        setUser(null);
        return;
      }

      try {
        await axios.get('/api/auth/verify', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setIsLoggedIn(true);
        setUser(JSON.parse(localStorage.getItem('user') || '{}'));
      } catch (error) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setIsLoggedIn(false);
        setUser(null);
      }
    };

    checkAuth();
  }, []);

  // 登出处理
  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setIsLoggedIn(false);
    setUser(null);
    router.push('/');
  };

  return (
    <div className="flex h-screen bg-transparent">
      {/* 侧边栏 */}
      <div className="relative h-full">
        <Sidebar 
          isLoggedIn={isLoggedIn} 
          user={user} 
          onLogout={handleLogout} 
        />
      </div>
      
      {/* 主内容区 */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* 头部状态栏 */}
        <header className="bg-white bg-opacity-70 backdrop-filter backdrop-blur-md border-b border-gray-200 h-16 flex items-center px-6 shadow-sm">
          <div className="flex-1">
            <h1 className="text-xl font-semibold text-gray-800">飞行日志系统</h1>
          </div>
          <div className="flex items-center space-x-4">
            {isLoggedIn && (
              <div className="text-sm text-gray-600">
                欢迎回来，
                <Link href="/user-profile">
                  <span className="font-medium text-blue-500 cursor-pointer hover:text-blue-600 transition-colors">{user?.username || '用户'}</span>
                </Link>
              </div>
            )}
          </div>
        </header>
        
        {/* 内容区域 */}
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-transparent p-6">
          <div className="mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
} 