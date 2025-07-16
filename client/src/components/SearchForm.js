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
    <div className="glass p-8 rounded-3xl shadow-2xl mb-12 relative z-20 max-w-6xl mx-auto border border-gray-200/50 shadow-lg">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold gradient-text mb-2">Search Trains</h2>
        <p className="text-gray-600">Find your perfect journey</p>
      </div>
      <form onSubmit={handleSearch} className="grid grid-cols-12 gap-6 items-start">

        <div className="col-span-12 lg:col-span-3 relative" ref={sourceRef}>
          <label htmlFor="source" className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
            <span className="mr-2">🚉</span>From
          </label>
          <input
            id="source"
            placeholder="Type a station name"
            value={source}
            onChange={e => handleStationInputChange(e.target.value, 'source')}
            onFocus={() => handleInputFocus('source')}
            onKeyDown={e => handleKeyDown(e, 'source')}
            autoComplete="off"
            className="form-input w-full px-4 py-3 text-gray-900 placeholder-gray-500"
          />
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
          <label htmlFor="destination" className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
            <span className="mr-2">🎯</span>To
          </label>
          <input
            id="destination"
            placeholder="Type a station name"
            value={destination}
            onChange={e => handleStationInputChange(e.target.value, 'destination')}
            onFocus={() => handleInputFocus('destination')}
            onKeyDown={e => handleKeyDown(e, 'destination')}
            autoComplete="off"
            className="form-input w-full px-4 py-3 text-gray-900 placeholder-gray-500"
          />
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
          <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
            <span className="mr-2">📅</span>Date
          </label>
          <input
            id="date"
            type="date"
            value={date}
            onChange={e => setDate(e.target.value)}
            min={today}
            className="form-input w-full px-4 py-3 text-gray-900"
          />
        </div>

        <div className="col-span-12 lg:col-span-2">
          <label htmlFor="class-type" className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
            <span className="mr-2">🎫</span>Class
          </label>
          <select
            id="class-type"
            value={selectedClass}
            onChange={e => setSelectedClass(e.target.value)}
            className="form-input w-full px-4 py-3 text-gray-900"
          >
            {classes.length === 0 && <option>Loading...</option>}
            {classes.map(c => (
              <option key={c.class_type} value={c.class_type}>
                {c.class_type}
              </option>
            ))}
          </select>
        </div>

        <div className="col-span-12 lg:col-span-2 mt-[30px] lg:mt-0">
          <label className="block text-sm font-medium text-gray-700 mb-2">&nbsp;</label>
          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full py-3 px-6 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <div className="flex items-center justify-center">
                <div className="loading-spinner mr-2"></div>
                Searching...
              </div>
            ) : (
              <span className="flex items-center justify-center">
                🔍 Search Trains
              </span>
            )}
          </button>
        </div>

      </form>
    </div>
  );
}

export default SearchForm;
