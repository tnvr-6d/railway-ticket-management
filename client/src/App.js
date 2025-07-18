import React, { useState, useEffect } from "react";
import "./App.css";
import SearchForm from "./components/SearchForm";
import ScheduleList from "./components/ScheduleList";
import Login from "./components/Login";
import Signup from "./components/Signup";
import MyTickets from "./components/MyTickets";
import AdminDashboard from "./components/AdminDashboard";
import Footer from "./components/Footer";
import Contact from "./components/Contact";
import NotificationBell from "./components/NotificationBell";
import NotificationsPage from "./components/NotificationsPage";
import PassengerDashboard from "./components/PassengerDashboard";
import { getSeats, buyTicket, getPassengerById } from "./api/api";
import AdminProfileModal from "./components/AdminProfileModal";


function App() {
  const [passenger, setPassenger] = useState(null);
  const [adminUser, setAdminUser] = useState(null);
  const [schedules, setSchedules] = useState([]);
  const [selectedSchedule, setSelectedSchedule] = useState(null);
  const [seats, setSeats] = useState({});
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [message, setMessage] = useState("");
  const [currentView, setCurrentView] = useState("home");
  const [loading, setLoading] = useState(false);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [showSignup, setShowSignup] = useState(false);
  const [showPassengerDashboard, setShowPassengerDashboard] = useState(false);
  const [dashboardPassenger, setDashboardPassenger] = useState(null);
  const [showAdminDashboard, setShowAdminDashboard] = useState(false);

  useEffect(() => {
    if (selectedSchedule) {
      setLoading(true);
      setSeats({});
      getSeats(selectedSchedule.schedule_id)
        .then((seatsData) => {
          const groupedSeats = seatsData.reduce((acc, seat) => {
            const row = seat.row_number;
            if (!acc[row]) {
              acc[row] = [];
            }
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
    if (selectedSeats.length === 0) return;
    setBookingLoading(true);
    try {
      for (const seat of selectedSeats) {
        const ticketData = {
          schedule_id: selectedSchedule.schedule_id,
          seat_number: seat.seat_number,
          passenger_id: passenger.passenger_id,
        };
        await buyTicket(ticketData);
        // Update seats grid
        const updatedSeats = { ...seats };
        const seatToUpdate = updatedSeats[seat.row_number]?.find(
          (s) => s.seat_number === seat.seat_number
        );
        if (seatToUpdate) {
          seatToUpdate.is_available = false;
          seatToUpdate.status = "Booked";
        }
      }
      setMessage(`🎉 Ticket${selectedSeats.length > 1 ? 's' : ''} purchased successfully!`);
      setSchedules((prevSchedules) =>
        prevSchedules.map((sch) =>
          sch.schedule_id === selectedSchedule.schedule_id
            ? {
                ...sch,
                available_seats: Math.max(0, (sch.available_seats || selectedSeats.length) - selectedSeats.length),
              }
            : sch
        )
      );
      setSelectedSeats([]);
      setTimeout(() => setMessage(""), 3000);
    } catch (error) {
      setMessage("❌ Failed to purchase ticket(s). Please try again.");
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
    setSelectedSeats([]);
    setCurrentView("home");
    setMessage("");
  };

  const handleSearchResults = (results) => {
    setSchedules(results);
    setSelectedSchedule(null);
  };

  const handleViewChange = (view) => {
    if (view === "home") {
      setSelectedSchedule(null);
    }
    setCurrentView(view);
  };

  const handlePassengerSignup = (user) => {
    setPassenger(user);
    setShowSignup(false);
  };

  const handleOpenPassengerDashboard = async () => {
    if (!passenger) return;
    try {
      const data = await getPassengerById(passenger.passenger_id);
      setDashboardPassenger(data);
      setShowPassengerDashboard(true);
    } catch (err) {
      setMessage("Failed to load passenger details.");
      setTimeout(() => setMessage(""), 3000);
    }
  };
  const handleClosePassengerDashboard = () => {
    setShowPassengerDashboard(false);
    setDashboardPassenger(null);
  };

  const handleOpenAdminDashboard = () => {
    setShowAdminDashboard(true);
  };
  const handleCloseAdminDashboard = () => {
    setShowAdminDashboard(false);
  };

  // Helper function to render a single seat
  const renderSeat = (seat) => {
    if (!seat) {
      return <div className="h-36 w-28" />; // Larger placeholder
    }

    const isOccupied = !seat.is_available;
    const isPending = isOccupied && seat.status === "Pending Cancellation";
    const isSelected = selectedSeats.some(s => s.seat_number === seat.seat_number);

    const seatClasses = `seat p-4 border-2 rounded-xl text-center cursor-pointer transition h-36 w-28 flex flex-col justify-center items-center relative overflow-hidden shadow-lg text-lg font-semibold select-none ${
      isSelected ? "seat-selected-pop" : ""
    } ${
      isPending
        ? "bg-gray-200 border-gray-400 text-gray-500 cursor-not-allowed"
        : isOccupied
        ? "bg-red-100 border-red-300 text-red-500 cursor-not-allowed"
        : isSelected
        ? "bg-indigo-600 border-indigo-700 text-white font-bold ring-4 ring-indigo-300"
        : "bg-green-100 border-green-300 hover:bg-green-200 hover:border-green-400"
    }`;

    const shadeClass = isOccupied ? "bg-red-500/30" : "bg-green-500/30";

    return (
      <div
        key={seat.seat_number}
        className={seatClasses}
        onClick={() => {
          if (isOccupied || isPending) return;
          if (isSelected) {
            setSelectedSeats(selectedSeats.filter(s => s.seat_number !== seat.seat_number));
          } else if (selectedSeats.length < 5) {
            setSelectedSeats([...selectedSeats, seat]);
          } else {
            setMessage("Only 5 tickets can be purchased under one booking!");
            setTimeout(() => setMessage(""), 3000);
          }
        }}
      >
        <div className="font-bold text-xl mb-3 truncate w-full text-center">{seat.seat_number}</div>
        <div className="text-base mb-1">{seat.class_type}</div>
        <div
          className={`text-base mt-1 ${isOccupied ? "" : "text-green-700"}`}
        >
          {isPending ? "Pending" : isOccupied ? "Occupied" : `${seat.price}`}
        </div>
        <div
          className={`absolute bottom-0 left-0 right-0 h-1/3 ${shadeClass}`}
        ></div>
      </div>
    );
  };

  if (!passenger && !adminUser) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        {showSignup ? (
          <Signup onSignup={handlePassengerSignup} />
        ) : (
          <Login onLogin={setPassenger} onAdminLogin={setAdminUser} />
        )}
        <div className="text-center py-4">
          {showSignup ? (
            <p className="text-gray-600">
              Already have an account?{" "}
              <button
                onClick={() => setShowSignup(false)}
                className="text-indigo-600 hover:underline"
              >
                Login here
              </button>
            </p>
          ) : (
            <p className="text-gray-600">
              Don't have an account?{" "}
              <button
                onClick={() => setShowSignup(true)}
                className="text-indigo-600 hover:underline"
              >
                Sign up here
              </button>
            </p>
          )}
        </div>
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
              <div className="flex-shrink-0 font-bold text-xl text-purple-600">
                👑 Admin Panel
              </div>
              <div className="flex items-center space-x-2 pl-4">
              <span className="text-sm font-medium text-gray-700 cursor-pointer hover:underline" onClick={handleOpenAdminDashboard} title="View admin profile">
                  👤 Admin: {adminUser.username}
                </span>
                <button
                  onClick={handleLogout}
                  className="px-3 py-2 rounded-md text-sm font-medium text-red-600 hover:bg-red-50"
                >
                  Logout
                </button>
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
        {showAdminDashboard && (
          <AdminProfileModal admin={adminUser} onClose={handleCloseAdminDashboard} />
        )}
      </div>
    );
  }

  return (
    <div className="App">
      <header className="bg-white/95 backdrop-blur-md shadow-lg sticky top-0 z-40 border-b border-gray-200/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex-shrink-0 font-bold text-xl gradient-text">
              🚆 Bangladesh Railway
            </div>
            <nav className="hidden md:flex items-center space-x-4">
              <button
                onClick={() => handleViewChange("home")}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${
                  currentView === "home"
                    ? "bg-gradient-to-r from-indigo-500 to-purple-500 text-white shadow-lg"
                    : "text-gray-600 hover:text-indigo-600 hover:bg-indigo-50"
                }`}
              >
                🏠 Home
              </button>
              <button
                onClick={() => handleViewChange("tickets")}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${
                  currentView === "tickets"
                    ? "bg-gradient-to-r from-indigo-500 to-purple-500 text-white shadow-lg"
                    : "text-gray-600 hover:text-indigo-600 hover:bg-indigo-50"
                }`}
              >
                🎫 My Tickets
              </button>
              <button
                onClick={() => handleViewChange("contact")}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${
                  currentView === "contact"
                    ? "bg-gradient-to-r from-indigo-500 to-purple-500 text-white shadow-lg"
                    : "text-gray-600 hover:text-indigo-600 hover:bg-indigo-50"
                }`}
              >
                📞 Contact
              </button>
              <button
                onClick={() => handleViewChange("notifications")}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${
                  currentView === "notifications"
                    ? "bg-gradient-to-r from-indigo-500 to-purple-500 text-white shadow-lg"
                    : "text-gray-600 hover:text-indigo-600 hover:bg-indigo-50"
                }`}
              >
                🔔 Notifications
              </button>
              <div className="flex items-center space-x-3 pl-4">
                <NotificationBell passengerId={passenger.passenger_id} />
                <div className="flex items-center space-x-2 bg-gradient-to-r from-indigo-50 to-purple-50 px-4 py-2 rounded-lg">
                <span className="text-sm font-medium text-gray-700 cursor-pointer hover:underline" onClick={handleOpenPassengerDashboard} title="View profile">
                    👤 {passenger.name} (#{passenger.passenger_id})
                  </span>
                </div>
                <button
                  onClick={handleLogout}
                  className="px-4 py-2 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 hover:scale-105 transition-all duration-300"
                >
                  Logout
                </button>
              </div>
            </nav>
          </div>
        </div>
      </header>

      {/* Enhanced message display */}
      {message && (
        <div className="message success" role="alert">
          <p>{message}</p>
        </div>
      )}

      <main className="flex-grow">
        {currentView === "home" && (
          <>
            {/* Enhanced hero section */}
            <div className="hero-section relative h-96 flex flex-col justify-center items-center">
              {/* Hero content positioned higher */}
              <div className="hero-content text-center px-4 mb-4">
                <h1 className="text-4xl md:text-6xl font-extrabold text-white mb-6 leading-tight">
                  Find Your Next Journey
                </h1>
                <p className="text-lg md:text-xl text-white text-opacity-90 mb-8 max-w-3xl mx-auto">
                  Search, select, and book your train tickets in seconds with Bangladesh Railway
                </p>
                <div className="flex justify-center space-x-4">
                  <div className="bg-white/20 backdrop-blur-sm px-6 py-3 rounded-full">
                    <span className="text-white font-semibold">🚆 100+ Routes</span>
                  </div>
                  <div className="bg-white/20 backdrop-blur-sm px-6 py-3 rounded-full">
                    <span className="text-white font-semibold">⚡ Instant Booking</span>
                  </div>
                  <div className="bg-white/20 backdrop-blur-sm px-6 py-3 rounded-full">
                    <span className="text-white font-semibold">🔒 Secure Payment</span>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Search form positioned below the hero section */}
            <div className="relative z-10 w-full max-w-6xl mx-auto px-4">
              <SearchForm onResults={handleSearchResults} />
            </div>
            
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
              <div className="mt-4">
                <h2 className="text-3xl font-bold text-gray-800 mb-6">
                  Available Journeys
                </h2>
                <ScheduleList
                  schedules={schedules}
                  onSelectSchedule={setSelectedSchedule}
                />
              </div>
            </div>

            {selectedSchedule && (
              <div className="mt-12 bg-white rounded-xl shadow-lg p-8 max-w-7xl mx-auto">
                <h3 className="text-2xl font-bold text-center text-gray-800 mb-6">
                  Choose Your Seat for {selectedSchedule.train_name}
                </h3>
                {loading ? (
                  <div className="text-center text-gray-500">
                    Loading seats...
                  </div>
                ) : (
                  <>
                    <div className="space-y-4 max-w-5xl mx-auto">
                      {Object.keys(seats)
                        .sort((a, b) => parseInt(a) - parseInt(b))
                        .map((rowNumber) => {
                          const fullRow = Array(4).fill(null);
                          seats[rowNumber].forEach((seat) => {
                            if (seat.column_number >= 1 && seat.column_number <= 4) {
                              fullRow[seat.column_number - 1] = seat;
                            }
                          });

                          // Render seats with a corridor (gap) between 2nd and 3rd columns only
                          return (
                            <div key={rowNumber} className="flex justify-center items-center mb-6">
                              {/* 1st and 2nd seats with a slight gap */}
                              {fullRow.slice(0, 2).map((seat, idx) => (
                                <div key={idx} className="mx-1">
                                  {renderSeat(seat)}
                                </div>
                              ))}
                              {/* Corridor (gap) between 2nd and 3rd */}
                              <div className="w-10 sm:w-16" />
                              {/* 3rd and 4th seats with a slight gap */}
                              {fullRow.slice(2, 4).map((seat, idx) => (
                                <div key={idx} className="mx-1">
                                  {renderSeat(seat)}
                                </div>
                              ))}
                            </div>
                          );
                        })}
                    </div>

                    {selectedSeats.length > 0 && (
                      <div className="mt-8 max-w-md mx-auto bg-gray-50 p-6 rounded-lg shadow-inner text-center">
                        <h4 className="text-xl font-bold mb-4">Booking Summary</h4>
                        <div className="mb-2 text-left">
                          {selectedSeats.map(seat => (
                            <div key={seat.seat_number}>
                              <strong>Seat:</strong> {seat.seat_number} (Row: {seat.row_number}, Col: {seat.column_number}) - ${seat.price}
                            </div>
                          ))}
                        </div>
                        <p className="font-bold text-lg my-2">
                          <strong>Total Price:</strong> ${selectedSeats.reduce((sum, seat) => sum + Number(seat.price), 0).toFixed(2)}
                        </p>
                        <button
                          className="w-full mt-4 bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-6 rounded-lg"
                          onClick={handleBuy}
                          disabled={bookingLoading}
                        >
                          {bookingLoading ? "Processing..." : `💳 Purchase Ticket${selectedSeats.length > 1 ? 's' : ''}`}
                        </button>
                      </div>
                    )}
                  </>
                )}
              </div>
            )}
          </>
        )}

        {currentView === "tickets" && (
          <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
            <MyTickets passengerId={passenger.passenger_id} />
          </div>
        )}

        {currentView === "notifications" && (
          <NotificationsPage passengerId={passenger.passenger_id} />
        )}

        {currentView === "contact" && <Contact />}
      </main>

      <Footer />
      {showPassengerDashboard && (
        <PassengerDashboard passenger={dashboardPassenger} onClose={handleClosePassengerDashboard} />
      )}
    </div>
  );
}

export default App;