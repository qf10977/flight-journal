"use client"

import { useEffect, useRef, useState } from 'react'
import 'leaflet/dist/leaflet.css'

export default function FlightMap({ flights = [], selectedFlight, onFlightSelect }) {
  const mapRef = useRef(null)
  const mapInstanceRef = useRef(null)
  const markersRef = useRef([])
  const pathsRef = useRef([])

  // 初始化地图
  useEffect(() => {
    if (typeof window !== 'undefined') {
      import('leaflet').then(L => {
        if (!mapInstanceRef.current && mapRef.current) {
          // 修复Leaflet默认图标路径问题
          delete L.Icon.Default.prototype._getIconUrl;
          L.Icon.Default.mergeOptions({
            iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
            iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
            shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
          });
          
          // 创建地图实例
          mapInstanceRef.current = L.map(mapRef.current).setView([30, 110], 4)
          
          // 添加地图图层
          L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          }).addTo(mapInstanceRef.current)
        }
      })
    }
    
    return () => {
      // 清理地图实例
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove()
        mapInstanceRef.current = null
      }
    }
  }, [])

  // 更新航班路线
  useEffect(() => {
    if (typeof window !== 'undefined' && mapInstanceRef.current) {
      import('leaflet').then(L => {
        // 修复Leaflet默认图标路径问题
        delete L.Icon.Default.prototype._getIconUrl;
        L.Icon.Default.mergeOptions({
          iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
          iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
          shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
        });
        
        const map = mapInstanceRef.current
        
        // 清除现有标记和路径
        markersRef.current.forEach(marker => {
          if (map.hasLayer(marker)) {
            map.removeLayer(marker)
          }
        })
        pathsRef.current.forEach(path => {
          if (map.hasLayer(path)) {
            map.removeLayer(path)
          }
        })
        markersRef.current = []
        pathsRef.current = []
        
        if (flights.length === 0) return
        
        // 所有航班的坐标点
        const allPoints = []
        
        // 添加航班路线
        flights.forEach(flight => {
          if (!flight.departure?.coordinates || !flight.arrival?.coordinates) return
          
          const departureCoords = flight.departure.coordinates
          const arrivalCoords = flight.arrival.coordinates
          
          // 确保坐标是有效的
          if (!departureCoords.length || !arrivalCoords.length) return
          
          const depLat = departureCoords[1]
          const depLng = departureCoords[0]
          const arrLat = arrivalCoords[1]
          const arrLng = arrivalCoords[0]
          
          // 添加到所有点集合
          allPoints.push([depLat, depLng])
          allPoints.push([arrLat, arrLng])
          
          // 创建出发地标记
          const depMarker = L.marker([depLat, depLng], {
            title: flight.departure.name,
            riseOnHover: true,
          }).addTo(map)
          
          // 创建目的地标记
          const arrMarker = L.marker([arrLat, arrLng], {
            title: flight.arrival.name,
            riseOnHover: true,
          }).addTo(map)
          
          // 创建弧线路径
          const latlngs = createArcPoints([depLat, depLng], [arrLat, arrLng])
          
          // 创建路线
          const polyline = L.polyline(latlngs, {
            color: selectedFlight?.id === flight.id ? '#4F46E5' : '#9CA3AF',
            weight: selectedFlight?.id === flight.id ? 3 : 2,
            opacity: selectedFlight?.id === flight.id ? 1 : 0.7,
            smoothFactor: 1
          }).addTo(map)
          
          // 添加点击事件
          polyline.on('click', () => {
            onFlightSelect(flight)
          })
          
          // 添加弹出窗口
          const popupContent = `
            <div class="p-2">
              <div class="font-bold">${flight.flightNumber}</div>
              <div>${flight.departure.city} → ${flight.arrival.city}</div>
              <div class="text-xs text-gray-500">${new Date(flight.departureTime).toLocaleDateString()}</div>
            </div>
          `
          
          depMarker.bindPopup(`
            <div class="p-2">
              <div class="font-bold">${flight.departure.name}</div>
              <div>${flight.departure.city}, ${flight.departure.code}</div>
              <div class="text-xs text-gray-500">出发: ${new Date(flight.departureTime).toLocaleString()}</div>
            </div>
          `)
          
          arrMarker.bindPopup(`
            <div class="p-2">
              <div class="font-bold">${flight.arrival.name}</div>
              <div>${flight.arrival.city}, ${flight.arrival.code}</div>
              <div class="text-xs text-gray-500">到达: ${new Date(flight.arrivalTime).toLocaleString()}</div>
            </div>
          `)
          
          polyline.bindPopup(popupContent)
          
          // 保存引用以便后续清除
          markersRef.current.push(depMarker, arrMarker)
          pathsRef.current.push(polyline)
        })
        
        // 如果有选中的航班，将地图中心设置为该航班的中点
        if (selectedFlight) {
          const depLat = selectedFlight.departure.coordinates[1]
          const depLng = selectedFlight.departure.coordinates[0]
          const arrLat = selectedFlight.arrival.coordinates[1]
          const arrLng = selectedFlight.arrival.coordinates[0]
          
          const centerLat = (depLat + arrLat) / 2
          const centerLng = (depLng + arrLng) / 2
          
          map.setView([centerLat, centerLng], 5)
        } else if (flights.length > 0 && allPoints.length > 0) {
          // 如果没有选中的航班但有航班数据，将地图调整为包含所有航班
          const bounds = L.latLngBounds(allPoints)
          map.fitBounds(bounds, { padding: [50, 50] })
        }
      })
    }
  }, [flights, selectedFlight, onFlightSelect])

  // 创建弧线点
  const createArcPoints = (start, end) => {
    const latlngs = []
    const offsetX = end[1] - start[1]
    const offsetY = end[0] - start[0]
    const r = Math.sqrt(Math.pow(offsetX, 2) + Math.pow(offsetY, 2))
    const numPoints = Math.max(Math.round(r * 5), 10) // 根据距离调整点的数量
    
    // 大圆航线
    for (let i = 0; i <= numPoints; i++) {
      const t = i / numPoints
      const lat = start[0] + offsetY * t
      const lng = start[1] + offsetX * t
      latlngs.push([lat, lng])
    }
    
    return latlngs
  }

  return (
    <div ref={mapRef} style={{ width: '100%', height: '100%' }}></div>
  )
} 