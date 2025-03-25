import { useState, useRef, useEffect } from 'react';
import axios from 'axios';

export default function CitySelector({ value, onChange }) {
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [filteredCities, setFilteredCities] = useState([]);
  const [cities, setCities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const suggestionsRef = useRef(null);

  // 从数据库加载城市数据
  useEffect(() => {
    const fetchCities = async () => {
      try {
        setLoading(true);
        const response = await axios.get('/api/memocities');
        setCities(response.data);
        setFilteredCities(response.data);
        setLoading(false);
      } catch (err) {
        console.error('获取城市数据失败:', err);
        setError('无法加载城市数据');
        setLoading(false);
      }
    };
    
    fetchCities();
  }, []);

  // 处理输入变化
  const handleInputChange = (e) => {
    const input = e.target.value.trim();
    onChange(input);
    
    if (!input) {
      setFilteredCities(cities);
      return;
    }
    
    // 过滤匹配的城市
    const matched = cities.filter(city => 
      city.name.includes(input) || 
      city.airports.some(airport => airport.includes(input))
    );
    
    setFilteredCities(matched);
  };

  // 选择城市
  const selectCity = (city) => {
    onChange(city.name);
    setShowSuggestions(false);
  };

  // 点击外部关闭建议列表
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (suggestionsRef.current && !suggestionsRef.current.contains(e.target)) {
        setShowSuggestions(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative">
      <input 
        type="text" 
        value={value}
        onChange={handleInputChange}
        onFocus={() => setShowSuggestions(true)}
        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
        placeholder="输入城市名称"
      />
      
      {showSuggestions && (
        <div 
          ref={suggestionsRef}
          className="absolute z-10 w-full bg-white border rounded-md shadow-lg mt-1 max-h-48 overflow-y-auto"
        >
          {loading ? (
            <div className="px-4 py-2 text-gray-500">加载中...</div>
          ) : error ? (
            <div className="px-4 py-2 text-red-500">{error}</div>
          ) : filteredCities.length > 0 ? (
            filteredCities.map((city, index) => (
              <div 
                key={index}
                className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                onClick={() => selectCity(city)}
              >
                <div className="font-medium">{city.name}</div>
                <div className="text-sm text-gray-500">{city.airports.join(' / ')}</div>
              </div>
            ))
          ) : (
            <div className="px-4 py-2 text-gray-500">未找到匹配的城市</div>
          )}
        </div>
      )}
    </div>
  );
}