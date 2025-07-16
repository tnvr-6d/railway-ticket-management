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
    const res = await fetch(`${API_BASE}/api/admin/coaches`);
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