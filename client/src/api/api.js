const API_BASE = "http://localhost:5000";

// Fetch all trains
export const getTrains = async () => {
  try {
    const res = await fetch(`${API_BASE}/api/trains`);
    if (!res.ok) throw new Error("Failed to load trains");
    return await res.json();
  } catch (err) {
    console.error("❌ getTrains() failed:", err);
    return [];
  }
};

// Fetch all schedules
export const getSchedules = async () => {
  try {
    const res = await fetch(`${API_BASE}/api/schedules`);
    if (!res.ok) throw new Error("Failed to load schedules");
    return await res.json();
  } catch (err) {
    console.error("❌ getSchedules() failed:", err);
    return [];
  }
};

// Search schedules by source, destination, and date
export const getClasses = async () => {
  try {
    const res = await fetch(`${API_BASE}/api/classes`);
    if (!res.ok) throw new Error("Failed to load class types");
    return await res.json();
  } catch (err) {
    console.error("❌ getClasses() failed:", err);
    return [];
  }
};

// MODIFIED search function to include class_type
export const searchSchedules = async (source, destination, departure_date, class_type) => {
  try {
    const res = await fetch(
      `${API_BASE}/api/schedules/search?source=${encodeURIComponent(source)}&destination=${encodeURIComponent(destination)}&departure_date=${departure_date}&class_type=${encodeURIComponent(class_type)}`
    );
    if (!res.ok) throw new Error("Search failed");
    return await res.json();
  } catch (err) {
    console.error("❌ searchSchedules() failed:", err);
    return [];
  }
};


// Find and replace the getFare function
export const getFare = async (class_type) => {
  try {
    const res = await fetch(`${API_BASE}/api/fares?class_type=${encodeURIComponent(class_type)}`);
    if (!res.ok) {
        // Create a new error with a more descriptive message
        const errorData = await res.json().catch(() => ({})); // try to get JSON body, otherwise empty object
        throw new Error(errorData.error || "Fare not available");
    }
    return await res.json();
  } catch (err) {
    console.error("\u274c getFare() failed:", err);
    throw err; // Re-throw the error to be caught by the component
  }
};


// Fetch seat inventory for a schedule
export const getSeats = async (scheduleId) => {
  try {
    const res = await fetch(`${API_BASE}/api/tickets/seats/${scheduleId}`);
    if (!res.ok) throw new Error("Failed to load seats");
    return await res.json();
  } catch (err) {
    console.error("❌ getSeats() failed:", err);
    return [];
  }
};

// Buy a ticket
export const buyTicket = async (ticketData) => {
  try {
    const res = await fetch(`${API_BASE}/api/tickets`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(ticketData),
    });
    if (!res.ok) throw new Error("Failed to buy ticket");
    return await res.json();
  } catch (err) {
    console.error("❌ buyTicket() failed:", err);
    throw err;
  }
};

// Cancel a ticket
export const cancelTicket = async (ticketId, reason = 'User requested cancellation') => {
  try {
    const res = await fetch(`${API_BASE}/api/tickets/cancel`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ticket_id: ticketId, reason }),
    });
    if (!res.ok) throw new Error("Failed to cancel ticket");
    return await res.json();
  } catch (err) {
    console.error("❌ cancelTicket() failed:", err);
    throw err;
  }
};

// Fetch all tickets for a passenger
export const getMyTickets = async (passengerId) => {
  try {
    const res = await fetch(`${API_BASE}/api/tickets?passenger_id=${passengerId}`);
    if (!res.ok) throw new Error("Failed to load tickets");
    return await res.json();
  } catch (err) {
    console.error("❌ getMyTickets() failed:", err);
    return [];
  }
};

// Passenger login
export const loginPassenger = async (email, password) => {
  try {
    const res = await fetch(`${API_BASE}/api/passenger/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: email,
        password_hash: password,
      }),
    });
    const data = await res.json();
    if (!res.ok) {
      return { success: false, message: data.message || "Login failed" };
    }
    return data;
  } catch (err) {
    console.error("❌ loginPassenger() failed:", err);
    return { success: false, message: "Network error." };
  }
};

// Admin login updated to use email
export const loginAdmin = async (email, password) => {
  try {
    const res = await fetch(`${API_BASE}/api/admin/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json();
    if (!res.ok) {
      return { success: false, message: data.message || "Login failed" };
    }
    return data;
  } catch (err) {
    console.error("❌ loginAdmin() failed:", err);
    return { success: false, message: "Network error." };
  }
};

export const getPendingCancellationRequests = async () => {
  try {
    const res = await fetch(`${API_BASE}/api/tickets/pending-cancellations`);
    if (!res.ok) throw new Error("Failed to fetch pending requests");
    return await res.json();
  } catch (err) {
    console.error("❌ getPendingCancellationRequests() failed:", err);
    throw err;
  }
};

export const confirmCancellationRequest = async (ticket_id, admin_id) => {
  try {
    const res = await fetch(`${API_BASE}/api/tickets/confirm-cancellation`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ticket_id, admin_id }),
    });
    if (!res.ok) throw new Error("Failed to confirm cancellation");
    return await res.json();
  } catch (err) {
    console.error("❌ confirmCancellationRequest() failed:", err);
    throw err;
  }
};


// --- MODIFIED CANCELLATION FUNCTION ---
// The old `cancelTicket` is now `requestCancellation`
export const requestCancellation = async (ticketId, reason) => {
  try {
    const res = await fetch(`${API_BASE}/api/tickets/request-cancellation`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ticket_id: ticketId, reason }),
    });
    if (!res.ok) throw new Error("Failed to request ticket cancellation");
    return await res.json();
  } catch (err) {
    console.error("❌ requestCancellation() failed:", err);
    throw err;
  }
};

export const searchStations = async (query) => {
  if (!query || query.length < 2) return [];
  try {
    const res = await fetch(`${API_BASE}/api/stations/search?q=${encodeURIComponent(query)}`);
    if (!res.ok) throw new Error("Station search failed");
    return await res.json();
  } catch (err) {
    console.error("❌ searchStations() failed:", err);
    return [];
  }
};

export const registerPassenger = async (passengerData) => {
  try {
    const res = await fetch(`${API_BASE}/api/passenger/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(passengerData),
    });
    const data = await res.json();
    if (!res.ok) {
      return { success: false, message: data.message || "Registration failed" };
    }
    return data;
  } catch (err) {
    console.error("❌ registerPassenger() failed:", err);
    return { success: false, message: "Network error." };
  }
};

// Notification API functions
export const getNotifications = async (passengerId) => {
  try {
    const res = await fetch(`${API_BASE}/api/notifications?passenger_id=${passengerId}`);
    if (!res.ok) throw new Error("Failed to load notifications");
    return await res.json();
  } catch (err) {
    console.error("❌ getNotifications() failed:", err);
    return [];
  }
};

export const markNotificationAsRead = async (notificationId) => {
  try {
    const res = await fetch(`${API_BASE}/api/notifications/mark-read`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ notification_id: notificationId }),
    });
    if (!res.ok) throw new Error("Failed to mark notification as read");
    return await res.json();
  } catch (err) {
    console.error("❌ markNotificationAsRead() failed:", err);
    throw err;
  }
};

export const getUnreadNotificationCount = async (passengerId) => {
  try {
    const res = await fetch(`${API_BASE}/api/notifications/unread-count?passenger_id=${passengerId}`);
    if (!res.ok) throw new Error("Failed to get unread count");
    const data = await res.json();
    return data.count || 0;
  } catch (err) {
    console.error("❌ getUnreadNotificationCount() failed:", err);
    return 0;
  }
};

export const sendNotification = async (notificationData) => {
  try {
    const res = await fetch(`${API_BASE}/api/notifications`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(notificationData),
    });
    if (!res.ok) throw new Error("Failed to send notification");
    return await res.json();
  } catch (err) {
    console.error("❌ sendNotification() failed:", err);
    throw err;
  }
};

// ===== ADMIN API FUNCTIONS =====

// Schedule Management
export const adminGetAllSchedules = async () => {
  try {
    const res = await fetch(`${API_BASE}/api/admin/schedules`);
    if (!res.ok) throw new Error("Failed to load schedules");
    return await res.json();
  } catch (err) {
    console.error("❌ adminGetAllSchedules() failed:", err);
    throw err;
  }
};

export const adminGetScheduleById = async (scheduleId) => {
  try {
    const res = await fetch(`${API_BASE}/api/admin/schedules/${scheduleId}`);
    if (!res.ok) throw new Error("Failed to load schedule");
    return await res.json();
  } catch (err) {
    console.error("❌ adminGetScheduleById() failed:", err);
    throw err;
  }
};

export const adminCreateSchedule = async (scheduleData) => {
  try {
    const res = await fetch(`${API_BASE}/api/admin/schedules`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(scheduleData),
    });
    if (!res.ok) {
      const errorData = await res.json();
      throw new Error(errorData.message || "Failed to create schedule");
    }
    return await res.json();
  } catch (err) {
    console.error("❌ adminCreateSchedule() failed:", err);
    throw err;
  }
};

export const adminUpdateSchedule = async (scheduleId, scheduleData) => {
  try {
    const res = await fetch(`${API_BASE}/api/admin/schedules/${scheduleId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(scheduleData),
    });
    if (!res.ok) {
      const errorData = await res.json();
      throw new Error(errorData.message || "Failed to update schedule");
    }
    return await res.json();
  } catch (err) {
    console.error("❌ adminUpdateSchedule() failed:", err);
    throw err;
  }
};

export const adminDeleteSchedule = async (scheduleId) => {
  try {
    const res = await fetch(`${API_BASE}/api/admin/schedules/${scheduleId}`, {
      method: "DELETE",
    });
    if (!res.ok) {
      const errorData = await res.json();
      throw new Error(errorData.message || "Failed to delete schedule");
    }
    return await res.json();
  } catch (err) {
    console.error("❌ adminDeleteSchedule() failed:", err);
    throw err;
  }
};

// Train Management
export const adminGetAllTrains = async () => {
  try {
    const res = await fetch(`${API_BASE}/api/admin/trains`);
    if (!res.ok) throw new Error("Failed to load trains");
    return await res.json();
  } catch (err) {
    console.error("❌ adminGetAllTrains() failed:", err);
    throw err;
  }
};

export const adminGetTrainById = async (trainId) => {
  try {
    const res = await fetch(`${API_BASE}/api/admin/trains/${trainId}`);
    if (!res.ok) throw new Error("Failed to load train");
    return await res.json();
  } catch (err) {
    console.error("❌ adminGetTrainById() failed:", err);
    throw err;
  }
};

export const adminCreateTrain = async (trainData) => {
  try {
    const res = await fetch(`${API_BASE}/api/admin/trains`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(trainData),
    });
    if (!res.ok) {
      const errorData = await res.json();
      throw new Error(errorData.message || "Failed to create train");
    }
    return await res.json();
  } catch (err) {
    console.error("❌ adminCreateTrain() failed:", err);
    throw err;
  }
};

export const adminUpdateTrain = async (trainId, trainData) => {
  try {
    const res = await fetch(`${API_BASE}/api/admin/trains/${trainId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(trainData),
    });
    if (!res.ok) {
      const errorData = await res.json();
      throw new Error(errorData.message || "Failed to update train");
    }
    return await res.json();
  } catch (err) {
    console.error("❌ adminUpdateTrain() failed:", err);
    throw err;
  }
};

export const adminDeleteTrain = async (trainId) => {
  try {
    const res = await fetch(`${API_BASE}/api/admin/trains/${trainId}`, {
      method: "DELETE",
    });
    if (!res.ok) {
      const errorData = await res.json();
      throw new Error(errorData.message || "Failed to delete train");
    }
    return await res.json();
  } catch (err) {
    console.error("❌ adminDeleteTrain() failed:", err);
    throw err;
  }
};

// Supporting Data
export const adminGetAllRoutes = async () => {
  try {
    const res = await fetch(`${API_BASE}/api/admin/routes`);
    if (!res.ok) throw new Error("Failed to load routes");
    return await res.json();
  } catch (err) {
    console.error("❌ adminGetAllRoutes() failed:", err);
    throw err;
  }
};

export const adminGetAllStations = async () => {
  try {
    const res = await fetch(`${API_BASE}/api/admin/stations`);
    if (!res.ok) throw new Error("Failed to load stations");
    return await res.json();
  } catch (err) {
    console.error("❌ adminGetAllStations() failed:", err);
    throw err;
  }
};

export const adminGetAllClasses = async () => {
  try {
    const res = await fetch(`${API_BASE}/api/admin/classes`);
    if (!res.ok) throw new Error("Failed to load classes");
    return await res.json();
  } catch (err) {
    console.error("❌ adminGetAllClasses() failed:", err);
    throw err;
  }
};

export const adminGetAllCoaches = async () => {
  try {
    const res = await fetch(`${API_BASE}/api/coaches`);
    if (!res.ok) throw new Error("Failed to load coaches");
    return await res.json();
  } catch (err) {
    console.error("❌ adminGetAllCoaches() failed:", err);
    throw err;
  }
};

// Seat Inventory Management
export const adminGetSeatInventoryByTrain = async (trainId) => {
  try {
    const res = await fetch(`${API_BASE}/api/admin/trains/${trainId}/seats`);
    if (!res.ok) throw new Error("Failed to load seat inventory");
    return await res.json();
  } catch (err) {
    console.error("❌ adminGetSeatInventoryByTrain() failed:", err);
    throw err;
  }
};

export const adminGetSeatInventoryBySchedule = async (scheduleId) => {
  try {
    const res = await fetch(`${API_BASE}/api/admin/schedules/${scheduleId}/seats`);
    if (!res.ok) throw new Error("Failed to load seat inventory");
    return await res.json();
  } catch (err) {
    console.error("❌ adminGetSeatInventoryBySchedule() failed:", err);
    throw err;
  }
};

export const adminAddSeatToSchedule = async (scheduleId, seatData) => {
  try {
    const res = await fetch(`${API_BASE}/api/admin/schedules/${scheduleId}/seats`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(seatData),
    });
    if (!res.ok) {
      const errorData = await res.json();
      throw new Error(errorData.message || "Failed to add seat");
    }
    return await res.json();
  } catch (err) {
    console.error("❌ adminAddSeatToSchedule() failed:", err);
    throw err;
  }
};

export const adminBulkAddSeatsToSchedule = async (scheduleId, bulkSeatData) => {
  try {
    const res = await fetch(`${API_BASE}/api/admin/schedules/${scheduleId}/seats/bulk`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(bulkSeatData),
    });
    if (!res.ok) {
      const errorData = await res.json();
      throw new Error(errorData.message || "Failed to add bulk seats");
    }
    return await res.json();
  } catch (err) {
    console.error("❌ adminBulkAddSeatsToSchedule() failed:", err);
    throw err;
  }
};

export const adminUpdateSeatAvailability = async (inventoryId, isAvailable) => {
  try {
    const res = await fetch(`${API_BASE}/api/admin/seats/${inventoryId}/availability`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ is_available: isAvailable }),
    });
    if (!res.ok) {
      const errorData = await res.json();
      throw new Error(errorData.message || "Failed to update seat availability");
    }
    return await res.json();
  } catch (err) {
    console.error("❌ adminUpdateSeatAvailability() failed:", err);
    throw err;
  }
};

export const adminDeleteSeat = async (inventoryId) => {
  try {
    const res = await fetch(`${API_BASE}/api/admin/seats/${inventoryId}`, {
      method: "DELETE",
    });
    if (!res.ok) {
      const errorData = await res.json();
      throw new Error(errorData.message || "Failed to delete seat");
    }
    return await res.json();
  } catch (err) {
    console.error("❌ adminDeleteSeat() failed:", err);
    throw err;
  }
};

export const adminGetScheduleByTrain = async (trainId) => {
  try {
    const res = await fetch(`${API_BASE}/api/admin/trains/${trainId}/schedules`);
    if (!res.ok) throw new Error("Failed to load schedules");
    return await res.json();
  } catch (err) {
    console.error("❌ adminGetScheduleByTrain() failed:", err);
    throw err;
  }
};

// ===== FEEDBACK API FUNCTIONS =====
export const submitFeedback = async (feedbackData) => {
  try {
    const res = await fetch(`${API_BASE}/api/feedback`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(feedbackData),
    });
    if (!res.ok) {
      const errorData = await res.json();
      throw new Error(errorData.error || "Failed to submit feedback");
    }
    return await res.json();
  } catch (err) {
    console.error("❌ submitFeedback() failed:", err);
    throw err;
  }
};

export const getAllFeedback = async () => {
  try {
    const res = await fetch(`${API_BASE}/api/feedback`);
    if (!res.ok) throw new Error("Failed to fetch feedback");
    return await res.json();
  } catch (err) {
    console.error("❌ getAllFeedback() failed:", err);
    throw err;
  }
};

export const updateFeedbackStatus = async (feedback_id, status) => {
  try {
    const res = await fetch(`${API_BASE}/api/feedback/status`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ feedback_id, status }),
    });
    if (!res.ok) {
      const errorData = await res.json();
      throw new Error(errorData.error || "Failed to update feedback status");
    }
    return await res.json();
  } catch (err) {
    console.error("❌ updateFeedbackStatus() failed:", err);
    throw err;
  }
};

export const getPassengerById = async (passengerId) => {
  try {
    const res = await fetch(`${API_BASE}/api/passenger/check/${passengerId}`);
    if (!res.ok) throw new Error("Failed to fetch passenger details");
    return await res.json();
  } catch (err) {
    console.error("❌ getPassengerById() failed:", err);
    throw err;
  }
};

// Dummy payment API (for extensibility, not used in modal)
export const dummyPayment = async (amount) => {
  // Simulate a network call delay
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({ success: true, message: 'Payment successful (dummy)' });
    }, 1200);
  });
};

// Get train location
export const getTrainLocation = async (train_id) => {
  const res = await fetch(`${API_BASE}/api/train/location/${train_id}`);
  if (!res.ok) throw new Error('No location found');
  return await res.json();
};

// Update train location (for uploader)
export const updateTrainLocation = async (train_id, latitude, longitude) => {
  const res = await fetch(`${API_BASE}/api/train/location`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ train_id, latitude, longitude }),
  });
  if (!res.ok) throw new Error('Failed to update location');
  return await res.json();
};

// ===== COACH API FUNCTIONS =====
export const getAllCoaches = async () => {
  try {
    const res = await fetch(`${API_BASE}/api/coaches`);
    if (!res.ok) throw new Error("Failed to load coaches");
    return await res.json();
  } catch (err) {
    console.error("❌ getAllCoaches() failed:", err);
    return [];
  }
};

export const getCoachById = async (coachId) => {
  try {
    const res = await fetch(`${API_BASE}/api/coaches/${coachId}`);
    if (!res.ok) throw new Error("Failed to load coach");
    return await res.json();
  } catch (err) {
    console.error("❌ getCoachById() failed:", err);
    throw err;
  }
};

export const createCoach = async (coachData) => {
  try {
    const res = await fetch(`${API_BASE}/api/coaches`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(coachData),
    });
    if (!res.ok) throw new Error("Failed to create coach");
    return await res.json();
  } catch (err) {
    console.error("❌ createCoach() failed:", err);
    throw err;
  }
};

export const updateCoach = async (coachId, coachData) => {
  try {
    const res = await fetch(`${API_BASE}/api/coaches/${coachId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(coachData),
    });
    if (!res.ok) throw new Error("Failed to update coach");
    return await res.json();
  } catch (err) {
    console.error("❌ updateCoach() failed:", err);
    throw err;
  }
};

export const deleteCoach = async (coachId) => {
  try {
    const res = await fetch(`${API_BASE}/api/coaches/${coachId}`, {
      method: "DELETE",
    });
    if (!res.ok) throw new Error("Failed to delete coach");
    return await res.json();
  } catch (err) {
    console.error("❌ deleteCoach() failed:", err);
    throw err;
  }
};

export const getCoachesByClass = async (classId) => {
  try {
    const res = await fetch(`${API_BASE}/api/coaches/class/${classId}`);
    if (!res.ok) throw new Error("Failed to load coaches by class");
    return await res.json();
  } catch (err) {
    console.error("❌ getCoachesByClass() failed:", err);
    return [];
  }
};

// ===== TRAIN COACH API FUNCTIONS =====
export const getTrainCoaches = async (trainId) => {
  try {
    const res = await fetch(`${API_BASE}/api/train-coaches/train/${trainId}`);
    if (!res.ok) throw new Error("Failed to load train coaches");
    return await res.json();
  } catch (err) {
    console.error("❌ getTrainCoaches() failed:", err);
    return [];
  }
};

export const getTrainComposition = async (trainId) => {
  try {
    const res = await fetch(`${API_BASE}/api/train-coaches/composition/${trainId}`);
    if (!res.ok) throw new Error("Failed to load train composition");
    return await res.json();
  } catch (err) {
    console.error("❌ getTrainComposition() failed:", err);
    return [];
  }
};

export const assignCoachToTrain = async (trainId, coachData) => {
  try {
    const res = await fetch(`${API_BASE}/api/train-coaches/train/${trainId}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(coachData),
    });
    if (!res.ok) throw new Error("Failed to assign coach to train");
    return await res.json();
  } catch (err) {
    console.error("❌ assignCoachToTrain() failed:", err);
    throw err;
  }
};

export const updateCoachOrder = async (trainCoachId, coachOrder) => {
  try {
    const res = await fetch(`${API_BASE}/api/train-coaches/${trainCoachId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ coach_order: coachOrder }),
    });
    if (!res.ok) throw new Error("Failed to update coach order");
    return await res.json();
  } catch (err) {
    console.error("❌ updateCoachOrder() failed:", err);
    throw err;
  }
};

export const removeCoachFromTrain = async (trainCoachId) => {
  try {
    const res = await fetch(`${API_BASE}/api/train-coaches/${trainCoachId}`, {
      method: "DELETE",
    });
    if (!res.ok) throw new Error("Failed to remove coach from train");
    return await res.json();
  } catch (err) {
    console.error("❌ removeCoachFromTrain() failed:", err);
    throw err;
  }
};

// ===== ROUTE API FUNCTIONS =====
export const getAllRoutes = async () => {
  try {
    const res = await fetch(`${API_BASE}/api/routes`);
    if (!res.ok) throw new Error("Failed to load routes");
    return await res.json();
  } catch (err) {
    console.error("❌ getAllRoutes() failed:", err);
    return [];
  }
};

export const getRouteById = async (routeId) => {
  try {
    const res = await fetch(`${API_BASE}/api/routes/${routeId}`);
    if (!res.ok) throw new Error("Failed to load route");
    return await res.json();
  } catch (err) {
    console.error("❌ getRouteById() failed:", err);
    throw err;
  }
};

export const createRoute = async (routeData) => {
  try {
    const res = await fetch(`${API_BASE}/api/routes`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(routeData),
    });
    if (!res.ok) throw new Error("Failed to create route");
    return await res.json();
  } catch (err) {
    console.error("❌ createRoute() failed:", err);
    throw err;
  }
};

export const updateRoute = async (routeId, routeData) => {
  try {
    const res = await fetch(`${API_BASE}/api/routes/${routeId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(routeData),
    });
    if (!res.ok) throw new Error("Failed to update route");
    return await res.json();
  } catch (err) {
    console.error("❌ updateRoute() failed:", err);
    throw err;
  }
};

export const deleteRoute = async (routeId) => {
  try {
    const res = await fetch(`${API_BASE}/api/routes/${routeId}`, {
      method: "DELETE",
    });
    if (!res.ok) throw new Error("Failed to delete route");
    return await res.json();
  } catch (err) {
    console.error("❌ deleteRoute() failed:", err);
    throw err;
  }
};

export const getRouteStations = async (routeId) => {
  try {
    const res = await fetch(`${API_BASE}/api/routes/${routeId}/stations`);
    if (!res.ok) throw new Error("Failed to load route stations");
    return await res.json();
  } catch (err) {
    console.error("❌ getRouteStations() failed:", err);
    return [];
  }
};

export const addStationToRoute = async (routeId, stationData) => {
  try {
    const res = await fetch(`${API_BASE}/api/routes/${routeId}/stations`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(stationData),
    });
    if (!res.ok) throw new Error("Failed to add station to route");
    return await res.json();
  } catch (err) {
    console.error("❌ addStationToRoute() failed:", err);
    throw err;
  }
};

export const removeStationFromRoute = async (routeStationId) => {
  try {
    const res = await fetch(`${API_BASE}/api/routes/stations/${routeStationId}`, {
      method: "DELETE",
    });
    if (!res.ok) throw new Error("Failed to remove station from route");
    return await res.json();
  } catch (err) {
    console.error("❌ removeStationFromRoute() failed:", err);
    throw err;
  }
};

// ===== PAYMENT API FUNCTIONS =====
export const createPayment = async (paymentData) => {
  try {
    const res = await fetch(`${API_BASE}/api/payments`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(paymentData),
    });
    if (!res.ok) throw new Error("Failed to create payment");
    return await res.json();
  } catch (err) {
    console.error("❌ createPayment() failed:", err);
    throw err;
  }
};

export const getPaymentById = async (paymentId) => {
  try {
    const res = await fetch(`${API_BASE}/api/payments/${paymentId}`);
    if (!res.ok) throw new Error("Failed to load payment");
    return await res.json();
  } catch (err) {
    console.error("❌ getPaymentById() failed:", err);
    throw err;
  }
};

export const updatePaymentStatus = async (paymentId, status) => {
  try {
    const res = await fetch(`${API_BASE}/api/payments/${paymentId}/status`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    if (!res.ok) throw new Error("Failed to update payment status");
    return await res.json();
  } catch (err) {
    console.error("❌ updatePaymentStatus() failed:", err);
    throw err;
  }
};

export const getPaymentsByPassenger = async (passengerId) => {
  try {
    const res = await fetch(`${API_BASE}/api/payments/passenger/${passengerId}`);
    if (!res.ok) throw new Error("Failed to load passenger payments");
    return await res.json();
  } catch (err) {
    console.error("❌ getPaymentsByPassenger() failed:", err);
    return [];
  }
};

export const getPaymentStatistics = async () => {
  try {
    const res = await fetch(`${API_BASE}/api/payments/statistics/overview`);
    if (!res.ok) throw new Error("Failed to load payment statistics");
    return await res.json();
  } catch (err) {
    console.error("❌ getPaymentStatistics() failed:", err);
    return [];
  }
};

export const getPaymentsByDateRange = async (startDate, endDate) => {
  try {
    const res = await fetch(`${API_BASE}/api/payments/statistics/range?startDate=${startDate}&endDate=${endDate}`);
    if (!res.ok) throw new Error("Failed to load payments by date range");
    return await res.json();
  } catch (err) {
    console.error("❌ getPaymentsByDateRange() failed:", err);
    return [];
  }
};

// ===== BOOKING API FUNCTIONS =====
export const createBooking = async (bookingData) => {
  try {
    const res = await fetch(`${API_BASE}/api/bookings`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(bookingData),
    });
    if (!res.ok) throw new Error("Failed to create booking");
    return await res.json();
  } catch (err) {
    console.error("❌ createBooking() failed:", err);
    throw err;
  }
};

export const getBookingById = async (bookingId) => {
  try {
    const res = await fetch(`${API_BASE}/api/bookings/${bookingId}`);
    if (!res.ok) throw new Error("Failed to load booking");
    return await res.json();
  } catch (err) {
    console.error("❌ getBookingById() failed:", err);
    throw err;
  }
};

export const getBookingsByPassenger = async (passengerId) => {
  try {
    const res = await fetch(`${API_BASE}/api/bookings/passenger/${passengerId}`);
    if (!res.ok) throw new Error("Failed to load passenger bookings");
    return await res.json();
  } catch (err) {
    console.error("❌ getBookingsByPassenger() failed:", err);
    return [];
  }
};

export const updateBookingCancellationReason = async (bookingId, cancellationReason) => {
  try {
    const res = await fetch(`${API_BASE}/api/bookings/${bookingId}/cancellation`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ cancellation_reason: cancellationReason }),
    });
    if (!res.ok) throw new Error("Failed to update booking cancellation reason");
    return await res.json();
  } catch (err) {
    console.error("❌ updateBookingCancellationReason() failed:", err);
    throw err;
  }
};

export const getBookingStatistics = async () => {
  try {
    const res = await fetch(`${API_BASE}/api/bookings/statistics/overview`);
    if (!res.ok) throw new Error("Failed to load booking statistics");
    return await res.json();
  } catch (err) {
    console.error("❌ getBookingStatistics() failed:", err);
    return [];
  }
};

export const getCancelledBookings = async () => {
  try {
    const res = await fetch(`${API_BASE}/api/bookings/statistics/cancelled`);
    if (!res.ok) throw new Error("Failed to load cancelled bookings");
    return await res.json();
  } catch (err) {
    console.error("❌ getCancelledBookings() failed:", err);
    return [];
  }
};

// ===== DISCOUNT API FUNCTIONS =====
export const getAllDiscounts = async () => {
  try {
    const res = await fetch(`${API_BASE}/api/discounts`);
    if (!res.ok) throw new Error("Failed to load discounts");
    return await res.json();
  } catch (err) {
    console.error("❌ getAllDiscounts() failed:", err);
    return [];
  }
};

export const getActiveDiscounts = async () => {
  try {
    const res = await fetch(`${API_BASE}/api/discounts/active`);
    if (!res.ok) throw new Error("Failed to load active discounts");
    return await res.json();
  } catch (err) {
    console.error("❌ getActiveDiscounts() failed:", err);
    return [];
  }
};

export const createDiscount = async (discountData) => {
  try {
    const res = await fetch(`${API_BASE}/api/discounts`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(discountData),
    });
    if (!res.ok) throw new Error("Failed to create discount");
    return await res.json();
  } catch (err) {
    console.error("❌ createDiscount() failed:", err);
    throw err;
  }
};

export const validateDiscountCode = async (code, passengerId) => {
  try {
    const res = await fetch(`${API_BASE}/api/discounts/validate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code, passengerId }),
    });
    if (!res.ok) throw new Error("Failed to validate discount code");
    return await res.json();
  } catch (err) {
    console.error("❌ validateDiscountCode() failed:", err);
    throw err;
  }
};

export const applyDiscountToBooking = async (discountId, bookingId, passengerId) => {
  try {
    const res = await fetch(`${API_BASE}/api/discounts/apply`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ discountId, bookingId, passengerId }),
    });
    if (!res.ok) throw new Error("Failed to apply discount to booking");
    return await res.json();
  } catch (err) {
    console.error("❌ applyDiscountToBooking() failed:", err);
    throw err;
  }
};

export const updateDiscountStatus = async (discountId, isActive) => {
  try {
    const res = await fetch(`${API_BASE}/api/discounts/${discountId}/status`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isActive }),
    });
    if (!res.ok) throw new Error("Failed to update discount status");
    return await res.json();
  } catch (err) {
    console.error("❌ updateDiscountStatus() failed:", err);
    throw err;
  }
};

export const deleteDiscount = async (discountId) => {
  try {
    const res = await fetch(`${API_BASE}/api/discounts/${discountId}`, {
      method: "DELETE",
    });
    if (!res.ok) throw new Error("Failed to delete discount");
    return await res.json();
  } catch (err) {
    console.error("❌ deleteDiscount() failed:", err);
    throw err;
  }
};

export const getDiscountUsageStatistics = async () => {
  try {
    const res = await fetch(`${API_BASE}/api/discounts/statistics/usage`);
    if (!res.ok) throw new Error("Failed to load discount usage statistics");
    return await res.json();
  } catch (err) {
    console.error("❌ getDiscountUsageStatistics() failed:", err);
    return [];
  }
};

export const getDiscountsByPassenger = async (passengerId) => {
  try {
    const res = await fetch(`${API_BASE}/api/discounts/by-passenger?passenger_id=${passengerId}`);
    if (!res.ok) throw new Error("Failed to load passenger discounts");
    const data = await res.json();
    return data.success ? data.discounts : [];
  } catch (err) {
    console.error("❌ getDiscountsByPassenger() failed:", err);
    throw err;
  }
};

// ===== PASSENGER API FUNCTIONS =====
export const getAllPassengers = async () => {
  try {
    const res = await fetch(`${API_BASE}/api/passenger`);
    if (!res.ok) throw new Error("Failed to load passengers");
    return await res.json();
  } catch (err) {
    console.error("❌ getAllPassengers() failed:", err);
    return [];
  }
};  