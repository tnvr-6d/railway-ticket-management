import React, { useEffect, useState, useCallback } from 'react';
import { getMyTickets, requestCancellation } from '../api/api';
import { submitFeedback } from '../api/api';
import { generateTicketPDF } from '../utils/pdfGenerator';

function MyTickets({ passengerId }) {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(false);
  const [cancellingTicket, setCancellingTicket] = useState(null);
  const [error, setError] = useState('');
  const [flippedTicketId, setFlippedTicketId] = useState(null);

  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [feedbackTicket, setFeedbackTicket] = useState(null);
  const [feedbackSubject, setFeedbackSubject] = useState('');
  const [feedbackMessage, setFeedbackMessage] = useState('');
  const [feedbackLoading, setFeedbackLoading] = useState(false);
  const [feedbackError, setFeedbackError] = useState('');
  const [feedbackSuccess, setFeedbackSuccess] = useState('');

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

  const handleDownloadPDF = (ticket, event) => {
    try {
      const button = event.target;
      button.classList.add('pdf-download-animation');
      generateTicketPDF(ticket);
      setTimeout(() => {
        button.classList.remove('pdf-download-animation');
      }, 600);
    } catch (error) {
      console.error('Failed to generate PDF:', error);
      alert('Failed to generate PDF. Please try again.');
    }
  };

  const handleDownloadAllPDFs = () => {
    if (tickets.length === 0) {
      alert('No tickets to download.');
      return;
    }
    tickets.forEach((ticket, index) => {
      setTimeout(() => {
        generateTicketPDF(ticket);
      }, index * 1000);
    });
  };

  const formatDate = (dateString) => new Date(dateString).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  const formatTime = (timeString) => new Date(`1970-01-01T${timeString}`).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });

  const openFeedbackModal = (ticket) => {
    setFeedbackTicket(ticket);
    setFeedbackSubject('');
    setFeedbackMessage('');
    setFeedbackError('');
    setFeedbackSuccess('');
    setShowFeedbackModal(true);
  };

  const closeFeedbackModal = () => {
    setShowFeedbackModal(false);
    setFeedbackTicket(null);
    setFeedbackSubject('');
    setFeedbackMessage('');
    setFeedbackError('');
    setFeedbackSuccess('');
  };

  const handleFeedbackSubmit = async (e) => {
    e.preventDefault();
    setFeedbackLoading(true);
    setFeedbackError('');
    setFeedbackSuccess('');
    try {
      await submitFeedback({
        passenger_id: passengerId,
        ticket_id: feedbackTicket.ticket_id,
        subject: feedbackSubject,
        message: feedbackMessage,
      });
      setFeedbackSuccess('Feedback submitted successfully!');
      setTimeout(() => {
        closeFeedbackModal();
        fetchTickets();
      }, 1200);
    } catch (err) {
      setFeedbackError(err.message || 'Failed to submit feedback.');
    } finally {
      setFeedbackLoading(false);
    }
  };

  if (loading) {
    return <div className="text-center py-10 text-gray-500">Loading your tickets...</div>;
  }

  if (error) {
    return <div className="text-center py-10 text-red-600">{error}</div>;
  }

  return (
    <div>
      <div className="glass p-6 mb-8">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-3xl font-bold gradient-text mb-2">My Tickets</h2>
            <p className="text-gray-600">Manage your railway bookings</p>
          </div>
          <div className="flex gap-3">
            {tickets.length > 0 && (
              <button
                onClick={handleDownloadAllPDFs}
                className="download-btn px-4 py-2 bg-gradient-to-r from-green-500 to-green-600 text-white text-sm font-medium rounded-lg hover:from-green-600 hover:to-green-700 transition-all duration-300 hover:scale-105 flex items-center"
              >
                📄 Download All
              </button>
            )}
            <button
              onClick={fetchTickets}
              className="px-4 py-2 bg-gradient-to-r from-indigo-500 to-purple-500 text-white text-sm font-medium rounded-lg hover:from-indigo-600 hover:to-purple-600 transition-all duration-300 hover:scale-105"
              disabled={loading}
            >
              🔄 Refresh
            </button>
          </div>
        </div>
      </div>

      {tickets.length === 0 ? (
        <div className="text-center py-16 glass">
          <div className="text-6xl mb-4 float">🎫</div>
          <h3 className="text-xl font-semibold text-gray-800 mb-2">No tickets yet</h3>
          <p className="text-gray-500">You haven't booked any tickets yet.</p>
        </div>
      ) : (
        <div className="grid lg:grid-cols-2 gap-x-8 gap-y-12 mb-16">
          {tickets.map((ticket) => {
            const isCancelled = ticket.status === 'Cancelled';
            const isPending = ticket.status === 'Pending Cancellation';
            const isFlipped = flippedTicketId === ticket.ticket_id;
            const isValidTicket = !isCancelled && !isPending;

            let headerClass = "p-4 text-white flex justify-between items-center font-bold ";
            if (isCancelled) headerClass += "bg-gradient-to-r from-red-500 to-red-600";
            else if (isPending) headerClass += "bg-gradient-to-r from-gray-500 to-gray-600";
            else headerClass += "bg-gradient-to-r from-purple-600 to-indigo-600";

            return (
              <div key={ticket.ticket_id} className="ticket-card">
                {!isFlipped ? (
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

                      <div className="flex justify-between items-center mt-4">
                        <button
                          onClick={(e) => handleDownloadPDF(ticket, e)}
                          className="download-btn text-sm font-semibold text-green-600 hover:text-green-800 flex items-center px-3 py-1 rounded-lg transition-all duration-300"
                        >
                          📄 Download PDF
                        </button>
                        <button
                          onClick={() => setFlippedTicketId(ticket.ticket_id)}
                          className="text-sm font-semibold text-indigo-600 hover:text-indigo-800 px-3 py-1 rounded-lg transition-all duration-300"
                        >
                          View Route Stations ↪
                        </button>
                      </div>
                    </div>

                    <div className="p-4 bg-gray-50 rounded-b-xl">
                      {!isValidTicket ? (
                        isCancelled ? (
                          <div className="text-center text-red-600 bg-red-100 p-3 rounded-md">❌ This ticket has been cancelled.</div>
                        ) : (
                          <div className="text-center text-gray-600 bg-gray-200 p-3 rounded-md">⏳ This ticket is pending cancellation approval.</div>
                        )
                      ) : (
                        <div className="space-y-2">
                          <button
                            onClick={() => handleCancel(ticket)}
                            className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-lg transition-colors duration-200"
                            disabled={cancellingTicket === ticket.ticket_id}
                          >
                            {cancellingTicket === ticket.ticket_id ? '⏳ Submitting...' : '❌ Request Cancellation'}
                          </button>
                          <button
                            onClick={() => openFeedbackModal(ticket)}
                            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg transition-colors duration-200"
                          >
                            💬 Give Feedback
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="ticket-card-back p-6 bg-gradient-to-br from-indigo-700 to-purple-700 rounded-xl text-white">
                    <h3 className="text-xl font-bold mb-6">🚆 Journey Route</h3>
                    <div className="w-full max-w-sm mx-auto">
                      <div className="space-y-3">
                        {/* Route Stations could be shown here if available */}
                      </div>
                    </div>
                    <div className="flex gap-3 mt-6">
                      <button
                        onClick={(e) => handleDownloadPDF(ticket, e)}
                        className="download-btn flex-1 bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded-lg flex items-center justify-center transition-all duration-300"
                      >
                        📄 Download PDF
                      </button>
                      <button
                        onClick={() => setFlippedTicketId(null)}
                        className="flex-1 bg-white/20 hover:bg-white/30 text-white font-bold py-2 px-4 rounded-lg transition-all duration-300 border border-white/30"
                      >
                        ← Back
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Feedback Modal */}
      {showFeedbackModal && feedbackTicket && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-2xl p-8 w-full max-w-md relative">
            <button
              className="absolute top-3 right-3 text-gray-500 hover:text-gray-800 text-2xl"
              onClick={closeFeedbackModal}
              aria-label="Close"
            >
              &times;
            </button>
            <h3 className="text-2xl font-bold mb-4 text-gray-800">Give Feedback for Ticket #{feedbackTicket.ticket_id}</h3>
            <form onSubmit={handleFeedbackSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
                <input
                  type="text"
                  value={feedbackSubject}
                  onChange={e => setFeedbackSubject(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2"
                  required
                  maxLength={100}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Message</label>
                <textarea
                  value={feedbackMessage}
                  onChange={e => setFeedbackMessage(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2"
                  rows={4}
                  required
                />
              </div>
              {feedbackError && <div className="text-red-600 text-sm">{feedbackError}</div>}
              {feedbackSuccess && <div className="text-green-600 text-sm">{feedbackSuccess}</div>}
              <button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg"
                disabled={feedbackLoading}
              >
                {feedbackLoading ? 'Submitting...' : 'Submit Feedback'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default MyTickets;
