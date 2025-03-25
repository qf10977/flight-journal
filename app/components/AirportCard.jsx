"use client";

export default function AirportCard({ airport, onClick }) {
    return (
      <div 
        className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow cursor-pointer"
        onClick={onClick}
      >
        <div className="flex justify-between items-start">
          <div>
            <h3 className="text-xl font-medium text-gray-900">
              {airport.name} ({airport.iata})
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              {airport.city}, {airport.country}
            </p>
          </div>
          <div className="text-right text-sm text-gray-500">
            <p>时区: {airport.timezone}</p>
            <p className="mt-1">海拔: {airport.elevation}m</p>
          </div>
        </div>
      </div>
    );
  }