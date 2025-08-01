import React, { useState, useEffect } from "react";
import FareLabel from "./FareLabel";
import { getTrainLocation } from '../api/api';
import TrainLocationMap from './TrainLocationMap';

function ScheduleList({ schedules, onSelectSchedule }) {
  const [expandedScheduleId, setExpandedScheduleId] = useState(null);
  const [showMapForTrain, setShowMapForTrain] = useState(null);
  const [trainLocations, setTrainLocations] = useState({});

  const toggleRouteStations = (scheduleId) => {
    setExpandedScheduleId(expandedScheduleId === scheduleId ? null : scheduleId);
  };

  // Fetch location for a specific train
  const fetchLocation = async (train_id) => {
    if (!train_id) {
      console.warn('No train_id provided to fetchLocation!');
      return;
    }
    try {
      const loc = await getTrainLocation(train_id);
      setTrainLocations((prev) => ({ ...prev, [train_id]: loc }));
      console.log('Fetched location for train_id', train_id, loc);
    } catch {
      setTrainLocations((prev) => ({ ...prev, [train_id]: null }));
      console.warn('Failed to fetch location for train_id', train_id);
    }
  };

  // Poll for updates every 15s when map is open
  useEffect(() => {
    if (!showMapForTrain) return;
    fetchLocation(showMapForTrain);
    const interval = setInterval(() => fetchLocation(showMapForTrain), 15000);
    return () => clearInterval(interval);
  }, [showMapForTrain]);

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
        // Debug: print schedule object
        console.log('Schedule:', schedule);
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
              {(() => {
                const available = schedule.available_seats;
                const total = schedule.total_seats;
                const percent = total > 0 ? available / total : 0;
                let badgeColor = "bg-green-100 text-green-800 border-green-300";
                if (percent <= 0.2) badgeColor = "bg-red-100 text-red-700 border-red-300";
                else if (percent <= 0.5) badgeColor = "bg-yellow-100 text-yellow-800 border-yellow-300";
                return (
                  <div className={`flex items-center justify-start gap-2 my-2 px-3 py-2 rounded-full border font-bold text-base shadow-sm w-fit ${badgeColor}`} aria-label={`Seats available: ${available} out of ${total}`}>
                    <span className="text-xl mr-1"></span>
                    <span className="text-lg font-extrabold">{available}</span>
                    <span className="text-gray-600 font-medium text-base">/ {total} seats available</span>
                  </div>
                );
              })()}
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
            <div className="flex flex-col gap-2 mt-2">
              <button
                className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-lg"
                onClick={async () => {
                  if (showMapForTrain === schedule.train_id) setShowMapForTrain(null);
                  else {
                    setShowMapForTrain(schedule.train_id);
                    await fetchLocation(schedule.train_id);
                  }
                }}
              >
                {showMapForTrain === schedule.train_id ? 'Hide Live Location' : 'Show Live Location'}
              </button>
                                {showMapForTrain === schedule.train_id && (
                    <div className="my-4">
                      <TrainLocationMap
                        latitude={trainLocations[schedule.train_id]?.latitude}
                        longitude={trainLocations[schedule.train_id]?.longitude}
                        trainName={schedule.train_name}
                      />
                    </div>
                  )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default ScheduleList;