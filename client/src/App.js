import React, { useState, useEffect } from "react";
import "./App.css";
import SearchForm from "./components/SearchForm";
import ScheduleList from "./components/ScheduleList";
import Login from "./components/Login";
import MyTickets from "./components/MyTickets";
import AdminDashboard from "./components/AdminDashboard";
import Footer from "./components/Footer";
import { getSeats, buyTicket } from "./api/api";

function App() {
  const [passenger, setPassenger] = useState(null);
  const [adminUser, setAdminUser] = useState(null);
  const [schedules, setSchedules] = useState([]);
  const [selectedSchedule, setSelectedSchedule] = useState(null);
  const [seats, setSeats] = useState({}); 
  const [selectedSeat, setSelectedSeat] = useState(null);
  const [message, setMessage] = useState("");
  const [currentView, setCurrentView] = useState("search");
  const [loading, setLoading] = useState(false);
  const [bookingLoading, setBookingLoading] = useState(false);

  useEffect(() => {
    if (selectedSchedule) {
      setLoading(true);
      setSeats({});
      getSeats(selectedSchedule.schedule_id)
        .then(seatsData => {
            const groupedSeats = seatsData.reduce((acc, seat) => {
                const row = seat.row_number;
                if (!acc[row]) { acc[row] = []; }
                acc[row].push(seat);
                acc[row].sort((a, b) => a.column_number - b.column_number);
                return acc;
            }, {});
            setSeats(groupedSeats);
        })
        .finally(() => setLoading(false));
    }
  }, [selectedSchedule]);

  const handleBuy = async () => {
    if (!selectedSeat) return;
    setBookingLoading(true);
    const ticketData = {
      schedule_id: selectedSchedule.schedule_id,
      seat_number: selectedSeat.seat_number,
      passenger_id: passenger.passenger_id,
    };
    try {
      await buyTicket(ticketData);
      setMessage("🎉 Ticket purchased successfully!");
      const updatedSeats = { ...seats };
      const seatToUpdate = updatedSeats[selectedSeat.row_number].find(s => s.seat_number === selectedSeat.seat_number);
      if(seatToUpdate) {
        seatToUpdate.is_available = false;
        seatToUpdate.status = 'Booked';
      }
      setSeats(updatedSeats);
      setSelectedSeat(null);
      setTimeout(() => setMessage(""), 3000);
    } catch (error) {
      setMessage("❌ Failed to purchase ticket. Please try again.");
    } finally {
      setBookingLoading(false);
    }
  };

  const handleLogout = () => {
    setPassenger(null);
    setAdminUser(null);
    setSelectedSchedule(null);
    setSchedules([]);
    setSeats({});
    setSelectedSeat(null);
    setCurrentView("search");
    setMessage("");
  };

  const handleSearchResults = (results) => {
    setSchedules(results);
    setSelectedSchedule(null);
  };

  const handleViewChange = (view) => {
    if (view === 'search') {
      setSelectedSchedule(null);
    }
    setCurrentView(view);
  };

  // Helper function to render a single seat
  const renderSeat = (seat) => {
    // If a seat is missing from the data, render a blank placeholder to maintain symmetry.
    if (!seat) {
      return <div className="h-24" />;
    }

    const isOccupied = !seat.is_available;
    const isPending = isOccupied && seat.status === 'Pending Cancellation';
    const isSelected = selectedSeat?.seat_number === seat.seat_number;

    const seatClasses = `p-2 border-2 rounded-lg text-center cursor-pointer transition h-24 flex flex-col justify-center items-center relative overflow-hidden ${isSelected ? 'seat-selected-pop' : ''} ${isPending ? 'bg-gray-200 border-gray-400 text-gray-500 cursor-not-allowed' : isOccupied ? 'bg-red-100 border-red-300 text-red-500 cursor-not-allowed' : isSelected ? 'bg-indigo-600 border-indigo-700 text-white font-bold ring-4 ring-indigo-300' : 'bg-green-100 border-green-300 hover:bg-green-200 hover:border-green-400'}`;
    
    // Darkened the shade by increasing opacity from /20 to /30
    const shadeClass = isOccupied ? 'bg-red-500/30' : 'bg-green-500/30';

    return (
      <div key={seat.seat_number} className={seatClasses} onClick={() => !isOccupied && !isPending && setSelectedSeat(seat)}>
        <div className="font-bold text-lg">{seat.seat_number}</div>
        <div className="text-xs">{seat.class_type}</div>
        <div className={`text-xs mt-1 font-semibold ${isOccupied ? '' : 'text-green-700'}`}>
          {isPending ? 'Pending' : isOccupied ? 'Occupied' : `$${seat.price}`}
        </div>
        <div className={`absolute bottom-0 left-0 right-0 h-1/3 ${shadeClass}`}></div>
      </div>
    );
  };

  if (!passenger && !adminUser) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <Login onLogin={setPassenger} onAdminLogin={setAdminUser} />
        <Footer />
      </div>
    );
  }

  if (adminUser) {
    return (
      <div className="min-h-screen bg-gray-100 flex flex-col">
        <header className="bg-white/80 backdrop-blur-md shadow-sm sticky top-0 z-40">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <div className="flex-shrink-0 font-bold text-xl text-purple-600">👑 Admin Panel</div>
              <div className="flex items-center space-x-2 pl-4">
                <span className="text-sm font-medium text-gray-700">👤 Admin: {adminUser.username}</span>
                <button onClick={handleLogout} className="px-3 py-2 rounded-md text-sm font-medium text-red-600 hover:bg-red-50">Logout</button>
              </div>
            </div>
          </div>
        </header>
        <main className="flex-grow">
          <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
            <AdminDashboard adminUser={adminUser} />
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="App">
      <header className="bg-white/80 backdrop-blur-md shadow-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex-shrink-0 font-bold text-xl text-indigo-600">🚆 Bangladesh Railway</div>
            <nav className="hidden md:flex items-center space-x-4">
              <button onClick={() => handleViewChange('search')} className={`px-3 py-2 rounded-md text-sm font-medium ${currentView === 'search' ? 'bg-indigo-100 text-indigo-700' : 'text-gray-500 hover:bg-gray-100'}`}>🔍 Book Ticket</button>
              <button onClick={() => handleViewChange('tickets')} className={`px-3 py-2 rounded-md text-sm font-medium ${currentView === 'tickets' ? 'bg-indigo-100 text-indigo-700' : 'text-gray-500 hover:bg-gray-100'}`}>🎫 My Tickets</button>
              <div className="flex items-center space-x-2 pl-4">
                <span className="text-sm font-medium text-gray-700">👤 {passenger.name} (#{passenger.passenger_id})</span>
                <button onClick={handleLogout} className="px-3 py-2 rounded-md text-sm font-medium text-red-600 hover:bg-red-50">Logout</button>
              </div>
            </nav>
          </div>
        </div>
      </header>

      {message && message.text && (
        <div className={`p-4 fixed top-20 right-8 z-50 rounded-md shadow-lg ${message.type === 'success' ? 'bg-green-100 border-l-4 border-green-500 text-green-700' : 'bg-red-100 border-l-4 border-red-500 text-red-700'}`} role="alert">
          <p>{message.text}</p>
        </div>
      )}

      <main className="flex-grow">
        {currentView === 'search' && (
          <>
            <div className="hero-section">
              <div className="hero-content"><h1>Find Your Next Journey</h1><p>Search, select, and book in seconds.</p></div>
            </div>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <SearchForm onResults={handleSearchResults} />
              <div className="mt-4"><h2 className="text-3xl font-bold text-gray-800 mb-6">Available Journeys</h2><ScheduleList schedules={schedules} onSelectSchedule={setSelectedSchedule} /></div>
            </div>

            {selectedSchedule && (
              <div className="mt-12 bg-white rounded-xl shadow-lg p-8 max-w-7xl mx-auto">
                <h3 className="text-2xl font-bold text-center text-gray-800 mb-6">Choose Your Seat for {selectedSchedule.train_name}</h3>
                {loading ? <div className="text-center text-gray-500">Loading seats...</div> : (
                  <>
                    <div className="space-y-4 max-w-5xl mx-auto">
                      {Object.keys(seats).sort((a,b) => parseInt(a) - parseInt(b)).map(rowNumber => {
                        
                        // --- SYMMETRY FIX: Create a full 4-element array with placeholders ---
                        const fullRow = Array(4).fill(null);
                        seats[rowNumber].forEach(seat => {
                          if(seat.column_number >= 1 && seat.column_number <= 4) {
                            fullRow[seat.column_number - 1] = seat;
                          }
                        });

                        return (
                          <div key={rowNumber} className="flex justify-center">
                            <div className="flex flex-1 justify-center gap-x-12 sm:gap-x-24 max-w-2xl">
                              <div className="grid grid-cols-2 gap-4">
                                {fullRow.slice(0, 2).map((seat, index) => renderSeat(seat))}
                              </div>
                              <div className="grid grid-cols-2 gap-4">
                                {fullRow.slice(2, 4).map((seat, index) => renderSeat(seat))}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {selectedSeat && (
                      <div className="mt-8 max-w-md mx-auto bg-gray-50 p-6 rounded-lg shadow-inner text-center">
                        <h4 className="text-xl font-bold mb-4">Booking Summary</h4>
                        <p><strong>Seat:</strong> {selectedSeat.seat_number} (Row: {selectedSeat.row_number}, Col: {selectedSeat.column_number})</p>
                        <p className="font-bold text-lg my-2"><strong>Price:</strong> ${selectedSeat.price}</p>
                        <button className="w-full mt-4 bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-6 rounded-lg" onClick={handleBuy} disabled={bookingLoading}>
                          {bookingLoading ? 'Processing...' : '💳 Purchase Ticket'}
                        </button>
                      </div>
                    )}
                  </>
                )}
              </div>
            )}
          </>
        )}

        {currentView === 'tickets' && (
          <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
            <MyTickets passengerId={passenger.passenger_id} />
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}

export default App;
