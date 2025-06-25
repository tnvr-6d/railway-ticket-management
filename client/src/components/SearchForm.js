import React, { useState } from 'react';
import { searchSchedules } from '../api/api';

function SearchForm({ onResults }) {
  const [source, setSource] = useState('');
  const [destination, setDestination] = useState('');
  const [date, setDate] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!source || !destination || !date) {
        alert("Please fill in all search fields.");
        return;
    }
    setLoading(true);
    try {
        const schedules = await searchSchedules(source, destination, date);
        onResults(schedules);
    } catch (error) {
        alert("Failed to fetch search results.");
    } finally {
        setLoading(false);
    }
  };

  return (
    <div className="bg-white p-6 md:p-8 rounded-2xl shadow-lg -mt-16 mb-12 relative z-10 max-w-4xl mx-auto">
      <form onSubmit={handleSearch} className="grid md:grid-cols-3 lg:flex lg:items-end gap-4">
        <div className="lg:flex-grow">
          <label htmlFor="source" className="block text-sm font-medium text-gray-700 mb-1">From</label>
          <input 
            id="source"
            placeholder="e.g., Dhaka Kamalapur" 
            value={source} 
            onChange={e => setSource(e.target.value)} 
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>
        <div className="lg:flex-grow">
          <label htmlFor="destination" className="block text-sm font-medium text-gray-700 mb-1">To</label>
          <input 
            id="destination"
            placeholder="e.g., Chittagong" 
            value={destination} 
            onChange={e => setDestination(e.target.value)} 
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>
        <div className="lg:flex-grow">
          <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-1">Date</label>
          <input 
            id="date"
            type="date" 
            value={date} 
            onChange={e => setDate(e.target.value)} 
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>
        <button type="submit" className="w-full lg:w-auto bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-6 rounded-lg transition duration-300 disabled:opacity-50">
          {loading ? '...' : 'Search'}
        </button>
      </form>
    </div>
  );
}

export default SearchForm;