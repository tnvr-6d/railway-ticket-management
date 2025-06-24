/*import React, { useEffect, useState } from "react";
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

export default FareLabel;*/

// File: client/src/components/FareLabel.js

// File: client/src/components/FareLabel.js

import React, { useEffect, useState } from "react";
import { getFare } from "../api/api";

function FareLabel({ schedule }) {
  const [fareInfo, setFareInfo] = useState({ fare: null, error: null, loading: true });

  useEffect(() => {
    if (!schedule?.coach_number || !schedule?.class_type) {
      setFareInfo({ fare: null, error: 'Incomplete schedule data', loading: false });
      return;
    }

    setFareInfo({ fare: null, error: null, loading: true });

    getFare(schedule.coach_number, schedule.class_type)
      .then(fareData => {
        setFareInfo({ fare: fareData, error: null, loading: false });
      })
      .catch(err => {
        console.warn(`❌ Fare fetch failed for ${schedule.coach_number}:`, err.message);
        setFareInfo({ fare: null, error: "Fare not available", loading: false });
      });
  }, [schedule]);

  if (fareInfo.loading) {
    return <p>💰 Loading fare...</p>;
  }

  if (fareInfo.error || !fareInfo.fare?.per_km_fare || !schedule?.distance) {
    return <p>💰 Fare not available</p>;
  }

  const totalFare = Number(schedule.distance) * Number(fareInfo.fare.per_km_fare);
  return <p>💰 BDT {totalFare.toFixed(2)}</p>;
}

export default FareLabel;


