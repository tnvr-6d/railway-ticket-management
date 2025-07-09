import React, { useEffect, useState, useCallback } from 'react';
import { getMyTickets, requestCancellation } from '../api/api';

function MyTickets({ passengerId }) {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(false);
  const [cancellingTicket, setCancellingTicket] = useState(null);
  const [error, setError] = useState('');
  
  const [flippedTicketId, setFlippedTicketId] = useState(null);

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
    const reason = prompt("Please provide a reason for cancellation:");
    if (!reason || reason.trim() === '') {
        alert("A reason is required to request cancellation.");
        return;
    }

    setCancellingTicket(ticket.ticket_id);
    try {
      await requestCancellation(ticket.ticket_id, reason);
      await fetchTickets();
    } catch (error) {
      alert('Failed to submit cancellation request: ' + error.message);
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
         <div className="grid lg:grid-cols-2 gap-x-8 gap-y-12 mb-16">
          {tickets.map((ticket) => {
            const isCancelled = ticket.status === 'Cancelled';
            const isPending = ticket.status === 'Pending Cancellation';
            const isFlipped = flippedTicketId === ticket.ticket_id;

            let headerClass = "p-4 text-white flex justify-between items-center font-bold ";
            if (isCancelled) headerClass += "bg-gradient-to-r from-red-500 to-red-600";
            else if (isPending) headerClass += "bg-gradient-to-r from-gray-500 to-gray-600";
            else headerClass += "bg-gradient-to-r from-purple-600 to-indigo-600";
            
            const routeString = [
              ticket.source,
              ...(ticket.intermediate_stations || []),
              ticket.destination
            ].join(' → ');

            return (
              <div key={ticket.ticket_id} className={`ticket-card ${isFlipped ? 'is-flipped' : ''}`}>
                <div className="ticket-card-inner">
                  {/* --- FRONT OF THE CARD --- */}
                  <div className="ticket-card-front">
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

                      <div className="text-right mt-4">
                          <button onClick={() => setFlippedTicketId(ticket.ticket_id)} className="text-sm font-semibold text-indigo-600 hover:text-indigo-800">
                              View Route Stations ↪
                          </button>
                      </div>
                    </div>

                    <div className="p-4 bg-gray-50 rounded-b-xl">
                      {isCancelled ? <div className="text-center text-red-600 bg-red-100 p-3 rounded-md">❌ This ticket has been cancelled.</div>
                       : isPending ? <div className="text-center text-gray-600 bg-gray-200 p-3 rounded-md">⏳ This ticket is pending cancellation approval.</div>
                       : <button onClick={() => handleCancel(ticket)} className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-lg" disabled={cancellingTicket === ticket.ticket_id}>
                           {cancellingTicket === ticket.ticket_id ? 'Submitting...' : 'Request Cancellation'}
                         </button>
                      }
                    </div>
                  </div>

                  {/* --- BACK OF THE CARD --- */}
                  <div className="ticket-card-back">
                      <h3 className="text-xl font-bold text-gray-800 mb-4">Route Stations</h3>
                      <p className="text-center text-gray-700 px-4 leading-relaxed">{routeString}</p>
                      <button onClick={() => setFlippedTicketId(null)} className="mt-6 bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-2 px-6 rounded-lg">
                        Go Back
                      </button>
                  </div>
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