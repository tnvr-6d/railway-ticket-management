import React, { useEffect, useState } from "react";
import { getFare } from "../api/api";

function FareLabel({ schedule }) {
  const [fare, setFare] = useState(null);

  useEffect(() => {
    if (!schedule?.route_id || !schedule?.coach_number || !schedule?.class_type) return;

    getFare(schedule.route_id, schedule.coach_number, schedule.class_type)
      .then(setFare)
      .catch(err => console.warn("❌ Fare fetch failed:", err));
  }, [schedule]);

  if (!fare || !fare.per_km_fare || !schedule?.distance) {
    return <p>💰 Fare not available</p>;
  }

  const totalFare = Number(schedule.distance) * Number(fare.per_km_fare);
  return <p>💰 BDT {totalFare.toFixed(2)}</p>;
}

export default FareLabel;



