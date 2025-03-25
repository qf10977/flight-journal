'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import AppLayout from '../components/AppLayout';
import CitySelector from '../components/CitySelector';
import TravelMemoItem from '../components/TravelMemoItem';
import axios from 'axios';

// 天气API配置
const WEATHER_API_KEY = '6f3d186c3e1b478eb8388d69161b5df2';
const WEATHER_API_BASE = 'https://devapi.qweather.com/v7';

export default function TravelMemo() {
  const router = useRouter();
  
  // 状态管理
  const [plans, setPlans] = useState([]);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [memos, setMemos] = useState([]);
  const [destination, setDestination] = useState('');
  const [date, setDate] = useState('');
  const [memoInput, setMemoInput] = useState('');
  const [weatherInfo, setWeatherInfo] = useState({ temperature: '--', condition: '加载中...', notice: '' });
  const [countdown, setCountdown] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [error, setError] = useState(null);

  // 初始化检查用户是否登录
  useEffect(() => {
    checkAuth();
  }, []);

  // 检查认证状态
  const checkAuth = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
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
          // 加载保存的计划
          const savedPlans = JSON.parse(localStorage.getItem('plans') || '[]');
          setPlans(savedPlans);
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
      router.push('/');
    }
  };

  // 更新倒计时
  useEffect(() => {
    if (!selectedPlan) return;
    
    const intervalId = setInterval(() => {
      updateCountdown(selectedPlan.date);
    }, 60000); // 每分钟更新一次
    
    updateCountdown(selectedPlan.date);
    
    return () => clearInterval(intervalId);
  }, [selectedPlan]);

  // 获取天气信息
  useEffect(() => {
    if (!selectedPlan) return;
    
    const fetchWeather = async () => {
      try {
        const weather = await getWeather(selectedPlan.destination);
        setWeatherInfo(weather);
      } catch (error) {
        console.error('获取天气失败:', error);
        setWeatherInfo({
          temperature: '--',
          condition: '获取失败',
          notice: error.message || '暂时无法获取天气信息'
        });
      }
    };
    
    fetchWeather();
  }, [selectedPlan]);

  // 加载备忘录
  useEffect(() => {
    if (!selectedPlan) return;
    
    const savedMemos = JSON.parse(localStorage.getItem(`memos_${selectedPlan.id}`) || '[]');
    setMemos(savedMemos);
  }, [selectedPlan]);

  // 保存计划
  const handleSavePlan = (e) => {
    e.preventDefault();
    
    if (!destination || !date) {
      alert('请填写完整信息');
      return;
    }

    const plan = {
      id: Date.now(),
      destination,
      date
    };

    const newPlans = [...plans, plan];
    setPlans(newPlans);
    localStorage.setItem('plans', JSON.stringify(newPlans));
    
    // 清空表单
    setDestination('');
    setDate('');
  };

  // 选择计划
  const handleSelectPlan = (plan) => {
    setSelectedPlan(plan);
  };

  // 删除计划
  const handleDeletePlan = (planId) => {
    if (!confirm('确定要删除这个出行计划吗？')) {
      return;
    }

    const updatedPlans = plans.filter(p => p.id !== planId);
    setPlans(updatedPlans);
    localStorage.setItem('plans', JSON.stringify(updatedPlans));

    // 删除相关的备忘录
    localStorage.removeItem(`memos_${planId}`);

    // 如果删除的是当前选中的计划，清空选中状态
    if (selectedPlan?.id === planId) {
      setSelectedPlan(null);
      setMemos([]);
    }
  };

  // 添加备忘项
  const handleAddMemo = () => {
    if (!memoInput.trim() || !selectedPlan) return;
    
    const newMemo = {
      id: Date.now(),
      content: memoInput.trim(),
      completed: false
    };
    
    const updatedMemos = [...memos, newMemo];
    setMemos(updatedMemos);
    localStorage.setItem(`memos_${selectedPlan.id}`, JSON.stringify(updatedMemos));
    setMemoInput('');
  };

  // 切换备忘项状态
  const toggleMemo = (memoId) => {
    const updatedMemos = memos.map(memo => 
      memo.id === memoId ? {...memo, completed: !memo.completed} : memo
    );
    
    setMemos(updatedMemos);
    localStorage.setItem(`memos_${selectedPlan.id}`, JSON.stringify(updatedMemos));
  };

  // 删除备忘项
  const deleteMemo = (memoId) => {
    const updatedMemos = memos.filter(memo => memo.id !== memoId);
    setMemos(updatedMemos);
    localStorage.setItem(`memos_${selectedPlan.id}`, JSON.stringify(updatedMemos));
  };

  // 获取天气信息
  const getWeather = async (city) => {
    try {
      // 查找城市ID
      const response = await fetch(`/api/weather?city=${encodeURIComponent(city)}`);
      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.message || '获取天气失败');
      }
      
      return {
        temperature: data.data.temperature,
        condition: data.data.condition,
        notice: data.data.notice
      };
    } catch (error) {
      console.error('获取天气失败:', error);
      return {
        temperature: '--',
        condition: '获取失败',
        notice: error.message || '暂时无法获取天气信息'
      };
    }
  };

  // 更新倒计时
  const updateCountdown = (targetDate) => {
    const target = new Date(targetDate);
    const now = new Date();
    const diff = target - now;

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    setCountdown(`${days}天 ${hours}小时 ${minutes}分钟`);
  };

  return (
    <AppLayout>
      <div className="animate-fadeIn">
        <div className="mb-6 relative">
          <div className="absolute -top-2 -left-4 text-blue-100 opacity-50">
            <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
            </svg>
          </div>
          <div className="absolute top-0 right-10 text-blue-100 opacity-30">
            <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
              <path d="M17.8 19.2 16 11l3.5-3.5C21 6 21.5 4 21 3c-1-.5-3 0-4.5 1.5L13 8 4.8 6.2c-.5-.1-.9.1-1.1.5l-.3.5c-.2.5-.1 1 .3 1.3L9 12l-2 3H4l-1 1 3 2 2 3 1-1v-3l3-2 3.5 5.3c.3.4.8.5 1.3.3l.5-.2c.4-.3.6-.7.5-1.2z"></path>
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-blue-800 mb-2 relative z-10">✈️ 出行备忘录</h1>
          <p className="text-blue-600">记录您的旅行计划，追踪天气变化，不遗漏任何细节</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* 左侧 - 新增出行计划 */}
          <div className="bg-gradient-to-br from-white to-blue-50 rounded-xl shadow-md p-6 animate-slideInLeft lg:col-span-1 border border-blue-100 relative overflow-hidden">
            <div className="absolute -right-8 -bottom-8 text-blue-50 opacity-20">
              <svg xmlns="http://www.w3.org/2000/svg" width="120" height="120" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
                <path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z" />
              </svg>
            </div>
            <h2 className="text-xl font-bold mb-6 flex items-center text-blue-700">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              新增出行计划
            </h2>
            <form onSubmit={handleSavePlan} className="space-y-4 relative z-10">
              <CitySelector 
                value={destination} 
                onChange={setDestination} 
                label="目的地城市"
              />
              <div>
                <label className="block text-sm font-medium text-blue-700 mb-1">出发日期</label>
                <input 
                  type="date" 
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full px-4 py-2 border border-blue-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all duration-200 bg-white"
                />
              </div>
              <button 
                type="submit" 
                className="w-full bg-gradient-to-r from-blue-400 to-blue-600 hover:from-blue-500 hover:to-blue-700 text-white py-3 px-4 rounded-lg font-medium transition-all duration-300 flex items-center justify-center shadow-md hover:shadow-lg"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                保存计划
              </button>
            </form>

            {/* 已保存的计划列表 */}
            <div className="mt-8 relative z-10">
              <h3 className="text-lg font-bold mb-4 text-blue-700 flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
                已保存的计划
              </h3>
              {plans.length === 0 ? (
                <div className="text-center py-8 text-gray-500 bg-blue-50 rounded-lg border border-blue-100">
                  暂无出行计划，请添加新计划
                </div>
              ) : (
                <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
                  {plans.map(plan => (
                    <div 
                      key={plan.id} 
                      onClick={() => handleSelectPlan(plan)} 
                      className={`border rounded-lg p-4 cursor-pointer transition-all duration-200 hover:shadow-md group ${selectedPlan?.id === plan.id ? 'border-blue-500 bg-blue-50' : 'border-blue-200 hover:border-blue-300 hover:bg-blue-50'}`}
                    >
                      <div className="flex justify-between items-center">
                        <div>
                          <div className="font-medium text-lg flex items-center">
                            <span className="text-blue-500 mr-2">✈️</span>
                            {plan.destination}
                          </div>
                          <div className="text-sm text-blue-500">
                            出发日期: {new Date(plan.date).toLocaleDateString()}
                          </div>
                        </div>
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeletePlan(plan.id);
                          }}
                          className="text-gray-400 hover:text-red-500 p-2 rounded-full hover:bg-red-50 transition-colors"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* 右侧 - 备忘录详情 */}
          <div className="lg:col-span-2">
            {selectedPlan ? (
              <div className="space-y-6 animate-slideInRight">
                {/* 天气卡片 */}
                <div className="bg-gradient-to-r from-blue-400 to-blue-600 rounded-xl shadow-md p-6 text-white relative overflow-hidden">
                  <div className="absolute -right-10 -top-10 text-white opacity-10">
                    <svg xmlns="http://www.w3.org/2000/svg" width="150" height="150" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M6.76 4.84l-1.8-1.79-1.41 1.41 1.79 1.79 1.42-1.41zM4 10.5H1v2h3v-2zm9-9.95h-2V3.5h2V.55zm7.45 3.91l-1.41-1.41-1.79 1.79 1.41 1.41 1.79-1.79zm-3.21 13.7l1.79 1.8 1.41-1.41-1.8-1.79-1.4 1.4zM20 10.5v2h3v-2h-3zm-8-5c-3.31 0-6 2.69-6 6s2.69 6 6 6 6-2.69 6-6-2.69-6-6-6zm-1 16.95h2V19.5h-2v2.95zm-7.45-3.91l1.41 1.41 1.79-1.8-1.41-1.41-1.79 1.8z"/>
                    </svg>
                  </div>
                  <div className="flex justify-between items-center mb-4 relative z-10">
                    <h2 className="text-xl font-bold flex items-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" />
                      </svg>
                      {selectedPlan.destination}天气
                    </h2>
                    <div className="text-3xl font-bold">{weatherInfo.temperature}°C</div>
                  </div>
                  <div className="flex justify-between relative z-10">
                    <div>
                      <div className="text-sm opacity-90">天气状况</div>
                      <div className="font-medium">{weatherInfo.condition}</div>
                    </div>
                    <div>
                      <div className="text-sm opacity-90">贴士</div>
                      <div className="font-medium">{weatherInfo.notice || '暂无天气提示'}</div>
                    </div>
                  </div>
                </div>

                {/* 倒计时卡片 */}
                <div className="bg-gradient-to-br from-white to-blue-50 rounded-xl shadow-md p-6 border border-blue-100 relative overflow-hidden">
                  <div className="absolute -left-8 -bottom-8 text-blue-100 opacity-20">
                    <svg xmlns="http://www.w3.org/2000/svg" width="120" height="120" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10 10-4.5 10-10S17.5 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm.5-13H11v6l5.2 3.2.8-1.3-4.5-2.7V7z"/>
                    </svg>
                  </div>
                  <h3 className="text-lg font-bold mb-3 text-blue-700 flex items-center relative z-10">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    行程倒计时
                  </h3>
                  <div className="flex items-center space-x-4 relative z-10">
                    <div className="bg-blue-100 rounded-full p-3">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div>
                      <div className="text-sm text-blue-500">距离出发还有</div>
                      <div className="text-2xl font-bold text-blue-600">{countdown}</div>
                    </div>
                  </div>
                </div>

                {/* 备忘项管理 */}
                <div className="bg-gradient-to-br from-white to-blue-50 rounded-xl shadow-md p-6 border border-blue-100 relative overflow-hidden">
                  <div className="absolute right-0 bottom-0 text-blue-100 opacity-10">
                    <svg xmlns="http://www.w3.org/2000/svg" width="150" height="150" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M19 3h-4.18C14.4 1.84 13.3 1 12 1c-1.3 0-2.4.84-2.82 2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-7 0c.55 0 1 .45 1 1s-.45 1-1 1-1-.45-1-1 .45-1 1-1zm2 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z"/>
                    </svg>
                  </div>
                  <h3 className="text-lg font-bold mb-4 text-blue-700 flex items-center relative z-10">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                    行程备忘
                  </h3>
                  
                  {/* 添加备忘项 */}
                  <div className="flex mb-4 relative z-10">
                    <input
                      type="text"
                      value={memoInput}
                      onChange={(e) => setMemoInput(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleAddMemo()}
                      placeholder="添加新的备忘项..."
                      className="flex-1 px-4 py-2 border border-blue-200 rounded-l-lg focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white"
                    />
                    <button
                      onClick={handleAddMemo}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-r-lg transition-colors"
                    >
                      添加
                    </button>
                  </div>
                  
                  {/* 备忘项列表 */}
                  <div className="space-y-2 max-h-72 overflow-y-auto pr-2 relative z-10">
                    {memos.length === 0 ? (
                      <div className="text-center py-8 text-blue-500 bg-blue-50 rounded-lg border border-blue-100">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 mx-auto mb-2 text-blue-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                        </svg>
                        暂无备忘项，添加一些内容吧！
                      </div>
                    ) : (
                      <div className="divide-y divide-blue-100">
                        {memos.map(memo => (
                          <TravelMemoItem
                            key={memo.id}
                            memo={memo}
                            onToggle={toggleMemo}
                            onDelete={deleteMemo}
                          />
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-gradient-to-br from-white to-blue-50 rounded-xl shadow-md p-12 text-center animate-fadeIn border border-blue-100 relative overflow-hidden">
                <div className="absolute left-0 top-0 w-full h-full opacity-5">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" className="w-full h-full text-blue-500" fill="currentColor">
                    <path d="M511.9 150c-14.2-93.3-105-116.2-119.2-53.2-14.3 63 14.3 126 42.8 153.4 28.5 27.5 90.7 56.9 153.4 42.8 63-14.2 41.5-105.3-76.6-119.2-118.1-13.9-147.7 118.1-0.4 76.5" />
                  </svg>
                </div>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto text-blue-400 mb-4 relative z-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
                <h3 className="text-xl font-bold text-blue-700 mb-2 relative z-10">请选择一个出行计划</h3>
                <p className="text-blue-600 relative z-10">
                  在左侧选择一个已保存的计划，或者创建一个新计划，开始您的旅程吧！
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </AppLayout>
  );
}