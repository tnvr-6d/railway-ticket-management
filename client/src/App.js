// src/App.js (Restored Homepage and Added Footer)
import React, { useState, useEffect } from "react";
import "./App.css";
import SearchForm from "./components/SearchForm";
import ScheduleList from "./components/ScheduleList";
import Login from "./components/Login";
import MyTickets from "./components/MyTickets";
import Footer from "./components/Footer"; // <-- Import new Footer component
import { getSeats, buyTicket } from "./api/api";

function App() {
  const [passengerId, setPassengerId] = useState(null);
  const [schedules, setSchedules] = useState([]);
  const [selectedSchedule, setSelectedSchedule] = useState(null);
  const [seats, setSeats] = useState([]);
  const [selectedSeat, setSelectedSeat] = useState(null);
  const [message, setMessage] = useState("");
  const [currentView, setCurrentView] = useState("search");
  const [loading, setLoading] = useState(false);
  const [bookingLoading, setBookingLoading] = useState(false);

  useEffect(() => {
    if (selectedSchedule) {
      setLoading(true);
      getSeats(selectedSchedule.schedule_id)
        .then(setSeats)
        .finally(() => setLoading(false));
    }
  }, [selectedSchedule]);

  const handleBuy = async () => {
    if (!selectedSeat) return;
    setBookingLoading(true);
    const ticketData = {
      schedule_id: selectedSchedule.schedule_id,
      seat_number: selectedSeat.seat_number,
      passenger_id: passengerId,
      payment_method: "Cash",
    };

    try {
      await buyTicket(ticketData);
      setMessage("🎉 Ticket purchased successfully!");
      setSeats(seats.map(s =>
        s.seat_number === selectedSeat.seat_number ? { ...s, is_available: false } : s
      ));
      setSelectedSeat(null);
      setTimeout(() => setMessage(""), 3000);
    } catch (error) {
      setMessage("❌ Failed to purchase ticket. Please try again.");
    } finally {
      setBookingLoading(false);
    }
  };

  const handleLogout = () => {
    setPassengerId(null);
    setSelectedSchedule(null);
    setSchedules([]);
    setSeats([]);
    setSelectedSeat(null);
    setCurrentView("search");
    setMessage("");
  };
  
  const handleSearchResults = (results) => {
    setSchedules(results);
    setSelectedSchedule(null);
  };

  // Pre-Login View (Homepage)
  if (!passengerId) {
    return (
        <div className="App">
            <header className="hero-section">
              <div className="hero-content">
                <h1 className="hero-title">Railway Ticket System</h1>
                <p className="hero-subtitle">Book your train tickets with ease and comfort</p>
                <div className="hero-features">
                  <div className="feature-item">
                    <span className="feature-icon">🚄</span>
                    <span>Fast Booking</span>
                  </div>
                  <div className="feature-item">
                    <span className="feature-icon">💳</span>
                    <span>Secure Payment</span>
                  </div>
                  <div className="feature-item">
                    <span className="feature-icon">📱</span>
                    <span>Mobile Friendly</span>
                  </div>
                </div>
              </div>
            </header>
    
            <main className="main-content">
              <Login onLogin={setPassengerId} />
            </main>
            
            <Footer />
        </div>
    );
  }

  // Logged-in View
  return (
    <div className="App">
      <header className="navbar">
        <div className="nav-container">
          <div className="nav-brand">
            <h1>🚆 Bangladesh Railway</h1>
          </div>
          <nav className="nav-menu">
            <button className={`nav-item ${currentView === 'search' ? 'active' : ''}`} onClick={() => setCurrentView('search')}>
              🔍 Book Ticket
            </button>
            <button className={`nav-item ${currentView === 'tickets' ? 'active' : ''}`} onClick={() => setCurrentView('tickets')}>
              🎫 My Tickets
            </button>
            <div className="nav-user">
              <span className="user-info">👤 Passenger #{passengerId}</span>
              <button className="logout-btn" onClick={handleLogout}>Logout</button>
            </div>
          </nav>
        </div>
      </header>

      {message && (
        <div className="alert-message">
          <span>{message}</span>
          <button className="alert-close" onClick={() => setMessage("")}>×</button>
        </div>
      )}

      <main className="main-content">
        <div className="content-container">
          {currentView === 'search' && (
            <>
                <div className="search-card-container">
                    <div className="search-card-header">
                      <h2>Find Your Perfect Journey</h2>
                      <p>Search for trains by source, destination, and date.</p>
                    </div>
                    <SearchForm onResults={handleSearchResults} />
                </div>
              
                <div className="section-header">
                    <h2>Available Journeys</h2>
                </div>
                <ScheduleList schedules={schedules} onSelectSchedule={setSelectedSchedule} />

              {selectedSchedule && (
                <div className="booking-section">
                  <div className="seat-selection">
                    <h3>Choose Your Seat for {selectedSchedule.train_name}</h3>
                    {loading ? (
                      <div className="loading">Loading seats...</div>
                    ) : (
                      <>
                        <div className="seats-grid">
                          {seats.map(seat => (
                            <div 
                              key={seat.seat_number} 
                              className={`seat-item ${!seat.is_available ? 'occupied' : selectedSeat?.seat_number === seat.seat_number ? 'selected' : 'available'}`}
                            >
                              <div className="seat-number">{seat.seat_number}</div>
                               <div className="seat-info-small">{seat.class_type}</div>
                              <div className={`seat-status ${seat.is_available ? 'available' : 'occupied'}`}>
                                {seat.is_available ? `$${seat.price}` : 'Occupied'}
                              </div>
                              {seat.is_available && (
                                <button
                                  className="select-seat-btn"
                                  onClick={() => setSelectedSeat(seat)}
                                  disabled={bookingLoading}
                                >
                                  {selectedSeat?.seat_number === seat.seat_number ? 'Selected' : 'Select'}
                                </button>
                              )}
                            </div>
                          ))}
                        </div>
                        {selectedSeat && (
                          <div className="purchase-section">
                            <div className="purchase-summary">
                              <h4>Booking Summary</h4>
                              <p><strong>Route:</strong> {selectedSchedule.source} → {selectedSchedule.destination}</p>
                              <p><strong>Seat:</strong> {selectedSeat.seat_number} ({selectedSeat.class_type})</p>
                              <p><strong>Price:</strong> ${selectedSeat.price}</p>
                            </div>
                            <button 
                              className="purchase-btn" 
                              onClick={handleBuy}
                              disabled={bookingLoading}
                            >
                              {bookingLoading ? 'Processing...' : '💳 Purchase Ticket'}
                            </button>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                </div>
              )}
            </>
          )}

          {currentView === 'tickets' && (
            <section className="tickets-section">
              <MyTickets passengerId={passengerId} />
            </section>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}

export default App;

/*// src/App.js (Enhanced with Search Feature)
import React, { useState, useEffect } from "react";
import "./App.css";
import SearchForm from "./components/SearchForm";
import ScheduleList from "./components/ScheduleList"; // <-- Import new component
import Login from "./components/Login";
import MyTickets from "./components/MyTickets";
import { getSeats, buyTicket } from "./api/api";

function App() {
  const [passengerId, setPassengerId] = useState(null);
  const [schedules, setSchedules] = useState([]); // <-- State to hold search results
  const [selectedSchedule, setSelectedSchedule] = useState(null);
  const [seats, setSeats] = useState([]);
  const [selectedSeat, setSelectedSeat] = useState(null);
  const [message, setMessage] = useState("");
  const [currentView, setCurrentView] = useState("search");
  const [loading, setLoading] = useState(false);
  const [bookingLoading, setBookingLoading] = useState(false);

  useEffect(() => {
    if (selectedSchedule) {
      setLoading(true);
      getSeats(selectedSchedule.schedule_id)
        .then(setSeats)
        .finally(() => setLoading(false));
    }
  }, [selectedSchedule]);

  const handleBuy = async () => {
    if (!selectedSeat) return;
    setBookingLoading(true);
    const ticketData = {
      schedule_id: selectedSchedule.schedule_id,
      seat_number: selectedSeat.seat_number,
      passenger_id: passengerId,
      payment_method: "Cash",
    };

    try {
      await buyTicket(ticketData);
      setMessage("🎉 Ticket purchased successfully!");
      setSeats(seats.map(s =>
        s.seat_number === selectedSeat.seat_number ? { ...s, is_available: false } : s
      ));
      setSelectedSeat(null);
      setTimeout(() => setMessage(""), 3000);
    } catch (error) {
      setMessage("❌ Failed to purchase ticket. Please try again.");
    } finally {
      setBookingLoading(false);
    }
  };

  const handleLogout = () => {
    setPassengerId(null);
    setSelectedSchedule(null);
    setSchedules([]);
    setSeats([]);
    setSelectedSeat(null);
    setCurrentView("search");
    setMessage("");
  };
  
  const handleSearchResults = (results) => {
    setSchedules(results);
    setSelectedSchedule(null); // Clear previous selections
  };

  // Login View
  if (!passengerId) {
    return (
        <div className="App">
            <header className="hero-section">
                <div className="hero-content">
                    <h1 className="hero-title">Railway Ticket System</h1>
                    <p className="hero-subtitle">Book your train tickets with ease and comfort</p>
                </div>
            </header>
            <main className="main-content">
                <Login onLogin={setPassengerId} />
            </main>
        </div>
    );
  }

  // Logged-in View
  return (
    <div className="App">
      <header className="navbar">
        <div className="nav-container">
          <div className="nav-brand">
            <h1>🚆 Bangladesh Railway</h1>
          </div>
          <nav className="nav-menu">
            <button className={`nav-item ${currentView === 'search' ? 'active' : ''}`} onClick={() => setCurrentView('search')}>
              🔍 Book Ticket
            </button>
            <button className={`nav-item ${currentView === 'tickets' ? 'active' : ''}`} onClick={() => setCurrentView('tickets')}>
              🎫 My Tickets
            </button>
            <div className="nav-user">
              <span className="user-info">👤 Passenger #{passengerId}</span>
              <button className="logout-btn" onClick={handleLogout}>Logout</button>
            </div>
          </nav>
        </div>
      </header>

      {message && (
        <div className="alert-message">
          <span>{message}</span>
          <button className="alert-close" onClick={() => setMessage("")}>×</button>
        </div>
      )}

      <main className="main-content">
        <div className="content-container">
          {currentView === 'search' && (
            <>
              <div className="home-search-container">
                  <div className="train-animation-placeholder">
                      <h2>Your Journey Begins Here</h2>
                      <p>Reliable, safe, and comfortable travel across Bangladesh.</p>
                      <div className="train-icon-animation">🚆</div>
                  </div>
                  <div className="search-form-wrapper">
                      <h3>Select Your Source, Destination and Date</h3>
                      <SearchForm onResults={handleSearchResults} />
                  </div>
              </div>
              
              <div className="section-header">
                  <h2>Available Journeys</h2>
              </div>
              <ScheduleList schedules={schedules} onSelectSchedule={setSelectedSchedule} />

              {selectedSchedule && (
                <div className="booking-section">
                  <div className="seat-selection">
                    <h3>Choose Your Seat for {selectedSchedule.train_name}</h3>
                    {loading ? (
                      <div className="loading">Loading seats...</div>
                    ) : (
                      <>
                        <div className="seats-grid">
                          {seats.map(seat => (
                            <div 
                              key={seat.seat_number} 
                              className={`seat-item ${!seat.is_available ? 'occupied' : selectedSeat?.seat_number === seat.seat_number ? 'selected' : 'available'}`}
                            >
                              <div className="seat-number">{seat.seat_number}</div>
                               <div className="seat-info-small">{seat.class_type}</div>
                              <div className={`seat-status ${seat.is_available ? 'available' : 'occupied'}`}>
                                {seat.is_available ? `$${seat.price}` : 'Occupied'}
                              </div>
                              {seat.is_available && (
                                <button
                                  className="select-seat-btn"
                                  onClick={() => setSelectedSeat(seat)}
                                  disabled={bookingLoading}
                                >
                                  {selectedSeat?.seat_number === seat.seat_number ? 'Selected' : 'Select'}
                                </button>
                              )}
                            </div>
                          ))}
                        </div>
                        {selectedSeat && (
                          <div className="purchase-section">
                            <div className="purchase-summary">
                              <h4>Booking Summary</h4>
                              <p><strong>Route:</strong> {selectedSchedule.source} → {selectedSchedule.destination}</p>
                              <p><strong>Seat:</strong> {selectedSeat.seat_number} ({selectedSeat.class_type})</p>
                              <p><strong>Price:</strong> ${selectedSeat.price}</p>
                            </div>
                            <button 
                              className="purchase-btn" 
                              onClick={handleBuy}
                              disabled={bookingLoading}
                            >
                              {bookingLoading ? 'Processing...' : '💳 Purchase Ticket'}
                            </button>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                </div>
              )}
            </>
          )}

          {currentView === 'tickets' && (
            <section className="tickets-section">
              <MyTickets passengerId={passengerId} />
            </section>
          )}
        </div>
      </main>
    </div>
  );
}

export default App;*/
