import mongoose from 'mongoose';
import dotenv from 'dotenv';
import City from '../models/City.js';

dotenv.config();

const AIRPORT_CITIES = [
  // 一线城市
  { name: "北京", id: "101010100", airports: ["首都国际机场", "大兴国际机场"], longitude: 116.4074, latitude: 39.9042 },
  { name: "上海", id: "101020100", airports: ["浦东国际机场", "虹桥国际机场"], longitude: 121.4737, latitude: 31.2304 },
  { name: "广州", id: "101280101", airports: ["白云国际机场"], longitude: 113.2644, latitude: 23.1291 },
  { name: "深圳", id: "101280601", airports: ["宝安国际机场"], longitude: 114.0579, latitude: 22.5431 },
  
  // 省会城市
  { name: "成都", id: "101270101", airports: ["双流国际机场", "天府国际机场"], longitude: 104.0665, latitude: 30.5723 },
  { name: "重庆", id: "101040100", airports: ["江北国际机场"], longitude: 106.5516, latitude: 29.5630 },
  { name: "杭州", id: "101210101", airports: ["萧山国际机场"], longitude: 120.1551, latitude: 30.2741 },
  { name: "南京", id: "101190101", airports: ["禄口国际机场"], longitude: 118.7969, latitude: 32.0603 },
  { name: "武汉", id: "101200101", airports: ["天河国际机场"], longitude: 114.3055, latitude: 30.5928 },
  { name: "西安", id: "101110101", airports: ["咸阳国际机场"], longitude: 108.9402, latitude: 34.3416 },
  { name: "长沙", id: "101250101", airports: ["黄花国际机场"], longitude: 112.9388, latitude: 28.2278 },
  { name: "郑州", id: "101180101", airports: ["新郑国际机场"], longitude: 113.6254, latitude: 34.7472 },
  { name: "哈尔滨", id: "101050101", airports: ["太平国际机场"], longitude: 126.5358, latitude: 45.8038 },
  { name: "沈阳", id: "101070101", airports: ["桃仙国际机场"], longitude: 123.4315, latitude: 41.8057 },
  { name: "昆明", id: "101290101", airports: ["长水国际机场"], longitude: 102.8329, latitude: 24.8801 },
  { name: "南宁", id: "101300101", airports: ["吴圩国际机场"], longitude: 108.3665, latitude: 22.8170 },
  { name: "贵阳", id: "101260101", airports: ["龙洞堡国际机场"], longitude: 106.6302, latitude: 26.6477 },
  { name: "兰州", id: "101160101", airports: ["中川国际机场"], longitude: 103.8343, latitude: 36.0611 },
  { name: "太原", id: "101100101", airports: ["武宿国际机场"], longitude: 112.5489, latitude: 37.8706 },
  { name: "合肥", id: "101220101", airports: ["新桥国际机场"], longitude: 117.2272, latitude: 31.8206 },
  { name: "福州", id: "101230101", airports: ["长乐国际机场"], longitude: 119.3062, latitude: 26.0753 },
  { name: "济南", id: "101120101", airports: ["遥墙国际机场"], longitude: 117.1209, latitude: 36.6510 },
  { name: "南昌", id: "101240101", airports: ["昌北国际机场"], longitude: 115.8581, latitude: 28.6820 },
  { name: "石家庄", id: "101090101", airports: ["正定国际机场"], longitude: 114.5149, latitude: 38.0428 },
  { name: "长春", id: "101060101", airports: ["龙嘉国际机场"], longitude: 125.3235, latitude: 43.8171 },
  { name: "呼和浩特", id: "101080101", airports: ["白塔国际机场"], longitude: 111.6708, latitude: 40.8424 },
  { name: "乌鲁木齐", id: "101130101", airports: ["地窝堡国际机场"], longitude: 87.6168, latitude: 43.8256 },
  { name: "拉萨", id: "101140101", airports: ["贡嘎机场"], longitude: 91.1172, latitude: 29.6524 },
  { name: "西宁", id: "101150101", airports: ["曹家堡机场"], longitude: 101.7782, latitude: 36.6232 },
  { name: "银川", id: "101170101", airports: ["河东机场"], longitude: 106.2309, latitude: 38.4872 },
  // 重要旅游城市
  { name: "三亚", id: "101310201", airports: ["凤凰国际机场"], longitude: 109.5119, latitude: 18.2528 },
  { name: "厦门", id: "101230201", airports: ["高崎国际机场"], longitude: 118.0894, latitude: 24.4798 },
  { name: "青岛", id: "101120201", airports: ["流亭国际机场"], longitude: 120.3826, latitude: 36.0671 },
  { name: "大连", id: "101070201", airports: ["周水子国际机场"], longitude: 121.6147, latitude: 38.9140 },
  { name: "天津", id: "101030100", airports: ["滨海国际机场"], longitude: 117.2010, latitude: 39.0842 },
  { name: "桂林", id: "101300501", airports: ["两江国际机场"], longitude: 110.2902, latitude: 25.2747 },
  { name: "海口", id: "101310101", airports: ["美兰国际机场"], longitude: 110.1999, latitude: 20.0444 },
  { name: "丽江", id: "101291401", airports: ["三义机场"], longitude: 100.2330, latitude: 26.8721 },
  { name: "张家界", id: "101251101", airports: ["荷花机场"], longitude: 110.4792, latitude: 29.1171 },
  { name: "黄山", id: "101221001", airports: ["屯溪国际机场"], longitude: 118.1694, latitude: 29.7147 },
  // 其他重要城市
  { name: "温州", id: "101210701", airports: ["龙湾国际机场"], longitude: 120.6906, latitude: 28.0027 },
  { name: "宁波", id: "101210401", airports: ["栎社国际机场"], longitude: 121.5498, latitude: 29.8684 },
  { name: "无锡", id: "101190201", airports: ["硕放国际机场"], longitude: 120.3119, latitude: 31.4912 },
  { name: "烟台", id: "101120501", airports: ["蓬莱国际机场"], longitude: 121.4479, latitude: 37.4638 },
  { name: "珠海", id: "101280701", airports: ["金湾机场"], longitude: 113.5767, latitude: 22.2707 },
  { name: "威海", id: "101121301", airports: ["大水泊国际机场"], longitude: 122.1214, latitude: 37.5139 },
  { name: "徐州", id: "101190801", airports: ["观音机场"], longitude: 117.1848, latitude: 34.2618 },
  { name: "常州", id: "101191101", airports: ["奔牛国际机场"], longitude: 119.9741, latitude: 31.8112 },
  { name: "绵阳", id: "101270401", airports: ["南郊机场"], longitude: 104.6791, latitude: 31.4678 },
  { name: "洛阳", id: "101180901", airports: ["北郊机场"], longitude: 112.4539, latitude: 34.6197 }
];

async function importCities() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('数据库连接成功');
    
    // 清空现有数据
    await City.deleteMany({});
    console.log('已清空现有城市数据');
    
    // 导入新数据
    await City.insertMany(AIRPORT_CITIES);
    console.log('城市数据导入成功');

    await mongoose.disconnect();
    console.log('数据库连接已关闭');
  } catch (error) {
    console.error('导入失败:', error);
  }
}

importCities(); 