import React, { useState } from 'react';
import { searchSchedules } from '../api/api';

function SearchForm({ onResults }) {
  const [source, setSource] = useState('');
  const [destination, setDestination] = useState('');
  const [date, setDate] = useState('');

  const handleSearch = async () => {
    if (!source || !destination || !date) return;
    const schedules = await searchSchedules(source, destination, date);
    onResults(schedules);
  };

  return (
    <div className="search-form">
      <input placeholder="From" value={source} onChange={e => setSource(e.target.value)} />
      <input placeholder="To" value={destination} onChange={e => setDestination(e.target.value)} />
      <input type="date" value={date} onChange={e => setDate(e.target.value)} />
      <button onClick={handleSearch}>Search Trains</button>
    </div>
  );
}

export default SearchForm;
