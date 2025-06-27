import React, { useEffect, useState, useCallback } from 'react';
import { getMyTickets, cancelTicket } from '../api/api';

function MyTickets({ passengerId }) {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(false);
  const [cancellingTicket, setCancellingTicket] = useState(null);
  const [error, setError] = useState('');

  const fetchTickets = useCallback(async () => {
    if (passengerId) {
      setLoading(true);
      setError('');
      try {
        const data = await getMyTickets(passengerId);
        setTickets(data || []);
      } catch (err) {
        setError('Failed to fetch tickets. Please try again.');
      } finally {
        setLoading(false);
      }
    }
  }, [passengerId]);

  useEffect(() => {
    fetchTickets();
  }, [fetchTickets]);

  const handleCancel = async (ticket) => {
    const reason = prompt("Enter reason for cancellation:");
    if (!reason) return;

    setCancellingTicket(ticket.ticket_id);
    try {
      await cancelTicket(ticket.ticket_id, reason);
      await fetchTickets(); // Refresh tickets after successful cancellation
    } catch (error) {
      alert('Failed to cancel ticket: ' + error.message);
    } finally {
      setCancellingTicket(null);
    }
  };

  const formatDate = (dateString) => new Date(dateString).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  const formatTime = (timeString) => new Date(`1970-01-01T${timeString}`).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });

  if (loading) {
    return <div className="text-center py-10 text-gray-500">Loading your tickets...</div>;
  }
  if (error) {
    return <div className="text-center py-10 text-red-600">{error}</div>;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-bold text-gray-800">My Tickets</h2>
        <button onClick={fetchTickets} className="px-4 py-2 bg-blue-100 text-blue-700 text-sm font-medium rounded-md hover:bg-blue-200" disabled={loading}>
          🔄 Refresh
        </button>
      </div>

      {tickets.length === 0 ? (
        <div className="text-center py-12 px-6 bg-white rounded-lg shadow-md">
          <p className="text-gray-500">You haven't booked any tickets yet.</p>
        </div>
      ) : (
        <div className="grid lg:grid-cols-2 gap-8">
          {tickets.map((ticket) => {
            const isCancelled = ticket.status === 'Cancelled';
            let headerClass = "p-4 text-white flex justify-between items-center font-bold ";
            headerClass += isCancelled ? "bg-gradient-to-r from-gray-500 to-gray-600" : "bg-gradient-to-r from-purple-600 to-indigo-600";
            
            return (
              <div key={ticket.ticket_id} className="bg-white rounded-xl shadow-lg flex flex-col">
                <div className={headerClass}>
                  <span>Ticket #{ticket.ticket_id}</span>
                  <span className="px-3 py-1 text-xs rounded-full bg-white/20">{ticket.status}</span>
                </div>
                
                <div className="p-6 flex-grow">
                  <div className="mb-4">
                    <div className="flex items-center text-xl font-semibold text-gray-800">
                      <span>{ticket.source}</span>
                      <span className="mx-4 text-indigo-400">→</span>
                      <span>{ticket.destination}</span>
                    </div>
                    <div className="text-gray-600 mt-1">🚆 {ticket.train_name}</div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm text-gray-700">
                    <span><strong>📅 Date:</strong> {formatDate(ticket.departure_date)}</span>
                    <span><strong>⏰ Departure:</strong> {formatTime(ticket.departure_time)}</span>
                    <span><strong>🪑 Seat:</strong> {ticket.seat_number} ({ticket.class_type})</span>
                    <span><strong>🚃 Coach:</strong> {ticket.coach_number}</span>
                    <span className="font-semibold"><strong>💰 Price:</strong> ${ticket.price}</span>
                    <span><strong>✔ Booked:</strong> {formatDate(ticket.booking_date)}</span>
                  </div>
                </div>

                <div className="p-4 bg-gray-50 rounded-b-xl">
                  {isCancelled ? (
                    <div className="text-center text-red-600 bg-red-100 p-3 rounded-md">
                      ❌ This ticket has been cancelled
                    </div>
                  ) : (
                    <button 
                      onClick={() => handleCancel(ticket)}
                      className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-lg transition disabled:opacity-50"
                      disabled={cancellingTicket === ticket.ticket_id}
                    >
                      {cancellingTicket === ticket.ticket_id ? 'Cancelling...' : 'Cancel Ticket'}
                    </button>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  );
}

export default MyTickets;