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
export const getFare = async (coach_number, class_type) => {
  try {
    const res = await fetch(`${API_BASE}/api/fares?coach_number=${encodeURIComponent(coach_number)}&class_type=${encodeURIComponent(class_type)}`);
    if (!res.ok) {
        // Create a new error with a more descriptive message
        const errorData = await res.json().catch(() => ({})); // try to get JSON body, otherwise empty object
        throw new Error(errorData.error || "Fare not available");
    }
    return await res.json();
  } catch (err) {
    console.error("❌ getFare() failed:", err);
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
export const loginPassenger = async (identifier, password) => {
  try {
    const res = await fetch(`${API_BASE}/api/passenger/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        identifier: identifier, // Send 'identifier' instead of 'passenger_id'
        password_hash: password,
      }),
    });

    const data = await res.json();
    if (!res.ok) {
      return {
        success: false,
        message: data.message || "Login failed",
      };
    }

    return data;
  } catch (err) {
    console.error("❌ loginPassenger() failed:", err);
    return {
      success: false,
      message: "Network error. Please check your connection.",
    };
  }
};
export const loginAdmin = async (username, password) => {
  try {
    const res = await fetch(`${API_BASE}/api/admin/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
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
