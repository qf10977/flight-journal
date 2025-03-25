"use client";

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import axios from 'axios';
import AppLayout from '../components/AppLayout';
import { useRouter } from 'next/navigation';

// 动态导入地图组件，禁用SSR
const MapComponent = dynamic(() => import('../components/MapComponent'), {
  ssr: false,
  loading: () => (
    <div className="h-[480px] flex items-center justify-center bg-gray-100 rounded-lg">
      <div className="text-center">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500 mx-auto mb-2"></div>
        <p>加载地图中...</p>
      </div>
    </div>
  )
});

export default function FlightMap() {
  const router = useRouter();
  const [flights, setFlights] = useState([]);
  const [cities, setCities] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedYear, setSelectedYear] = useState('');
  const [flightForm, setFlightForm] = useState({
    flightNumber: '',
    departureCity: '',
    arrivalCity: '',
    flightDate: ''
  });
  const [years, setYears] = useState([]);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [error, setError] = useState(null);
  const [mapKey, setMapKey] = useState(Date.now()); // 添加key用于强制重新渲染地图组件

  // 初始化
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
          // 加载航班和城市数据
          loadFlights();
          loadCities();
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

  // 加载航班数据
  const loadFlights = async () => {
    try {
      setLoading(true);
      console.log('开始加载航班数据');
      
      // 尝试从 API 获取数据
      let flightData = [];
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get('/api/flights', {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        console.log('API 返回数据:', response.data);
        
        // 确保 flightData 是一个数组
        if (response.data && response.data.success && Array.isArray(response.data.data)) {
          flightData = response.data.data;
        } else if (Array.isArray(response.data)) {
          flightData = response.data;
        } else {
          console.warn('API 返回的数据格式不正确:', response.data);
          
          // 使用示例数据
          flightData = getSampleFlightData();
        }
      } catch (error) {
        console.warn('从 API 加载航班失败，使用示例数据:', error);
        
        // 使用示例数据
        flightData = getSampleFlightData();
      }
      
      console.log('最终使用的航班数据:', flightData);
      
      // 确保 flightData 是一个数组
      if (!Array.isArray(flightData)) {
        console.error('flightData 不是一个数组:', flightData);
        flightData = getSampleFlightData();
      }
      
      setFlights(flightData);
      
      // 提取年份列表
      const uniqueYears = [...new Set(flightData.map(flight => 
        new Date(flight.date).getFullYear()
      ))].sort((a, b) => b - a); // 降序排列
      
      setYears(uniqueYears);
      setLoading(false);
    } catch (error) {
      console.error('加载航班失败:', error);
      setFlights(getSampleFlightData());
      setLoading(false);
    }
  };
  
  // 获取示例航班数据
  const getSampleFlightData = () => {
    return [
      {
        id: 1,
        flightNumber: 'CA1234',
        departureCity: '北京',
        arrivalCity: '上海',
        date: '2023-03-15',
        status: '已完成',
        departureCoords: {
          longitude: 116.4074,
          latitude: 39.9042
        },
        arrivalCoords: {
          longitude: 121.4737,
          latitude: 31.2304
        }
      },
      {
        id: 2,
        flightNumber: 'MU5678',
        departureCity: '上海',
        arrivalCity: '广州',
        date: '2023-04-20',
        status: '已完成',
        departureCoords: {
          longitude: 121.4737,
          latitude: 31.2304
        },
        arrivalCoords: {
          longitude: 113.2644,
          latitude: 23.1291
        }
      },
      {
        id: 3,
        flightNumber: 'CZ3456',
        departureCity: '广州',
        arrivalCity: '成都',
        date: '2023-05-10',
        status: '已完成',
        departureCoords: {
          longitude: 113.2644,
          latitude: 23.1291
        },
        arrivalCoords: {
          longitude: 104.0668,
          latitude: 30.5728
        }
      }
    ];
  };

  // 加载城市数据
  const loadCities = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('/api/cities', {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (response.data && response.data.success) {
        setCities(response.data.data);
      } else {
        console.error('获取城市数据失败:', response.data);
      }
    } catch (error) {
      console.error('加载城市数据失败:', error);
    }
  };

  // 处理表单输入变化
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFlightForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // 添加航班
  const handleAddFlight = async (e) => {
    e.preventDefault();
    
    const { flightNumber, departureCity, arrivalCity, flightDate } = flightForm;
    
    if (departureCity === arrivalCity) {
      alert('出发城市和到达城市不能相同');
      return;
    }

    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      if (!token) {
        alert('请先登录');
        return;
      }

      const departureCityData = cities.find(c => c._id === departureCity);
      const arrivalCityData = cities.find(c => c._id === arrivalCity);

      if (!departureCityData || !arrivalCityData) {
        alert('城市数据无效');
        return;
      }

      const flightData = {
        flightNumber,
        departureCity: departureCityData.name,
        arrivalCity: arrivalCityData.name,
        date: flightDate,
        departureCoords: {
          longitude: departureCityData.longitude,
          latitude: departureCityData.latitude
        },
        arrivalCoords: {
          longitude: arrivalCityData.longitude,
          latitude: arrivalCityData.latitude
        },
        departureAirport: departureCityData.airports[0],
        arrivalAirport: arrivalCityData.airports[0]
      };

      await axios.post('/api/flights', flightData, {
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      // 清空表单
      setFlightForm({
        flightNumber: '',
        departureCity: '',
        arrivalCity: '',
        flightDate: ''
      });
      
      // 重新加载航班数据
      await loadFlights();
      
      alert('航班添加成功！');
    } catch (error) {
      console.error('添加航班失败:', error);
      const errorMessage = error.response?.data?.message || error.message || '添加失败，请检查数据格式';
      alert('添加航班失败: ' + errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // 删除航班
  const deleteFlight = async (flightId) => {
    if (!confirm('确定要删除这个航班记录吗？')) {
      return;
    }

    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      await axios.delete(`/api/flights/${flightId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      // 重新加载航班数据
      await loadFlights();
      alert('航班删除成功！');
    } catch (error) {
      console.error('删除航班失败:', error);
      alert('删除航班失败: ' + (error.response?.data?.message || '请稍后重试'));
    } finally {
      setLoading(false);
    }
  };

  // 按年份筛选
  const filterByYear = (e) => {
    setSelectedYear(e.target.value);
  };

  // 获取过滤后的航班
  const getFilteredFlights = () => {
    if (!selectedYear || selectedYear === 'all') {
      return flights;
    }
    
    return flights.filter(flight => {
      const flightYear = new Date(flight.date).getFullYear().toString();
      return flightYear === selectedYear;
    });
  };

  return (
    <AppLayout>
      <div className="animate-fadeIn">
        <div className="mb-6 relative">
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
          <h1 className="text-2xl font-bold text-blue-800 mb-2 relative z-10">✈️ 航班地图</h1>
          <p className="text-blue-600">在这里查看并管理您的所有飞行记录</p>
        </div>
        
        {/* 上半部分 - 左右两栏 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* 左侧表单 */}
          <div className="bg-gradient-to-br from-white to-blue-50 rounded-xl shadow-md p-6 animate-slideInLeft border border-blue-100 relative overflow-hidden">
            <div className="absolute -right-8 -bottom-8 text-blue-50 opacity-20">
              <svg xmlns="http://www.w3.org/2000/svg" width="120" height="120" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
                <path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z" />
              </svg>
            </div>
            <h2 className="text-xl font-bold mb-6 flex items-center text-blue-700 relative z-10">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              添加航班记录
            </h2>
            <form onSubmit={handleAddFlight} className="space-y-5 relative z-10">
              <div>
                <label className="block text-sm font-medium text-blue-700 mb-1">航班号</label>
                <input
                  type="text"
                  name="flightNumber"
                  value={flightForm.flightNumber}
                  onChange={handleInputChange}
                  placeholder="例如: MU2501"
                  className="w-full px-4 py-2 border border-blue-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all duration-200 bg-white"
                  required
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-blue-700 mb-1">出发城市</label>
                  <select
                    name="departureCity"
                    value={flightForm.departureCity}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-blue-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all duration-200 bg-white"
                    required
                  >
                    <option value="">选择城市</option>
                    {cities.map(city => (
                      <option key={`dep-${city._id}`} value={city._id}>
                        {city.name}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-blue-700 mb-1">到达城市</label>
                  <select
                    name="arrivalCity"
                    value={flightForm.arrivalCity}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-blue-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all duration-200 bg-white"
                    required
                  >
                    <option value="">选择城市</option>
                    {cities.map(city => (
                      <option key={`arr-${city._id}`} value={city._id}>
                        {city.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-blue-700 mb-1">航班日期</label>
                <input
                  type="date"
                  name="flightDate"
                  value={flightForm.flightDate}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-blue-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all duration-200 bg-white"
                  required
                />
              </div>
              
              <button
                type="submit"
                className="w-full bg-gradient-to-r from-blue-400 to-blue-600 hover:from-blue-500 hover:to-blue-700 text-white py-3 px-4 rounded-lg font-medium transition-all duration-300 flex items-center justify-center shadow-md hover:shadow-lg"
                disabled={loading}
              >
                {loading ? (
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                )}
                {loading ? '添加中...' : '添加航班'}
              </button>
            </form>
          </div>
          
          {/* 右侧地图 */}
          <div className="bg-gradient-to-br from-white to-blue-50 rounded-xl shadow-md overflow-hidden h-auto animate-slideInRight border border-blue-100 relative">
            <div className="absolute top-2 right-2 z-10 bg-white bg-opacity-80 rounded-full p-2 shadow-sm">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
              </svg>
            </div>
            <div className="h-[480px] relative" id="map-container">
              <style jsx global>{`
                .map-container {
                  height: 100% !important;
                  width: 100% !important;
                  z-index: 0;
                }
                
                .leaflet-container {
                  height: 100% !important;
                  width: 100% !important;
                  z-index: 0;
                }
              `}</style>
              <MapComponent 
                flights={getFilteredFlights()} 
                key={mapKey}
              />
            </div>
          </div>
        </div>
        
        {/* 下半部分 - 我的航班列表 */}
        {flights.length > 0 && (
          <div className="bg-gradient-to-br from-white to-blue-50 rounded-xl shadow-md p-6 animate-slideInLeft border border-blue-100 relative overflow-hidden">
            <div className="absolute right-0 bottom-0 text-blue-100 opacity-10">
              <svg xmlns="http://www.w3.org/2000/svg" width="200" height="200" fill="currentColor" viewBox="0 0 16 16">
                <path d="M8 16c3.314 0 6-2 6-5.5 0-1.5-.5-4-2.5-6 .25 1.5-1.25 2-1.25 2C11 4 9 .5 6 0c.357 2 .5 4-2 6-1.25 1-2 2.729-2 4.5C2 14 4.686 16 8 16Zm0-1c-1.657 0-3-1-3-2.75 0-.75.25-2 1.25-3C6.125 10 7 10.5 7 10.5c-.375-1.25.5-3.25 2-3.5-.179 1-.25 2 1 3 .625.5 1 1.364 1 2.25C11 14 9.657 15 8 15Z"/>
              </svg>
            </div>
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6 relative z-10">
              <h2 className="text-xl font-bold flex items-center text-blue-700">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                我的航班记录
              </h2>
              {years.length > 0 && (
                <div className="flex items-center bg-blue-50 rounded-lg px-3 py-2 border border-blue-200">
                  <span className="text-sm text-blue-600 mr-2">按年份筛选:</span>
                  <select
                    value={selectedYear}
                    onChange={filterByYear}
                    className="bg-transparent border-0 text-blue-600 font-medium focus:outline-none focus:ring-0"
                  >
                    <option value="all">全部年份</option>
                    {years.map(year => (
                      <option key={year} value={year}>{year}年</option>
                    ))}
                  </select>
                </div>
              )}
            </div>
            
            <div className="space-y-3 max-h-96 overflow-y-auto pr-2 relative z-10">
              {getFilteredFlights().length === 0 ? (
                <div className="text-center py-8 text-blue-500 bg-blue-50 rounded-lg border border-blue-100">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 mx-auto mb-2 text-blue-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 13l-7 7-7-7m14-8l-7 7-7-7" />
                  </svg>
                  没有符合条件的航班记录
                </div>
              ) : (
                getFilteredFlights().map(flight => (
                  <div key={flight._id || flight.id} className="border border-blue-200 rounded-lg p-4 hover:bg-blue-50 transition-all duration-200 group">
                    <div className="flex justify-between items-center">
                      <div>
                        <div className="font-medium text-lg text-blue-700">{flight.flightNumber}</div>
                        <div className="mt-1 flex items-center text-blue-600">
                          <span className="font-medium flex items-center">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                            </svg>
                            {flight.departureCity}
                          </span>
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mx-2 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                          </svg>
                          <span className="font-medium flex items-center">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1113.314 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                            {flight.arrivalCity}
                          </span>
                        </div>
                        <div className="mt-1 text-sm text-blue-500 flex items-center">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          {new Date(flight.date).toLocaleDateString()}
                        </div>
                      </div>
                      <button
                        onClick={() => deleteFlight(flight._id || flight.id)}
                        className="text-gray-400 hover:text-red-500 transition-colors duration-200 p-2 rounded-full hover:bg-red-50"
                        title="删除"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
}