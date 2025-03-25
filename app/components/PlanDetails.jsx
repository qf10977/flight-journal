import { useState, useEffect, useRef } from 'react';

// 和风天气API配置
const WEATHER_API_KEY = '6f3d186c3e1b478eb8388d69161b5df2';
const WEATHER_API_BASE = 'https://devapi.qweather.com/v7';

// 机场城市列表数据
const AIRPORT_CITIES = [
  // 一线城市
  { name: "北京", id: "101010100", airports: ["首都国际机场", "大兴国际机场"] },
  { name: "上海", id: "101020100", airports: ["浦东国际机场", "虹桥国际机场"] },
  { name: "广州", id: "101280101", airports: ["白云国际机场"] },
  { name: "深圳", id: "101280601", airports: ["宝安国际机场"] },
  // 省会城市
{ name: "成都", id: "101270101", airports: ["双流国际机场", "天府国际机场"] },
    { name: "重庆", id: "101040100", airports: ["江北国际机场"] },
    { name: "杭州", id: "101210101", airports: ["萧山国际机场"] },
    { name: "南京", id: "101190101", airports: ["禄口国际机场"] },
    { name: "武汉", id: "101200101", airports: ["天河国际机场"] },
    { name: "西安", id: "101110101", airports: ["咸阳国际机场"] },
    { name: "长沙", id: "101250101", airports: ["黄花国际机场"] },
    { name: "郑州", id: "101180101", airports: ["新郑国际机场"] },
    { name: "哈尔滨", id: "101050101", airports: ["太平国际机场"] },
    { name: "沈阳", id: "101070101", airports: ["桃仙国际机场"] },
    { name: "昆明", id: "101290101", airports: ["长水国际机场"] },
    { name: "南宁", id: "101300101", airports: ["吴圩国际机场"] },
    { name: "贵阳", id: "101260101", airports: ["龙洞堡国际机场"] },
    { name: "兰州", id: "101160101", airports: ["中川国际机场"] },
    { name: "太原", id: "101100101", airports: ["武宿国际机场"] },
    { name: "合肥", id: "101220101", airports: ["新桥国际机场"] },
    { name: "福州", id: "101230101", airports: ["长乐国际机场"] },
    { name: "济南", id: "101120101", airports: ["遥墙国际机场"] },
    { name: "南昌", id: "101240101", airports: ["昌北国际机场"] },
    { name: "石家庄", id: "101090101", airports: ["正定国际机场"] },
    { name: "长春", id: "101060101", airports: ["龙嘉国际机场"] },
    { name: "呼和浩特", id: "101080101", airports: ["白塔国际机场"] },
    { name: "乌鲁木齐", id: "101130101", airports: ["地窝堡国际机场"] },
    { name: "拉萨", id: "101140101", airports: ["贡嘎机场"] },
    { name: "西宁", id: "101150101", airports: ["曹家堡机场"] },
    { name: "银川", id: "101170101", airports: ["河东机场"] },
    //重要旅游城市
    { name: "三亚", id: "101310201", airports: ["凤凰国际机场"] },
    { name: "厦门", id: "101230201", airports: ["高崎国际机场"] },
    { name: "青岛", id: "101120201", airports: ["流亭国际机场"] },
    { name: "大连", id: "101070201", airports: ["周水子国际机场"] },
    { name: "天津", id: "101030100", airports: ["滨海国际机场"] },
    { name: "桂林", id: "101300501", airports: ["两江国际机场"] },
    { name: "海口", id: "101310101", airports: ["美兰国际机场"] },
    { name: "丽江", id: "101291401", airports: ["三义机场"] },
    { name: "张家界", id: "101251101", airports: ["荷花机场"] },
    { name: "黄山", id: "101221001", airports: ["屯溪国际机场"] },
    //其他重要城市
    { name: "温州", id: "101210701", airports: ["龙湾国际机场"] },
    { name: "宁波", id: "101210401", airports: ["栎社国际机场"] },
    { name: "无锡", id: "101190201", airports: ["硕放国际机场"] },
    { name: "烟台", id: "101120501", airports: ["蓬莱国际机场"] },
    { name: "珠海", id: "101280701", airports: ["金湾机场"] },
    { name: "威海", id: "101121301", airports: ["大水泊国际机场"] },
    { name: "徐州", id: "101190801", airports: ["观音机场"] },
    { name: "常州", id: "101191101", airports: ["奔牛国际机场"] },
    { name: "绵阳", id: "101270401", airports: ["南郊机场"] },
    { name: "洛阳", id: "101180901", airports: ["北郊机场"] }
    
];

export default function PlanDetails({ 
  plan, 
  memos, 
  newMemoText, 
  onNewMemoChange, 
  onAddMemo, 
  onToggleMemo, 
  onDeleteMemo 
}) {
  const [weather, setWeather] = useState({ temperature: '--', condition: '加载中...', notice: '' });
  const [countdown, setCountdown] = useState('');
  const [showCitySuggestions, setShowCitySuggestions] = useState(false);
  const [filteredCities, setFilteredCities] = useState([]);
  const [cursorPosition, setCursorPosition] = useState(0);
  const inputRef = useRef(null);
  const suggestionsRef = useRef(null);

  // 加载天气信息
  useEffect(() => {
    const fetchWeather = async () => {
      try {
        const weatherData = await getWeather(plan.destination);
        setWeather(weatherData);
      } catch (error) {
        console.error('获取天气失败:', error);
        setWeather({ 
          temperature: '--', 
          condition: '获取失败', 
          notice: '暂时无法获取天气信息' 
        });
      }
    };

    fetchWeather();
    
    // 设置倒计时更新定时器
    const intervalId = setInterval(() => {
      updateCountdown(plan.date);
    }, 60000); // 每分钟更新一次
    
    // 立即更新一次倒计时
    updateCountdown(plan.date);
    
    return () => clearInterval(intervalId);
  }, [plan]);

  // 获取天气信息
  const getWeather = async (city) => {
    try {
      // 查找城市ID
      const cityData = AIRPORT_CITIES.find(c => c.name === city);
      if (!cityData) {
        throw new Error(`城市"${city}"未找到`);
      }

      // 直接使用城市ID获取天气信息
      const weatherRes = await fetch(
        `${WEATHER_API_BASE}/weather/now?location=${cityData.id}&key=${WEATHER_API_KEY}`
      );
      const weatherData = await weatherRes.json();

      if (weatherData.code !== '200') {
        throw new Error('获取天气失败');
      }

      return {
        temperature: weatherData.now.temp,
        condition: weatherData.now.text,
        notice: getWeatherNotice({
          temp: weatherData.now.temp,
          text: weatherData.now.text
        })
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

  // 根据天气情况生成提示
  const getWeatherNotice = (weather) => {
    const temp = parseInt(weather.temp);
    const notices = [];

    // 温度提示
    if (temp >= 35) {
      notices.push('请注意防暑降温');
    } else if (temp >= 30) {
      notices.push('天气炎热');
    } else if (temp <= 5) {
      notices.push('请注意保暖');
    } else if (temp <= 10) {
      notices.push('天气较凉');
    }

    // 天气状况提示
    if (weather.text.includes('晴')) {
      notices.push('适合出行');
    } else if (weather.text.includes('雨')) {
      notices.push('请携带雨具');
    } else if (weather.text.includes('雪')) {
      notices.push('请注意路滑');
    } else if (weather.text.includes('雾') || weather.text.includes('霾')) {
      notices.push('请注意空气质量');
    }

    return notices.join('，') || '天气适宜出行';
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

  // 处理输入变化，检测城市名称
  const handleMemoInputChange = (e) => {
    const text = e.target.value;
    const cursorPos = e.target.selectionStart;
    
    onNewMemoChange(e);
    setCursorPosition(cursorPos);
    
    // 提取光标位置前的文本
    const textBeforeCursor = text.substring(0, cursorPos);
    
    // 查找最后一个空格的位置
    const lastSpaceIndex = textBeforeCursor.lastIndexOf(' ');
    
    // 提取当前正在输入的词
    const currentWord = textBeforeCursor.substring(lastSpaceIndex + 1);
    
    // 如果当前词至少有1个字符，尝试匹配城市
    if (currentWord.length >= 1) {
      const matched = AIRPORT_CITIES.filter(city => 
        city.name.includes(currentWord)
      ).slice(0, 5); // 限制最多显示5个建议
      
      setFilteredCities(matched);
      setShowCitySuggestions(matched.length > 0);
    } else {
      setShowCitySuggestions(false);
    }
  };

  // 选择城市建议
  const selectCitySuggestion = (cityName) => {
    // 获取光标前的文本
    const textBeforeCursor = newMemoText.substring(0, cursorPosition);
    const lastSpaceIndex = textBeforeCursor.lastIndexOf(' ');
    
    // 替换当前词为选中的城市名
    const newText = 
      textBeforeCursor.substring(0, lastSpaceIndex + 1) + 
      cityName + 
      newMemoText.substring(cursorPosition);
    
    // 更新输入框内容
    const event = { target: { value: newText } };
    onNewMemoChange(event);
    
    // 隐藏建议
    setShowCitySuggestions(false);
    
    // 聚焦输入框并设置光标位置
    setTimeout(() => {
      if (inputRef.current) {
        inputRef.current.focus();
        const newCursorPos = lastSpaceIndex + 1 + cityName.length;
        inputRef.current.setSelectionRange(newCursorPos, newCursorPos);
        setCursorPosition(newCursorPos);
      }
    }, 0);
  };

  // 点击外部关闭建议
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (suggestionsRef.current && !suggestionsRef.current.contains(e.target) && 
          inputRef.current && !inputRef.current.contains(e.target)) {
        setShowCitySuggestions(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <h2 className="text-2xl font-bold mb-6">{plan.destination} - {plan.date}</h2>
      
      {/* 天气信息 */}
      <div className="mb-8">
        <h3 className="text-lg font-medium mb-3">天气信息</h3>
        <div className="flex items-center gap-3 text-gray-600">
          <svg className="w-6 h-6 text-blue-500" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
          </svg>
          <span>{weather.temperature}°C, {weather.condition}</span>
        </div>
        <p className="text-gray-500 mt-2">{weather.notice}</p>
      </div>

      {/* 出发倒计时 */}
      <div className="mb-8">
        <h3 className="text-lg font-medium mb-3">出发倒计时</h3>
        <div className="text-2xl font-bold">{countdown}</div>
      </div>

      {/* 备忘清单 */}
      <div>
        <h3 className="text-lg font-medium mb-3">备忘清单</h3>
        <div className="flex gap-2 mb-4 relative">
          <input 
            ref={inputRef}
            type="text" 
            value={newMemoText}
            onChange={handleMemoInputChange}
            placeholder="添加新项目（输入城市名可自动匹配）" 
            className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
          <button 
            onClick={onAddMemo} 
            className="bg-black text-white px-4 py-2 rounded-md hover:bg-gray-800 transition-colors"
          >
            添加
          </button>
          
          {/* 城市建议列表 */}
          {showCitySuggestions && (
            <div 
              ref={suggestionsRef}
              className="absolute z-10 left-0 right-0 top-full bg-white border rounded-md shadow-lg mt-1 max-h-48 overflow-y-auto"
            >
              {filteredCities.map((city, index) => (
                <div 
                  key={index}
                  className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                  onClick={() => selectCitySuggestion(city.name)}
                >
                  <div className="font-medium">{city.name}</div>
                  <div className="text-sm text-gray-500">{city.airports.join(' / ')}</div>
                </div>
              ))}
            </div>
          )}
        </div>
        
        {memos.length > 0 ? (
          <ul className="space-y-2">
            {memos.map(memo => {
              // 高亮显示城市名称
              const highlightedContent = memo.content.split(' ').map((word, i) => {
                const isCity = AIRPORT_CITIES.some(city => city.name === word);
                return isCity ? 
                  <span key={i} className="text-blue-600 font-medium">{word}</span> : 
                  <span key={i}>{word}</span>;
              }).reduce((prev, curr, i) => [prev, ' ', curr]);
              
              return (
                <li key={memo.id} className={`flex items-center gap-3 p-2 bg-white border rounded-md ${memo.hasCity ? 'border-blue-200' : ''}`}>
                  <input 
                    type="checkbox" 
                    checked={memo.completed} 
                    onChange={() => onToggleMemo(memo.id)} 
                    className="w-5 h-5"
                  />
                  <span className={memo.completed ? 'line-through text-gray-500' : ''}>
                    {highlightedContent}
                    {memo.hasCity && (
                      <svg className="inline-block ml-1 w-4 h-4 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    )}
                  </span>
                  <button 
                    onClick={() => onDeleteMemo(memo.id)} 
                    className="ml-auto text-red-500 hover:text-red-700"
                  >
                    删除
                  </button>
                </li>
              );
            })}
          </ul>
        ) : (
          <div className="text-center py-4 text-gray-500">
            暂无备忘项，点击上方按钮添加
          </div>
        )}
      </div>
    </div>
  );
}