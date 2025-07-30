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
  const [showSourceSuggestions, setShowSourceSuggestions] = useState(false);
  const [showDestinationSuggestions, setShowDestinationSuggestions] = useState(false);

  const searchTimeout = useRef(null);
  const sourceRef = useRef(null);
  const destinationRef = useRef(null);

  const today = new Date().toISOString().split('T')[0];

  useEffect(() => {
    const fetchClasses = async () => {
      try {
        const data = await getClasses();
        if (data && data.length > 0) {
          setClasses(data);
          setSelectedClass(data[0].class_type);
        }
      } catch (error) {
        console.error('Failed to fetch classes:', error);
      }
    };
    fetchClasses();
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (sourceRef.current && !sourceRef.current.contains(event.target)) {
        setShowSourceSuggestions(false);
      }
      if (destinationRef.current && !destinationRef.current.contains(event.target)) {
        setShowDestinationSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  useEffect(() => {
    return () => {
      if (searchTimeout.current) {
        clearTimeout(searchTimeout.current);
      }
    };
  }, []);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (date < today) {
      alert("Please select a valid date (today or future)");
      return;
    }
    if (!source.trim() || !destination.trim() || !date || !selectedClass) {
      alert("Please fill in all search fields.");
      return;
    }
    if (source.trim().toLowerCase() === destination.trim().toLowerCase()) {
      alert("Source and destination cannot be the same.");
      return;
    }

    setLoading(true);
    try {
      const schedules = await searchSchedules(source.trim(), destination.trim(), date, selectedClass);
      onResults(schedules);
    } catch (error) {
      console.error('Search error:', error);
      alert("Failed to fetch search results. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleStationInputChange = async (value, type) => {
    if (type === 'source') setSource(value);
    else setDestination(value);

    if (searchTimeout.current) clearTimeout(searchTimeout.current);

    if (value.length <= 1) {
      if (type === 'source') {
        setSourceSuggestions([]);
        setShowSourceSuggestions(false);
      } else {
        setDestinationSuggestions([]);
        setShowDestinationSuggestions(false);
      }
      return;
    }

    searchTimeout.current = setTimeout(async () => {
      try {
        const results = await searchStations(value.trim());
        if (type === 'source') {
          setSourceSuggestions(results || []);
          setShowSourceSuggestions(true);
        } else {
          setDestinationSuggestions(results || []);
          setShowDestinationSuggestions(true);
        }
      } catch (error) {
        if (type === 'source') {
          setSourceSuggestions([]);
          setShowSourceSuggestions(false);
        } else {
          setDestinationSuggestions([]);
          setShowDestinationSuggestions(false);
        }
      }
    }, 300);
  };

  const handleSuggestionClick = (stationName, type) => {
    if (type === 'source') {
      setSource(stationName);
      setSourceSuggestions([]);
      setShowSourceSuggestions(false);
    } else {
      setDestination(stationName);
      setDestinationSuggestions([]);
      setShowDestinationSuggestions(false);
    }
  };

  const handleInputFocus = (type) => {
    if (type === 'source' && sourceSuggestions.length > 0) setShowSourceSuggestions(true);
    else if (type === 'destination' && destinationSuggestions.length > 0) setShowDestinationSuggestions(true);
  };

  const handleKeyDown = (e, type) => {
    if (e.key === 'Escape') {
      if (type === 'source') setShowSourceSuggestions(false);
      else setShowDestinationSuggestions(false);
    }
  };

  return (
    <form onSubmit={handleSearch} className="grid grid-cols-12 gap-6 items-start">

        <div className="col-span-12 lg:col-span-3 relative" ref={sourceRef}>
          <label htmlFor="source" className="block text-sm font-semibold text-gray-800 mb-3 flex items-center">
            <span className="mr-2 text-lg">🚉</span>From
          </label>
          <div className="relative">
            <input
              id="source"
              placeholder="Type a station name"
              value={source}
              onChange={e => handleStationInputChange(e.target.value, 'source')}
              onFocus={() => handleInputFocus('source')}
              onKeyDown={e => handleKeyDown(e, 'source')}
              autoComplete="off"
              className="w-full px-4 py-4 text-gray-900 placeholder-gray-500 bg-white/80 backdrop-blur-sm border-2 border-gray-200 rounded-xl focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 transition-all duration-300 text-lg"
            />
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
              <div className="w-2 h-2 bg-indigo-500 rounded-full animate-pulse"></div>
            </div>
          </div>
          {showSourceSuggestions && sourceSuggestions.length > 0 && (
            <div className="absolute top-full left-0 w-full bg-white border border-gray-300 rounded-b-lg shadow-lg z-30 max-h-48 overflow-y-auto min-w-[200px]">
              {sourceSuggestions.map((s, index) => (
                <div
                  key={s.station_name || index}
                  onClick={() => handleSuggestionClick(s.station_name, 'source')}
                  className="px-4 py-2 cursor-pointer hover:bg-indigo-50 text-gray-900 border-b border-gray-100 last:border-b-0"
                >
                  {s.station_name}
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="col-span-12 lg:col-span-3 relative" ref={destinationRef}>
          <label htmlFor="destination" className="block text-sm font-semibold text-gray-800 mb-3 flex items-center">
            <span className="mr-2 text-lg">🎯</span>To
          </label>
          <div className="relative">
            <input
              id="destination"
              placeholder="Type a station name"
              value={destination}
              onChange={e => handleStationInputChange(e.target.value, 'destination')}
              onFocus={() => handleInputFocus('destination')}
              onKeyDown={e => handleKeyDown(e, 'destination')}
              autoComplete="off"
              className="w-full px-4 py-4 text-gray-900 placeholder-gray-500 bg-white/80 backdrop-blur-sm border-2 border-gray-200 rounded-xl focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 transition-all duration-300 text-lg"
            />
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
              <div className="w-2 h-2 bg-indigo-500 rounded-full animate-pulse"></div>
            </div>
          </div>
          {showDestinationSuggestions && destinationSuggestions.length > 0 && (
            <div className="absolute top-full left-0 w-full bg-white border border-gray-300 rounded-b-lg shadow-lg z-30 max-h-48 overflow-y-auto min-w-[200px]">
              {destinationSuggestions.map((s, index) => (
                <div
                  key={s.station_name || index}
                  onClick={() => handleSuggestionClick(s.station_name, 'destination')}
                  className="px-4 py-2 cursor-pointer hover:bg-indigo-50 text-gray-900 border-b border-gray-100 last:border-b-0"
                >
                  {s.station_name}
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="col-span-12 lg:col-span-2">
          <label htmlFor="date" className="block text-sm font-semibold text-gray-800 mb-3 flex items-center">
            <span className="mr-2 text-lg">📅</span>Date
          </label>
          <div className="relative">
            <input
              id="date"
              type="date"
              value={date}
              onChange={e => setDate(e.target.value)}
              min={today}
              className="w-full px-4 py-4 text-gray-900 bg-white/80 backdrop-blur-sm border-2 border-gray-200 rounded-xl focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 transition-all duration-300 text-lg"
            />
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
              <div className="w-2 h-2 bg-indigo-500 rounded-full animate-pulse"></div>
            </div>
          </div>
        </div>

        <div className="col-span-12 lg:col-span-2">
          <label htmlFor="class-type" className="block text-sm font-semibold text-gray-800 mb-3 flex items-center">
            <span className="mr-2 text-lg">🎫</span>Class
          </label>
          <div className="relative">
            <select
              id="class-type"
              value={selectedClass}
              onChange={e => setSelectedClass(e.target.value)}
              className="w-full px-4 py-4 text-gray-900 bg-white/80 backdrop-blur-sm border-2 border-gray-200 rounded-xl focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 transition-all duration-300 text-lg appearance-none"
            >
              {classes.length === 0 && <option>Loading...</option>}
              {classes.map(c => (
                <option key={c.class_type} value={c.class_type}>
                  {c.class_type}
                </option>
              ))}
            </select>
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
              <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>
        </div>

        <div className="col-span-12 lg:col-span-2 mt-[30px] lg:mt-0">
          <label className="block text-sm font-semibold text-gray-800 mb-3">&nbsp;</label>
          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 px-6 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-bold rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
          >
            {loading ? (
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                Searching...
              </div>
            ) : (
              <span className="flex items-center justify-center text-lg">
                <span className="mr-2">🔍</span>
                Search Trains
              </span>
            )}
          </button>
        </div>

      </form>
  );
}

export default SearchForm;
