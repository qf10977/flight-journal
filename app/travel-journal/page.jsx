"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import AppLayout from '../components/AppLayout';
import axios from 'axios';
import { motion } from 'framer-motion';

export default function TravelJournal() {
  const router = useRouter();
  const [journals, setJournals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  useEffect(() => {
    checkAuth();
  }, []);

  // 检查认证状态
  const checkAuth = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      setLoading(false);
      setError('请先登录');
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
          // 加载日志数据
          loadJournals();
        } catch (error) {
          console.error('解析用户信息失败:', error);
          setError('用户信息不完整，请重新登录');
          localStorage.removeItem('user');
          localStorage.removeItem('token');
          router.push('/');
        }
      } else {
        setError('用户信息不完整，请重新登录');
        localStorage.removeItem('token');
        router.push('/');
      }
    } catch (error) {
      console.error('验证失败:', error);
      setError('登录已过期，请重新登录');
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      setIsLoggedIn(false);
      setLoading(false);
      router.push('/');
    }
  };

  // 加载所有笔记
  const loadJournals = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await fetch('/api/journals', {
        headers: {
          'Accept': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        console.error('API错误:', response.status);
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      // 获取响应内容
      let result;
      try {
        result = await response.json();
      } catch (e) {
        console.error('解析JSON失败:', e);
        throw new Error('返回的不是有效的JSON数据');
      }
      
      if (!result.success) {
        throw new Error(result.message || '加载失败');
      }

      const journalData = result.data;
      if (!Array.isArray(journalData)) {
        console.error('数据格式错误:', journalData);
        throw new Error('返回的数据格式不正确');
      }
      
      setJournals(journalData);
      setError(null);
    } catch (err) {
      console.error('加载笔记失败:', err);
      setError(err.message || '加载失败，请稍后重试');
    } finally {
      setLoading(false);
    }
  };

  // 筛选日志
  const filteredJournals = journals.filter(journal => 
    journal.title?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    journal.content?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    journal.location?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // 动画变体
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { 
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { 
      y: 0, 
      opacity: 1,
      transition: { type: 'spring', stiffness: 100 }
    }
  };

  return (
    <AppLayout>
      <div className="min-h-screen bg-transparent py-4 px-2 sm:px-3 animate-fadeIn relative overflow-hidden">
        
        <div className="max-w-7xl mx-auto relative z-10">
          {/* 顶部横幅 - 改为与其他页面一致的样式 */}
          <div className="mb-4 relative">
            <div className="absolute -top-2 -left-4 text-blue-100 opacity-50">
              <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
                <path d="M17.8 19.2 16 11l3.5-3.5C21 6 21.5 4 21 3c-1-.5-3 0-4.5 1.5L13 8 4.8 6.2c-.5-.1-.9.1-1.1.5l-.3.5c-.2.5-.1 1 .3 1.3L9 12l-2 3H4l-1 1 3 2 2 3 1-1v-3l3-2 3.5 5.3c.3.4.8.5 1.3.3l.5-.2c.4-.3.6-.7.5-1.2z"></path>
              </svg>
            </div>
            <div className="absolute top-0 right-10 text-blue-100 opacity-30">
              <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-blue-800 mb-1 relative z-10 flex items-center">
              <svg className="w-8 h-8 mr-3 text-blue-500" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M17.8 19.2 16 11l3.5-3.5C21 6 21.5 4 21 3c-1-.5-3 0-4.5 1.5L13 8 4.8 6.2c-.5-.1-.9.1-1.1.5l-.3.5c-.2.5-.1 1 .3 1.3L9 12l-2 3H4l-1 1 3 2 2 3 1-1v-3l3-2 3.5 5.3c.3.4.8.5 1.3.3l.5-.2c.4-.3.6-.7.5-1.2z" strokeWidth="1.5" stroke="currentColor" fill="#1d4ed8" />
              </svg>
              出行随记
            </h1>
            <p className="text-blue-600">记录您的旅行经历和感受，分享精彩瞬间和故事。让每一次旅行都成为永恒的记忆。</p>
          </div>
          
          {/* 控制栏 */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 space-y-3 md:space-y-0">
            {/* 搜索框 */}
            <div className="relative w-full md:w-auto md:flex-1 md:max-w-md">
              <input
                type="text"
                placeholder="搜索随记..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 rounded-xl border-0 bg-white shadow-md focus:ring-2 focus:ring-blue-400 transition-all duration-300"
              />
              <svg className="absolute left-3 top-2.5 w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            
            <div className="flex space-x-2 w-full md:w-auto">
              {/* 筛选按钮 */}
              <button 
                onClick={() => setIsFilterOpen(!isFilterOpen)}
                className="bg-gradient-to-br from-white to-blue-50 text-blue-600 px-3 py-2 rounded-xl font-medium flex items-center justify-center shadow-md hover:bg-blue-50 transition-all duration-300 border border-blue-100"
              >
                <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                </svg>
                筛选
              </button>
              
              {/* 发布按钮 */}
              <button 
                onClick={() => router.push('/publish-journal')}
                className="bg-gradient-to-r from-blue-400 to-blue-600 hover:from-blue-500 hover:to-blue-700 text-white px-4 py-2 rounded-xl font-medium flex items-center justify-center shadow-md hover:shadow-lg transition-all duration-300 flex-1 md:flex-none"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                写随记
              </button>
            </div>
          </div>
          
          {/* 筛选面板 - 条件显示 */}
          {isFilterOpen && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="bg-gradient-to-br from-transparent to-blue-50/30 rounded-xl shadow-md p-3 mb-4 border border-blue-100 relative overflow-hidden"
            >
              <div className="absolute -right-8 -bottom-8 text-blue-50 opacity-10">
                <svg xmlns="http://www.w3.org/2000/svg" width="120" height="120" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
                  <path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z" />
                </svg>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 relative z-10">
                <div>
                  <label className="block text-sm font-medium text-blue-700 mb-1">目的地</label>
                  <select className="w-full rounded-lg border-blue-200 shadow-sm focus:border-blue-500 focus:ring-blue-500 bg-white">
                    <option value="">全部地点</option>
                    <option value="北京">北京</option>
                    <option value="上海">上海</option>
                    <option value="广州">广州</option>
                    <option value="深圳">深圳</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-blue-700 mb-1">时间</label>
                  <select className="w-full rounded-lg border-blue-200 shadow-sm focus:border-blue-500 focus:ring-blue-500 bg-white">
                    <option value="">全部时间</option>
                    <option value="今天">今天</option>
                    <option value="本周">本周</option>
                    <option value="本月">本月</option>
                    <option value="今年">今年</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-blue-700 mb-1">排序方式</label>
                  <select className="w-full rounded-lg border-blue-200 shadow-sm focus:border-blue-500 focus:ring-blue-500 bg-white">
                    <option value="newest">最新发布</option>
                    <option value="oldest">最早发布</option>
                    <option value="popular">最受欢迎</option>
                  </select>
                </div>
              </div>
            </motion.div>
          )}

          {/* 内容区域 */}
          {loading ? (
            <div className="flex flex-col justify-center items-center py-20">
              <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-600 mb-4"></div>
              <p className="text-blue-600 font-medium">正在加载您的旅行回忆...</p>
            </div>
          ) : error ? (
            <div className="bg-gradient-to-br from-transparent to-blue-50/30 rounded-2xl shadow-xl p-10 text-center max-w-lg mx-auto border border-blue-100 relative overflow-hidden">
              <div className="absolute right-0 bottom-0 text-blue-100 opacity-10">
                <svg xmlns="http://www.w3.org/2000/svg" width="150" height="150" fill="currentColor" viewBox="0 0 16 16">
                  <path d="M8 16c3.314 0 6-2 6-5.5 0-1.5-.5-4-2.5-6 .25 1.5-1.25 2-1.25 2C11 4 9 .5 6 0c.357 2 .5 4-2 6-1.25 1-2 2.729-2 4.5C2 14 4.686 16 8 16Zm0-1c-1.657 0-3-1-3-2.75 0-.75.25-2 1.25-3C6.125 10 7 10.5 7 10.5c-.375-1.25.5-3.25 2-3.5-.179 1-.25 2 1 3 .625.5 1 1.364 1 2.25C11 14 9.657 15 8 15Z"/>
                </svg>
              </div>
              <div className="bg-red-100 text-red-500 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 relative z-10">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-blue-700 mb-3 relative z-10">加载失败</h3>
              <p className="text-blue-600 mb-6 relative z-10">{error}</p>
              <button 
                onClick={loadJournals} 
                className="bg-gradient-to-r from-blue-400 to-blue-600 hover:from-blue-500 hover:to-blue-700 text-white px-6 py-3 rounded-xl font-medium transition-colors shadow-md relative z-10"
              >
                重新加载
              </button>
            </div>
          ) : journals.length === 0 ? (
            <div className="bg-gradient-to-br from-transparent to-blue-50/30 rounded-2xl shadow-xl p-16 text-center max-w-2xl mx-auto border border-blue-100 relative overflow-hidden">
              <div className="absolute right-0 bottom-0 text-blue-100 opacity-10">
                <svg xmlns="http://www.w3.org/2000/svg" width="200" height="200" fill="currentColor" viewBox="0 0 16 16">
                  <path d="M8 16c3.314 0 6-2 6-5.5 0-1.5-.5-4-2.5-6 .25 1.5-1.25 2-1.25 2C11 4 9 .5 6 0c.357 2 .5 4-2 6-1.25 1-2 2.729-2 4.5C2 14 4.686 16 8 16Zm0-1c-1.657 0-3-1-3-2.75 0-.75.25-2 1.25-3C6.125 10 7 10.5 7 10.5c-.375-1.25.5-3.25 2-3.5-.179 1-.25 2 1 3 .625.5 1 1.364 1 2.25C11 14 9.657 15 8 15Z"/>
                </svg>
              </div>
              <img src="/images/empty-journal.svg" alt="没有随记" className="w-40 h-40 mx-auto mb-6 opacity-75 relative z-10" />
              <h3 className="text-2xl font-bold text-blue-700 mb-3 relative z-10">还没有随记</h3>
              <p className="text-blue-600 mb-8 text-lg relative z-10">
                开始记录您的旅行故事和精彩瞬间吧！每一次旅行都值得被记住。
              </p>
              <button 
                onClick={() => router.push('/publish-journal')} 
                className="bg-gradient-to-r from-blue-400 to-blue-600 hover:from-blue-500 hover:to-blue-700 text-white px-8 py-4 rounded-xl font-medium transition-colors shadow-lg text-lg relative z-10"
              >
                创建第一篇随记
              </button>
            </div>
          ) : (
            <motion.div 
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
            >
              {filteredJournals.map(journal => (
                <motion.div key={journal._id} variants={itemVariants}>
                  <JournalCard journal={journal} />
                </motion.div>
              ))}
            </motion.div>
          )}
          
          {/* 分页控件 - 当有内容时显示 */}
          {!loading && !error && journals.length > 0 && (
            <div className="mt-8 flex justify-center">
              <nav className="flex items-center space-x-1">
                <button className="px-2 py-1 rounded-lg border border-blue-200 bg-gradient-to-br from-white to-blue-50 text-blue-500 hover:bg-blue-50">
                  上一页
                </button>
                <button className="px-2 py-1 rounded-lg bg-blue-600 text-white">1</button>
                <button className="px-2 py-1 rounded-lg border border-blue-200 bg-gradient-to-br from-white to-blue-50 text-blue-700 hover:bg-blue-50">2</button>
                <button className="px-2 py-1 rounded-lg border border-blue-200 bg-gradient-to-br from-white to-blue-50 text-blue-700 hover:bg-blue-50">3</button>
                <span className="px-1 text-blue-500">...</span>
                <button className="px-2 py-1 rounded-lg border border-blue-200 bg-gradient-to-br from-white to-blue-50 text-blue-700 hover:bg-blue-50">8</button>
                <button className="px-2 py-1 rounded-lg border border-blue-200 bg-gradient-to-br from-white to-blue-50 text-blue-500 hover:bg-blue-50">
                  下一页
                </button>
              </nav>
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
}

// 日记卡片组件
const JournalCard = ({ journal }) => {
  const router = useRouter();
  
  const handleClick = () => {
    router.push(`/journal-detail?id=${journal._id}`);
  };

  // 格式化日期
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('zh-CN', { year: 'numeric', month: 'long', day: 'numeric' });
  };

  return (
    <div 
      className="bg-gradient-to-br from-transparent to-blue-50/30 rounded-xl shadow-lg overflow-hidden cursor-pointer transition-all duration-300 hover:shadow-xl hover:-translate-y-2 group border border-blue-100"
      onClick={handleClick}
    >
      <div className="relative h-48">
        {journal.images?.length > 0 ? (
          <img 
            src={`/api/journals/images/${journal.images[0]._id}`} 
            alt={journal.title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-100/50 to-transparent">
            <svg className="w-16 h-16 text-blue-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" 
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/>
            </svg>
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent opacity-70 group-hover:opacity-90 transition-opacity duration-300"></div>
        
        {/* 地点标签 */}
        <div className="absolute top-2 right-2 bg-white/70 backdrop-blur-sm text-blue-700 px-2 py-0.5 rounded-full text-xs font-medium shadow flex items-center">
          <svg className="w-3 h-3 mr-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" 
              d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          <span className="truncate max-w-[100px]">{journal.location || '未知地点'}</span>
        </div>
        
        <div className="absolute bottom-0 left-0 right-0 p-3">
          <h3 className="text-white text-lg font-bold mb-1 line-clamp-1 group-hover:scale-105 transform transition-transform duration-300">{journal.title}</h3>
          <div className="bg-white/20 backdrop-blur-sm h-0.5 w-12 mb-2 group-hover:w-20 transition-all duration-300"></div>
        </div>
      </div>
      
      <div className="p-3">
        <p className="text-blue-600 text-xs line-clamp-2 mb-2 leading-relaxed">
          {journal.content || '无内容描述'}
        </p>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white font-bold overflow-hidden border-2 border-white shadow-sm">
              {journal.user?.avatar ? (
                <img 
                  src={journal.user.avatar} 
                  alt={journal.user.name} 
                  className="w-full h-full object-cover"
                />
              ) : (
                <span>{journal.user?.name?.[0]?.toUpperCase() || '?'}</span>
              )}
            </div>
            <div className="ml-2">
              <div className="text-xs font-medium text-blue-700">{journal.user?.name || '匿名用户'}</div>
              <div className="text-[10px] text-blue-500">{formatDate(journal.createdAt || new Date())}</div>
            </div>
          </div>
          
          <div className="flex space-x-3 text-blue-400">
            <div className="flex items-center group-hover:text-red-500 transition-colors duration-300">
              <svg className="w-3 h-3 mr-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" 
                  d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"/>
              </svg>
              <span className="text-xs">{journal.likes?.length || 0}</span>
            </div>
            <div className="flex items-center group-hover:text-blue-500 transition-colors duration-300">
              <svg className="w-3 h-3 mr-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" 
                  d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z"/>
              </svg>
              <span className="text-xs">{journal.comments?.length || 0}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}