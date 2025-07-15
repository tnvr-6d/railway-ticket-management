/*import React, { useState, useEffect, useRef } from 'react';
import { searchSchedules, getClasses, searchStations } from '../api/api';

function SearchForm({ onResults }) {
  const [source, setSource] = useState('');
  const [destination, setDestination] = useState('');
  const [date, setDate] = useState('');
  const [loading, setLoading] = useState(false);
  const [classes, setClasses] = useState([]);
  const [selectedClass, setSelectedClass] = useState('');

  const [sourceSuggestions, setSourceSuggestions] = useState([]);
  const [destinationSuggestions, setDestinationSuggestions] = useState([]);
  const searchTimeout = useRef(null);


  const today = new Date().toISOString().split('T')[0];

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

    
    if (date < today) {
        alert("SELECT A VALID DATE");
        return; 
    }
    
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

  const handleStationInputChange = (value, type) => {
    if (type === 'source') {
      setSource(value);
    } else {
      setDestination(value);
    }

    if (searchTimeout.current) {
      clearTimeout(searchTimeout.current);
    }

    searchTimeout.current = setTimeout(async () => {
      if (value.length > 1) {
        const results = await searchStations(value);
        if (type === 'source') {
          setSourceSuggestions(results);
        } else {
          setDestinationSuggestions(results);
        }
      } else {
        setSourceSuggestions([]);
        setDestinationSuggestions([]);
      }
    }, 300);
  };

  const handleSuggestionClick = (stationName, type) => {
    if (type === 'source') {
      setSource(stationName);
      setSourceSuggestions([]);
    } else {
      setDestination(stationName);
      setDestinationSuggestions([]);
    }
  };

  return (
    <div className="bg-white p-6 md:p-8 rounded-2xl shadow-lg -mt-16 mb-12 relative z-20 max-w-6xl mx-auto">
      <form onSubmit={handleSearch} className="grid grid-cols-12 gap-4 items-end">
        
        <div className="col-span-12 lg:col-span-3 relative">
          <label htmlFor="source" className="block text-sm font-medium text-gray-700 mb-1">From</label>
          <input 
            id="source"
            placeholder="Type a station name" 
            value={source} 
            onChange={e => handleStationInputChange(e.target.value, 'source')}
            autoComplete="off"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
          />
          {sourceSuggestions.length > 0 && (
            <div className="absolute top-full left-0 w-full bg-white border border-gray-300 rounded-b-lg shadow-lg z-30">
              {sourceSuggestions.map(s => (
                <div key={s.station_name} onClick={() => handleSuggestionClick(s.station_name, 'source')} className="px-4 py-2 cursor-pointer hover:bg-indigo-50">
                  {s.station_name}
                </div>
              ))}
            </div>
          )}
        </div>
        
        <div className="col-span-12 lg:col-span-3 relative">
          <label htmlFor="destination" className="block text-sm font-medium text-gray-700 mb-1">To</label>
          <input 
            id="destination"
            placeholder="Type a station name" 
            value={destination} 
            onChange={e => handleStationInputChange(e.target.value, 'destination')} 
            autoComplete="off"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
          />
          {destinationSuggestions.length > 0 && (
            <div className="absolute top-full left-0 w-full bg-white border border-gray-300 rounded-b-lg shadow-lg z-30">
              {destinationSuggestions.map(s => (
                <div key={s.station_name} onClick={() => handleSuggestionClick(s.station_name, 'destination')} className="px-4 py-2 cursor-pointer hover:bg-indigo-50">
                  {s.station_name}
                </div>
              ))}
            </div>
          )}
        </div>
        
        <div className="col-span-12 lg:col-span-2">
            <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-1">Date</label>
            <input 
              id="date"
              type="date" 
              value={date} 
              onChange={e => setDate(e.target.value)}
              min={today}
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
            <button type="submit" disabled={loading} className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-6 rounded-lg transition duration-300 disabled:opacity-50">
              {loading ? '...' : 'Search'}
            </button>
        </div>

      </form>
    </div>
  );
}

export default SearchForm;*/

import React, { useState, useEffect, useRef } from 'react';
import { searchSchedules, getClasses, searchStations } from '../api/api';

function SearchForm({ onResults }) {
  const [source, setSource] = useState('');
  const [destination, setDestination] = useState('');
  const [date, setDate] = useState('');
  const [loading, setLoading] = useState(false);
  const [classes, setClasses] = useState([]);
  const [selectedClass, setSelectedClass] = useState('');

  const [sourceSuggestions, setSourceSuggestions] = useState([]);
  const [destinationSuggestions, setDestinationSuggestions] = useState([]);
  const searchTimeout = useRef(null);

  // Get today's date in YYYY-MM-DD format for validation
  const today = new Date().toISOString().split('T')[0];

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

    // --- DATE VALIDATION ---
    if (date < today) {
        alert("SELECT A VALID DATE");
        return; // Stop the search if the date is in the past
    }
    
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

  const handleStationInputChange = (value, type) => {
    if (type === 'source') {
      setSource(value);
    } else {
      setDestination(value);
    }

    if (searchTimeout.current) {
      clearTimeout(searchTimeout.current);
    }

    searchTimeout.current = setTimeout(async () => {
      if (value.length > 1) {
        const results = await searchStations(value);
        if (type === 'source') {
          setSourceSuggestions(results);
        } else {
          setDestinationSuggestions(results);
        }
      } else {
        setSourceSuggestions([]);
        setDestinationSuggestions([]);
      }
    }, 300);
  };

  const handleSuggestionClick = (stationName, type) => {
    if (type === 'source') {
      setSource(stationName);
      setSourceSuggestions([]);
    } else {
      setDestination(stationName);
      setDestinationSuggestions([]);
    }
  };

  return (
    <div className="bg-white p-6 md:p-8 rounded-2xl shadow-lg -mt-16 mb-12 relative z-20 max-w-6xl mx-auto">
      <form onSubmit={handleSearch} className="grid grid-cols-12 gap-4 items-end">
        
        <div className="col-span-12 lg:col-span-3 relative">
          <label htmlFor="source" className="block text-sm font-medium text-gray-700 mb-1">From</label>
          <input 
            id="source"
            placeholder="Type a station name" 
            value={source} 
            onChange={e => handleStationInputChange(e.target.value, 'source')}
            autoComplete="off"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
          />
          {sourceSuggestions.length > 0 && (
            <div className="absolute top-full left-0 w-full bg-white border border-gray-300 rounded-b-lg shadow-lg z-30">
              {sourceSuggestions.map(s => (
                <div key={s.station_name} onClick={() => handleSuggestionClick(s.station_name, 'source')} className="px-4 py-2 cursor-pointer hover:bg-indigo-50">
                  {s.station_name}
                </div>
              ))}
            </div>
          )}
        </div>
        
        <div className="col-span-12 lg:col-span-3 relative">
          <label htmlFor="destination" className="block text-sm font-medium text-gray-700 mb-1">To</label>
          <input 
            id="destination"
            placeholder="Type a station name" 
            value={destination} 
            onChange={e => handleStationInputChange(e.target.value, 'destination')} 
            autoComplete="off"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
          />
          {destinationSuggestions.length > 0 && (
            <div className="absolute top-full left-0 w-full bg-white border border-gray-300 rounded-b-lg shadow-lg z-30">
              {destinationSuggestions.map(s => (
                <div key={s.station_name} onClick={() => handleSuggestionClick(s.station_name, 'destination')} className="px-4 py-2 cursor-pointer hover:bg-indigo-50">
                  {s.station_name}
                </div>
              ))}
            </div>
          )}
        </div>
        
        <div className="col-span-12 lg:col-span-2">
            <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-1">Date</label>
            <input 
              id="date"
              type="date" 
              value={date} 
              onChange={e => setDate(e.target.value)}
              min={today}
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
            <button type="submit" disabled={loading} className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-6 rounded-lg transition duration-300 disabled:opacity-50">
              {loading ? '...' : 'Search'}
            </button>
        </div>

      </form>
    </div>
  );
}

export default SearchForm;