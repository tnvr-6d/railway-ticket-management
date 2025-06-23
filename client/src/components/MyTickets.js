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
        console.error('Error fetching tickets:', err);
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
      const response = await cancelTicket(ticket.ticket_id, reason);
      alert(response.message || 'Ticket cancelled successfully!');
      
      // Refresh tickets after successful cancellation
      await fetchTickets();
    } catch (error) {
      alert('Failed to cancel ticket: ' + error.message);
      console.error('Cancellation error:', error);
    } finally {
      setCancellingTicket(null);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  const formatTime = (timeString) => {
    return new Date(`1970-01-01T${timeString}`).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Booked': return '#28a745';
      case 'Cancelled': return '#dc3545';
      case 'Completed': return '#6c757d';
      default: return '#007bff';
    }
  };

  if (loading) {
    return (
      <div className="tickets-container">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Loading your tickets...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="tickets-container">
        <div className="error-message">
          <p>❌ {error}</p>
          <button onClick={fetchTickets} className="retry-btn">
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="tickets-container">
      <div className="tickets-header">
        <h3>🎫 My Tickets</h3>
        <button onClick={fetchTickets} className="refresh-btn" disabled={loading}>
          🔄 Refresh
        </button>
      </div>

      {tickets.length === 0 ? (
        <div className="no-tickets">
          <div className="no-tickets-icon">🎫</div>
          <h4>No tickets found</h4>
          <p>You haven't booked any tickets yet. Start by searching for trains!</p>
        </div>
      ) : (
        <div className="tickets-grid">
          {tickets.map((ticket) => (
            <div key={ticket.ticket_id} className="ticket-card">
              <div className="ticket-header">
                <span className="ticket-id">Ticket #{ticket.ticket_id}</span>
                <span 
                  className="ticket-status"
                  style={{ color: getStatusColor(ticket.status) }}
                >
                  {ticket.status}
                </span>
              </div>

              <div className="ticket-details">
                <div className="journey-info">
                  <div className="route">
                    <span className="station">{ticket.source}</span>
                    <span className="arrow">→</span>
                    <span className="station">{ticket.destination}</span>
                  </div>
                  <div className="train-info">
                    <span className="train-name">🚆 {ticket.train_name}</span>
                  </div>
                </div>

                <div className="booking-details">
                  <div className="detail-row">
                    <span className="label">📅 Date:</span>
                    <span className="value">{formatDate(ticket.departure_date)}</span>
                  </div>
                  <div className="detail-row">
                    <span className="label">⏰ Departure:</span>
                    <span className="value">{formatTime(ticket.departure_time)}</span>
                  </div>
                  <div className="detail-row">
                    <span className="label">🪑 Seat:</span>
                    <span className="value">{ticket.seat_number} ({ticket.class_type})</span>
                  </div>
                  <div className="detail-row">
                    <span className="label">🚃 Coach:</span>
                    <span className="value">{ticket.coach_number}</span>
                  </div>
                  <div className="detail-row">
                    <span className="label">💰 Price:</span>
                    <span className="value">${ticket.price}</span>
                  </div>
                  <div className="detail-row">
                    <span className="label">📅 Booked:</span>
                    <span className="value">{formatDate(ticket.booking_date)}</span>
                  </div>
                </div>

                {ticket.status === 'Booked' && (
                  <div className="ticket-actions">
                    <button 
                      onClick={() => handleCancel(ticket)}
                      className="cancel-btn"
                      disabled={cancellingTicket === ticket.ticket_id}
                    >
                      {cancellingTicket === ticket.ticket_id ? (
                        <>
                          <span className="spinner-small"></span>
                          Cancelling...
                        </>
                      ) : (
                        <>
                          ❌ Cancel Ticket
                        </>
                      )}
                    </button>
                  </div>
                )}

                {ticket.status === 'Cancelled' && (
                  <div className="cancellation-info">
                    <p className="cancelled-text">
                      ❌ This ticket has been cancelled
                    </p>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      <style jsx>{`
        .tickets-container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 20px;
        }

        .tickets-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 30px;
        }

        .tickets-header h3 {
          margin: 0;
          font-size: 24px;
          color: #333;
        }

        .refresh-btn {
          background: #007bff;
          color: white;
          border: none;
          padding: 8px 16px;
          border-radius: 6px;
          cursor: pointer;
          font-size: 14px;
          transition: background 0.3s;
        }

        .refresh-btn:hover:not(:disabled) {
          background: #0056b3;
        }

        .refresh-btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .loading-spinner {
          text-align: center;
          padding: 60px 20px;
        }

        .spinner {
          width: 40px;
          height: 40px;
          border: 4px solid #f3f3f3;
          border-top: 4px solid #007bff;
          border-radius: 50%;
          animation: spin 1s linear infinite;
          margin: 0 auto 20px;
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        .spinner-small {
          display: inline-block;
          width: 12px;
          height: 12px;
          border: 2px solid #ffffff;
          border-top: 2px solid transparent;
          border-radius: 50%;
          animation: spin 1s linear infinite;
          margin-right: 8px;
        }

        .error-message {
          text-align: center;
          padding: 40px;
          background: #f8f9fa;
          border-radius: 8px;
          border: 1px solid #dee2e6;
        }

        .retry-btn {
          background: #28a745;
          color: white;
          border: none;
          padding: 10px 20px;
          border-radius: 6px;
          cursor: pointer;
          margin-top: 15px;
        }

        .no-tickets {
          text-align: center;
          padding: 60px 20px;
          background: #f8f9fa;
          border-radius: 12px;
          border: 2px dashed #dee2e6;
        }

        .no-tickets-icon {
          font-size: 48px;
          margin-bottom: 20px;
        }

        .no-tickets h4 {
          color: #495057;
          margin-bottom: 10px;
        }

        .no-tickets p {
          color: #6c757d;
          margin: 0;
        }

        .tickets-grid {
          display: grid;
          gap: 20px;
          grid-template-columns: repeat(auto-fill, minmax(400px, 1fr));
        }

        .ticket-card {
          background: white;
          border-radius: 12px;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
          overflow: hidden;
          border: 1px solid #e9ecef;
          transition: transform 0.3s, box-shadow 0.3s;
        }

        .ticket-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 15px rgba(0, 0, 0, 0.1);
        }

        .ticket-header {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          padding: 15px 20px;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .ticket-id {
          font-weight: bold;
          font-size: 16px;
        }

        .ticket-status {
          background: rgba(255, 255, 255, 0.2);
          padding: 4px 12px;
          border-radius: 20px;
          font-size: 12px;
          font-weight: bold;
        }

        .ticket-details {
          padding: 20px;
        }

        .journey-info {
          margin-bottom: 20px;
        }

        .route {
          display: flex;
          align-items: center;
          gap: 15px;
          margin-bottom: 10px;
        }

        .station {
          font-weight: bold;
          color: #333;
          font-size: 18px;
        }

        .arrow {
          color: #007bff;
          font-size: 20px;
          font-weight: bold;
        }

        .train-info {
          color: #666;
          font-size: 14px;
        }

        .booking-details {
          display: grid;
          gap: 8px;
          margin-bottom: 20px;
        }

        .detail-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 8px 0;
          border-bottom: 1px solid #f8f9fa;
        }

        .detail-row:last-child {
          border-bottom: none;
        }

        .label {
          font-weight: bold;
          color: #495057;
          font-size: 14px;
        }

        .value {
          color: #333;
          font-size: 14px;
        }

        .ticket-actions {
          border-top: 1px solid #e9ecef;
          padding-top: 15px;
        }

        .cancel-btn {
          background: #dc3545;
          color: white;
          border: none;
          padding: 10px 20px;
          border-radius: 6px;
          cursor: pointer;
          font-size: 14px;
          font-weight: bold;
          transition: background 0.3s;
          width: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .cancel-btn:hover:not(:disabled) {
          background: #c82333;
        }

        .cancel-btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .cancellation-info {
          background: #f8d7da;
          border: 1px solid #f5c6cb;
          border-radius: 6px;
          padding: 15px;
          margin-top: 15px;
        }

        .cancelled-text {
          color: #721c24;
          margin: 0;
          font-weight: bold;
          text-align: center;
        }

        @media (max-width: 768px) {
          .tickets-grid {
            grid-template-columns: 1fr;
          }
          
          .tickets-header {
            flex-direction: column;
            gap: 15px;
            align-items: stretch;
          }
        }
      `}</style>
    </div>
  );
}

export default MyTickets;

