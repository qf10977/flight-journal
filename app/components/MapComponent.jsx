"use client";

import { useEffect, useRef } from 'react';
// 导入将在useEffect中动态导入的leaflet库，现在只是为了类型提示
// require('leaflet-polylinedecorator') 将在useEffect内动态导入

// 添加飞机图标样式
const planeIconStyles = `
  .plane-icon {
    font-size: 18px;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  .plane-icon div {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;
    height: 100%;
  }
`;

// 添加坐标转换工具函数
const PI = 3.1415926535897932384626;
const a = 6378245.0;  // 长半轴
const ee = 0.00669342162296594323; // 扁率

// WGS84坐标系转GCJ02(火星坐标系)
function wgs84togcj02(lng, lat) {
  if (outOfChina(lng, lat)) {
    return [lng, lat];
  }
  let dlat = transformlat(lng - 105.0, lat - 35.0);
  let dlng = transformlng(lng - 105.0, lat - 35.0);
  const radlat = lat / 180.0 * PI;
  let magic = Math.sin(radlat);
  magic = 1 - ee * magic * magic;
  const sqrtmagic = Math.sqrt(magic);
  dlat = (dlat * 180.0) / ((a * (1 - ee)) / (magic * sqrtmagic) * PI);
  dlng = (dlng * 180.0) / (a / sqrtmagic * Math.cos(radlat) * PI);
  const mglat = lat + dlat;
  const mglng = lng + dlng;
  return [mglng, mglat];
}

// 判断是否在中国境内
function outOfChina(lng, lat) {
  return !(lng > 73.66 && lng < 135.05 && lat > 3.86 && lat < 53.55);
}

function transformlat(lng, lat) {
  let ret = -100.0 + 2.0 * lng + 3.0 * lat + 0.2 * lat * lat + 0.1 * lng * lat + 0.2 * Math.sqrt(Math.abs(lng));
  ret += (20.0 * Math.sin(6.0 * lng * PI) + 20.0 * Math.sin(2.0 * lng * PI)) * 2.0 / 3.0;
  ret += (20.0 * Math.sin(lat * PI) + 40.0 * Math.sin(lat / 3.0 * PI)) * 2.0 / 3.0;
  ret += (160.0 * Math.sin(lat / 12.0 * PI) + 320 * Math.sin(lat * PI / 30.0)) * 2.0 / 3.0;
  return ret;
}

function transformlng(lng, lat) {
  let ret = 300.0 + lng + 2.0 * lat + 0.1 * lng * lng + 0.1 * lng * lat + 0.1 * Math.sqrt(Math.abs(lng));
  ret += (20.0 * Math.sin(6.0 * lng * PI) + 20.0 * Math.sin(2.0 * lng * PI)) * 2.0 / 3.0;
  ret += (20.0 * Math.sin(lng * PI) + 40.0 * Math.sin(lng / 3.0 * PI)) * 2.0 / 3.0;
  ret += (150.0 * Math.sin(lng / 12.0 * PI) + 300.0 * Math.sin(lng / 30.0 * PI)) * 2.0 / 3.0;
  return ret;
}

export default function MapComponent({ flights }) {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const flightPathsRef = useRef([]);

  // 初始化地图
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    // 动态导入 Leaflet
    const L = require('leaflet');
    require('leaflet/dist/leaflet.css');
    // 导入Leaflet Polyline Decorator插件
    require('leaflet-polylinedecorator');
    
    if (!mapInstanceRef.current) {
      // 创建地图实例
      mapInstanceRef.current = L.map(mapRef.current, {
        center: [35.8617, 104.1954],
        zoom: 4,
        zoomControl: false // 禁用默认缩放控件
      });
      
      // 添加飞机图标样式到页面
      if (!document.getElementById('plane-icon-styles')) {
        const styleElement = document.createElement('style');
        styleElement.id = 'plane-icon-styles';
        styleElement.textContent = planeIconStyles;
        document.head.appendChild(styleElement);
      }
      
      // 创建标记存储数组
      const markers = [];
      
      // 定义高德矢量图层
      const gaodeNormal = L.tileLayer('http://webrd0{s}.is.autonavi.com/appmaptile?lang=zh_cn&size=1&scale=1&style=8&x={x}&y={y}&z={z}', {
        subdomains: ['1', '2', '3', '4'],
        attribution: '© 高德地图',
        minZoom: 1,
        maxZoom: 19
      });
      
      // 定义高德卫星图层
      const gaodeSatellite = L.tileLayer('http://webst0{s}.is.autonavi.com/appmaptile?style=6&x={x}&y={y}&z={z}', {
        subdomains: ['1', '2', '3', '4'],
        attribution: '© 高德地图',
        minZoom: 1,
        maxZoom: 19
      });
      
      // 将矢量图层添加到地图
      gaodeNormal.addTo(mapInstanceRef.current);
      
      // 创建图层控件并添加到地图
      L.control.layers({
        "高德地图": gaodeNormal,
        "高德卫星": gaodeSatellite
      }, null, {
        position: 'topright'
      }).addTo(mapInstanceRef.current);
      
      // 添加缩放控件到右上角
      L.control.zoom({
        position: 'topright'
      }).addTo(mapInstanceRef.current);
      
      // 添加地图点击事件，显示坐标信息
      const popupContent = L.DomUtil.create('div');
      const popup = L.popup();
      
      mapInstanceRef.current.on('click', function(e) {
        // 显示高德坐标
        const {lat, lng} = e.latlng;
        
        // GCJ02坐标转WGS84坐标
        const gcj02towgs84 = function(lng, lat) {
          if (outOfChina(lng, lat)) {
            return [lng, lat];
          }
          
          let dlat = transformlat(lng - 105.0, lat - 35.0);
          let dlng = transformlng(lng - 105.0, lat - 35.0);
          const radlat = lat / 180.0 * PI;
          let magic = Math.sin(radlat);
          magic = 1 - ee * magic * magic;
          const sqrtmagic = Math.sqrt(magic);
          dlat = (dlat * 180.0) / ((a * (1 - ee)) / (magic * sqrtmagic) * PI);
          dlng = (dlng * 180.0) / (a / sqrtmagic * Math.cos(radlat) * PI);
          const mglat = lat + dlat;
          const mglng = lng + dlng;
          return [lng * 2 - mglng, lat * 2 - mglat];
        };
        
        // 转换为WGS84坐标
        const [wgsLng, wgsLat] = gcj02towgs84(lng, lat);
        
        // 显示点击位置弹窗
        popupContent.innerHTML = `
          <div class="p-2 text-center">
            <button id="createMarker" class="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600">添加标记</button>
          </div>
        `;
        
        popup
          .setLatLng(e.latlng)
          .setContent(popupContent)
          .openOn(mapInstanceRef.current);
          
        // 添加创建标记按钮事件
        setTimeout(() => {
          const createMarkerBtn = document.getElementById('createMarker');
          if (createMarkerBtn) {
            createMarkerBtn.addEventListener('click', () => {
              // 创建飞机图标
              const planeIcon = L.divIcon({
                html: `<div style="transform: rotate(0deg);">✈️</div>`,
                className: 'plane-icon',
                iconSize: [20, 20],
                iconAnchor: [10, 10]
              });
              
              // 创建标记，使用飞机图标
              const marker = L.marker(e.latlng, {
                icon: planeIcon,
                zIndexOffset: 1000
              }).addTo(mapInstanceRef.current);
              
              // 存储标记
              markers.push(marker);
              
              // 添加标记弹窗
              marker.bindPopup(`
                <div class="p-2 text-center">
                  <button id="removeMarker" class="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600">删除标记</button>
                </div>
              `);
              
              // 关闭原有弹窗
              mapInstanceRef.current.closePopup();
              
              // 打开标记弹窗
              marker.openPopup();
              
              // 添加删除标记按钮事件
              setTimeout(() => {
                const removeMarkerBtn = document.getElementById('removeMarker');
                if (removeMarkerBtn) {
                  removeMarkerBtn.addEventListener('click', () => {
                    // 移除标记
                    mapInstanceRef.current.removeLayer(marker);
                    
                    // 从数组中删除标记
                    const index = markers.indexOf(marker);
                    if (index > -1) {
                      markers.splice(index, 1);
                    }
                    
                    // 关闭弹窗
                    mapInstanceRef.current.closePopup();
                  });
                }
              }, 100);
            });
          }
        }, 100);
      });
    }
    
    return () => {
      // 清理地图实例
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // 更新航班路线
  useEffect(() => {
    if (typeof window === 'undefined' || !mapInstanceRef.current || !flights?.length) return;
    
    console.log('航班数据:', flights);
    
    const L = require('leaflet');
    // 导入Leaflet Polyline Decorator插件
    require('leaflet-polylinedecorator');
    
    // 清除现有航线
    flightPathsRef.current.forEach(path => {
      mapInstanceRef.current.removeLayer(path);
    });
    flightPathsRef.current = [];
    
    // 添加新航线
    flights.forEach(flight => {
      try {
        console.log('处理航班:', flight);
        
        // 检查并获取坐标
        let departureCoords, arrivalCoords;
        
        // 尝试不同的数据格式
        if (flight.departure && flight.departure.coordinates) {
          departureCoords = flight.departure.coordinates;
        } else if (flight.departureCoords) {
          departureCoords = flight.departureCoords;
        } else if (flight.departureLat && flight.departureLng) {
          departureCoords = [flight.departureLng, flight.departureLat];
        } else if (flight.from && flight.from.location) {
          departureCoords = [flight.from.location.lng, flight.from.location.lat];
        } else {
          console.warn('无法获取出发地坐标:', flight);
          return; // 跳过这个航班
        }
        
        if (flight.arrival && flight.arrival.coordinates) {
          arrivalCoords = flight.arrival.coordinates;
        } else if (flight.arrivalCoords) {
          arrivalCoords = flight.arrivalCoords;
        } else if (flight.arrivalLat && flight.arrivalLng) {
          arrivalCoords = [flight.arrivalLng, flight.arrivalLat];
        } else if (flight.to && flight.to.location) {
          arrivalCoords = [flight.to.location.lng, flight.to.location.lat];
        } else {
          console.warn('无法获取目的地坐标:', flight);
          return; // 跳过这个航班
        }
        
        console.log('坐标信息:', { departureCoords, arrivalCoords });
        
        // 确保坐标是数组或对象
        if (!departureCoords || !arrivalCoords) {
          console.warn('坐标不存在:', { departureCoords, arrivalCoords });
          return; // 跳过这个航班
        }
        
        // 获取经纬度值
        const departureLat = departureCoords.latitude || (Array.isArray(departureCoords) ? departureCoords[1] : 0);
        const departureLng = departureCoords.longitude || (Array.isArray(departureCoords) ? departureCoords[0] : 0);
        const arrivalLat = arrivalCoords.latitude || (Array.isArray(arrivalCoords) ? arrivalCoords[1] : 0);
        const arrivalLng = arrivalCoords.longitude || (Array.isArray(arrivalCoords) ? arrivalCoords[0] : 0);
        
        // 坐标转换 WGS84 -> GCJ02(高德)
        const [departureGCJLng, departureGCJLat] = wgs84togcj02(departureLng, departureLat);
        const [arrivalGCJLng, arrivalGCJLat] = wgs84togcj02(arrivalLng, arrivalLat);
        
        // 创建航线 - 使用红色线条
        // 计算曲线航线点
        const latlngs = [];
        // 获取中间点，使航线呈现弧形
        const midLat = (departureGCJLat + arrivalGCJLat) / 2;
        const midLng = (departureGCJLng + arrivalGCJLng) / 2;
        
        // 计算垂直于直线的向量，用于弯曲航线
        const latDiff = arrivalGCJLat - departureGCJLat;
        const lngDiff = arrivalGCJLng - departureGCJLng;
        const distance = Math.sqrt(Math.pow(latDiff, 2) + Math.pow(lngDiff, 2));
        
        // 计算曲线的弯曲程度，距离越远弯曲越明显
        const curveHeight = distance * 0.15;
        
        // 垂直于直线的单位向量
        const perpLat = -lngDiff / distance;
        const perpLng = latDiff / distance;
        
        // 中间控制点
        const ctrlLat = midLat + perpLat * curveHeight;
        const ctrlLng = midLng + perpLng * curveHeight;
        
        // 生成曲线点
        const numPoints = 50;
        for (let i = 0; i <= numPoints; i++) {
          const t = i / numPoints;
          
          // 二次贝塞尔曲线公式 B(t) = (1-t)^2 * P0 + 2t(1-t) * P1 + t^2 * P2
          const lat = Math.pow(1-t, 2) * departureGCJLat + 
                     2 * t * (1-t) * ctrlLat + 
                     Math.pow(t, 2) * arrivalGCJLat;
                     
          const lng = Math.pow(1-t, 2) * departureGCJLng + 
                     2 * t * (1-t) * ctrlLng + 
                     Math.pow(t, 2) * arrivalGCJLng;
                     
          latlngs.push([lat, lng]);
        }
        
        // 创建曲线航线
        const path = L.polyline(latlngs, {
          color: '#e53e3e', // 红色航线
          weight: 2,
          opacity: 0.8
        }).addTo(mapInstanceRef.current);
        
        // 添加箭头
        const arrowHead = L.polylineDecorator(path, {
          patterns: [
            {
              offset: '100%', 
              repeat: 0, 
              symbol: L.Symbol.arrowHead({
                pixelSize: 15,
                polygon: true,
                pathOptions: {
                  fillOpacity: 1,
                  weight: 0,
                  color: '#e53e3e'
                }
              })
            }
          ]
        }).addTo(mapInstanceRef.current);
        
        flightPathsRef.current.push(arrowHead);
        
        // 获取城市名称
        const departureCity = flight.departure?.city || flight.departureCity || flight.from?.city || '出发地';
        const arrivalCity = flight.arrival?.city || flight.arrivalCity || flight.to?.city || '目的地';
        
        // 添加弹出信息
        path.bindPopup(`
          <div class="p-2 text-center">
            <button class="close-popup px-3 py-1 bg-gray-300 text-gray-700 rounded hover:bg-gray-400">关闭</button>
          </div>
        `);
        
        // 添加关闭按钮事件
        path.on('popupopen', () => {
          setTimeout(() => {
            const closeBtn = document.querySelector('.close-popup');
            if (closeBtn) {
              closeBtn.addEventListener('click', () => {
                mapInstanceRef.current.closePopup();
              });
            }
          }, 100);
        });
        
        flightPathsRef.current.push(path);
        
        // 添加起点和终点标记
        const departureMarker = L.circleMarker([departureGCJLat, departureGCJLng], {
          radius: 5,
          fillColor: '#e53e3e',
          color: '#fff',
          weight: 1,
          opacity: 1,
          fillOpacity: 0.8
        }).addTo(mapInstanceRef.current);
        
        const arrivalMarker = L.circleMarker([arrivalGCJLat, arrivalGCJLng], {
          radius: 5,
          fillColor: '#e53e3e',
          color: '#fff',
          weight: 1,
          opacity: 1,
          fillOpacity: 0.8
        }).addTo(mapInstanceRef.current);
        
        departureMarker.bindTooltip(departureCity);
        arrivalMarker.bindTooltip(arrivalCity);
        
        flightPathsRef.current.push(departureMarker);
        flightPathsRef.current.push(arrivalMarker);
      } catch (error) {
        console.error('处理航班数据时出错:', error, flight);
      }
    });
    
    // 调整地图视图以包含所有航班
    try {
      if (flights.length > 0 && flightPathsRef.current.length > 0) {
        const bounds = L.latLngBounds(
          flightPathsRef.current
            .filter(item => item instanceof L.Polyline)
            .flatMap(path => path.getLatLngs())
        );
        
        if (bounds.isValid()) {
          mapInstanceRef.current.fitBounds(bounds, { padding: [50, 50] });
        }
      }
    } catch (error) {
      console.error('调整地图视图时出错:', error);
    }
  }, [flights]);

  return (
    <div ref={mapRef} className="h-full w-full" />
  );
}