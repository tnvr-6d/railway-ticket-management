import React, { useState } from "react";
import { registerPassenger } from "../api/api";

function Signup({ onSignup }) {
  const [passengerName, setPassengerName] = useState("");
  const [passengerEmail, setPassengerEmail] = useState("");
  const [passengerPassword, setPassengerPassword] = useState("");
  const [passengerPhone, setPassengerPhone] = useState("");
  const [passengerAddress, setPassengerAddress] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSignup = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const result = await registerPassenger({
        passengerName,
        passengerEmail,
        passengerPassword,
        passengerPhone,
        passengerAddress,
      });
      if (result?.success) {
        onSignup(result.user);
      } else {
        setError(result?.message || "❌ Signup failed. Please try again.");
      }
    } catch (error) {
      setError("❌ Signup failed. Please check your connection.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <header className="relative text-center py-20 px-6 bg-gradient-to-br from-indigo-700 via-purple-600 to-blue-600 text-white">
        <h1 className="text-5xl font-extrabold mb-4">Railway Ticket System</h1>
        <p className="text-xl text-indigo-200 max-w-2xl mx-auto">Register to book your train tickets with ease and comfort.</p>
      </header>

      <main className="py-12 px-4">
        <div className="max-w-md mx-auto bg-white p-8 rounded-2xl shadow-xl">
          <h2 className="text-3xl font-bold text-gray-800 mb-6 text-center">Passenger Signup</h2>
          <form onSubmit={handleSignup} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
              <input type="text" placeholder="e.g., John Doe" value={passengerName} onChange={(e) => setPassengerName(e.target.value)} required disabled={loading} className="w-full px-4 py-3 border border-gray-300 rounded-lg"/>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
              <input type="email" placeholder="e.g., passenger@example.com" value={passengerEmail} onChange={(e) => setPassengerEmail(e.target.value)} required disabled={loading} className="w-full px-4 py-3 border border-gray-300 rounded-lg"/>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
              <input type="password" placeholder="Enter your password" value={passengerPassword} onChange={(e) => setPassengerPassword(e.target.value)} required disabled={loading} className="w-full px-4 py-3 border border-gray-300 rounded-lg"/>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
              <input type="tel" placeholder="e.g., +8801XXXXXXXXX" value={passengerPhone} onChange={(e) => setPassengerPhone(e.target.value)} required disabled={loading} className="w-full px-4 py-3 border border-gray-300 rounded-lg"/>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
              <input type="text" placeholder="e.g., 123 Main St, City" value={passengerAddress} onChange={(e) => setPassengerAddress(e.target.value)} required disabled={loading} className="w-full px-4 py-3 border border-gray-300 rounded-lg"/>
            </div>
            {error && <div className="text-red-600 text-sm text-center">{error}</div>}
            <button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-4 rounded-lg" disabled={loading}>
              {loading ? "Signing up..." : "Sign Up"}
            </button>
          </form>
        </div>
      </main>
    </>
  );
}

export default Signup;