"use client"

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import Head from 'next/head';
import Link from 'next/link';

// 动态导入地图组件，避免SSR问题
const MapComponent = dynamic(() => import('./MapComponent'), {
  ssr: false,
});

export default function AddFlight() {
  const router = useRouter();
  const [flightNumber, setFlightNumber] = useState('');
  const [departureCity, setDepartureCity] = useState('');
  const [arrivalCity, setArrivalCity] = useState('');
  const [flightDate, setFlightDate] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [cities, setCities] = useState([]);
  const [mapVisible, setMapVisible] = useState(true);

  // 获取城市列表
  useEffect(() => {
    const fetchCities = async () => {
      try {
        const response = await fetch('/api/cities');
        if (response.ok) {
          const data = await response.json();
          setCities(data);
        }
      } catch (error) {
        console.error('获取城市列表失败:', error);
      }
    };

    fetchCities();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        alert('请先登录');
        router.push('/');
        return;
      }

      const flightData = {
        flightNumber,
        departureCity,
        arrivalCity,
        flightDate
      };

      const response = await fetch('/api/flights', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(flightData)
      });

      if (response.ok) {
        alert('航班记录添加成功');
        router.push('/flight-map');
      } else {
        const error = await response.json();
        alert(error.message || '添加航班记录失败');
      }
    } catch (error) {
      console.error('添加航班记录错误:', error);
      alert('添加航班记录过程中发生错误');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Head>
        <title>添加航班 - 飞行日志</title>
      </Head>

      <div className="md:flex md:space-x-8">
        <div className="md:w-1/2">
          <h1 className="text-2xl font-bold mb-6">添加航班记录</h1>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="flightNumber" className="block text-sm font-medium text-gray-700 mb-1">航班号</label>
              <input
                id="flightNumber"
                type="text"
                placeholder="例如: MU2501"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                value={flightNumber}
                onChange={(e) => setFlightNumber(e.target.value)}
                required
              />
            </div>
            
            <div>
              <label htmlFor="departureCity" className="block text-sm font-medium text-gray-700 mb-1">出发城市</label>
              <select
                id="departureCity"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                value={departureCity}
                onChange={(e) => setDepartureCity(e.target.value)}
                required
              >
                <option value="">选择城市</option>
                {cities.map((city) => (
                  <option key={`dep-${city.id}`} value={city.name}>
                    {city.name}
                  </option>
                ))}
              </select>
            </div>
            
            <div>
              <label htmlFor="arrivalCity" className="block text-sm font-medium text-gray-700 mb-1">到达城市</label>
              <select
                id="arrivalCity"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                value={arrivalCity}
                onChange={(e) => setArrivalCity(e.target.value)}
                required
              >
                <option value="">选择城市</option>
                {cities.map((city) => (
                  <option key={`arr-${city.id}`} value={city.name}>
                    {city.name}
                  </option>
                ))}
              </select>
            </div>
            
            <div>
              <label htmlFor="flightDate" className="block text-sm font-medium text-gray-700 mb-1">航班日期</label>
              <input
                id="flightDate"
                type="date"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                value={flightDate}
                onChange={(e) => setFlightDate(e.target.value)}
                required
              />
            </div>
            
            <button
              type="submit"
              className="w-full bg-indigo-600 text-white py-3 rounded-md font-medium hover:bg-indigo-700"
              disabled={isLoading}
            >
              {isLoading ? '添加中...' : '添加航班'}
            </button>
          </form>
        </div>
        
        <div className="md:w-1/2 mt-8 md:mt-0">
          {mapVisible && (
            <div className="h-96 rounded-lg overflow-hidden border border-gray-300">
              <MapComponent 
                departureCity={departureCity} 
                arrivalCity={arrivalCity}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}