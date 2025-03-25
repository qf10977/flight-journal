"use client";

export default function AirportDetailModal({ airport, onClose }) {
  return (
    <div className="fixed inset-0 bg-black/70 overflow-y-auto h-full w-full z-50 animate-fadeIn">
      <div className="relative max-w-5xl mx-auto my-8 bg-white border border-blue-100 rounded-xl shadow-lg overflow-hidden">
        {/* 头部信息 */}
        <div className="sticky top-0 z-10 bg-gradient-to-r from-blue-50 to-indigo-50 px-6 py-6 border-b border-blue-100">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <div className="flex items-center justify-center h-12 w-12 rounded-lg bg-blue-100 text-blue-600 text-sm font-medium shadow-sm border border-blue-200">
                {airport.iata}
              </div>
              <div>
                <h3 className="text-2xl font-light text-gray-800">
                  {airport.name}
                </h3>
                <p className="text-gray-600">
                  {airport.city}, {airport.country}
                </p>
              </div>
            </div>
            <div>
              <button 
                onClick={onClose}
                className="group h-9 px-5 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-full transition-all duration-300 flex items-center shadow-md hover:shadow-lg transform hover:-translate-y-0.5 active:translate-y-0 hover:ring-2 hover:ring-blue-300 hover:ring-opacity-50"
              >
                <svg className="h-4 w-4 mr-1.5 group-hover:-rotate-90 transition-transform duration-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
                <span className="font-medium text-sm">退出</span>
              </button>
            </div>
          </div>
        </div>

        {/* 内容区域 */}
        <div className="px-6 py-6 bg-white">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8 animate-slideUp">
            <div className="bg-blue-50 rounded-xl p-5 border border-blue-100 shadow-sm">
              <div className="flex items-center mb-3">
                <svg className="h-5 w-5 text-blue-500 mr-2" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/>
                </svg>
                <h4 className="text-gray-700 font-medium">基本信息</h4>
              </div>
              <div className="space-y-2 text-sm">
                <p className="text-gray-600"><span className="inline-block w-16 text-gray-500">时区:</span> {airport.timezone}</p>
                <p className="text-gray-600"><span className="inline-block w-16 text-gray-500">海拔:</span> {airport.elevation}m</p>
              </div>
            </div>

            {/* 地图占位 */}
            <div className="bg-gray-50 rounded-xl p-5 border border-gray-100 shadow-sm flex items-center justify-center">
              <div className="text-center">
                <svg className="h-12 w-12 text-blue-300 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                </svg>
                <p className="text-blue-600">机场地理位置</p>
              </div>
            </div>
          </div>

          {/* 交通信息 */}
          <div className="mb-8 animate-slideUp animation-delay-150">
            <div className="flex items-center mb-4">
              <svg className="h-5 w-5 text-blue-500 mr-2" fill="currentColor" viewBox="0 0 24 24">
                <path d="M4 16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2v-8c0-1.1-.9-2-2-2H8.83L7 4H4c-1.1 0-2 .9-2 2v10zm9-13c.83 0 1.5.67 1.5 1.5S13.83 6 13 6s-1.5-.67-1.5-1.5S12.17 2 13 2zm-3 8.5c0-1.1.9-2 2-2s2 .9 2 2-.9 2-2 2-2-.9-2-2z"/>
              </svg>
              <h4 className="text-gray-700 font-medium">交通方式</h4>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {renderTransportation(airport.transportation)}
            </div>
          </div>

          {/* 航站楼信息 */}
          <div className="mb-8 animate-slideUp animation-delay-300">
            <div className="flex items-center mb-4">
              <svg className="h-5 w-5 text-blue-500 mr-2" fill="currentColor" viewBox="0 0 24 24">
                <path d="M21 16v-2l-8-5V3.5c0-.83-.67-1.5-1.5-1.5S10 2.67 10 3.5V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5z"/>
              </svg>
              <h4 className="text-gray-700 font-medium">航站楼设施</h4>
            </div>
            <div className="space-y-4">
              {renderTerminals(airport.terminals)}
            </div>
          </div>

          {/* 登机流程 */}
          <div className="mb-8 animate-slideUp animation-delay-450">
            <div className="flex items-center mb-4">
              <svg className="h-5 w-5 text-blue-500 mr-2" fill="currentColor" viewBox="0 0 24 24">
                <path d="M19 3h-4.18C14.4 1.84 13.3 1 12 1c-1.3 0-2.4.84-2.82 2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-7 0c.55 0 1 .45 1 1s-.45 1-1 1-1-.45-1-1 .45-1 1-1zm-2 14l-4-4 1.41-1.41L10 14.17l6.59-6.59L18 9l-8 8z"/>
              </svg>
              <h4 className="text-gray-700 font-medium">登机流程</h4>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {renderBoardingProcess(airport.boardingProcess)}
            </div>
          </div>

          {/* 住宿信息 */}
          <div className="mb-6 animate-slideUp animation-delay-600">
            <div className="flex items-center mb-4">
              <svg className="h-5 w-5 text-blue-500 mr-2" fill="currentColor" viewBox="0 0 24 24">
                <path d="M7 13c1.66 0 3-1.34 3-3S8.66 7 7 7s-3 1.34-3 3 1.34 3 3 3zm12-6h-8v7H3V7H1v10h22v-6c0-2.21-1.79-4-4-4z"/>
              </svg>
              <h4 className="text-gray-700 font-medium">转机住宿</h4>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {renderHotels(airport.hotels)}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// 渲染交通信息
function renderTransportation(transportation) {
  if (!transportation) return <p className="text-gray-500 text-sm col-span-full">暂无交通信息</p>;
  
  return (
    <>
      <div className="bg-white border border-blue-100 rounded-xl p-4 shadow-sm hover:shadow-md transition-all duration-300">
        <div className="flex items-center mb-2">
          <svg className="h-4 w-4 text-blue-400 mr-2" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 2c-4.42 0-8 .5-8 4v9.5C4 17.43 5.57 19 7.5 19L6 20.5v.5h12v-.5L16.5 19c1.93 0 3.5-1.57 3.5-3.5V6c0-3.5-3.58-4-8-4zm0 2c3.71 0 5.13.46 5.67 1H6.43c.6-.52 2.05-1 5.57-1zM6 7h5v3H6V7zm12 8.5c0 .83-.67 1.5-1.5 1.5h-9c-.83 0-1.5-.67-1.5-1.5V12h12v3.5zm0-5.5h-5V7h5v3z"/>
          </svg>
          <h5 className="text-sm font-medium text-gray-700">地铁</h5>
        </div>
        {transportation.subway.map((line, index) => (
          <div key={index} className="mb-2 pl-6">
            <p className="text-gray-700 text-sm">{line.line}</p>
            <p className="text-xs text-gray-500">首末班：{line.firstTrain} - {line.lastTrain}</p>
            <p className="text-xs text-gray-500">发车间隔：{line.frequency}</p>
          </div>
        ))}
      </div>
      <div className="bg-white border border-blue-100 rounded-xl p-4 shadow-sm hover:shadow-md transition-all duration-300">
        <div className="flex items-center mb-2">
          <svg className="h-4 w-4 text-blue-400 mr-2" fill="currentColor" viewBox="0 0 24 24">
            <path d="M4 16c0 .88.39 1.67 1 2.22V20c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h8v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1.78c.61-.55 1-1.34 1-2.22V6c0-3.5-3.58-4-8-4s-8 .5-8 4v10zm3.5 1c-.83 0-1.5-.67-1.5-1.5S6.67 14 7.5 14s1.5.67 1.5 1.5S8.33 17 7.5 17zm9 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zm1.5-6H6V6h12v5z"/>
          </svg>
          <h5 className="text-sm font-medium text-gray-700">机场巴士</h5>
        </div>
        {transportation.bus.map((bus, index) => (
          <div key={index} className="mb-2 pl-6">
            <p className="text-gray-700 text-sm">{bus.route} → {bus.destination}</p>
            <p className="text-xs text-gray-500">发车时间：{bus.schedule}</p>
            <p className="text-xs text-gray-500">票价：{bus.price}</p>
          </div>
        ))}
      </div>
    </>
  );
}

// 渲染航站楼信息
function renderTerminals(terminals) {
  if (!terminals?.length) return <p className="text-gray-500 text-sm">暂无航站楼信息</p>;
  
  return terminals.map((terminal, index) => (
    <div key={index} className="bg-white border border-blue-100 rounded-xl p-4 shadow-sm hover:shadow-md transition-all duration-300">
      <h5 className="text-sm font-medium text-gray-700 mb-3">{terminal.name}</h5>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <h6 className="text-xs font-medium text-gray-600 mb-2 flex items-center">
            <svg className="h-3 w-3 text-blue-400 mr-1" fill="currentColor" viewBox="0 0 24 24">
              <path d="M16 6v8h3v8h2V2c-2.76 0-5 2.24-5 4zm-5 3H9V2H7v7H5V2H3v7c0 2.21 1.79 4 4 4v9h2v-9c2.21 0 4-1.79 4-4V2h-2v7z"/>
            </svg>
            餐饮
          </h6>
          {terminal.restaurants.map((restaurant, idx) => (
            <div key={idx} className="mb-2">
              <p className="text-sm text-gray-700">{restaurant.name}</p>
              <p className="text-xs text-gray-500">位置：{restaurant.location}</p>
              <p className="text-xs text-gray-500">营业时间：{restaurant.hours}</p>
            </div>
          ))}
        </div>
        <div>
          <h6 className="text-xs font-medium text-gray-600 mb-2 flex items-center">
            <svg className="h-3 w-3 text-blue-400 mr-1" fill="currentColor" viewBox="0 0 24 24">
              <path d="M18 6h-2c0-2.21-1.79-4-4-4S8 3.79 8 6H6c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2zm-8 4c0 .55-.45 1-1 1s-1-.45-1-1V8h2v2zm2-6c1.1 0 2 .9 2 2h-4c0-1.1.9-2 2-2zm4 6c0 .55-.45 1-1 1s-1-.45-1-1V8h2v2z"/>
            </svg>
            商店
          </h6>
          {terminal.shops.map((shop, idx) => (
            <div key={idx} className="mb-2">
              <p className="text-sm text-gray-700">{shop.name}</p>
              <p className="text-xs text-gray-500">位置：{shop.location}</p>
              <p className="text-xs text-gray-500">营业时间：{shop.hours}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  ));
}

// 渲染登机流程
function renderBoardingProcess(process) {
  if (!process) return <p className="text-gray-500 text-sm col-span-full">暂无登机流程信息</p>;
  
  return (
    <>
      <div className="bg-white border border-blue-100 rounded-xl p-4 shadow-sm hover:shadow-md transition-all duration-300">
        <div className="flex items-center mb-2">
          <svg className="h-4 w-4 text-blue-400 mr-2" fill="currentColor" viewBox="0 0 24 24">
            <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm-5 14H4v-4h11v4zm0-5H4V9h11v4zm5 5h-4V9h4v9z"/>
          </svg>
          <h5 className="text-sm font-medium text-gray-700">值机信息</h5>
        </div>
        <ul className="pl-6 list-disc text-sm text-gray-600 space-y-1">
          {process.checkIn.requirements.map((req, index) => (
            <li key={index}>{req}</li>
          ))}
        </ul>
      </div>
      <div className="bg-white border border-blue-100 rounded-xl p-4 shadow-sm hover:shadow-md transition-all duration-300">
        <div className="flex items-center mb-2">
          <svg className="h-4 w-4 text-blue-400 mr-2" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm0 10.99h7c-.53 4.12-3.28 7.79-7 8.94V12H5V6.3l7-3.11v8.8z"/>
          </svg>
          <h5 className="text-sm font-medium text-gray-700">安检信息</h5>
        </div>
        <ul className="pl-6 list-disc text-sm text-gray-600 space-y-1">
          {process.security.requirements.map((req, index) => (
            <li key={index}>{req}</li>
          ))}
        </ul>
        <p className="text-xs font-medium text-gray-500 mt-3">温馨提示：</p>
        <ul className="pl-6 list-disc text-xs text-gray-500 space-y-1 mt-1">
          {process.security.tips.map((tip, index) => (
            <li key={index}>{tip}</li>
          ))}
        </ul>
      </div>
    </>
  );
}

// 渲染住宿信息
function renderHotels(hotels) {
  if (!hotels?.length) return <p className="text-gray-500 text-sm col-span-full">暂无住宿信息</p>;
  
  return hotels.map((hotel, index) => (
    <div key={index} className="bg-white border border-blue-100 rounded-xl p-4 shadow-sm hover:shadow-md transition-all duration-300">
      <h5 className="text-sm font-medium text-gray-700 mb-2">{hotel.name}</h5>
      <div className="space-y-1 text-sm">
        <p className="text-gray-600"><span className="text-gray-500">位置：</span>{hotel.location}</p>
        <p className="text-gray-600"><span className="text-gray-500">价格：</span>{hotel.price}</p>
        <p className="text-gray-600"><span className="text-gray-500">联系方式：</span>{hotel.contact}</p>
      </div>
    </div>
  ));
}