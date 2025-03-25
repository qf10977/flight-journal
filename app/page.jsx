"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import AppLayout from "./components/AppLayout"
import FlyingPlanes from "./components/FlyingPlanes"

export default function Home() {
  const [showLoginModal, setShowLoginModal] = useState(false)
  const [showRegisterModal, setShowRegisterModal] = useState(false)
  const [isLoggedIn, setIsLoggedIn] = useState(false)

  // 检查用户是否已登录
  useEffect(() => {
    const token = localStorage.getItem('token')
    const user = localStorage.getItem('user')
    if (token && user) {
      setIsLoggedIn(true)
    }
  }, [])

  // 登录处理
  const handleLogin = async (e) => {
    e.preventDefault()
    try {
      const email = document.getElementById('loginEmail').value
      const password = document.getElementById('loginPassword').value

      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email,
          password
        })
      })

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || `服务器错误 (${response.status})`);
      }

      const result = await response.json()

      if (result.token) {
        localStorage.setItem('token', result.token)
        localStorage.setItem('user', JSON.stringify(result.user))
        setShowLoginModal(false)
        window.location.reload()
      } else {
        throw new Error('登录响应中没有 token')
      }
    } catch (error) {
      let errorMessage = '请稍后重试';
      
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.message) {
        errorMessage = error.message;
      } else if (typeof error === 'string') {
        errorMessage = error;
      }
      
      alert('登录失败: ' + errorMessage);
    }
  }

  // 发送验证码
  const sendVerificationCode = async () => {
    const email = document.getElementById('registerEmail').value
    if (!email) {
      alert('请输入邮箱地址')
      return
    }

    const btn = document.getElementById('sendCodeBtn')
    btn.disabled = true
    let countdown = 60

    try {
      await fetch('/api/auth/send-code', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email })
      })
      
      const timer = setInterval(() => {
        btn.textContent = `${countdown}秒后重试`
        countdown--
        if (countdown < 0) {
          clearInterval(timer)
          btn.disabled = false
          btn.textContent = '获取验证码'
        }
      }, 1000)

      alert('验证码已发送到您的邮箱')
    } catch (error) {
      alert('发送验证码失败: ' + (error.response?.data?.message || '请稍后重试'))
      btn.disabled = false
    }
  }

  // 注册处理
  const handleRegister = async (e) => {
    e.preventDefault()
    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: document.getElementById('registerName').value,
          email: document.getElementById('registerEmail').value,
          password: document.getElementById('registerPassword').value,
          verificationCode: document.getElementById('verificationCode').value
        })
      })
      const result = await response.json()
      localStorage.setItem('token', result.token)
      localStorage.setItem('user', JSON.stringify(result.user))
      setShowRegisterModal(false)
      window.location.reload()
    } catch (error) {
      alert('注册失败: ' + (error.response?.data?.message || '请稍后重试'))
    }
  }

  return (
    <>
      {/* 小飞机乱飞特效 */}
      <FlyingPlanes 
        count={10} 
        speed={1.3} 
        maxSize={40} 
        minSize={20} 
        colors={["#e6f4ff", "#93c5fd", "#60a5fa", "#d6f0ff", "#3b82f6"]} 
      />
      
      <AppLayout>
        <div className="py-8 px-4 sm:px-6 animate-fadeIn max-w-7xl mx-auto">
          {/* 顶部注册卡片 - 仅在未登录时显示 */}
          {!isLoggedIn && (
            <div className="bg-gradient-to-r from-[#e6f4ff] to-[#d6f0ff] rounded-2xl p-6 sm:p-8 mb-12 flex flex-col md:flex-row justify-between items-center shadow-md border border-blue-100">
              <div className="mb-6 md:mb-0">
                <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-2 tracking-tight">准备好开始记录您的旅程了吗?</h2>
                <p className="text-base text-gray-600 font-light tracking-wide">立即注册，开启您的飞行日志之旅</p>
              </div>
              <div className="flex flex-col sm:flex-row gap-4">
                <button 
                  onClick={() => setShowRegisterModal(true)}
                  className="bg-transparent border-2 border-[#3b82f6] text-[#3b82f6] px-8 py-3 rounded-lg font-medium hover:bg-[#3b82f6]/10 transition-all"
                >
                  立即注册
                </button>
                <button 
                  onClick={() => setShowLoginModal(true)}
                  className="bg-transparent border-2 border-[#3b82f6] text-[#3b82f6] px-8 py-3 rounded-lg font-medium hover:bg-[#3b82f6]/10 transition-all"
                >
                  账号登录
                </button>
              </div>
            </div>
          )}
          
          {/* 主要内容 */}
          <div className="flex flex-col md:flex-row gap-12 mb-20">
            {/* 左侧介绍 */}
            <div className="w-full md:w-1/2 flex flex-col justify-center animate-slideInLeft">
              <h1 className="text-4xl font-bold text-gray-900 mb-6 leading-tight">
                记录旅程 <span className="text-blue-500">探索世界</span>
              </h1>
              <p className="text-xl text-gray-600 mb-8 leading-relaxed">
                飞行日志——您的私人航空旅行管家，全方位记录您的飞行足迹，让每一段旅程都被珍藏。
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/flight-map">
                  <button className="modern-button bg-gradient-to-r from-blue-500 via-blue-400 to-sky-400 text-white px-12 py-4 rounded-full font-medium flex items-center justify-center shadow-lg btn-glow transform transition-all duration-300 hover:scale-105 group">
                    <span className="relative z-10 flex items-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3 group-hover:animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                      </svg>
                      <span className="text-lg font-semibold group-hover:tracking-wider transition-all duration-300">开始记录</span>
                      <span className="absolute -right-6 opacity-0 group-hover:opacity-100 group-hover:right-[-18px] transition-all duration-300">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </span>
                    </span>
                  </button>
                </Link>
              </div>
            </div>
            
            {/* 右侧卡片 */}
            <div className="w-full md:w-1/2 animate-slideInRight">
              <div className="bg-white rounded-xl shadow-lg overflow-hidden relative">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-sky-500/20"></div>
                <div className="p-8 relative z-10">
                  <div className="flex justify-between items-center mb-6">
                    <div className="flex items-center">
                      <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center">
                        <svg className="h-6 w-6 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                        </svg>
                      </div>
                      <div className="ml-4">
                        <h2 className="text-xl font-bold text-gray-800">飞行日志</h2>
                        <p className="text-sm text-gray-500">释放旅行的无限可能</p>
                      </div>
                    </div>
                    <div className="bg-blue-100 rounded-full p-2">
                      <svg className="h-6 w-6 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 12h.01M12 12h.01M19 12h.01M6 12a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0z" />
                      </svg>
                    </div>
                  </div>
                  
                  <div className="space-y-6">
                    <div className="flex items-center">
                      <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                        <svg className="h-5 w-5 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <div className="ml-4">
                        <h3 className="text-lg font-medium text-gray-800">交互式地图</h3>
                        <p className="text-gray-600">直观显示您的飞行路线和足迹</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center">
                      <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                        <svg className="h-5 w-5 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                        </svg>
                      </div>
                      <div className="ml-4">
                        <h3 className="text-lg font-medium text-gray-800">旅行记录</h3>
                        <p className="text-gray-600">保存您的每一次旅行体验和回忆</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center">
                      <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                        <svg className="h-5 w-5 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                        </svg>
                      </div>
                      <div className="ml-4">
                        <h3 className="text-lg font-medium text-gray-800">智能提醒</h3>
                        <p className="text-gray-600">贴心的出行备忘录功能，不遗漏任何细节</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-8 flex justify-end">
                    <button className="text-sm text-blue-500 hover:text-blue-700 flex items-center">
                      了解更多功能
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 特色功能展示 */}
          <div className="mt-16">
            <h2 className="text-2xl font-bold text-center mb-12 text-gray-800">精心设计的功能，提升您的旅行体验</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="bg-transparent backdrop-blur-sm border border-white/30 rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow duration-300 animate-fadeIn">
                <div className="h-14 w-14 bg-blue-100/50 rounded-lg flex items-center justify-center mb-6">
                  <svg className="h-8 w-8 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold mb-3 text-gray-800">交互式航线地图</h3>
                <p className="text-gray-600 mb-4">直观展示您所有的航线轨迹，清晰记录每一段旅程。支持筛选、搜索和时间线查看。</p>
                <Link href="/flight-map">
                  <button className="text-blue-500 hover:text-blue-700 flex items-center text-sm font-medium">
                    查看地图
                    <svg className="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                    </svg>
                  </button>
                </Link>
              </div>

              <div className="bg-transparent backdrop-blur-sm border border-white/30 rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow duration-300 animate-fadeIn" style={{ animationDelay: '0.2s' }}>
                <div className="h-14 w-14 bg-blue-100/50 rounded-lg flex items-center justify-center mb-6">
                  <svg className="h-8 w-8 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold mb-3 text-gray-800">旅行日记</h3>
                <p className="text-gray-600 mb-4">记录下每段旅程的精彩瞬间，添加照片、感想和心情，打造专属的旅行记忆库。</p>
                <Link href="/travel-journal">
                  <button className="text-blue-500 hover:text-blue-700 flex items-center text-sm font-medium">
                    开始记录
                    <svg className="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                    </svg>
                  </button>
                </Link>
              </div>

              <div className="bg-transparent backdrop-blur-sm border border-white/30 rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow duration-300 animate-fadeIn" style={{ animationDelay: '0.4s' }}>
                <div className="h-14 w-14 bg-blue-100/50 rounded-lg flex items-center justify-center mb-6">
                  <svg className="h-8 w-8 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold mb-3 text-gray-800">出行备忘录</h3>
                <p className="text-gray-600 mb-4">智能提醒您旅行所需物品、重要事项，确保您的每次出行都无比顺畅。</p>
                <Link href="/travel-memo">
                  <button className="text-blue-500 hover:text-blue-700 flex items-center text-sm font-medium">
                    查看备忘录
                    <svg className="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                    </svg>
                  </button>
                </Link>
              </div>
            </div>
          </div>

          {/* 登录模态框 */}
          {showLoginModal && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-bold">用户登录</h2>
                  <button onClick={() => setShowLoginModal(false)} className="text-gray-500 hover:text-gray-700">
                    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                <form onSubmit={handleLogin} className="space-y-4">
                  <div>
                    <label htmlFor="loginEmail" className="block text-sm font-medium text-gray-700 mb-1">邮箱</label>
                    <input
                      type="email"
                      id="loginEmail"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      required
                    />
                  </div>
                  <div>
                    <label htmlFor="loginPassword" className="block text-sm font-medium text-gray-700 mb-1">密码</label>
                    <input
                      type="password"
                      id="loginPassword"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      required
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <input
                        id="remember-me"
                        name="remember-me"
                        type="checkbox"
                        className="h-4 w-4 text-blue-500 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-700">
                        记住我
                      </label>
                    </div>
                    <div className="text-sm">
                      <a href="#" className="text-blue-500 hover:text-blue-600">
                        忘记密码?
                      </a>
                    </div>
                  </div>
                  <button
                    type="submit"
                    className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-500 hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    登录
                  </button>
                </form>
                <div className="mt-4 text-center">
                  <p className="text-sm text-gray-600">
                    还没有账号?{' '}
                    <button
                      onClick={() => {
                        setShowLoginModal(false);
                        setShowRegisterModal(true);
                      }}
                      className="text-blue-500 hover:text-blue-600"
                    >
                      立即注册
                    </button>
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* 注册模态框 */}
          {showRegisterModal && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-bold">用户注册</h2>
                  <button onClick={() => setShowRegisterModal(false)} className="text-gray-500 hover:text-gray-700">
                    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                <form onSubmit={handleRegister} className="space-y-4">
                  <div>
                    <label htmlFor="registerName" className="block text-sm font-medium text-gray-700 mb-1">用户名</label>
                    <input
                      type="text"
                      id="registerName"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      required
                    />
                  </div>
                  <div>
                    <label htmlFor="registerEmail" className="block text-sm font-medium text-gray-700 mb-1">邮箱</label>
                    <input
                      type="email"
                      id="registerEmail"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      required
                    />
                  </div>
                  <div>
                    <label htmlFor="registerPassword" className="block text-sm font-medium text-gray-700 mb-1">密码</label>
                    <input
                      type="password"
                      id="registerPassword"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      required
                    />
                  </div>
                  <div>
                    <div className="flex justify-between">
                      <label htmlFor="verificationCode" className="block text-sm font-medium text-gray-700 mb-1">验证码</label>
                      <button
                        type="button"
                        id="sendCodeBtn"
                        onClick={sendVerificationCode}
                        className="text-xs text-blue-500 hover:text-blue-600"
                      >
                        获取验证码
                      </button>
                    </div>
                    <input
                      type="text"
                      id="verificationCode"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      required
                    />
                  </div>
                  <button
                    type="submit"
                    className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-500 hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    注册
                  </button>
                </form>
                <div className="mt-4 text-center">
                  <p className="text-sm text-gray-600">
                    已有账号?{' '}
                    <button
                      onClick={() => {
                        setShowRegisterModal(false);
                        setShowLoginModal(true);
                      }}
                      className="text-blue-500 hover:text-blue-600"
                    >
                      立即登录
                    </button>
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </AppLayout>
    </>
  );
}