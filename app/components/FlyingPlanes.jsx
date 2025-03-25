"use client";

import { useState, useEffect, useRef } from 'react';

// 几种飞机图标SVG路径
const PLANE_ICONS = [
  // 客机
  "M12 6.7c0-.7-1.1-1.5-2.4-1.5-1.1 0-1.4.3-2.8 2.8L2.3 13c-.3.4-.2.8.2 1.1.2.1.4.2.6.2h2.6c.3 0 .6-.1.7-.3l2.4-2.4c.3-.3.7-.4 1.1-.1.3.2.5.5.5.9v7.3c0 .3.1.6.3.9l.3.3c.3.3.7.5 1.1.5.3 0 .6-.1.8-.3l.3-.3c.2-.2.3-.5.3-.9v-7.2c0-.4.2-.7.5-.9.4-.2.8-.1 1.1.1l2.4 2.4c.2.2.5.3.7.3H21.1c.3 0 .7-.1.9-.3.5-.5.5-1.3 0-1.7l-5-4.6c-.5-.4-1.2-1.1-2.4-1.1-.4 0-.9.1-1.5.1s-1.1-.1-1.1-.8V6.7Z",
  // 小型飞机
  "M4.5 19.5l15-15m-6 20v-5.5m0 0l9.5-9.5-5-1-4.5 4.5-5.5.5L3 19.5l5.5-.5z",
  // 直升机
  "M5.5 6.5h13m-8 8l-.5 4 1 1.5h4l1-1.5-.5-4m0 0h-5m5 0l7.5-11-1-1h-18l-1 1 7.5 11m0-11l-3 11m3-11l3 11",
];

export default function FlyingPlanes({ 
  count = 5, 
  speed = 3,
  maxSize = 60,
  minSize = 30,
  colors = ["#3b82f6", "#4f46e5", "#8b5cf6", "#0ea5e9"] // 多种颜色
}) {
  const [planes, setPlanes] = useState([]);
  const [isInitialized, setIsInitialized] = useState(false);
  const animationRef = useRef(null);
  const containerRef = useRef(null);

  // 固定速度系数 - 保证所有飞机速度一致
  const FIXED_SPEED = speed * 0.4; 

  // 在视野范围外创建飞机的距离系数
  const OUT_OF_VIEW_DISTANCE = 5; // 比原来的更远，确保有足够的过渡时间

  // 初始化飞机
  useEffect(() => {
    const initPlanes = () => {
      if (!containerRef.current) return;
      
      const containerWidth = containerRef.current.offsetWidth;
      const containerHeight = containerRef.current.offsetHeight;
      
      // 创建均匀分布的飞机
      const newPlanes = Array.from({ length: count }, (_, index) => {
        // 给每架飞机随机大小
        const size = Math.floor(Math.random() * (maxSize - minSize)) + minSize;
        
        // 计算飞机初始位置，确保在视野之外很远的地方
        // 这样飞机可以慢慢飞入，而不是突然出现
        let x, y;
        
        // 将飞机均匀分布在四个边缘
        const side = Math.floor(index % 4); // 0:上, 1:右, 2:下, 3:左
        
        if (side === 0) { // 上边
          x = Math.random() * containerWidth;
          y = -size * OUT_OF_VIEW_DISTANCE;
        } else if (side === 1) { // 右边
          x = containerWidth + size * OUT_OF_VIEW_DISTANCE;
          y = Math.random() * containerHeight;
        } else if (side === 2) { // 下边
          x = Math.random() * containerWidth;
          y = containerHeight + size * OUT_OF_VIEW_DISTANCE;
        } else { // 左边
          x = -size * OUT_OF_VIEW_DISTANCE;
          y = Math.random() * containerHeight;
        }
        
        // 避免所有飞机同时到达，添加随机时间偏移
        const timeOffset = Math.random() * 15; // 0-15秒的随机偏移
        
        // 确定飞行目标在屏幕中心区域的随机位置
        const targetX = containerWidth / 2 + (Math.random() - 0.5) * containerWidth * 0.7;
        const targetY = containerHeight / 2 + (Math.random() - 0.5) * containerHeight * 0.7;
        
        // 计算飞向目标的角度
        const angleToTarget = Math.atan2(targetY - y, targetX - x);
        
        // 固定匀速，只改变方向
        const speedX = Math.cos(angleToTarget) * FIXED_SPEED;
        const speedY = Math.sin(angleToTarget) * FIXED_SPEED;
        
        // 计算初始旋转角度，与移动方向一致
        const rotation = Math.atan2(speedY, speedX) * (180 / Math.PI) + 90;
        
        // 随机选择飞机图标和颜色
        const iconIndex = Math.floor(Math.random() * PLANE_ICONS.length);
        const colorIndex = Math.floor(Math.random() * colors.length);
        
        // 波浪参数 - 使用非常缓慢的频率确保平滑运动
        const waveFrequency = 0.003 + Math.random() * 0.002; // 极低频率
        const waveAmplitude = 0.3 + Math.random() * 0.3; // 减小振幅，使波动更平缓
        
        return {
          id: index,
          x,
          y,
          size,
          speedX,
          speedY,
          rotation,
          // 设置初始透明度为0，会慢慢淡入
          opacity: 0,
          targetOpacity: 0.6 + Math.random() * 0.2, // 降低透明度，让效果更柔和
          color: colors[colorIndex],
          iconPath: PLANE_ICONS[iconIndex],
          pathType: Math.random() > 0.3 ? 'wave' : 'straight',
          waveAmplitude,
          waveFrequency,
          wavePhase: Math.random() * Math.PI * 2,
          time: timeOffset // 使用时间偏移，让飞机在不同时间进入视野
        };
      });
      
      setPlanes(newPlanes);
      setIsInitialized(true);
    };

    initPlanes();
    
    // 窗口大小变化时重新初始化飞机
    window.addEventListener('resize', initPlanes);
    return () => window.removeEventListener('resize', initPlanes);
  }, [count, maxSize, minSize, FIXED_SPEED, colors]);

  // 动画函数 - 更新飞机位置
  useEffect(() => {
    if (!containerRef.current || planes.length === 0 || !isInitialized) return;
    
    const container = containerRef.current;
    const containerWidth = container.offsetWidth;
    const containerHeight = container.offsetHeight;
    
    let lastTimestamp = 0;
    
    const animate = (timestamp) => {
      // 计算时间增量（秒）
      const deltaTime = lastTimestamp ? (timestamp - lastTimestamp) / 1000 : 0.016;
      lastTimestamp = timestamp;
      
      setPlanes(prevPlanes => 
        prevPlanes.map(plane => {
          let { 
            x, y, speedX, speedY, rotation, opacity, targetOpacity,
            pathType, waveAmplitude, waveFrequency, wavePhase, time
          } = plane;
          
          // 增加时间
          time += deltaTime;
          
          // 超慢的淡入效果，确保飞机不会突然变得可见
          if (opacity < targetOpacity) {
            opacity += deltaTime * 0.1; // 更慢的淡入速度
            if (opacity > targetOpacity) opacity = targetOpacity;
          }
          
          // 根据轨迹类型更新位置 - 始终保持匀速
          if (pathType === 'wave') {
            // 波浪轨迹 - 匀速移动
            const baseX = x + speedX * deltaTime * 30;
            const baseY = y + speedY * deltaTime * 30;
            
            // 添加垂直于移动方向的波浪偏移
            const angle = Math.atan2(speedY, speedX) + Math.PI/2;
            const waveOffset = Math.sin(time * waveFrequency + wavePhase) * waveAmplitude;
            x = baseX + Math.cos(angle) * waveOffset;
            y = baseY + Math.sin(angle) * waveOffset;
            
            // 平滑调整旋转角度
            const targetRotation = Math.atan2(speedY, speedX) * (180 / Math.PI) + 90;
            const tiltAngle = Math.cos(time * waveFrequency + wavePhase + Math.PI/2) * 3; // 更小的倾斜角度
            const rotationDiff = (targetRotation + tiltAngle) - rotation;
            rotation += rotationDiff * 0.03; // 更慢的旋转调整
          } else {
            // 直线轨迹 - 匀速移动
            x += speedX * deltaTime * 30;
            y += speedY * deltaTime * 30;
            
            // 平滑调整旋转角度
            const targetRotation = Math.atan2(speedY, speedX) * (180 / Math.PI) + 90;
            const rotationDiff = targetRotation - rotation;
            rotation += rotationDiff * 0.03;
          }
          
          // 边界检测 - 飞出边界时重新部署到视野外
          const isTooFarOut = (
            x < -plane.size * OUT_OF_VIEW_DISTANCE || 
            x > containerWidth + plane.size * OUT_OF_VIEW_DISTANCE ||
            y < -plane.size * OUT_OF_VIEW_DISTANCE || 
            y > containerHeight + plane.size * OUT_OF_VIEW_DISTANCE
          );
          
          if (isTooFarOut) {
            // 飞出太远后，重新从远离视野的位置开始
            opacity = 0; // 重置透明度为0
            
            // 选择与当前飞行方向相反的边缘重新进入
            // 这确保飞机的飞行路径看起来更自然
            const currentAngle = Math.atan2(speedY, speedX);
            const oppositeAngle = currentAngle + Math.PI + (Math.random() - 0.5) * Math.PI/2;
            
            // 设置在远离视野的位置
            const distance = Math.max(containerWidth, containerHeight) * 0.6;
            x = containerWidth/2 + Math.cos(oppositeAngle) * distance;
            y = containerHeight/2 + Math.sin(oppositeAngle) * distance;
            
            // 确定新的飞行目标在屏幕中心区域
            const targetX = containerWidth/2 + (Math.random() - 0.5) * containerWidth * 0.7;
            const targetY = containerHeight/2 + (Math.random() - 0.5) * containerHeight * 0.7;
            const angleToTarget = Math.atan2(targetY - y, targetX - x);
            
            // 更新速度方向，保持固定速度
            speedX = Math.cos(angleToTarget) * FIXED_SPEED;
            speedY = Math.sin(angleToTarget) * FIXED_SPEED;
            
            // 重置旋转角度与移动方向一致
            rotation = Math.atan2(speedY, speedX) * (180 / Math.PI) + 90;
            
            // 重置波浪参数
            wavePhase = Math.random() * Math.PI * 2;
            // 添加随机时间延迟，避免飞机同时出现
            time = Math.random() * 5;
          }
          
          return { 
            ...plane, 
            x, y, 
            speedX, speedY, 
            rotation, time, 
            opacity, targetOpacity,
            waveAmplitude,
            waveFrequency,
            wavePhase
          };
        })
      );
      
      animationRef.current = requestAnimationFrame(animate);
    };
    
    animationRef.current = requestAnimationFrame(animate);
    
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [planes, isInitialized, FIXED_SPEED]);

  return (
    <div 
      ref={containerRef}
      className="fixed inset-0 z-0 pointer-events-none overflow-hidden"
    >
      {planes.map(plane => (
        <div
          key={plane.id}
          className="absolute"
          style={{
            transform: `translate3d(${plane.x}px, ${plane.y}px, 0) rotate(${plane.rotation}deg)`,
            width: `${plane.size}px`,
            height: `${plane.size}px`,
            opacity: plane.opacity,
            // 超长平滑过渡时间
            transition: 'opacity 3s linear, transform 1.2s linear',
            willChange: 'transform, opacity',
            filter: `drop-shadow(0 0 2px ${plane.color})`
          }}
        >
          {/* 飞机SVG图标 */}
          <svg 
            viewBox="0 0 24 24" 
            fill="none" 
            className="w-full h-full"
            stroke={plane.color} 
            strokeWidth="1.5" 
            strokeLinecap="round" 
            strokeLinejoin="round"
          >
            <path d={plane.iconPath} fill={plane.iconPath.includes('m') ? "none" : plane.color} stroke={plane.iconPath.includes('m') ? plane.color : "none"} />
          </svg>
        </div>
      ))}
    </div>
  );
} 