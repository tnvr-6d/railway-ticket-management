import React, { useState, useEffect } from 'react';
import { searchSchedules, getClasses } from '../api/api';

function SearchForm({ onResults }) {
  const [source, setSource] = useState('');
  const [destination, setDestination] = useState('');
  const [date, setDate] = useState('');
  const [loading, setLoading] = useState(false);
  
  const [classes, setClasses] = useState([]);
  const [selectedClass, setSelectedClass] = useState('');

  useEffect(() => {
    getClasses().then(data => {
      if (data.length > 0) {
        setClasses(data);
        if (data[0]) {
           setSelectedClass(data[0].class_type);
        }
      }
    });
  }, []);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!source || !destination || !date || !selectedClass) {
        alert("Please fill in all search fields.");
        return;
    }
    setLoading(true);
    try {
        const schedules = await searchSchedules(source, destination, date, selectedClass);
        onResults(schedules);
    } catch (error) {
        alert("Failed to fetch search results.");
    } finally {
        setLoading(false);
    }
  };

  return (
    <div className="bg-white p-6 md:p-8 rounded-2xl shadow-lg -mt-16 mb-12 relative z-10 max-w-6xl mx-auto">
      {/* The form now uses a 12-column grid for better layout control */}
      <form onSubmit={handleSearch} className="grid grid-cols-12 gap-4 items-end">
        
        <div className="col-span-12 lg:col-span-3">
          <label htmlFor="source" className="block text-sm font-medium text-gray-700 mb-1">From</label>
          <input 
            id="source"
            placeholder="e.g., Dhaka Kamalapur" 
            value={source} 
            onChange={e => setSource(e.target.value)} 
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>
        
        <div className="col-span-12 lg:col-span-3">
          <label htmlFor="destination" className="block text-sm font-medium text-gray-700 mb-1">To</label>
          <input 
            id="destination"
            placeholder="e.g., Chittagong" 
            value={destination} 
            onChange={e => setDestination(e.target.value)} 
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>
        
        <div className="col-span-12 lg:col-span-2">
          <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-1">Date</label>
          <input 
            id="date"
            type="date" 
            value={date} 
            onChange={e => setDate(e.target.value)} 
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>
        
        <div className="col-span-12 lg:col-span-2">
          <label htmlFor="class-type" className="block text-sm font-medium text-gray-700 mb-1">Class</label>
          <select
            id="class-type"
            value={selectedClass}
            onChange={e => setSelectedClass(e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 bg-white"
          >
            {classes.length === 0 && <option>Loading...</option>}
            {classes.map(c => (
              <option key={c.class_type} value={c.class_type}>
                {c.class_type}
              </option>
            ))}
          </select>
        </div>
        
        <div className="col-span-12 lg:col-span-2">
            <button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-6 rounded-lg transition duration-300 disabled:opacity-50">
              {loading ? '...' : 'Search'}
            </button>
        </div>

      </form>
    </div>
  );
}

export default SearchForm;