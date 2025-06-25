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
export const searchSchedules = async (source, destination, departure_date) => {
  try {
    const res = await fetch(
      `${API_BASE}/api/schedules/search?source=${encodeURIComponent(source)}&destination=${encodeURIComponent(destination)}&departure_date=${departure_date}`
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
export const loginPassenger = async (passenger_id, password) => {
  try {
    const res = await fetch(`${API_BASE}/api/passenger/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        passenger_id: parseInt(passenger_id),
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

