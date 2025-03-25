"use client";

import { useState, useEffect, useCallback } from 'react';
import AppLayout from '../components/AppLayout';
import axios from 'axios';
import AirportCard from '../components/AirportCard';
import AirportDetailModal from '../components/AirportDetailModal';

export default function AirportInfo() {
  const [airports, setAirports] = useState([]);
  const [selectedAirport, setSelectedAirport] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  
  // 加载机场列表
  const loadAirports = useCallback(async (isNewSearch = false) => {
    try {
      setLoading(true);
      
      const response = await axios.get('/api/airports', {
        params: {
          search: searchQuery,
          limit: 100 // 设置较大的限制，一次性获取所有机场数据
        }
      });

      const newAirports = response.data.airports;
      setAirports(newAirports);
      setLoading(false);
    } catch (error) {
      console.error('加载机场信息失败:', error);
      setLoading(false);
    }
  }, [searchQuery]);

  // 显示机场详情
  const showAirportDetail = async (iata) => {
    try {
      const response = await axios.get(`/api/airports/${iata}`);
      setSelectedAirport(response.data);
      setShowModal(true);
    } catch (error) {
      console.error('获取机场详情失败:', error);
      alert('获取机场详情失败: ' + (error.response?.data?.message || '请稍后重试'));
    }
  };

  // 关闭模态框
  const closeModal = () => {
    setShowModal(false);
  };

  // 搜索处理
  const handleSearch = (e) => {
    setSearchQuery(e.target.value);
  };

  // 监听搜索输入变化
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      loadAirports(true);
    }, 500);
    
    return () => clearTimeout(timeoutId);
  }, [searchQuery, loadAirports]);

  // 初始加载
  useEffect(() => {
    loadAirports();
  }, [loadAirports]);

  return (
    <AppLayout>
      <div className="min-h-screen bg-transparent animate-fadeIn">
        {/* 页面标题区 */}
        <div className="mb-10">
          <div className="container mx-auto px-4 relative">
            <div className="absolute -top-2 -left-4 text-blue-100 opacity-50">
              <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
                <path d="M17.8 19.2 16 11l3.5-3.5C21 6 21.5 4 21 3c-1-.5-3 0-4.5 1.5L13 8 4.8 6.2c-.5-.1-.9.1-1.1.5l-.3.5c-.2.5-.1 1 .3 1.3L9 12l-2 3H4l-1 1 3 2 2 3 1-1v-3l3-2 3.5 5.3c.3.4.8.5 1.3.3l.5-.2c.4-.3.6-.7.5-1.2z"></path>
              </svg>
            </div>
            <div className="absolute top-0 right-10 text-blue-100 opacity-30">
              <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-blue-800 mb-1 relative z-10 flex items-center">
              <svg className="w-8 h-8 mr-3 text-blue-500" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M17.8 19.2 16 11l3.5-3.5C21 6 21.5 4 21 3c-1-.5-3 0-4.5 1.5L13 8 4.8 6.2c-.5-.1-.9.1-1.1.5l-.3.5c-.2.5-.1 1 .3 1.3L9 12l-2 3H4l-1 1 3 2 2 3 1-1v-3l3-2 3.5 5.3c.3.4.8.5 1.3.3l.5-.2c.4-.3.6-.7.5-1.2z" strokeWidth="1.5" stroke="currentColor" fill="#1d4ed8" />
              </svg>
              机场信息
            </h1>
            <p className="text-blue-600">探索各地机场设施、交通方式与转机信息</p>
          
            {/* 搜索栏 */}
            <div className="mt-8 max-w-lg">
              <div className="relative">
                <input 
                  type="text" 
                  placeholder="输入机场名称、城市或IATA代码" 
                  value={searchQuery}
                  onChange={handleSearch}
                  className="w-full py-3 pl-10 pr-4 text-gray-700 bg-white/70 rounded-xl shadow-sm border-0 focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all duration-300"
                />
                <div className="absolute inset-y-0 left-0 flex items-center pl-3">
                  <svg className="h-5 w-5 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 机场列表 */}
        <div className="container mx-auto px-4 mb-16">
          <h2 className="text-xl font-normal text-gray-700 mb-6">
            {searchQuery ? `"${searchQuery}" 的搜索结果` : '机场信息'}
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-fadeIn">
            {airports.map(airport => (
              <div
                key={airport.iata}
                onClick={() => showAirportDetail(airport.iata)}
                className="group bg-transparent/20 border border-gray-100 rounded-lg p-6 shadow-sm hover:shadow-md transition-all duration-300 cursor-pointer"
              >
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-lg font-medium text-gray-800 group-hover:text-blue-600 transition-colors">
                      {airport.name}
                    </h3>
                    <p className="text-gray-500 text-sm mt-1">
                      {airport.city}, {airport.country}
                    </p>
                  </div>
                  <div className="flex items-center justify-center h-8 w-8 rounded bg-blue-50/50 text-blue-600 text-sm font-medium">
                    {airport.iata}
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-500">时区</p>
                    <p className="text-gray-700">{airport.timezone}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">海拔</p>
                    <p className="text-gray-700">{airport.elevation}m</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* 加载状态 */}
          {loading && (
            <div className="text-center py-16">
              <div className="inline-block h-10 w-10 border-2 border-gray-200 border-t-blue-500 rounded-full animate-spin"></div>
              <p className="mt-4 text-gray-500">正在加载机场信息...</p>
            </div>
          )}

          {/* 无结果提示 */}
          {airports.length === 0 && !loading && (
            <div className="text-center py-16 bg-transparent/10 rounded-xl shadow-sm">
              <svg className="mx-auto h-16 w-16 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <h3 className="text-lg font-medium text-gray-700 mt-4 mb-2">未找到机场信息</h3>
              <p className="text-gray-500 max-w-md mx-auto">
                尝试使用不同的搜索关键词，例如机场名称、所在城市或IATA代码
              </p>
              <button 
                onClick={() => setSearchQuery('')} 
                className="mt-6 px-5 py-2 text-sm text-blue-600 bg-blue-50/50 rounded-md hover:bg-blue-100/50 transition-colors"
              >
                查看全部机场
              </button>
            </div>
          )}
        </div>

        {/* 机场详情模态框 */}
        {showModal && selectedAirport && (
          <AirportDetailModal 
            airport={selectedAirport} 
            onClose={closeModal} 
          />
        )}
      </div>
    </AppLayout>
  );
}