import React, { useState } from "react";
import { loginPassenger } from "../api/api";

function Login({ onLogin }) {
  const [passengerId, setPassengerId] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const result = await loginPassenger(passengerId, password);
      if (result?.success) {
        onLogin(result.user.passenger_id);
      } else {
        setError(result?.message || "❌ Invalid Passenger ID or password");
      }
    } catch (error) {
      setError("❌ Login failed. Please check your connection and try again.");
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
            <h2 className="text-3xl font-bold text-gray-800 mb-2">Passenger Login</h2>
            <p className="text-gray-500 mb-6">Enter your credentials to continue.</p>
            <form onSubmit={handleLogin} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Passenger ID</label>
                <input
                  type="number"
                  placeholder="e.g., 62"
                  value={passengerId}
                  onChange={(e) => setPassengerId(e.target.value)}
                  required
                  disabled={loading}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                <input
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={loading}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
              {error && <div className="text-red-600 text-sm">{error}</div>}
              <button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-4 rounded-lg transition duration-300 disabled:opacity-50" disabled={loading}>
                {loading ? "Logging in..." : "Login"}
              </button>
            </form>
          </div>

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

