
import React, { useEffect, useState } from "react";
import { getFare } from "../api/api";

function FareLabel({ schedule }) {
  const [fareInfo, setFareInfo] = useState({ fare: null, error: null, loading: true });

  useEffect(() => {
    if (!schedule?.class_type) {
      setFareInfo({ fare: null, error: 'Incomplete schedule data', loading: false });
      return;
    }

    setFareInfo({ fare: null, error: null, loading: true });

    getFare(schedule.class_type)
      .then(fareData => {
        setFareInfo({ fare: fareData, error: null, loading: false });
      })
      .catch(err => {
        console.warn(`\u274c Fare fetch failed for class ${schedule.class_type}:`, err.message);
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
  return <p>💰 ৳{totalFare.toFixed(2)}</p>;
}

export default FareLabel;


