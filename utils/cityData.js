// 城市数据
export const CITIES = [
    {
      _id: '1',
      city: '北京',
      province: '北京市',
      lat: 39.9042,
      lng: 116.4074
    },
    {
      _id: '2',
      city: '上海',
      province: '上海市',
      lat: 31.2304,
      lng: 121.4737
    },
    {
      _id: '3',
      city: '广州',
      province: '广东省',
      lat: 23.1291,
      lng: 113.2644
    },
    {
      _id: '4',
      city: '深圳',
      province: '广东省',
      lat: 22.5431,
      lng: 114.0579
    },
    {
      _id: '5',
      city: '杭州',
      province: '浙江省',
      lat: 30.2741,
      lng: 120.1551
    },
    {
      _id: '6',
      city: '成都',
      province: '四川省',
      lat: 30.5723,
      lng: 104.0665
    },
    {
      _id: '7',
      city: '武汉',
      province: '湖北省',
      lat: 30.5928,
      lng: 114.3055
    },
    {
      _id: '8',
      city: '西安',
      province: '陕西省',
      lat: 34.3416,
      lng: 108.9402
    },
    {
      _id: '9',
      city: '重庆',
      province: '重庆市',
      lat: 29.5630,
      lng: 106.5516
    },
    {
      _id: '10',
      city: '南京',
      province: '江苏省',
      lat: 32.0603,
      lng: 118.7969
    },
    {
      _id: '11',
      city: '青岛',
      province: '山东省',
      lat: 36.0671,
      lng: 120.3826
    },
    {
      _id: '12',
      city: '厦门',
      province: '福建省',
      lat: 24.4798,
      lng: 118.0894
    },
    {
      _id: '13',
      city: '哈尔滨',
      province: '黑龙江省',
      lat: 45.7575,
      lng: 126.6424
    },
    {
      _id: '14',
      city: '沈阳',
      province: '辽宁省',
      lat: 41.8057,
      lng: 123.4315
    },
    {
      _id: '15',
      city: '大连',
      province: '辽宁省',
      lat: 38.9140,
      lng: 121.6147
    }
  ];
  
  // 按拼音首字母对城市进行分组
  export const CITY_GROUPS = {
    'B': ['北京'],
    'G': ['广州', '贵阳'],
    'H': ['杭州', '哈尔滨', '合肥'],
    'N': ['南京', '南昌', '南宁'],
    'Q': ['青岛'],
    'S': ['上海', '深圳', '沈阳'],
    'X': ['西安'],
    'C': ['成都', '重庆', '长春'],
    'D': ['大连'],
    'F': ['福州'],
    'K': ['昆明'],
    'W': ['武汉', '乌鲁木齐'],
    'Z': ['郑州']
  };
  
  // 获取城市数据
  export function getCityById(id) {
    return CITIES.find(city => city._id === id);
  }
  
  // 获取城市分组
  export function getCityGroups() {
    return CITY_GROUPS;
  }