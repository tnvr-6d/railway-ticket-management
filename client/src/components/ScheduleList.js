import React from "react";
import FareLabel from "./FareLabel";

function ScheduleList({ schedules, onSelectSchedule }) {
  if (!schedules || schedules.length === 0) {
    return (
      <div className="text-center py-12 px-6 bg-white rounded-lg shadow-md">
        <p className="text-gray-500">Please search for a route to see available trains.</p>
      </div>
    );
  }

  return (
    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
      {schedules.map(schedule => (
        <div key={schedule.schedule_id} className="bg-white rounded-xl shadow-lg hover:shadow-2xl transform hover:-translate-y-1 transition-all duration-300 flex flex-col">
          <div className="p-4 border-b">
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

          <div className="p-4 bg-gray-50 rounded-b-xl">
            <button
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg transition"
              onClick={() => onSelectSchedule(schedule)}
            >
              🚆 Book Now
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}

export default ScheduleList;