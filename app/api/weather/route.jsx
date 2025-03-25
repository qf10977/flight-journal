import { NextResponse } from 'next/server';

// 城市数据
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
  // 其他城市数据...
];

// 天气API配置
const WEATHER_API_KEY = '6f3d186c3e1b478eb8388d69161b5df2';
const WEATHER_API_BASE = 'https://devapi.qweather.com/v7';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const city = searchParams.get('city');
    
    if (!city) {
      return NextResponse.json(
        { success: false, message: '请提供城市名称' },
        { status: 400 }
      );
    }
    
    // 查找城市ID
    const cityData = AIRPORT_CITIES.find(c => c.name === city);
    if (!cityData) {
      return NextResponse.json(
        { success: false, message: `城市"${city}"未找到` },
        { status: 404 }
      );
    }

    // 调用和风天气API
    const response = await fetch(
      `${WEATHER_API_BASE}/weather/now?location=${cityData.id}&key=${WEATHER_API_KEY}`
    );
    const weatherData = await response.json();

    if (weatherData.code !== '200') {
      return NextResponse.json(
        { success: false, message: '获取天气失败' },
        { status: 500 }
      );
    }

    // 生成天气提示
    const notice = getWeatherNotice({
      temp: weatherData.now.temp,
      text: weatherData.now.text
    });

    return NextResponse.json({
      success: true,
      data: {
        temperature: weatherData.now.temp,
        condition: weatherData.now.text,
        notice: notice
      }
    });
  } catch (error) {
    console.error('获取天气失败:', error);
    return NextResponse.json(
      { success: false, message: '获取天气失败' },
      { status: 500 }
    );
  }
}

// 根据天气情况生成提示
function getWeatherNotice(weather) {
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
} 