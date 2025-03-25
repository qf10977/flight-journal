"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import axios from 'axios';

export default function Navbar() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    // 检查认证状态
    const checkAuth = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        setIsLoggedIn(false);
        router.push('/');
        return;
      }

      try {
        await axios.get('/api/auth/verify', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setIsLoggedIn(true);
        
        // 从本地存储获取用户信息
        const userStr = localStorage.getItem('user');
        if (userStr) {
          try {
            const userData = JSON.parse(userStr);
            setUser(userData);
          } catch (error) {
            console.error('解析用户信息失败:', error);
            localStorage.removeItem('user');
            router.push('/');
          }
        } else {
          // 用户信息不完整，重定向到首页
          console.error('用户信息不完整');
          localStorage.removeItem('token');
          router.push('/');
        }
      } catch (error) {
        console.error('验证失败:', error);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setIsLoggedIn(false);
        router.push('/');
      }
    };
    
    checkAuth();
  }, [router]);

  return (
    <nav className="bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link href="/">
              <span className="flex items-center space-x-2 cursor-pointer">
                <svg className="h-8 w-8 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"/>
                </svg>
                <span className="text-xl font-bold text-indigo-600">飞行日志</span>
              </span>
            </Link>
          </div>
          <div className="flex items-center space-x-3">
            {isLoggedIn ? (
              <>
                <Link href="/publish-journal">
                  <span className="publish-button cursor-pointer">
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                      <circle cx="12" cy="12" r="9" strokeWidth="2"/>
                      <path d="M12 8v8M8 12h8" strokeWidth="2" strokeLinecap="round"/>
                    </svg>
                    发布笔记
                  </span>
                </Link>
                <button 
                  className="user-button"
                  onClick={() => router.push('/user-profile')}
                >
                  {user?.avatar ? (
                    <img 
                      src={user.avatar} 
                      alt={user.name} 
                      className="w-full h-full object-cover rounded-full"
                    />
                  ) : (
                    '用户'
                  )}
                </button>
              </>
            ) : (
              <button 
                className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
                onClick={() => router.push('/')}
              >
                登录
              </button>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}