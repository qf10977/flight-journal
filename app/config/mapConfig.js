/**
 * 地图配置文件
 */

// 高德地图配置
export const AMAP_CONFIG = {
  // 默认中国中心坐标
  CENTER: [35.8617, 104.1954],
  ZOOM: 4,
  // 瓦片地址 - 高德地图（免费无需key）
  TILES: {
    NORMAL: {
      URL: "https://webrd0{s}.is.autonavi.com/appmaptile?lang=zh_cn&size=1&scale=1&style=8&x={x}&y={y}&z={z}",
      SUBDOMAINS: ['1', '2', '3', '4'],
      ATTRIBUTION: '&copy; <a href="https://amap.com">高德地图</a>',
    },
    SATELLITE: {
      URL: "https://webst0{s}.is.autonavi.com/appmaptile?style=6&x={x}&y={y}&z={z}",
      SUBDOMAINS: ['1', '2', '3', '4'],
      ATTRIBUTION: '&copy; <a href="https://amap.com">高德地图</a>',
    }
  }
};

// 备用地图配置 - OpenStreetMap
export const OSM_CONFIG = {
  CENTER: [35.8617, 104.1954],
  ZOOM: 4,
  TILES: {
    URL: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
    ATTRIBUTION: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
  }
};

// 自定义地图样式
export const MAP_STYLES = {
  // 默认中国视图
  defaultView: {
    center: [35.8617, 104.1954],
    zoom: 4,
    minZoom: 2,
    maxZoom: 18
  },
  // 飞行轨迹样式
  flightPath: {
    normal: {
      color: '#D92228',
      weight: 2.5,
      opacity: 0.8,
      dashArray: '5, 5'
    },
    selected: {
      color: '#4F46E5',
      weight: 3.5,
      opacity: 1
    }
  }
};

export default {
  AMAP_CONFIG,
  OSM_CONFIG,
  MAP_STYLES
}; 