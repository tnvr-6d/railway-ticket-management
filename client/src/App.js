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
import { getSeats, buyTicket, getPassengerById, validateDiscountCode } from "./api/api";
import AdminProfileModal from "./components/AdminProfileModal";
import DummyPaymentModal from "./components/DummyPaymentModal";
import ChatBot from "./components/ChatBot";
import Creators from "./components/Creators";


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
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentProcessing, setPaymentProcessing] = useState(false);
  const [discountCode, setDiscountCode] = useState('');
  const [appliedDiscount, setAppliedDiscount] = useState(null);
  const [discountLoading, setDiscountLoading] = useState(false);
  const [selectedCoach, setSelectedCoach] = useState("");
  const [coachList, setCoachList] = useState([]);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    if (selectedSchedule) {
      setLoading(true);
      setSeats({});
      setSelectedCoach("");
      setCoachList([]);
      getSeats(selectedSchedule.schedule_id)
        .then((seatsData) => {
          // Extract unique coach numbers for the selected class
          const filteredSeats = seatsData.filter(
            (seat) => seat.class_type === selectedSchedule.class_type
          );
          const uniqueCoaches = [
            ...new Set(filteredSeats.map((seat) => seat.coach_number)),
          ];
          setCoachList(uniqueCoaches);
          setSelectedCoach(uniqueCoaches[0] || "");

          // Group seats by row (all seats, not just filtered)
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

  const handleApplyDiscount = async () => {
    if (!discountCode.trim() || !passenger) return;
    
    setDiscountLoading(true);
    try {
      const discount = await validateDiscountCode(discountCode.trim(), passenger.passenger_id);
      // FIX: Store the nested 'discount' object, not the whole response
      setAppliedDiscount(discount.discount);
      // FIX: Access the nested property for the message
      setMessage(`✅ Discount applied! ${discount.discount.discount_percentage}% off`);
      setTimeout(() => setMessage(""), 3000);
    } catch (error) {
      setMessage("❌ Invalid or expired discount code");
      setAppliedDiscount(null);
      setTimeout(() => setMessage(""), 3000);
    } finally {
      setDiscountLoading(false);
    }
  };

  const handleRemoveDiscount = () => {
    setAppliedDiscount(null);
    setDiscountCode('');
    setMessage("Discount removed");
    setTimeout(() => setMessage(""), 3000);
  };

  const calculateTotalPrice = () => {
    const subtotal = selectedSeats.reduce((sum, seat) => sum + Number(seat.price), 0);
    
    if (appliedDiscount && appliedDiscount.discount_percentage) {
      const discountPercentage = Number(appliedDiscount.discount_percentage);
      const discountAmount = (subtotal * discountPercentage) / 100;
      const finalPrice = subtotal - discountAmount;
      return finalPrice;
    }
    return subtotal;
  };

  const handleBuy = async () => {
    if (selectedSeats.length === 0) return;
    setBookingLoading(true);
    try {
      // Calculate the discounted price per seat
      const subtotal = selectedSeats.reduce((sum, seat) => sum + Number(seat.price), 0);
      const totalPrice = calculateTotalPrice();
      const discountPerSeat = subtotal > 0 ? (subtotal - totalPrice) / selectedSeats.length : 0;
      
      for (const seat of selectedSeats) {
        const originalPrice = Number(seat.price);
        const discountedPrice = originalPrice - discountPerSeat;
        
        const ticketData = {
          schedule_id: selectedSchedule.schedule_id,
          seat_number: seat.seat_number,
          passenger_id: passenger.passenger_id,
          original_price: originalPrice,
          discounted_price: discountedPrice,
          discount_code: appliedDiscount?.code || null,
          discount_percentage: appliedDiscount?.discount_percentage || null
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
      setAppliedDiscount(null);
      setDiscountCode('');
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
    setMobileMenuOpen(false); // Close mobile menu when navigating
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
          {isPending ? "Pending" : isOccupied ? "Occupied" : `৳${seat.price}`}
        </div>
        <div
          className={`absolute bottom-0 left-0 right-0 h-1/3 ${shadeClass}`}
        ></div>
      </div>
    );
  };

  if (!passenger && !adminUser) {
    if (currentView === 'creators') {
      return <Creators onBack={() => setCurrentView('home')} />;
    }
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        {/* Hero Section */}
        <div className="relative h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900 overflow-hidden">
          {/* Background Image */}
          <div 
            className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-20"
            style={{ backgroundImage: "url('/rail.jpg')" }}
          ></div>
          
          {/* Overlay */}
          <div className="absolute inset-0 bg-gradient-to-r from-blue-900/80 to-purple-900/80"></div>
          
          {/* Content */}
          <div className="relative z-10 flex flex-col justify-center items-center h-full text-center px-4">
            {/* Main Headline */}
            <div className="mb-8">
              <h2 className="text-red-500 font-bold text-lg uppercase tracking-wider mb-4">
                Where Railways Connect Dreams
              </h2>
              <h1 className="text-5xl md:text-7xl font-extrabold text-white mb-6 leading-tight">
                Book Your Journey
                <br />
                <span className="text-orange-400">Travel with Confidence</span>
              </h1>
            </div>
            
            {/* Features */}
            <div className="flex flex-col md:flex-row gap-6 mb-12">
              <div className="flex items-center space-x-3 text-white">
                <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center">
                  <span className="text-white font-bold">✓</span>
                </div>
                <span className="text-lg">Instant Booking</span>
              </div>
              <div className="flex items-center space-x-3 text-white">
                <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center">
                  <span className="text-white font-bold">✓</span>
                </div>
                <span className="text-lg">Secure Payments</span>
              </div>
              <div className="flex items-center space-x-3 text-white">
                <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center">
                  <span className="text-white font-bold">✓</span>
                </div>
                <span className="text-lg">Real-time Updates</span>
              </div>
            </div>
            
            {/* CTA Button */}
            <button 
              onClick={() => document.getElementById('login-section').scrollIntoView({ behavior: 'smooth' })}
              className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-bold py-4 px-8 rounded-lg text-xl transition-all duration-300 transform hover:scale-105 shadow-lg"
            >
              Get Started Now
            </button>
          </div>
          
          {/* Scroll Indicator */}
          <div className="absolute bottom-8 right-8 text-white">
            <div className="flex flex-col items-center space-y-2">
              <span className="text-sm font-medium transform -rotate-90 whitespace-nowrap">SCROLL TO EXPLORE</span>
              <div className="w-1 h-16 bg-white/30 rounded-full">
                <div className="w-1 h-4 bg-white rounded-full animate-bounce"></div>
              </div>
            </div>
          </div>
        </div>

        {/* Login Section */}
        <div id="login-section" className="relative py-20">
          {/* Background Image */}
          <div 
            className="absolute inset-0 bg-cover bg-center bg-no-repeat"
            style={{ backgroundImage: "url('/login-page-bg.svg')" }}
          ></div>
          
          {/* Overlay for better readability */}
          <div className="absolute inset-0 bg-white/90"></div>
          
          {/* Content */}
          <div className="relative z-10 max-w-6xl mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-gray-900 mb-4">Welcome to Bangladesh Railway</h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Choose your account type to access our comprehensive railway booking system
              </p>
            </div>
            
            <div className="grid md:grid-cols-2 gap-12 items-start">
              {/* Passenger Login */}
              <div className="bg-white/95 backdrop-blur-sm p-8 rounded-2xl shadow-xl border border-gray-100">
                <div className="text-center mb-8">
                  <div className="w-16 h-16 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-2xl">👤</span>
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">Passenger Portal</h3>
                  <p className="text-gray-600">Book tickets, manage your journeys, and track your trains</p>
                </div>
                
        {showSignup ? (
          <Signup onSignup={handlePassengerSignup} />
        ) : (
                  <Login onLogin={setPassenger} onlyPassenger={true} />
        )}
                
                <div className="text-center mt-6">
          {showSignup ? (
            <p className="text-gray-600">
              Already have an account?{" "}
              <button
                onClick={() => setShowSignup(false)}
                        className="text-indigo-600 hover:underline font-medium"
              >
                Login here
              </button>
            </p>
          ) : (
            <p className="text-gray-600">
              Don't have an account?{" "}
              <button
                onClick={() => setShowSignup(true)}
                        className="text-indigo-600 hover:underline font-medium"
              >
                Sign up here
              </button>
            </p>
          )}
        </div>
              </div>

              {/* Admin Login */}
              <div className="bg-white/95 backdrop-blur-sm p-8 rounded-2xl shadow-xl border border-gray-100">
                <div className="text-center mb-8">
                  <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-2xl">👑</span>
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">Admin Portal</h3>
                  <p className="text-gray-600">Manage schedules, monitor bookings, and oversee operations</p>
                </div>
                
                <Login onAdminLogin={setAdminUser} onlyAdmin={true} />
              </div>
            </div>
          </div>
        </div>

        {/* Features Section */}
        <div className="py-20 bg-gray-50">
          <div className="max-w-6xl mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-gray-900 mb-4">Why Choose Bangladesh Railway?</h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Experience the future of railway travel with our advanced booking system
              </p>
            </div>
            
            <div className="grid md:grid-cols-3 gap-8">
              <div className="bg-white p-8 rounded-2xl shadow-lg text-center">
                <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full flex items-center justify-center mx-auto mb-6">
                  <span className="text-2xl">🚆</span>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-4">100+ Routes</h3>
                <p className="text-gray-600">Connect to every major city across Bangladesh with our extensive network</p>
              </div>
              
              <div className="bg-white p-8 rounded-2xl shadow-lg text-center">
                <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6">
                  <span className="text-2xl">⚡</span>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-4">Instant Booking</h3>
                <p className="text-gray-600">Book your tickets in seconds with our streamlined booking process</p>
              </div>
              
              <div className="bg-white p-8 rounded-2xl shadow-lg text-center">
                <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-6">
                  <span className="text-2xl">🔒</span>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-4">Secure Payment</h3>
                <p className="text-gray-600">Your transactions are protected with bank-level security standards</p>
              </div>
            </div>
          </div>
        </div>

        <Footer onCreatorsClick={() => setCurrentView('creators')} />
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
      <header className="bg-blue-900 shadow-lg sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo Section */}
            <div className="flex-shrink-0 flex items-center">
              <div className="w-8 h-8 bg-white rounded mr-3 flex items-center justify-center">
                <div className="w-4 h-4 bg-blue-900 rounded-sm"></div>
            </div>
              <div className="font-bold text-xl text-white">
                TicketManager
              </div>
            </div>

            {/* Navigation Menu */}
            <nav className="hidden md:flex items-center space-x-8">
              <button
                onClick={() => handleViewChange("home")}
                className={`text-white hover:text-gray-200 transition-colors duration-200 flex items-center ${
                  currentView === "home" ? "font-semibold" : ""
                }`}
              >
                Home
                <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              <button
                onClick={() => handleViewChange("tickets")}
                className={`text-white hover:text-gray-200 transition-colors duration-200 flex items-center ${
                  currentView === "tickets" ? "font-semibold" : ""
                }`}
              >
                My Tickets
                <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              <button
                onClick={() => handleViewChange("contact")}
                className={`text-white hover:text-gray-200 transition-colors duration-200 flex items-center ${
                  currentView === "contact" ? "font-semibold" : ""
                }`}
              >
                Contact
                <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              <button
                onClick={() => handleViewChange("notifications")}
                className={`text-white hover:text-gray-200 transition-colors duration-200 flex items-center ${
                  currentView === "notifications" ? "font-semibold" : ""
                }`}
              >
                Notifications
                <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
            </nav>

            {/* Right Side - User Section */}
            <div className="flex items-center space-x-4">
                <NotificationBell passengerId={passenger.passenger_id} />
              
              {/* User Profile */}
              <div className="flex items-center space-x-3 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-lg hover:bg-white/20 transition-all duration-300">
                <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center text-blue-900 font-bold text-sm">
                  {passenger.name.charAt(0).toUpperCase()}
                </div>
                <div className="flex flex-col">
                  <span className="text-sm font-semibold text-white cursor-pointer hover:text-gray-200 transition-colors duration-300" onClick={handleOpenPassengerDashboard} title="View profile">
                    {passenger.name}
                  </span>
                  <span className="text-xs text-gray-300">ID: #{passenger.passenger_id}</span>
                </div>
              </div>

              {/* Logout Button */}
                <button
                  onClick={handleLogout}
                className="px-4 py-2 rounded-lg text-sm font-medium text-white hover:text-gray-200 hover:bg-white/10 transition-all duration-300"
                >
                  Logout
              </button>
              
              {/* Mobile Menu Button */}
              <div className="md:hidden">
                <button
                  onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                  className="text-white hover:text-gray-200 transition-colors duration-200"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    {mobileMenuOpen ? (
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    ) : (
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                    )}
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-blue-900 shadow-lg animate-slideDown">
          <div className="px-4 py-2 space-y-2">
            <button
              onClick={() => { handleViewChange("home"); setMobileMenuOpen(false); }}
              className={`w-full px-4 py-3 text-left text-white hover:text-gray-200 transition-colors duration-200 ${
                currentView === "home" ? "font-semibold" : ""
              }`}
            >
              Home
            </button>
            <button
              onClick={() => { handleViewChange("tickets"); setMobileMenuOpen(false); }}
              className={`w-full px-4 py-3 text-left text-white hover:text-gray-200 transition-colors duration-200 ${
                currentView === "tickets" ? "font-semibold" : ""
              }`}
            >
              My Tickets
            </button>
            <button
              onClick={() => { handleViewChange("contact"); setMobileMenuOpen(false); }}
              className={`w-full px-4 py-3 text-left text-white hover:text-gray-200 transition-colors duration-200 ${
                currentView === "contact" ? "font-semibold" : ""
              }`}
            >
              Contact
            </button>
            <button
              onClick={() => { handleViewChange("notifications"); setMobileMenuOpen(false); }}
              className={`w-full px-4 py-3 text-left text-white hover:text-gray-200 transition-colors duration-200 ${
                currentView === "notifications" ? "font-semibold" : ""
              }`}
            >
              Notifications
            </button>
          </div>
        </div>
      )}

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
            <div className="relative h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-blue-900 overflow-hidden">
              {/* Background Image */}
              <div 
                className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-10"
                style={{ backgroundImage: "url('/rail.jpg')" }}
              ></div>
              
              {/* Overlay */}
              <div className="absolute inset-0 bg-gradient-to-r from-indigo-900/80 to-purple-900/80"></div>
              
              {/* Content */}
              <div className="relative z-10 flex flex-col justify-center items-center h-full text-center px-4">
                {/* Main Headline */}
                <div className="mb-8">
                  <h2 className="text-red-500 font-bold text-lg uppercase tracking-wider mb-4">
                    WHERE RAILWAYS CONNECT DREAMS
                  </h2>
                  <h1 className="text-5xl md:text-7xl font-extrabold text-white mb-6 leading-tight">
                  Find Your Next Journey
                    <br />
                    <span className="text-orange-400">Travel with Confidence</span>
                </h1>
                  </div>
                
                {/* Features */}
                <div className="flex flex-col md:flex-row gap-6 mb-12">
                  <div className="flex items-center space-x-3 text-white">
                    <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center">
                      <span className="text-white font-bold">✓</span>
                  </div>
                    <span className="text-lg">Instant Booking</span>
                  </div>
                  <div className="flex items-center space-x-3 text-white">
                    <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center">
                      <span className="text-white font-bold">✓</span>
                </div>
                    <span className="text-lg">Secure Payments</span>
              </div>
                  <div className="flex items-center space-x-3 text-white">
                    <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center">
                      <span className="text-white font-bold">✓</span>
            </div>
                    <span className="text-lg">Real-time Updates</span>
                  </div>
                </div>
              </div>
              
              {/* Scroll Indicator */}
              <div className="absolute bottom-8 right-8 text-white">
                <div className="flex flex-col items-center space-y-2">
                  <span className="text-sm font-medium transform -rotate-90 whitespace-nowrap">SCROLL TO EXPLORE</span>
                  <div className="w-1 h-16 bg-white/30 rounded-full">
                    <div className="w-1 h-4 bg-white rounded-full animate-bounce"></div>
                  </div>
                </div>
              </div>
            </div>

            {/* Enhanced Search Section */}
            <div className="relative z-10 w-full max-w-7xl mx-auto px-4 -mt-20">
              <div className="bg-white/95 backdrop-blur-md rounded-3xl shadow-2xl border border-white/20 p-8">
                <div className="text-center mb-8">
                  <h2 className="text-3xl font-bold text-gray-900 mb-2">Search Trains</h2>
                  <p className="text-gray-600 text-lg">Find your perfect journey</p>
                </div>
              <SearchForm onResults={handleSearchResults} />
            </div>
            </div>
            <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
              {/* Background Image */}
              <div 
                className="absolute inset-0 bg-cover bg-center bg-no-repeat rounded-3xl"
                style={{ backgroundImage: "url('/login-page-bg.svg')" }}
              ></div>
              
              {/* Overlay for better readability */}
              <div className="absolute inset-0 bg-white/85 rounded-3xl"></div>
              
              {/* Content */}
              <div className="relative z-10">
                <div className="text-center mb-12">
                  <h2 className="text-4xl font-bold text-gray-900 mb-4">Available Journeys</h2>
                  <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                    Discover the perfect train schedule for your journey across Bangladesh
                  </p>
                </div>
                <div className="bg-white/95 backdrop-blur-md rounded-3xl shadow-2xl border border-white/20 p-8">
                <ScheduleList
                  schedules={schedules}
                  onSelectSchedule={setSelectedSchedule}
                />
                </div>
              </div>
            </div>
            {selectedSchedule && (
              <div className="mt-12 bg-white rounded-xl shadow-lg p-8 max-w-7xl mx-auto">
                <h3 className="text-2xl font-bold text-center text-gray-800 mb-6">
                  Choose Your Seat for {selectedSchedule.train_name}
                </h3>
                {/* Enhanced Coach Dropdown */}
                {coachList.length > 0 && (
                  <div className="mb-8">
                    <div className="text-center mb-6">
                      <h4 className="text-xl font-bold text-gray-800 mb-2">Select Your Coach</h4>
                      <p className="text-gray-600">Choose from available coaches for {selectedSchedule.class_type} class</p>
                    </div>
                    
                    {/* Coach Selection Cards */}
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 max-w-4xl mx-auto">
                      {coachList.map(coach => {
                        // Calculate seats for this coach
                        const allSeats = Object.values(seats).flat().filter(
                          seat => seat.coach_number === coach && seat.class_type === selectedSchedule.class_type
                        );
                        const available = allSeats.filter(seat => seat.is_available).length;
                        const total = allSeats.length;
                        const occupancyRate = total > 0 ? ((total - available) / total) * 100 : 0;
                        
                        // Determine badge color based on availability
                        let badgeColor = "bg-green-100 text-green-800 border-green-300";
                        let statusText = "Available";
                        if (available === 0) {
                          badgeColor = "bg-red-100 text-red-800 border-red-300";
                          statusText = "Full";
                        } else if (available <= total * 0.2) {
                          badgeColor = "bg-orange-100 text-orange-800 border-orange-300";
                          statusText = "Limited";
                        } else if (available <= total * 0.5) {
                          badgeColor = "bg-yellow-100 text-yellow-800 border-yellow-300";
                          statusText = "Few Left";
                        }
                        
                        return (
                          <div
                            key={coach}
                            onClick={() => setSelectedCoach(coach)}
                            className={`relative cursor-pointer transition-all duration-300 transform hover:scale-105 ${
                              selectedCoach === coach 
                                ? 'ring-4 ring-blue-500 ring-opacity-50 bg-blue-50 border-blue-300' 
                                : 'bg-white hover:bg-gray-50 border-gray-200'
                            } border-2 rounded-xl p-4 shadow-lg hover:shadow-xl`}
                          >
                            {/* Selected Indicator */}
                            {selectedCoach === coach && (
                              <div className="absolute -top-2 -right-2 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                                <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                </svg>
                              </div>
                            )}
                            
                            {/* Coach Icon */}
                            <div className="text-center mb-3">
                              <div className={`w-12 h-12 mx-auto rounded-full flex items-center justify-center text-xl font-bold ${
                                selectedCoach === coach 
                                  ? 'bg-blue-500 text-white' 
                                  : 'bg-gray-200 text-gray-700'
                              }`}>
                                {coach}
                              </div>
                            </div>
                            
                            {/* Coach Info */}
                            <div className="text-center">
                              <h5 className="font-bold text-gray-800 mb-2">Coach {coach}</h5>
                              
                              {/* Availability Badge */}
                              <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${badgeColor} mb-2`}>
                                <span className="w-2 h-2 rounded-full mr-1 bg-current"></span>
                                {statusText}
                              </div>
                              
                              {/* Seat Count */}
                              <div className="text-sm text-gray-600">
                                <span className="font-semibold text-green-600">{available}</span>
                                <span className="text-gray-500"> / {total} seats</span>
                              </div>
                              
                              {/* Progress Bar */}
                              <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
                                <div 
                                  className={`h-2 rounded-full transition-all duration-300 ${
                                    occupancyRate >= 80 ? 'bg-red-500' :
                                    occupancyRate >= 60 ? 'bg-orange-500' :
                                    occupancyRate >= 40 ? 'bg-yellow-500' : 'bg-green-500'
                                  }`}
                                  style={{ width: `${occupancyRate}%` }}
                                ></div>
                              </div>
                              
                              {/* Occupancy Percentage */}
                              <div className="text-xs text-gray-500 mt-1">
                                {Math.round(occupancyRate)}% occupied
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                    
                    {/* Selected Coach Info */}
                    {selectedCoach && (
                      <div className="mt-6 text-center">
                        <div className="inline-flex items-center px-4 py-2 bg-blue-50 border border-blue-200 rounded-lg">
                          <svg className="w-5 h-5 text-blue-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                          <span className="text-blue-800 font-medium">
                            Selected: Coach {selectedCoach} - {selectedSchedule.class_type} Class
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                )}
                {/* Seat Count for selected coach/class */}
                {selectedCoach && (() => {
                  // Flatten all seats for selected coach and class
                  const allSeats = Object.values(seats).flat().filter(
                    seat => seat.coach_number === selectedCoach && seat.class_type === selectedSchedule.class_type
                  );
                  const available = allSeats.filter(seat => seat.is_available).length;
                  const total = allSeats.length;
                  let badgeColor = "bg-green-100 text-green-800 border-green-300";
                  const percent = total > 0 ? available / total : 0;
                  if (percent <= 0.2) badgeColor = "bg-red-100 text-red-700 border-red-300";
                  else if (percent <= 0.5) badgeColor = "bg-yellow-100 text-yellow-800 border-yellow-300";
                  return (
                    <div className={`flex items-center justify-center gap-2 my-2 px-3 py-2 rounded-full border font-bold text-base shadow-sm w-fit mx-auto ${badgeColor}`} aria-label={`Seats available: ${available} out of ${total}`}>
                      <span className="text-lg font-extrabold">{available}</span>
                      <span className="text-gray-600 font-medium text-base">/ {total} seats available</span>
                    </div>
                  );
                })()}
                {loading ? (
                  <div className="text-center text-gray-500">
                    Loading seats...
                  </div>
                ) : (
                  <>
                    <div className="space-y-4 max-w-5xl mx-auto">
                      {/* Only show seats for selected coach and class */}
                      {Object.keys(seats)
                        .sort((a, b) => parseInt(a) - parseInt(b))
                        .map((rowNumber) => {
                          // Only show seats for selected coach and class
                          const filteredRow = (seats[rowNumber] || []).filter(
                            seat => seat.coach_number === selectedCoach && seat.class_type === selectedSchedule.class_type
                          );
                          if (filteredRow.length === 0) return null;
                          const fullRow = Array(4).fill(null);
                          filteredRow.forEach((seat) => {
                            if (seat.column_number >= 1 && seat.column_number <= 4) {
                              fullRow[seat.column_number - 1] = seat;
                            }
                          });
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
                              <strong>Seat:</strong> {seat.seat_number} (Row: {seat.row_number}, Col: {seat.column_number}) - ৳{seat.price}
                            </div>
                          ))}
                        </div>
                        
                        {/* Discount Section */}
                        <div className="mb-4 p-3 bg-white rounded-lg border">
                          <h5 className="font-semibold mb-2">Apply Discount</h5>
                          {!appliedDiscount ? (
                            <div className="flex gap-2">
                              <input
                                type="text"
                                value={discountCode}
                                onChange={(e) => setDiscountCode(e.target.value)}
                                placeholder="Enter discount code"
                                className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm"
                                disabled={discountLoading}
                              />
                              <button
                                onClick={handleApplyDiscount}
                                disabled={discountLoading || !discountCode.trim()}
                                className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm hover:bg-blue-700 disabled:bg-gray-400"
                              >
                                {discountLoading ? '...' : 'Apply'}
                              </button>
                            </div>
                          ) : (
                            <div className="flex items-center justify-between">
                              <span className="text-green-600 font-semibold">
                                ✅ {appliedDiscount.code} ({appliedDiscount.discount_percentage}% off)
                              </span>
                              <button
                                onClick={handleRemoveDiscount}
                                className="text-red-600 hover:text-red-800 text-sm"
                              >
                                Remove
                              </button>
                            </div>
                          )}
                        </div>

                        <div className="text-left space-y-1">
                          <p className="text-gray-600">
                            <strong>Subtotal:</strong> ৳{selectedSeats.reduce((sum, seat) => sum + Number(seat.price), 0).toFixed(2)}
                          </p>
                          {appliedDiscount && appliedDiscount.discount_percentage && (
                            <p className="text-green-600">
                              <strong>Discount ({appliedDiscount.discount_percentage}%):</strong> -৳{((selectedSeats.reduce((sum, seat) => sum + Number(seat.price), 0) * Number(appliedDiscount.discount_percentage)) / 100).toFixed(2)}
                            </p>
                          )}
                          <p className="font-bold text-lg">
                            <strong>Total Price:</strong> ৳{calculateTotalPrice().toFixed(2)}
                          </p>
                        </div>
                        <button
                          className="w-full mt-4 bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-6 rounded-lg"
                          onClick={() => setShowPaymentModal(true)}
                          disabled={bookingLoading || paymentProcessing}
                        >
                          {bookingLoading || paymentProcessing ? "Processing..." : `💳 Purchase Ticket${selectedSeats.length > 1 ? 's' : ''}`}
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
        {currentView === "creators" && <Creators onBack={() => setCurrentView('home')} />}
      </main>

      <Footer onCreatorsClick={() => handleViewChange('creators')} />
      {showPassengerDashboard && (
        <PassengerDashboard passenger={dashboardPassenger} onClose={handleClosePassengerDashboard} />
      )}
      <DummyPaymentModal
        open={showPaymentModal}
        amount={calculateTotalPrice().toFixed(2)}
        onClose={() => setShowPaymentModal(false)}
        onSuccess={async () => {
          setPaymentProcessing(true);
          setShowPaymentModal(false);
          await handleBuy();
          setPaymentProcessing(false);
        }}
      />
      <ChatBot />
    </div>
  );
}

export default App;
