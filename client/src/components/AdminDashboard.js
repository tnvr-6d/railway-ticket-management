import React, { useState, useEffect, useCallback } from 'react';
import {
  getPendingCancellationRequests,
  confirmCancellationRequest,
  adminGetAllSchedules,
  adminGetAllTrains,
  adminGetAllRoutes,
  adminGetAllStations,
  adminGetAllClasses,
  adminGetAllCoaches,
  adminCreateSchedule,
  adminUpdateSchedule,
  adminDeleteSchedule,
  adminCreateTrain,
  adminUpdateTrain,
  adminDeleteTrain,
  adminGetSeatInventoryByTrain,
  adminGetSeatInventoryBySchedule,
  adminAddSeatToSchedule,
  adminBulkAddSeatsToSchedule,
  adminUpdateSeatAvailability,
  adminDeleteSeat,
  adminGetScheduleByTrain,
  getAllFeedback,
  updateFeedbackStatus,
  createCoach,
  updateCoach,
  deleteCoach,
  getAllPassengers,
  createDiscount,
  sendNotification,
  updateDiscountStatus,
  getDiscountsByPassenger
} from '../api/api';
import TrainLocationUploader from './TrainLocationUploader';


function AdminDashboard({ adminUser }) {
    const [activeTab, setActiveTab] = useState('cancellations');
    const [requests, setRequests] = useState([]);
    const [schedules, setSchedules] = useState([]);
    const [trains, setTrains] = useState([]);
    const [routes, setRoutes] = useState([]);
    const [stations, setStations] = useState([]);
    const [classes, setClasses] = useState([]);
    const [coaches, setCoaches] = useState([]);
    const [seatInventory, setSeatInventory] = useState([]);
    const [selectedTrain, setSelectedTrain] = useState('');
    const [selectedSchedule, setSelectedSchedule] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [processingId, setProcessingId] = useState(null);
    const [showCreateSchedule, setShowCreateSchedule] = useState(false);
    const [showCreateTrain, setShowCreateTrain] = useState(false);
    const [showAddSeat, setShowAddSeat] = useState(false);
    const [showBulkAddSeat, setShowBulkAddSeat] = useState(false);
    const [editingSchedule, setEditingSchedule] = useState(null);
    const [editingTrain, setEditingTrain] = useState(null);
    const [feedbacks, setFeedbacks] = useState([]);
    const [feedbackLoading, setFeedbackLoading] = useState(false);
    const [feedbackError, setFeedbackError] = useState('');
    const [feedbackStatusUpdating, setFeedbackStatusUpdating] = useState(null);
    const [showUploader, setShowUploader] = useState(false);
    const [showCreateCoach, setShowCreateCoach] = useState(false);
    const [editingCoach, setEditingCoach] = useState(null);
    const [passengers, setPassengers] = useState([]);
    const [showDiscountModal, setShowDiscountModal] = useState(false);
    const [selectedPassenger, setSelectedPassenger] = useState(null);
    const [discountForm, setDiscountForm] = useState({
        discount_percentage: '',
        code: ''
    });

    // Form states
    const [scheduleForm, setScheduleForm] = useState({
        train_id: '',
        route_id: '',
        departure_time: '',
        arrival_time: '',
        departure_date: '',
        status: 'On Time',
        coach_id: ''
    });

    const [trainForm, setTrainForm] = useState({
        train_name: '',
        total_seats: '',
        description: ''
    });

    const [seatForm, setSeatForm] = useState({
        seat_number: '',
        class_id: '',
        coach_id: '',
        row_number: '',
        column_number: ''
    });
    const [bulkSeatForm, setBulkSeatForm] = useState({
        coach_id: '',
        total_seats: '',
        seats_per_row: 4
    });

    const [coachForm, setCoachForm] = useState({
        coach_number: '',
        class_id: ''
    });

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

    const fetchSchedules = useCallback(async () => {
        try {
            const data = await adminGetAllSchedules();
            setSchedules(data || []);
        } catch (err) {
            setError('Failed to fetch schedules.');
        }
    }, []);

    const fetchTrains = useCallback(async () => {
        try {
            const data = await adminGetAllTrains();
            setTrains(data || []);
        } catch (err) {
            setError('Failed to fetch trains.');
        }
    }, []);

    const fetchSupportingData = useCallback(async () => {
        try {
            const [routesData, stationsData, classesData, coachesData] = await Promise.all([
                adminGetAllRoutes(),
                adminGetAllStations(),
                adminGetAllClasses(),
                adminGetAllCoaches()
            ]);
            setRoutes(routesData || []);
            setStations(stationsData || []);
            setClasses(classesData || []);
            setCoaches(coachesData || []);
        } catch (err) {
            setError('Failed to fetch supporting data.');
        }
    }, []);

    const fetchSeatInventory = useCallback(async (scheduleId) => {
        if (!scheduleId) return;
        try {
            const data = await adminGetSeatInventoryBySchedule(scheduleId);
            setSeatInventory(data || []);
        } catch (err) {
            setError('Failed to fetch seat inventory.');
        }
    }, []);

    const fetchFeedbacks = useCallback(async () => {
        setFeedbackLoading(true);
        setFeedbackError('');
        try {
            const data = await getAllFeedback();
            setFeedbacks(data || []);
        } catch (err) {
            setFeedbackError('Failed to fetch feedback.');
        } finally {
            setFeedbackLoading(false);
        }
    }, []);

    const fetchPassengers = useCallback(async () => {
        try {
            const data = await getAllPassengers();
            setPassengers(data || []);
        } catch (err) {
            setError('Failed to fetch passengers.');
        }
    }, []);

    useEffect(() => {
        fetchRequests();
        fetchSchedules();
        fetchTrains();
        fetchSupportingData();
        fetchFeedbacks();
        fetchPassengers();
    }, [fetchRequests, fetchSchedules, fetchTrains, fetchSupportingData, fetchFeedbacks, fetchPassengers]);

    useEffect(() => {
        if (selectedSchedule) {
            fetchSeatInventory(selectedSchedule);
        } else {
            setSeatInventory([]);
        }
    }, [selectedSchedule, fetchSeatInventory]);

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

    const handleCreateSchedule = async (e) => {
        e.preventDefault();
        try {
            await adminCreateSchedule(scheduleForm);
            setShowCreateSchedule(false);
            setScheduleForm({
                train_id: '',
                route_id: '',
                departure_time: '',
                arrival_time: '',
                departure_date: '',
                status: 'On Time',
                coach_id: ''
            });
            fetchSchedules();
        } catch (err) {
            alert('Failed to create schedule: ' + err.message);
        }
    };

    const handleUpdateSchedule = async (e) => {
        e.preventDefault();
        try {
            await adminUpdateSchedule(editingSchedule.schedule_id, scheduleForm);
            setEditingSchedule(null);
            setScheduleForm({
                train_id: '',
                route_id: '',
                departure_time: '',
                arrival_time: '',
                departure_date: '',
                status: 'On Time',
                coach_id: ''
            });
            fetchSchedules();
        } catch (err) {
            alert('Failed to update schedule: ' + err.message);
        }
    };

    const handleDeleteSchedule = async (scheduleId) => {
        if (!window.confirm("Are you sure you want to delete this schedule?")) return;
        try {
            await adminDeleteSchedule(scheduleId);
            fetchSchedules();
        } catch (err) {
            alert('Failed to delete schedule: ' + err.message);
        }
    };

    const handleCreateTrain = async (e) => {
        e.preventDefault();
        try {
            await adminCreateTrain(trainForm);
            setShowCreateTrain(false);
            setTrainForm({
                train_name: '',
                total_seats: '',
                description: ''
            });
            fetchTrains();
        } catch (err) {
            alert('Failed to create train: ' + err.message);
        }
    };

    const handleUpdateTrain = async (e) => {
        e.preventDefault();
        try {
            await adminUpdateTrain(editingTrain.train_id, trainForm);
            setEditingTrain(null);
            setTrainForm({
                train_name: '',
                total_seats: '',
                description: ''
            });
            fetchTrains();
        } catch (err) {
            alert('Failed to update train: ' + err.message);
        }
    };

    const handleDeleteTrain = async (trainId) => {
        if (!window.confirm("Are you sure you want to delete this train?")) return;
        try {
            await adminDeleteTrain(trainId);
            fetchTrains();
        } catch (err) {
            alert('Failed to delete train: ' + err.message);
        }
    };

    const handleAddSeat = async (e) => {
        e.preventDefault();
        try {
            await adminAddSeatToSchedule(selectedSchedule, seatForm);
            setShowAddSeat(false);
            setSeatForm({
                seat_number: '',
                class_id: '',
                coach_id: '',
                row_number: '',
                column_number: ''
            });
            fetchSeatInventory(selectedSchedule);
        } catch (err) {
            alert('Failed to add seat: ' + err.message);
        }
    };

    const handleBulkAddSeats = async (e) => {
        e.preventDefault();
        try {
            await adminBulkAddSeatsToSchedule(selectedSchedule, bulkSeatForm);
            setShowBulkAddSeat(false);
            setBulkSeatForm({
                coach_id: '',
                total_seats: '',
                seats_per_row: 4
            });
            fetchSeatInventory(selectedSchedule);
        } catch (err) {
            alert('Failed to add bulk seats: ' + err.message);
        }
    };

    const handleUpdateSeatAvailability = async (inventoryId, isAvailable) => {
        try {
            await adminUpdateSeatAvailability(inventoryId, isAvailable);
            fetchSeatInventory(selectedSchedule);
        } catch (err) {
            alert('Failed to update seat availability: ' + err.message);
        }
    };

    const handleDeleteSeat = async (inventoryId) => {
        if (!window.confirm("Are you sure you want to delete this seat?")) return;
        try {
            await adminDeleteSeat(inventoryId);
            fetchSeatInventory(selectedSchedule);
        } catch (err) {
            alert('Failed to delete seat: ' + err.message);
        }
    };

    const editSchedule = (schedule) => {
        setEditingSchedule(schedule);
        setScheduleForm({
            train_id: schedule.train_id,
            route_id: schedule.route_id,
            departure_time: schedule.departure_time,
            arrival_time: schedule.arrival_time,
            departure_date: schedule.departure_date,
            status: schedule.status,
            coach_id: schedule.coach_id || ''
        });
    };

    const editTrain = (train) => {
        setEditingTrain(train);
        setTrainForm({
            train_name: train.train_name,
            total_seats: train.total_seats,
            description: train.description
        });
    };

    // Coach Management Functions
    const handleCreateCoach = async (e) => {
        e.preventDefault();
        try {
            await createCoach(coachForm);
            setShowCreateCoach(false);
            setCoachForm({
                coach_number: '',
                class_id: ''
            });
            fetchSupportingData(); // Refresh coaches data
        } catch (err) {
            alert('Failed to create coach: ' + err.message);
        }
    };

    const handleUpdateCoach = async (e) => {
        e.preventDefault();
        try {
            await updateCoach(editingCoach.coach_id, coachForm);
            setEditingCoach(null);
            setCoachForm({
                coach_number: '',
                class_id: ''
            });
            fetchSupportingData(); // Refresh coaches data
        } catch (err) {
            alert('Failed to update coach: ' + err.message);
        }
    };

    const handleDeleteCoach = async (coachId) => {
        if (!window.confirm("Are you sure you want to delete this coach?")) return;
        try {
            await deleteCoach(coachId);
            fetchSupportingData(); // Refresh coaches data
        } catch (err) {
            alert('Failed to delete coach: ' + err.message);
        }
    };

    const editCoach = (coach) => {
        setEditingCoach(coach);
        setCoachForm({
            coach_number: coach.coach_number,
            class_id: coach.class_id.toString()
        });
    };

    const handleCreateDiscount = async (e) => {
        e.preventDefault();
        try {
            const discountResult = await createDiscount({
                ...discountForm,
                passenger_id: selectedPassenger.passenger_id,
                processed_by: adminUser.admin_id
            });
            
            // Try to send notification to passenger (don't fail if notification fails)
            let notificationSent = true;
            try {
                await sendNotification({
                    passenger_id: selectedPassenger.passenger_id,
                    title: "Discount Activated! 🎉",
                    message: `Congratulations! You have received a ${discountForm.discount_percentage}% discount. Use code "${discountForm.code}" during your next ticket booking to get the discount.`,
                    type: "discount"
                });
            } catch (notificationError) {
                console.warn('Failed to send notification:', notificationError);
                notificationSent = false;
                // Continue with discount creation even if notification fails
            }
            
            setShowDiscountModal(false);
            setSelectedPassenger(null);
            setDiscountForm({
                discount_percentage: '',
                code: ''
            });
            fetchPassengers(); // Refresh passenger data
            alert(`Discount activated successfully!${!notificationSent ? ' (Notification failed to send)' : ''}`);
        } catch (err) {
            alert('Failed to create discount: ' + err.message);
        }
    };

    const handleActivateDiscount = (passenger) => {
        setSelectedPassenger(passenger);
        setShowDiscountModal(true);
    };

    const handleViewPassengerInfo = (passenger) => {
        alert(`Passenger Information:\n\nName: ${passenger.passenger_name}\nEmail: ${passenger.email}\nPhone: ${passenger.phone}\nAddress: ${passenger.address}\nCreated: ${new Date(passenger.created_at).toLocaleDateString()}`);
    };

    const handleDeactivateDiscount = async (passenger) => {
        if (!window.confirm(`Are you sure you want to deactivate the discount for ${passenger.passenger_name}?`)) return;
        
        try {
            // Find the discount for this passenger
            const discounts = await getDiscountsByPassenger(passenger.passenger_id);
            
            if (discounts.length > 0) {
                const discount = discounts[0];
                await updateDiscountStatus(discount.discount_id, false);
                
                // Try to send notification to passenger (don't fail if notification fails)
                let notificationSent = true;
                try {
                    await sendNotification({
                        passenger_id: passenger.passenger_id,
                        title: "Discount Deactivated",
                        message: `Your discount code "${discount.code}" has been deactivated. Please contact support if you have any questions.`,
                        type: "discount"
                    });
                } catch (notificationError) {
                    console.warn('Failed to send notification:', notificationError);
                    notificationSent = false;
                    // Continue with deactivation even if notification fails
                }
                
                fetchPassengers(); // Refresh passenger data
                alert(`Discount deactivated successfully!${!notificationSent ? ' (Notification failed to send)' : ''}`);
            } else {
                alert('No active discount found for this passenger.');
            }
        } catch (err) {
            alert('Failed to deactivate discount: ' + err.message);
        }
    };

    const formatDate = (dateString) => new Date(dateString).toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' });

    const handleMarkReviewed = async (feedback_id) => {
        setFeedbackStatusUpdating(feedback_id);
        try {
            await updateFeedbackStatus(feedback_id, 'Reviewed');
            await fetchFeedbacks();
        } catch (err) {
            alert('Failed to update feedback status: ' + err.message);
        } finally {
            setFeedbackStatusUpdating(null);
        }
    };

    const renderCancellationsTab = () => (
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

    const renderSchedulesTab = () => (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-3xl font-bold text-gray-800">Schedule Management</h2>
                <button 
                    onClick={() => setShowCreateSchedule(true)} 
                    className="px-4 py-2 bg-green-600 text-white font-medium rounded-md hover:bg-green-700"
                >
                    + Add Schedule
                </button>
            </div>

            <div className="bg-white rounded-lg shadow-md overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Schedule ID</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Train</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Route</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Departure</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Arrival</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {schedules.map(schedule => (
                                <tr key={schedule.schedule_id}>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{schedule.schedule_id}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{schedule.train_name}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{schedule.source} → {schedule.destination}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{formatDate(schedule.departure_date)}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{schedule.arrival_time}</td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                            schedule.status === 'On Time' ? 'bg-green-100 text-green-800' :
                                            schedule.status === 'Delayed' ? 'bg-yellow-100 text-yellow-800' :
                                            'bg-red-100 text-red-800'
                                        }`}>
                                            {schedule.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                        <button
                                            onClick={() => editSchedule(schedule)}
                                            className="text-indigo-600 hover:text-indigo-900 mr-3"
                                        >
                                            Edit
                                        </button>
                                        <button
                                            onClick={() => handleDeleteSchedule(schedule.schedule_id)}
                                            className="text-red-600 hover:text-red-900"
                                        >
                                            Delete
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Create/Edit Schedule Modal */}
            {(showCreateSchedule || editingSchedule) && (
                <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
                    <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
                        <div className="mt-3">
                            <h3 className="text-lg font-medium text-gray-900 mb-4">
                                {editingSchedule ? 'Edit Schedule' : 'Create New Schedule'}
                            </h3>
                            <form onSubmit={editingSchedule ? handleUpdateSchedule : handleCreateSchedule}>
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Train</label>
                                        <select
                                            value={scheduleForm.train_id}
                                            onChange={(e) => setScheduleForm({...scheduleForm, train_id: e.target.value})}
                                            className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                                            required
                                        >
                                            <option value="">Select Train</option>
                                            {trains.map(train => (
                                                <option key={train.train_id} value={train.train_id}>
                                                    {train.train_name}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Route</label>
                                        <select
                                            value={scheduleForm.route_id}
                                            onChange={(e) => setScheduleForm({...scheduleForm, route_id: e.target.value})}
                                            className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                                            required
                                        >
                                            <option value="">Select Route</option>
                                            {routes.map(route => (
                                                <option key={route.route_id} value={route.route_id}>
                                                    {route.source} → {route.destination}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Coach</label>
                                        <select
                                            value={scheduleForm.coach_id}
                                            onChange={(e) => setScheduleForm({...scheduleForm, coach_id: e.target.value})}
                                            className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                                            required
                                        >
                                            <option value="">Select Coach</option>
                                            {coaches.map(coach => (
                                                <option key={coach.coach_id} value={coach.coach_id}>
                                                    {coach.coach_number} - {coach.class_type}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Departure Date</label>
                                        <input
                                            type="date"
                                            value={scheduleForm.departure_date}
                                            onChange={(e) => setScheduleForm({...scheduleForm, departure_date: e.target.value})}
                                            className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                                            required
                                        />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">Departure Time</label>
                                            <input
                                                type="time"
                                                value={scheduleForm.departure_time}
                                                onChange={(e) => setScheduleForm({...scheduleForm, departure_time: e.target.value})}
                                                className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                                                required
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">Arrival Time</label>
                                            <input
                                                type="time"
                                                value={scheduleForm.arrival_time}
                                                onChange={(e) => setScheduleForm({...scheduleForm, arrival_time: e.target.value})}
                                                className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                                                required
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Status</label>
                                        <select
                                            value={scheduleForm.status}
                                            onChange={(e) => setScheduleForm({...scheduleForm, status: e.target.value})}
                                            className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                                        >
                                            <option value="On Time">On Time</option>
                                            <option value="Delayed">Delayed</option>
                                            <option value="Cancelled">Cancelled</option>
                                        </select>
                                    </div>
                                </div>
                                <div className="flex justify-end space-x-3 mt-6">
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setShowCreateSchedule(false);
                                            setEditingSchedule(null);
                                            setScheduleForm({
                                                train_id: '',
                                                route_id: '',
                                                departure_time: '',
                                                arrival_time: '',
                                                departure_date: '',
                                                status: 'On Time',
                                                coach_id: ''
                                            });
                                        }}
                                        className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700"
                                    >
                                        {editingSchedule ? 'Update' : 'Create'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );

    const renderTrainsTab = () => (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-3xl font-bold text-gray-800">Train Management</h2>
                <button 
                    onClick={() => setShowCreateTrain(true)} 
                    className="px-4 py-2 bg-green-600 text-white font-medium rounded-md hover:bg-green-700"
                >
                    + Add Train
                </button>
            </div>

            <div className="bg-white rounded-lg shadow-md overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Train ID</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Seats</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {trains.map(train => (
                                <tr key={train.train_id}>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{train.train_id}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{train.train_name}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{train.total_seats}</td>
                                    <td className="px-6 py-4 text-sm text-gray-900">{train.description}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                        <button
                                            onClick={() => editTrain(train)}
                                            className="text-indigo-600 hover:text-indigo-900 mr-3"
                                        >
                                            Edit
                                        </button>
                                        <button
                                            onClick={() => handleDeleteTrain(train.train_id)}
                                            className="text-red-600 hover:text-red-900"
                                        >
                                            Delete
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Create/Edit Train Modal */}
            {(showCreateTrain || editingTrain) && (
                <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
                    <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
                        <div className="mt-3">
                            <h3 className="text-lg font-medium text-gray-900 mb-4">
                                {editingTrain ? 'Edit Train' : 'Create New Train'}
                            </h3>
                            <form onSubmit={editingTrain ? handleUpdateTrain : handleCreateTrain}>
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Train Name</label>
                                        <input
                                            type="text"
                                            value={trainForm.train_name}
                                            onChange={(e) => setTrainForm({...trainForm, train_name: e.target.value})}
                                            className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                                            required
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Total Seats</label>
                                        <input
                                            type="number"
                                            value={trainForm.total_seats}
                                            onChange={(e) => setTrainForm({...trainForm, total_seats: e.target.value})}
                                            className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Description</label>
                                        <textarea
                                            value={trainForm.description}
                                            onChange={(e) => setTrainForm({...trainForm, description: e.target.value})}
                                            className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                                            rows="3"
                                        />
                                    </div>
                                </div>
                                <div className="flex justify-end space-x-3 mt-6">
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setShowCreateTrain(false);
                                            setEditingTrain(null);
                                            setTrainForm({
                                                train_name: '',
                                                coach_number: '',
                                                class_type: '',
                                                total_seats: '',
                                                description: ''
                                            });
                                        }}
                                        className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700"
                                    >
                                        {editingTrain ? 'Update' : 'Create'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );

    const renderSeatInventoryTab = () => (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-3xl font-bold text-gray-800">Seat Inventory Management</h2>
                <div className="flex space-x-3">
                    <button 
                        onClick={() => setShowAddSeat(true)} 
                        className="px-4 py-2 bg-green-600 text-white font-medium rounded-md hover:bg-green-700"
                        disabled={!selectedSchedule}
                    >
                        + Add Single Seat
                    </button>
                    <button 
                        onClick={() => setShowBulkAddSeat(true)} 
                        className="px-4 py-2 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700"
                        disabled={!selectedSchedule}
                    >
                        + Add Bulk Seats
                    </button>
                </div>
            </div>

            <div className="mb-6">
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Select Train</label>
                        <select
                            value={selectedTrain}
                            onChange={(e) => {
                                setSelectedTrain(e.target.value);
                                setSelectedSchedule('');
                                setSeatInventory([]);
                            }}
                            className="block w-full border border-gray-300 rounded-md px-3 py-2"
                        >
                            <option value="">Select a train</option>
                            {trains.map(train => (
                                <option key={train.train_id} value={train.train_id}>
                                    {train.train_name}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Select Schedule</label>
                        <select
                            value={selectedSchedule}
                            onChange={(e) => setSelectedSchedule(e.target.value)}
                            className="block w-full border border-gray-300 rounded-md px-3 py-2"
                            disabled={!selectedTrain}
                        >
                            <option value="">Select a schedule</option>
                            {schedules
                                .filter(schedule => schedule.train_id == selectedTrain)
                                .map(schedule => (
                                    <option key={schedule.schedule_id} value={schedule.schedule_id}>
                                        {formatDate(schedule.departure_date)} - {schedule.source} → {schedule.destination}
                                    </option>
                                ))}
                        </select>
                    </div>
                </div>
            </div>

            {selectedSchedule && (
                <div className="bg-white rounded-lg shadow-md overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Seat Number</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Coach</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Class</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Row/Column</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {seatInventory.map(seat => (
                                    <tr key={seat.inventory_id}>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{seat.seat_number}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{seat.coach_number}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{seat.class_type}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{seat.row_number}/{seat.column_number}</td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                                seat.is_available ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                            }`}>
                                                {seat.is_available ? 'Available' : 'Booked'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                            <button
                                                onClick={() => handleUpdateSeatAvailability(seat.inventory_id, !seat.is_available)}
                                                className={`mr-3 ${
                                                    seat.is_available 
                                                        ? 'text-red-600 hover:text-red-900' 
                                                        : 'text-green-600 hover:text-green-900'
                                                }`}
                                            >
                                                {seat.is_available ? 'Mark Booked' : 'Mark Available'}
                                            </button>
                                            <button
                                                onClick={() => handleDeleteSeat(seat.inventory_id)}
                                                className="text-red-600 hover:text-red-900"
                                            >
                                                Delete
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Add Seat Modal */}
            {showAddSeat && (
                <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
                    <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
                        <div className="mt-3">
                            <h3 className="text-lg font-medium text-gray-900 mb-4">Add New Seat</h3>
                            <form onSubmit={handleAddSeat}>
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Seat Number</label>
                                        <input
                                            type="text"
                                            value={seatForm.seat_number}
                                            onChange={(e) => setSeatForm({...seatForm, seat_number: e.target.value})}
                                            className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                                            placeholder="e.g., A1, B2, C3"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Class</label>
                                        <select
                                            value={seatForm.class_id}
                                            onChange={(e) => {
                                                setSeatForm({
                                                    ...seatForm, 
                                                    class_id: e.target.value,
                                                    coach_id: '' // Reset coach when class changes
                                                });
                                            }}
                                            className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                                            required
                                        >
                                            <option value="">Select Class</option>
                                            {classes.map(cls => (
                                                <option key={cls.class_id} value={cls.class_id}>
                                                    {cls.class_type}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Coach</label>
                                        <select
                                            value={seatForm.coach_id}
                                            onChange={(e) => setSeatForm({...seatForm, coach_id: e.target.value})}
                                            className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                                            required
                                            disabled={!seatForm.class_id}
                                        >
                                            <option value="">Select Coach</option>
                                            {coaches
                                                .filter(coach => {
                                                    if (!seatForm.class_id) return true;
                                                    return coach.class_id === parseInt(seatForm.class_id);
                                                })
                                                .map(coach => (
                                                    <option key={coach.coach_id} value={coach.coach_id}>
                                                        {coach.coach_number} - {coach.class_type}
                                                    </option>
                                                ))
                                            }
                                        </select>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">Row Number</label>
                                            <input
                                                type="number"
                                                value={seatForm.row_number}
                                                onChange={(e) => setSeatForm({...seatForm, row_number: e.target.value})}
                                                className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                                                required
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">Column Number</label>
                                            <input
                                                type="number"
                                                value={seatForm.column_number}
                                                onChange={(e) => setSeatForm({...seatForm, column_number: e.target.value})}
                                                className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                                                required
                                            />
                                        </div>
                                    </div>
                                </div>
                                <div className="flex justify-end space-x-3 mt-6">
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setShowAddSeat(false);
                                            setSeatForm({
                                                seat_number: '',
                                                class_id: '',
                                                coach_id: '',
                                                row_number: '',
                                                column_number: ''
                                            });
                                        }}
                                        className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700"
                                    >
                                        Add Seat
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}

            {/* Bulk Add Seats Modal */}
            {showBulkAddSeat && (
                <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
                    <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
                        <div className="mt-3">
                            <h3 className="text-lg font-medium text-gray-900 mb-4">Add Bulk Seats</h3>
                            <form onSubmit={handleBulkAddSeats}>
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Select Coach</label>
                                        <select
                                            value={bulkSeatForm.coach_id}
                                            onChange={(e) => setBulkSeatForm({...bulkSeatForm, coach_id: e.target.value})}
                                            className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                                            required
                                        >
                                            <option value="">Select a coach</option>
                                            {coaches.map(coach => (
                                                <option key={coach.coach_id} value={coach.coach_id}>
                                                    {coach.coach_number} - {coach.class_type}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Total Number of Seats</label>
                                        <input
                                            type="number"
                                            min="1"
                                            max="100"
                                            value={bulkSeatForm.total_seats}
                                            onChange={(e) => setBulkSeatForm({...bulkSeatForm, total_seats: e.target.value})}
                                            className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                                            placeholder="e.g., 20"
                                            required
                                        />
                                        <p className="text-xs text-gray-500 mt-1">Maximum 100 seats per bulk operation</p>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Seats Per Row</label>
                                        <select
                                            value={bulkSeatForm.seats_per_row}
                                            onChange={(e) => setBulkSeatForm({...bulkSeatForm, seats_per_row: parseInt(e.target.value)})}
                                            className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                                        >
                                            <option value="2">2 seats per row</option>
                                            <option value="3">3 seats per row</option>
                                            <option value="4">4 seats per row</option>
                                            <option value="6">6 seats per row</option>
                                        </select>
                                    </div>
                                    <div className="bg-blue-50 p-3 rounded-md">
                                        <h4 className="text-sm font-medium text-blue-800 mb-2">Seat Naming Convention:</h4>
                                        <p className="text-xs text-blue-700">
                                            Seats will be named as: <strong>coach-{bulkSeatForm.coach_id || 'X'}-1</strong>, <strong>coach-{bulkSeatForm.coach_id || 'X'}-2</strong>, etc.
                                        </p>
                                    </div>
                                </div>
                                <div className="flex justify-end space-x-3 mt-6">
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setShowBulkAddSeat(false);
                                            setBulkSeatForm({
                                                coach_id: '',
                                                total_seats: '',
                                                seats_per_row: 4
                                            });
                                        }}
                                        className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700"
                                    >
                                        Add Bulk Seats
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );

    const renderFeedbackTab = () => (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-3xl font-bold text-gray-800">Passenger Feedback</h2>
                <button onClick={fetchFeedbacks} className="px-4 py-2 bg-blue-100 text-blue-700 text-sm font-medium rounded-md hover:bg-blue-200" disabled={feedbackLoading}>
                    🔄 Refresh
                </button>
            </div>
            {feedbackError && <div className="text-red-600 text-center p-4 bg-red-100 rounded-md">{feedbackError}</div>}
            {feedbackLoading ? (
                <div className="text-center py-10 text-gray-500">Loading feedback...</div>
            ) : feedbacks.length === 0 ? (
                <div className="text-center py-12 px-6 bg-white rounded-lg shadow-md">
                    <p className="text-gray-500">No feedback found.</p>
                </div>
            ) : (
                <div className="bg-white rounded-lg shadow-md overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Feedback ID</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Passenger</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ticket</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Subject</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Message</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created At</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {feedbacks.map(fb => (
                                <tr key={fb.feedback_id}>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{fb.feedback_id}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{fb.passenger_name} (ID: {fb.passenger_id})</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{fb.ticket_id} <span className="text-gray-500">({fb.train_name})</span></td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{fb.subject}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 max-w-xs truncate" title={fb.message}>{fb.message}</td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                            fb.status === 'Reviewed' ? 'bg-green-100 text-green-800' :
                                            fb.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' :
                                            'bg-gray-100 text-gray-800'
                                        }`}>
                                            {fb.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        {fb.status !== 'Reviewed' && (
                                            <button
                                                onClick={() => handleMarkReviewed(fb.feedback_id)}
                                                className="px-3 py-1 bg-green-600 hover:bg-green-700 text-white text-xs rounded-md font-semibold disabled:opacity-50"
                                                disabled={feedbackStatusUpdating === fb.feedback_id}
                                            >
                                                {feedbackStatusUpdating === fb.feedback_id ? 'Marking...' : 'Mark Reviewed'}
                                            </button>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{new Date(fb.created_at).toLocaleString()}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );

    const renderCoachesTab = () => (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-3xl font-bold text-gray-800">Coach Management</h2>
                <button 
                    onClick={() => setShowCreateCoach(true)} 
                    className="px-4 py-2 bg-green-600 text-white font-medium rounded-md hover:bg-green-700"
                >
                    + Add Coach
                </button>
            </div>

            <div className="bg-white rounded-lg shadow-md overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Coach ID</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Coach Number</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Class Type</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {coaches.map(coach => (
                                <tr key={coach.coach_id}>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{coach.coach_id}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{coach.coach_number}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{coach.class_type}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                        <button
                                            onClick={() => editCoach(coach)}
                                            className="text-indigo-600 hover:text-indigo-900 mr-3"
                                        >
                                            Edit
                                        </button>
                                        <button
                                            onClick={() => handleDeleteCoach(coach.coach_id)}
                                            className="text-red-600 hover:text-red-900"
                                        >
                                            Delete
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Create/Edit Coach Modal */}
            {(showCreateCoach || editingCoach) && (
                <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
                    <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
                        <div className="mt-3">
                            <h3 className="text-lg font-medium text-gray-900 mb-4">
                                {editingCoach ? 'Edit Coach' : 'Create New Coach'}
                            </h3>
                            <form onSubmit={editingCoach ? handleUpdateCoach : handleCreateCoach}>
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Coach Number</label>
                                        <input
                                            type="text"
                                            value={coachForm.coach_number}
                                            onChange={(e) => setCoachForm({...coachForm, coach_number: e.target.value})}
                                            className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                                            placeholder="e.g., A1, B2, C3"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Class</label>
                                        <select
                                            value={coachForm.class_id}
                                            onChange={(e) => setCoachForm({...coachForm, class_id: e.target.value})}
                                            className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                                            required
                                        >
                                            <option value="">Select Class</option>
                                            {classes.map(cls => (
                                                <option key={cls.class_id} value={cls.class_id}>
                                                    {cls.class_type}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                                <div className="flex justify-end space-x-3 mt-6">
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setShowCreateCoach(false);
                                            setEditingCoach(null);
                                            setCoachForm({
                                                coach_number: '',
                                                class_id: ''
                                            });
                                        }}
                                        className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700"
                                    >
                                        {editingCoach ? 'Update' : 'Create'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );

    const renderDiscountsTab = () => (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-3xl font-bold text-gray-800">Discount Management</h2>
                <button 
                    onClick={fetchPassengers} 
                    className="px-4 py-2 bg-blue-100 text-blue-700 text-sm font-medium rounded-md hover:bg-blue-200"
                >
                    🔄 Refresh
                </button>
            </div>

            <div className="bg-white rounded-lg shadow-md overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Passenger ID</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Phone</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Active Discount</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {passengers.map(passenger => (
                                <tr key={passenger.passenger_id}>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{passenger.passenger_id}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{passenger.passenger_name}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{passenger.email}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{passenger.phone}</td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        {passenger.active_discount ? (
                                            <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                                                {passenger.discount_code} ({passenger.discount_percentage}%)
                                            </span>
                                        ) : (
                                            <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800">
                                                No Discount
                                            </span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                        {passenger.active_discount ? (
                                            <>
                                                <button
                                                    onClick={() => handleDeactivateDiscount(passenger)}
                                                    className="text-red-600 hover:text-red-900 mr-3"
                                                >
                                                    Deactivate Discount
                                                </button>
                                                <button
                                                    onClick={() => handleViewPassengerInfo(passenger)}
                                                    className="text-blue-600 hover:text-blue-900"
                                                >
                                                    Info
                                                </button>
                                            </>
                                        ) : (
                                            <>
                                                <button
                                                    onClick={() => handleActivateDiscount(passenger)}
                                                    className="text-green-600 hover:text-green-900 mr-3"
                                                >
                                                    Activate Discount
                                                </button>
                                                <button
                                                    onClick={() => handleViewPassengerInfo(passenger)}
                                                    className="text-blue-600 hover:text-blue-900"
                                                >
                                                    Info
                                                </button>
                                            </>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Create Discount Modal */}
            {showDiscountModal && selectedPassenger && (
                <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
                    <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
                        <div className="mt-3">
                            <h3 className="text-lg font-medium text-gray-900 mb-4">
                                Activate Discount for {selectedPassenger.passenger_name}
                            </h3>
                            <form onSubmit={handleCreateDiscount}>
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Discount Code</label>
                                        <input
                                            type="text"
                                            value={discountForm.code}
                                            onChange={(e) => setDiscountForm({...discountForm, code: e.target.value})}
                                            className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                                            placeholder="e.g., STUDENT10, SENIOR15"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Discount Percentage</label>
                                        <input
                                            type="number"
                                            min="1"
                                            max="100"
                                            value={discountForm.discount_percentage}
                                            onChange={(e) => setDiscountForm({...discountForm, discount_percentage: e.target.value})}
                                            className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                                            placeholder="e.g., 10, 15, 20"
                                            required
                                        />
                                    </div>
                                </div>
                                <div className="flex justify-end space-x-3 mt-6">
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setShowDiscountModal(false);
                                            setSelectedPassenger(null);
                                            setDiscountForm({
                                                discount_percentage: '',
                                                code: ''
                                            });
                                        }}
                                        className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        className="px-4 py-2 bg-green-600 text-white rounded-md text-sm font-medium hover:bg-green-700"
                                    >
                                        Activate Discount
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );

    return (
        <div className="min-h-screen bg-gray-100">
            <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
                {/* Header Section */}
                <div className="flex justify-between items-center mb-8">
                    <h1 className="text-4xl font-bold text-gray-900">Admin Dashboard</h1>
                    <button
                        className="bg-blue-700 hover:bg-blue-800 text-white font-bold py-2 px-4 rounded-lg flex items-center space-x-2 transition"
                        onClick={() => setShowUploader(true)}
                    >
                        <span>🚆</span>
                        <span>Open Train Location Uploader</span>
                    </button>
                </div>

                {/* Tab Navigation */}
                <div className="border-b border-gray-200 mb-6">
                    <nav className="-mb-px flex space-x-8">
                        <button
                            onClick={() => setActiveTab('cancellations')}
                            className={`py-2 px-1 border-b-2 font-medium text-sm ${
                                activeTab === 'cancellations'
                                    ? 'border-blue-500 text-blue-600'
                                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                            }`}
                        >
                            Cancellations
                        </button>
                        <button
                            onClick={() => setActiveTab('schedules')}
                            className={`py-2 px-1 border-b-2 font-medium text-sm ${
                                activeTab === 'schedules'
                                    ? 'border-blue-500 text-blue-600'
                                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                            }`}
                        >
                            Schedules
                        </button>
                        <button
                            onClick={() => setActiveTab('trains')}
                            className={`py-2 px-1 border-b-2 font-medium text-sm ${
                                activeTab === 'trains'
                                    ? 'border-blue-500 text-blue-600'
                                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                            }`}
                        >
                            Trains
                        </button>
                        <button
                            onClick={() => setActiveTab('seats')}
                            className={`py-2 px-1 border-b-2 font-medium text-sm ${
                                activeTab === 'seats'
                                    ? 'border-blue-500 text-blue-600'
                                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                            }`}
                        >
                            Seat Inventory
                        </button>
                        <button
                            onClick={() => setActiveTab('feedback')}
                            className={`py-2 px-1 border-b-2 font-medium text-sm ${
                                activeTab === 'feedback'
                                    ? 'border-blue-500 text-blue-600'
                                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                            }`}
                        >
                            Feedback
                        </button>
                        <button
                            onClick={() => setActiveTab('coaches')}
                            className={`py-2 px-1 border-b-2 font-medium text-sm ${
                                activeTab === 'coaches'
                                    ? 'border-blue-500 text-blue-600'
                                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                            }`}
                        >
                            Coaches
                        </button>
                        <button
                            onClick={() => setActiveTab('discounts')}
                            className={`py-2 px-1 border-b-2 font-medium text-sm ${
                                activeTab === 'discounts'
                                    ? 'border-blue-500 text-blue-600'
                                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                            }`}
                        >
                            Discounts
                        </button>
                    </nav>
                </div>

                {/* Tab Content */}
                {activeTab === 'cancellations' && renderCancellationsTab()}
                {activeTab === 'schedules' && renderSchedulesTab()}
                {activeTab === 'trains' && renderTrainsTab()}
                {activeTab === 'seats' && renderSeatInventoryTab()}
                {activeTab === 'feedback' && renderFeedbackTab()}
                {activeTab === 'coaches' && renderCoachesTab()}
                {activeTab === 'discounts' && renderDiscountsTab()}
            </div>
            {showUploader && (
                <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
                    <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-2xl relative">
                        <button
                            className="absolute top-3 right-3 text-gray-500 hover:text-gray-800 text-2xl"
                            onClick={() => setShowUploader(false)}
                            aria-label="Close"
                        >
                            &times;
                        </button>
                        <TrainLocationUploader />
                    </div>
                </div>
            )}
        </div>
    );
}

export default AdminDashboard;