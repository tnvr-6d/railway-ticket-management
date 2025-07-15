import React, { useState, useEffect, useCallback } from 'react';
import { getPendingCancellationRequests, confirmCancellationRequest } from '../api/api';

function AdminDashboard({ adminUser }) {
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [processingId, setProcessingId] = useState(null);

    const fetchRequests = useCallback(async () => {
        setLoading(true);
        setError('');
        try {
            const data = await getPendingCancellationRequests();
            setRequests(data || []);
        } catch (err) {
            setError('Failed to fetch cancellation requests.');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchRequests();
    }, [fetchRequests]);

    const handleConfirm = async (ticketId) => {
        if (!window.confirm("Are you sure you want to confirm this cancellation?")) return;

        setProcessingId(ticketId);
        try {
            await confirmCancellationRequest(ticketId, adminUser.admin_id);
            fetchRequests();
        } catch (err) {
            alert('Failed to confirm cancellation: ' + err.message);
        } finally {
            setProcessingId(null);
        }
    };
    
    const formatDate = (dateString) => new Date(dateString).toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' });

    if (loading && requests.length === 0) {
        return <div className="text-center py-10">Loading requests...</div>;
    }

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-3xl font-bold text-gray-800">Pending Cancellations</h2>
                <button onClick={fetchRequests} className="px-4 py-2 bg-blue-100 text-blue-700 text-sm font-medium rounded-md hover:bg-blue-200" disabled={loading}>
                  🔄 Refresh
                </button>
            </div>
            
            {error && <div className="text-red-600 text-center p-4 bg-red-100 rounded-md">{error}</div>}

            {requests.length === 0 && !loading ? (
                <div className="text-center py-12 px-6 bg-white rounded-lg shadow-md">
                    <p className="text-gray-500">No pending cancellation requests found.</p>
                </div>
            ) : (
                <div className="space-y-6">
                    {requests.map(req => (
                        <div key={req.ticket_id} className="bg-white rounded-lg shadow-md p-6">
                            <div className="grid md:grid-cols-3 gap-6">
                             <div>
                                    <h4 className="font-bold text-lg">Ticket #{req.ticket_id}</h4>
                                    <p><strong>Passenger:</strong> {req.passenger_name} (ID: {req.passenger_id})</p>
                                    {/* This is the line to check */}
                                    <p><strong>Seat:</strong> {req.seat_number} <span className="text-gray-500">({req.class_type})</span></p>
                                    <p><strong>Price:</strong> ${req.price}</p>
                                </div>
                                    <div>
                                    <h4 className="font-bold text-lg">Journey Details</h4>
                                    <p><strong>Train:</strong> {req.train_name}</p>
                                    <p><strong>Route:</strong> {req.source} → {req.destination}</p>
                                    <p><strong>Departure:</strong> {formatDate(req.departure_date)}</p>
                                </div>
                                <div className="md:col-span-3 border-t pt-4 mt-4">
                                    <p><strong>Reason for Cancellation:</strong> <span className="text-red-700">{req.cancellation_reason}</span></p>
                                </div>
                            </div>
                             <div className="mt-4 text-right">
                                <button
                                    onClick={() => handleConfirm(req.ticket_id)}
                                    disabled={processingId === req.ticket_id}
                                    className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-6 rounded-lg transition disabled:opacity-50"
                                >
                                    {processingId === req.ticket_id ? 'Processing...' : 'Confirm Cancellation'}
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

export default AdminDashboard;