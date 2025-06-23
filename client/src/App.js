// src/App.js (Enhanced modern website UI with integrated MyTickets)
import React, { useState, useEffect } from "react";
import "./App.css";
import TrainList from "./components/TrainList";
import Login from "./components/Login";
import MyTickets from "./components/MyTickets";
import { getSeats, buyTicket } from "./api/api";

function App() {
  const [passengerId, setPassengerId] = useState(null);
  const [selectedSchedule, setSelectedSchedule] = useState(null);
  const [seats, setSeats] = useState([]);
  const [selectedSeat, setSelectedSeat] = useState(null);
  const [message, setMessage] = useState("");
  const [currentView, setCurrentView] = useState("search");
  const [loading, setLoading] = useState(false);

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
    setLoading(true);
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
      setLoading(false);
    }
  };

  const handleLogout = () => {
    setPassengerId(null);
    setSelectedSchedule(null);
    setSeats([]);
    setSelectedSeat(null);
    setCurrentView("search");
    setMessage("");
  };

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
          <section className="login-section">
            <div className="login-container">
              <div className="login-card">
                <div className="login-header">
                  <h2>Welcome Back</h2>
                  <p>Please enter your passenger ID to continue</p>
                </div>
                <Login onLogin={setPassengerId} />
              </div>

              <div className="info-cards">
                <div className="info-card">
                  <div className="info-icon">🎫</div>
                  <h3>Easy Booking</h3>
                  <p>Book your train tickets in just a few clicks with our streamlined process</p>
                </div>
                <div className="info-card">
                  <div className="info-icon">🔒</div>
                  <h3>Secure & Safe</h3>
                  <p>Your data and payments are protected with industry-standard security</p>
                </div>
                <div className="info-card">
                  <div className="info-icon">📞</div>
                  <h3>24/7 Support</h3>
                  <p>Our customer service team is always ready to help you with any questions</p>
                </div>
              </div>
            </div>
          </section>
        </main>

        <footer className="footer">
          <div className="footer-content">
            <div className="footer-section">
              <h4>Railway Booking</h4>
              <p>Your trusted partner for train travel across the country</p>
            </div>
            <div className="footer-section">
              <h4>Quick Links</h4>
              <p>Book Tickets • Cancel Tickets • Customer Support • Terms & Conditions</p>
            </div>
            <div className="footer-section">
              <h4>Contact Us</h4>
              <p>📞 01577088591<br/>✉️ support@railway.com<br/>🏢 Buet Cse Software company limited</p>
            </div>
          </div>
          <div className="footer-bottom">
            <p>&copy; 2025 Railway Booking System. All rights reserved.</p>
          </div>
        </footer>
      </div>
    );
  }

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
            <section className="search-section">
              <div className="section-header">
                <h2>Find Your Perfect Journey</h2>
                <p>Search and book train tickets for your next adventure</p>
              </div>
              <TrainList onSelectSchedule={setSelectedSchedule} />
              {selectedSchedule && (
                <div className="booking-section">
                  <div className="journey-info">
                    <h3>Selected Journey</h3>
                    <div className="journey-card">
                      <div className="journey-details">
                        <p><strong>Date:</strong> {new Date(selectedSchedule.departure_date).toLocaleDateString()}</p>
                        <p><strong>Route:</strong> {selectedSchedule.route || 'Express Service'}</p>
                        <p><strong>Departure:</strong> {selectedSchedule.departure_time || 'TBD'}</p>
                      </div>
                    </div>
                  </div>
                  <div className="seat-selection">
                    <h3>Choose Your Seat</h3>
                    {loading ? (
                      <div className="loading">Loading seats...</div>
                    ) : (
                      <>
                        <div className="seats-grid">
                          {seats.map(seat => (
                            <div 
                              key={seat.seat_number} 
                              className={`seat-item ${seat.is_available ? 'available' : 'occupied'} ${selectedSeat?.seat_number === seat.seat_number ? 'selected' : ''}`}
                            >
                              <div className="seat-number">{seat.seat_number}</div>
                              <div className={`seat-status ${seat.is_available ? 'available' : 'occupied'}`}>
                                {seat.is_available ? 'Available' : 'Occupied'}
                              </div>
                              {seat.is_available && (
                                <button
                                  className="select-seat-btn"
                                  onClick={() => setSelectedSeat(seat)}
                                  disabled={loading}
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
                              <p><strong>Seat:</strong> {selectedSeat.seat_number}</p>
                              <p><strong>Price:</strong> ${selectedSeat.price}</p>
                            </div>
                            <button 
                              className="purchase-btn" 
                              onClick={handleBuy}
                              disabled={loading}
                            >
                              {loading ? 'Processing...' : '💳 Purchase Ticket'}
                            </button>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                </div>
              )}
            </section>
          )}

          {currentView === 'tickets' && (
            <section className="tickets-section">
              <div className="section-header">
                <h2>My Tickets</h2>
                <p>Manage your booked train tickets</p>
              </div>
              <MyTickets passengerId={passengerId} />
            </section>
          )}
        </div>
      </main>

      <footer className="footer">
        <div className="footer-content">
          <div className="footer-section">
            <h4>Railway Booking</h4>
            <p>Your trusted partner for train travel</p>
          </div>
          <div className="footer-section">
            <h4>Quick Links</h4>
            <p>Book Tickets • Cancel Tickets • Customer Support</p>
          </div>
          <div className="footer-section">
            <h4>Contact</h4>
            <p>📞 1-800-RAILWAY • ✉️ support@railway.com</p>
          </div>
        </div>
        <div className="footer-bottom">
          <p>&copy; 2025 Railway Booking System. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}

export default App;
