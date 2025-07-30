const express = require('express');
const router = express.Router();
const db = require('../db'); // Use the existing database connection

// Helper function to format time
const formatTime = (time) => {
  if (!time) return 'N/A';
  return new Date(`1970-01-01T${time}Z`).toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  });
};

// Helper function to format date
const formatDate = (date) => {
  if (!date) return 'N/A';
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

// Function to search for trains between stations
const searchTrains = async (sourceStation, destStation) => {
  try {
    const query = `
      SELECT 
        t.train_name,
        t.train_id,
        s.schedule_id,
        s.departure_time,
        s.arrival_time,
        s.departure_date,
        s.status,
        r.distance,
        src.station_name as source_station,
        dest.station_name as destination_station,
        f.per_km_fare,
        c.class_type
      FROM schedule s
      JOIN train t ON s.train_id = t.train_id
      JOIN route r ON s.route_id = r.route_id
      JOIN station src ON r.source_station_id = src.station_id
      JOIN station dest ON r.destination_station_id = dest.station_id
      LEFT JOIN seat_inventory si ON s.schedule_id = si.schedule_id
      LEFT JOIN coach co ON si.coach_id = co.coach_id
      LEFT JOIN class c ON co.class_id = c.class_id
      LEFT JOIN fare f ON c.class_id = f.class_id
      WHERE LOWER(src.station_name) LIKE $1 
      AND LOWER(dest.station_name) LIKE $2
      AND s.departure_date >= CURRENT_DATE
      ORDER BY s.departure_date, s.departure_time
      LIMIT 5
    `;
    
    const result = await db.query(query, [`%${sourceStation}%`, `%${destStation}%`]);
    return result.rows;
  } catch (error) {
    console.error('Error searching trains:', error);
    return [];
  }
};

// Function to get station information
const getStationInfo = async (stationName) => {
  try {
    const query = `
      SELECT station_id, station_name, location, contact_info
      FROM station
      WHERE LOWER(station_name) LIKE $1
      ORDER BY station_name
      LIMIT 5
    `;
    
    const result = await db.query(query, [`%${stationName}%`]);
    return result.rows;
  } catch (error) {
    console.error('Error getting station info:', error);
    return [];
  }
};

// Function to check seat availability
const checkSeatAvailability = async (scheduleId) => {
  try {
    const query = `
      SELECT 
        COUNT(*) as total_seats,
        COUNT(CASE WHEN is_available = true THEN 1 END) as available_seats,
        c.class_type,
        co.coach_number
      FROM seat_inventory si
      JOIN coach co ON si.coach_id = co.coach_id
      JOIN class c ON co.class_id = c.class_id
      WHERE si.schedule_id = $1
      GROUP BY c.class_type, co.coach_number
      ORDER BY c.class_type
    `;
    
    const result = await db.query(query, [scheduleId]);
    return result.rows;
  } catch (error) {
    console.error('Error checking seat availability:', error);
    return [];
  }
};

// Function to get user's booking history
const getUserBookings = async (passengerId) => {
  try {
    const query = `
      SELECT 
        t.ticket_id,
        tr.train_name,
        s.departure_date,
        s.departure_time,
        t.seat_number,
        t.price,
        t.status,
        src.station_name as source_station,
        dest.station_name as destination_station
      FROM ticket t
      JOIN schedule s ON t.schedule_id = s.schedule_id
      JOIN train tr ON s.train_id = tr.train_id
      JOIN route r ON s.route_id = r.route_id
      JOIN station src ON r.source_station_id = src.station_id
      JOIN station dest ON r.destination_station_id = dest.station_id
      WHERE t.passenger_id = $1
      ORDER BY s.departure_date DESC
      LIMIT 5
    `;
    
    const result = await db.query(query, [passengerId]);
    return result.rows;
  } catch (error) {
    console.error('Error getting user bookings:', error);
    return [];
  }
};

// Function to get fare information
const getFareInfo = async (classType) => {
  try {
    const query = `
      SELECT 
        c.class_type,
        f.per_km_fare
      FROM class c
      JOIN fare f ON c.class_id = f.class_id
      WHERE LOWER(c.class_type) LIKE $1
      ORDER BY f.per_km_fare
    `;
    
    const result = await db.query(query, [`%${classType}%`]);
    return result.rows;
  } catch (error) {
    console.error('Error getting fare info:', error);
    return [];
  }
};

// POST /api/chat
router.post('/', async (req, res) => {
  try {
    const { message, userId } = req.body;
    
    if (!message) {
      return res.json({ 
        reply: "Please send a message to get assistance with your railway queries." 
      });
    }

    const lowerMessage = message.toLowerCase();
    let reply = "I'm here to help you with train schedules, bookings, and railway information. How can I assist you?";

    // Greeting responses
    if (/\b(hello|hi|hey|good morning|good afternoon|good evening|assalamu alaikum)\b/i.test(message)) {
      reply = `Hello! Welcome to Bangladesh Railway Assistant. I can help you with:

🚂 Train schedules and routes
🎫 Ticket booking information  
🚉 Station details
💺 Seat availability
💰 Fare information
📞 Contact information

What would you like to know? You can ask things like:
- "Show trains from Dhaka to Chittagong"
- "What's the fare for AC Chair?"
- "Check seat availability for Suborno Express"`;
    }

    // Train schedule queries
    else if (/\b(train|schedule|time|departure|arrival)\b/i.test(lowerMessage)) {
      // Extract station names from the message
      const stationPatterns = [
        { name: 'dhaka', patterns: ['dhaka', 'kamalapur'] },
        { name: 'chittagong', patterns: ['chittagong', 'chattogram'] },
        { name: 'sylhet', patterns: ['sylhet'] },
        { name: 'rajshahi', patterns: ['rajshahi'] },
        { name: 'rangpur', patterns: ['rangpur'] },
        { name: 'kushtia', patterns: ['kushtia'] },
        { name: 'mymensingh', patterns: ['mymensingh'] },
        { name: 'comilla', patterns: ['comilla'] },
        { name: 'jessore', patterns: ['jessore'] }
      ];

      // Find stations based on their position in the message
      let foundStations = [];
      
      for (const station of stationPatterns) {
        for (const pattern of station.patterns) {
          const index = lowerMessage.indexOf(pattern);
          if (index !== -1) {
            foundStations.push({ 
              name: station.name, 
              index: index,
              displayName: station.name.charAt(0).toUpperCase() + station.name.slice(1)
            });
          }
        }
      }
      
      // Sort by position in message and remove duplicates
      foundStations.sort((a, b) => a.index - b.index);
      foundStations = foundStations.filter((station, index, arr) => 
        index === 0 || station.name !== arr[index - 1].name
      );

      let sourceStation = null;
      let destStation = null;

      if (foundStations.length >= 2) {
        sourceStation = foundStations[0].name;
        destStation = foundStations[1].name;
      } else if (foundStations.length === 1) {
        // If only one station found, check for "from" and "to" patterns
        const fromMatch = lowerMessage.match(/from\s+(\w+)/i);
        const toMatch = lowerMessage.match(/to\s+(\w+)/i);
        
        if (fromMatch && toMatch) {
          // Try to match the found patterns with station names
          const fromStation = stationPatterns.find(s => 
            s.patterns.some(p => fromMatch[1].toLowerCase().includes(p))
          );
          const toStation = stationPatterns.find(s => 
            s.patterns.some(p => toMatch[1].toLowerCase().includes(p))
          );
          
          if (fromStation && toStation) {
            sourceStation = fromStation.name;
            destStation = toStation.name;
          }
        }
      }

      if (sourceStation && destStation) {
        const trains = await searchTrains(sourceStation, destStation);
        
        if (trains.length > 0) {
          reply = `🚂 **Trains from ${trains[0].source_station} to ${trains[0].destination_station}:**\n\n`;
          
          trains.forEach((train, index) => {
            const fare = train.per_km_fare ? (train.per_km_fare * train.distance).toFixed(2) : 'N/A';
            reply += `**${train.train_name}**\n`;
            reply += `⏰ Departure: ${formatTime(train.departure_time)} | Arrival: ${formatTime(train.arrival_time)}\n`;
            reply += `📅 Date: ${formatDate(train.departure_date)}\n`;
            reply += `🚉 Distance: ${train.distance} km\n`;
            reply += `💰 Estimated Fare: ৳${fare} (${train.class_type || 'Standard'})\n`;
            reply += `📊 Status: ${train.status}\n\n`;
          });
          
          reply += "Would you like to check seat availability or get more details about any specific train?";
        } else {
          reply = `Sorry, I couldn't find any trains from ${sourceStation} to ${destStation}. Please check the station names or try different dates.`;
        }
      } else {
        reply = `To show train schedules, please specify both source and destination stations. For example:
- "Show trains from Dhaka to Chittagong"
- "Train schedule Sylhet to Dhaka"
- "Departure time from Rajshahi to Rangpur"`;
      }
    }

    // Station information queries
    else if (/\b(station|location|address|contact)\b/i.test(lowerMessage)) {
      const stationNames = ['dhaka', 'chittagong', 'sylhet', 'rajshahi', 'rangpur', 'kushtia', 'mymensingh', 'comilla', 'jessore'];
      let foundStation = null;

      for (const station of stationNames) {
        if (lowerMessage.includes(station)) {
          foundStation = station;
          break;
        }
      }

      if (foundStation) {
        const stations = await getStationInfo(foundStation);
        
        if (stations.length > 0) {
          reply = `🚉 **Station Information:**\n\n`;
          
          stations.forEach(station => {
            reply += `**${station.station_name}**\n`;
            reply += `📍 Location: ${station.location}\n`;
            reply += `📞 Contact: ${station.contact_info || 'N/A'}\n\n`;
          });
        } else {
          reply = `Sorry, I couldn't find information for ${foundStation} station.`;
        }
      } else {
        reply = `Please specify which station you'd like information about. For example:
- "Dhaka station contact"
- "Chittagong station location"
- "Sylhet station address"`;
      }
    }

    // Seat availability queries
    else if (/\b(seat|availability|available|vacant)\b/i.test(lowerMessage)) {
      reply = `To check seat availability, I need more specific information. Please provide:
- Train name or number
- Travel date
- Source and destination stations

For example: "Check seats for Suborno Express on July 30th from Dhaka to Chittagong"`;
    }

    // Fare information queries
    else if (/\b(fare|price|cost|ticket price)\b/i.test(lowerMessage)) {
      const classTypes = ['shovan', 'chair', 'ac', 'berth', 'snigdha', 'first'];
      let foundClass = null;

      for (const classType of classTypes) {
        if (lowerMessage.includes(classType)) {
          foundClass = classType;
          break;
        }
      }

      if (foundClass) {
        const fares = await getFareInfo(foundClass);
        
        if (fares.length > 0) {
          reply = `💰 **Fare Information:**\n\n`;
          
          fares.forEach(fare => {
            reply += `**${fare.class_type}**\n`;
            reply += `💵 Per KM: ৳${fare.per_km_fare}\n\n`;
          });
          
          reply += "Note: Total fare = Per KM rate × Distance + applicable taxes";
        } else {
          reply = `Sorry, I couldn't find fare information for ${foundClass} class.`;
        }
      } else {
        reply = `Available ticket classes:
💺 **Shovan** - Economy class
🪑 **S_Chair** - Standard chair
🛋️ **F_Chair** - First class chair  
🛏️ **S_Berth** - Standard berth
🏨 **F_Berth** - First class berth
❄️ **AC_Chair** - AC chair
🏖️ **AC_Berth** - AC berth
✨ **Snigdha** - Premium class

Ask like: "What's the fare for AC Chair?" or "Snigdha class price"`;
      }
    }

    // Booking history queries
    else if (/\b(booking|history|my ticket|booked)\b/i.test(lowerMessage) && userId) {
      const bookings = await getUserBookings(userId);
      
      if (bookings.length > 0) {
        reply = `🎫 **Your Recent Bookings:**\n\n`;
        
        bookings.forEach(booking => {
          reply += `**${booking.train_name}**\n`;
          reply += `🚉 ${booking.source_station} → ${booking.destination_station}\n`;
          reply += `📅 ${formatDate(booking.departure_date)} at ${formatTime(booking.departure_time)}\n`;
          reply += `💺 Seat: ${booking.seat_number}\n`;
          reply += `💰 Price: ৳${booking.price}\n`;
          reply += `📊 Status: ${booking.status}\n\n`;
        });
      } else {
        reply = "You don't have any recent bookings. Would you like to search for trains to book?";
      }
    }

    // Cancellation queries
    else if (/\b(cancel|refund|cancellation)\b/i.test(lowerMessage)) {
      reply = `🔄 **Ticket Cancellation Information:**

To cancel your ticket:
1. Go to your booking history
2. Select the ticket you want to cancel
3. Choose cancellation reason
4. Submit cancellation request

📋 **Cancellation Policy:**
- Cancellation allowed up to 2 hours before departure
- Refund amount varies based on cancellation time
- Processing fee may apply
- Refund will be processed within 7-10 working days

Need help with a specific cancellation? Please provide your ticket ID.`;
    }

    // Help and general queries
    else if (/\b(help|support|assistance|how)\b/i.test(lowerMessage)) {
      reply = `🤖 **How I can help you:**

📊 **Train Information:**
- "Show trains from [source] to [destination]"
- "Train schedule for [train name]"
- "Departure time from [station]"

🎫 **Booking Support:**
- "Check availability for [train name]"
- "My booking history"
- "Cancel ticket [ticket ID]"

💰 **Fare & Pricing:**
- "Fare for [class type]"
- "Price from [source] to [destination]"

🚉 **Station Details:**
- "[Station name] contact information"
- "Location of [station name]"

Just ask me naturally, and I'll do my best to help!`;
    }

    // Thank you responses
    else if (/\b(thank|thanks|dhonnobad)\b/i.test(lowerMessage)) {
      reply = "You're welcome! 😊 Feel free to ask if you need any more help with your railway journey. Have a safe trip!";
    }

    // Default response for unrecognized queries
    else {
      reply = `I'd love to help you with that! I can assist with:

🚂 Train schedules and routes
🎫 Booking information
🚉 Station details  
💺 Seat availability
💰 Fare information

Try asking something like:
- "Show trains from Dhaka to Chittagong"
- "What's the AC Chair fare?"
- "Contact info for Sylhet station"

What specific information are you looking for?`;
    }

    res.json({ reply });

  } catch (error) {
    console.error('Chat API Error:', error);
    res.status(500).json({ 
      reply: "Sorry, I'm experiencing some technical difficulties. Please try again in a moment." 
    });
  }
});

module.exports = router;