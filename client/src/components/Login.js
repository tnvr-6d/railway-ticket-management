import React, { useState } from "react";
import { loginPassenger, loginAdmin } from "../api/api";

function Login({ onLogin, onAdminLogin }) {
  const [loginType, setLoginType] = useState('passenger');
  
  // Changed from passengerId to a generic identifier
  const [loginIdentifier, setLoginIdentifier] = useState("");
  const [passengerPassword, setPassengerPassword] = useState("");
  
  const [adminUsername, setAdminUsername] = useState("");
  const [adminPassword, setAdminPassword] = useState("");

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handlePassengerLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      // Pass the generic identifier
      const result = await loginPassenger(loginIdentifier, passengerPassword);
      if (result?.success) {
        // Pass the whole user object {passenger_id, name} to onLogin
        onLogin(result.user);
      } else {
        setError(result?.message || "❌ Invalid credentials");
      }
    } catch (error) {
      setError("❌ Login failed. Please check your connection and try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleAdminLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
        const result = await loginAdmin(adminUsername, adminPassword);
        if (result?.success) {
            onAdminLogin(result.user);
        } else {
            setError(result?.message || "❌ Invalid admin credentials.");
        }
    } catch (error) {
        setError("❌ Admin login failed. Please try again.");
    } finally {
        setLoading(false);
    }
  };


  return (
    <>
      <header className="relative text-center py-20 px-6 bg-gradient-to-br from-indigo-700 via-purple-600 to-blue-600 text-white">
        <h1 className="text-5xl font-extrabold mb-4">Railway Ticket System</h1>
        <p className="text-xl text-indigo-200 max-w-2xl mx-auto">Book your train tickets with ease and comfort, from anywhere in Bangladesh.</p>
      </header>

      <main className="py-12 px-4">
        <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-12 items-start">
          <div className="bg-white p-8 rounded-2xl shadow-xl">
            {/* --- LOGIN TYPE TOGGLE --- */}
            <div className="flex border-b mb-6">
                <button onClick={() => setLoginType('passenger')} className={`flex-1 py-2 font-semibold ${loginType === 'passenger' ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-gray-500'}`}>
                    Passenger Login
                </button>
                <button onClick={() => setLoginType('admin')} className={`flex-1 py-2 font-semibold ${loginType === 'admin' ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-gray-500'}`}>
                    Admin Login
                </button>
            </div>

            {loginType === 'passenger' ? (
                <form onSubmit={handlePassengerLogin} className="space-y-6">
                    <h2 className="text-2xl font-bold text-gray-800">Passenger Login</h2>
                    <div>
                        {/* Updated Label and Input */}
                        <label className="block text-sm font-medium text-gray-700 mb-1">Passenger ID or Name</label>
                        <input 
                            type="text" 
                            placeholder="e.g., 62 or Fatima Khatun" 
                            value={loginIdentifier} 
                            onChange={(e) => setLoginIdentifier(e.target.value)} 
                            required disabled={loading} 
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg"/>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                        <input type="password" placeholder="Enter your password" value={passengerPassword} onChange={(e) => setPassengerPassword(e.target.value)} required disabled={loading} className="w-full px-4 py-3 border border-gray-300 rounded-lg"/>
                    </div>
                    {error && <div className="text-red-600 text-sm">{error}</div>}
                    <button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-4 rounded-lg" disabled={loading}>
                        {loading ? "Logging in..." : "Login as Passenger"}
                    </button>
                </form>
            ) : (
                <form onSubmit={handleAdminLogin} className="space-y-6">
                     <h2 className="text-2xl font-bold text-gray-800">Admin Login</h2>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Admin Username</label>
                        <input type="text" placeholder="e.g., admin" value={adminUsername} onChange={(e) => setAdminUsername(e.target.value)} required disabled={loading} className="w-full px-4 py-3 border border-gray-300 rounded-lg"/>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                        <input type="password" placeholder="Enter admin password" value={adminPassword} onChange={(e) => setAdminPassword(e.target.value)} required disabled={loading} className="w-full px-4 py-3 border border-gray-300 rounded-lg"/>
                    </div>
                     {error && <div className="text-red-600 text-sm">{error}</div>}
                    <button type="submit" className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-4 rounded-lg" disabled={loading}>
                        {loading ? "Logging in..." : "Login as Admin"}
                    </button>
                </form>
            )}
          </div>
          
          {/* --- RESTORED FEATURE CARDS --- */}
          <div className="space-y-6 pt-4">
              <div className="bg-white p-6 rounded-xl shadow-lg flex items-start gap-4 hover:shadow-xl transition">
                  <div className="text-3xl">🎫</div>
                  <div>
                      <h3 className="font-bold text-lg text-gray-800">Easy Booking</h3>
                      <p className="text-gray-600">Book train tickets in just a few clicks with our streamlined process.</p>
                  </div>
              </div>
              <div className="bg-white p-6 rounded-xl shadow-lg flex items-start gap-4 hover:shadow-xl transition">
                  <div className="text-3xl">🔒</div>
                  <div>
                      <h3 className="font-bold text-lg text-gray-800">Secure & Safe</h3>
                      <p className="text-gray-600">Your data and payments are protected with industry-standard security.</p>
                  </div>
              </div>
              <div className="bg-white p-6 rounded-xl shadow-lg flex items-start gap-4 hover:shadow-xl transition">
                  <div className="text-3xl">📞</div>
                  <div>
                      <h3 className="font-bold text-lg text-gray-800">24/7 Support</h3>
                      <p className="text-gray-600">Our customer service team is always ready to help you with any questions.</p>
                  </div>
              </div>
          </div>
        </div>
      </main>
    </>
  );
}

export default Login;