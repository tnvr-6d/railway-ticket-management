import React from "react";
import FareLabel from "./FareLabel";

function ScheduleList({ schedules, onSelectSchedule }) {
  if (!schedules || schedules.length === 0) {
    return (
      <div className="no-schedules-message">
        <p>Please search for a route to see available trains.</p>
      </div>
    );
  }

  return (
    <div className="schedule-list-container">
      {schedules.map((schedule, index) => (
        <div 
          key={schedule.schedule_id} 
          className="schedule-card"
          style={{ animationDelay: `${index * 100}ms` }} // Staggered animation delay
        >
          <div className="p-4 border-b bg-gray-50 rounded-t-xl">
            <h3 className="font-bold text-xl text-indigo-700">{schedule.train_name}</h3>
            <p className="text-sm text-gray-500">
              📅 {new Date(schedule.departure_date).toLocaleDateString()} | ⏰ {schedule.departure_time} → {schedule.arrival_time}
            </p>
          </div>

          <div className="p-4 space-y-2 flex-grow">
            <p className="font-semibold text-gray-800">{schedule.source} → {schedule.destination}</p>
            <p className="text-sm text-gray-600">🕒 {schedule.duration} min | 📏 {Number(schedule.distance).toFixed(2)} km</p>
            <FareLabel schedule={schedule} />
          </div>

          <div className="p-4">
            <button
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-4 rounded-lg transition"
              onClick={() => onSelectSchedule(schedule)}
            >
              Select Seats
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}

export default ScheduleList;