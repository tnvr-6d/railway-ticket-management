import React, { useState } from "react";
import FareLabel from "./FareLabel";

function ScheduleList({ schedules, onSelectSchedule }) {
  const [expandedScheduleId, setExpandedScheduleId] = useState(null);

  const toggleRouteStations = (scheduleId) => {
    setExpandedScheduleId(expandedScheduleId === scheduleId ? null : scheduleId);
  };

  if (!schedules || schedules.length === 0) {
    return (
      <div className="text-center py-16 glass">
        <div className="text-6xl mb-4 float">🚆</div>
        <h3 className="text-xl font-semibold text-gray-800 mb-2">No trains found</h3>
        <p className="text-gray-500">Please search for a route to see available trains.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {schedules.map((schedule, index) => {
        const isExpanded = expandedScheduleId === schedule.schedule_id;
        const routeString = [
          schedule.source,
          ...(schedule.intermediate_stations || []),
          schedule.destination
        ].join(' → ');

        return (
          <div 
            key={schedule.schedule_id} 
            className="schedule-card"
            style={{ animationDelay: `${index * 100}ms` }}
          >
            <div className="p-6 border-b bg-gradient-to-r from-indigo-50 to-purple-50 rounded-t-xl">
              <h3 className="font-bold text-xl gradient-text mb-2">{schedule.train_name}</h3>
              <p className="text-sm text-gray-600">
                📅 {new Date(schedule.departure_date).toLocaleDateString()} | ⏰ {schedule.departure_time} → {schedule.arrival_time}
              </p>
            </div>

            <div className="p-6 space-y-3 flex-grow">
              <div className="flex items-center justify-between">
                <p className="font-semibold text-gray-800 text-lg">{schedule.source} → {schedule.destination}</p>
              </div>
              <div className="flex items-center space-x-4 text-sm text-gray-600">
                <span>🕒 {schedule.duration} min</span>
                <span>📏 {Number(schedule.distance).toFixed(2)} km</span>
              </div>
              <FareLabel schedule={schedule} />

              {schedule.intermediate_stations && schedule.intermediate_stations.length > 0 && (
                <div className="mt-4">
                  <button
                    onClick={() => toggleRouteStations(schedule.schedule_id)}
                    className="text-sm font-semibold text-indigo-600 hover:text-indigo-800 transition-colors"
                  >
                    {isExpanded ? 'Hide Route Stations ▲' : 'View Route Stations ▼'}
                  </button>
                  {isExpanded && (
                    <p className="text-xs text-gray-500 mt-2 leading-relaxed bg-gray-50 p-3 rounded-lg">{routeString}</p>
                  )}
                </div>
              )}
            </div>

            <div className="p-6">
              <button
                className="btn-primary w-full py-3 px-4"
                onClick={() => onSelectSchedule(schedule)}
              >
                🪑 Select Seats
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default ScheduleList;