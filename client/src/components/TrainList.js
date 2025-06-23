import React, { useEffect, useState } from "react";
import { getTrains, getSchedules } from "../api/api";
import FareLabel from "./FareLabel"; // ✅ Show fare for each schedule
import "../App.css"; // ✅ Ensure your App.css includes modern styles

function TrainList({ onSelectSchedule }) {
  const [trains, setTrains] = useState([]);
  const [schedules, setSchedules] = useState([]);

  useEffect(() => {
    getTrains().then(setTrains);
    getSchedules().then(setSchedules);
  }, []);

  return (
    <div className="train-list">
      {trains.map(train => {
        const matchingSchedules = schedules.filter(
          (sch) => sch.train_id === train.train_id
        );

        return matchingSchedules.map(schedule => (
          <div key={schedule.schedule_id} className="train-card">
            <div className="train-header">
              <h3>{train.train_name}</h3>
              <span className="date-time">
                📅 {new Date(schedule.departure_date).toLocaleDateString()} |
                ⏰ {schedule.departure_time} → {schedule.arrival_time}
              </span>
            </div>

            <div className="train-info">
              <p>📍 <strong>{schedule.source}</strong> → <strong>{schedule.destination}</strong></p>
              <p>🕒 {schedule.duration} min | 📏 📏 {Number(schedule.distance).toFixed(2)} km
</p>
              <FareLabel schedule={schedule} />
            </div>

            <button
              className="book-btn"
              onClick={() => onSelectSchedule(schedule)}
            >
              🚆 Book Now
            </button>
          </div>
        ));
      })}
    </div>
  );
}

export default TrainList;
