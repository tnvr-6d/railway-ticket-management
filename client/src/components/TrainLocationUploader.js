import React, { useState, useEffect, useRef } from 'react';
import { updateTrainLocation } from '../api/api';

function TrainLocationUploader() {
  const [trainId, setTrainId] = useState('');
  const [sending, setSending] = useState(false);
  const [status, setStatus] = useState('');
  const [lastLocation, setLastLocation] = useState(null);
  const intervalRef = useRef(null);

  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  const startSending = () => {
    if (!trainId) {
      setStatus('Please enter a train ID.');
      return;
    }
    setSending(true);
    setStatus('Starting location updates...');
    intervalRef.current = setInterval(sendLocation, 10000); // every 10s
    sendLocation();
  };

  const stopSending = () => {
    setSending(false);
    setStatus('Stopped.');
    if (intervalRef.current) clearInterval(intervalRef.current);
  };

  const sendLocation = () => {
    if (!navigator.geolocation) {
      setStatus('Geolocation not supported.');
      return;
    }
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;
        setLastLocation({ latitude, longitude, time: new Date().toLocaleTimeString() });
        try {
          await updateTrainLocation(trainId, latitude, longitude);
          setStatus(`Location sent at ${new Date().toLocaleTimeString()}`);
        } catch (err) {
          setStatus('Failed to send location: ' + err.message);
        }
      },
      (err) => {
        setStatus('Error getting location: ' + err.message);
      }
    );
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-xl shadow-lg w-full max-w-md">
        <h2 className="text-2xl font-bold mb-4">Train Location Uploader</h2>
        <label className="block mb-2 font-medium">Train ID:</label>
        <input
          type="text"
          value={trainId}
          onChange={e => setTrainId(e.target.value)}
          className="w-full border px-4 py-2 rounded mb-4"
          disabled={sending}
        />
        <div className="flex gap-2 mb-4">
          <button
            onClick={startSending}
            className="bg-green-600 text-white px-4 py-2 rounded"
            disabled={sending}
          >
            Start
          </button>
          <button
            onClick={stopSending}
            className="bg-red-600 text-white px-4 py-2 rounded"
            disabled={!sending}
          >
            Stop
          </button>
        </div>
        <div className="mb-2 text-gray-700">Status: {status}</div>
        {lastLocation && (
          <div className="text-sm text-gray-600">
            Last sent: Lat {lastLocation.latitude}, Lng {lastLocation.longitude} at {lastLocation.time}
          </div>
        )}
        <div className="mt-6 text-xs text-gray-400">Keep this page open and running on the train's laptop for live tracking.</div>
      </div>
    </div>
  );
}

export default TrainLocationUploader; 