import React from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

// Fix default marker icon issue in Leaflet + Webpack
import L from 'leaflet';
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

function TrainLocationMap({ latitude, longitude, trainName }) {
  if (!latitude || !longitude) {
    return <div className="text-center text-gray-500">No location available for this train.</div>;
  }
  return (
    <MapContainer center={[latitude, longitude]} zoom={13} style={{ height: '300px', width: '100%' }} scrollWheelZoom={false}>
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <Marker position={[latitude, longitude]}>
        <Popup>
          {trainName ? <b>{trainName}</b> : 'Train'}<br />
          Lat: {latitude.toFixed(5)}, Lng: {longitude.toFixed(5)}
        </Popup>
      </Marker>
    </MapContainer>
  );
}

export default TrainLocationMap; 