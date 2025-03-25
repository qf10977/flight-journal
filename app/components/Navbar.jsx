"use client"

import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

export default function Navbar({ isLoggedIn, user, onLogin, onRegister, onLogout }) {
  const router = useRouter();

  return (
    <nav className="bg-white bg-opacity-70 backdrop-filter backdrop-blur-md shadow-sm py-2">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-14">
          <div className="flex items-center">
            <Link href="/" className="flex items-center space-x-2">
              <svg className="h-8 w-8 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
              <span className="text-xl font-bold text-indigo-600">飞行日志</span>
            </Link>
            
            <div className="hidden md:flex ml-10 space-x-8">
              <Link href="/flight-map" className="text-gray-600 hover:text-indigo-600 px-3 py-2 text-sm font-medium">
                航班地图
              </Link>
              <Link href="/travel-memo" className="text-gray-600 hover:text-indigo-600 px-3 py-2 text-sm font-medium">
                出行备忘录
              </Link>
              <Link href="/travel-journal" className="text-gray-600 hover:text-indigo-600 px-3 py-2 text-sm font-medium">
                出行随记
              </Link>
              <Link href="/airport-info" className="text-gray-600 hover:text-indigo-600 px-3 py-2 text-sm font-medium">
                机场信息
              </Link>
            </div>
          </div>
          
          <div className="flex items-center">
            {isLoggedIn ? (
              <div className="flex items-center space-x-4">
                <Link href="/profile" className="text-gray-600 hover:text-indigo-600">
                  {user?.username || '用户'}
                </Link>
                <button
                  onClick={onLogout}
                  className="text-indigo-600 hover:text-indigo-800 font-medium"
                >
                  登出
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-4">
                <button
                  onClick={onLogin}
                  className="text-indigo-600 hover:text-indigo-800 font-medium"
                >
                  登录
                </button>
                <button
                  onClick={onRegister}
                  className="bg-indigo-600 text-white px-4 py-2 rounded-md font-medium hover:bg-indigo-700"
                >
                  注册
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}