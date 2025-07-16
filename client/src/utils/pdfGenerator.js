// PDF Generator Utility for Railway Tickets

export const generateTicketPDF = (ticket) => {
  // Create a new window for PDF generation
  const printWindow = window.open('', '_blank');
  
  // Generate the HTML content for the ticket
  const ticketHTML = generateTicketHTML(ticket);
  
  printWindow.document.write(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>Railway Ticket - ${ticket.ticket_id}</title>
      <style>
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
        
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }
        
        body {
          font-family: 'Inter', sans-serif;
          line-height: 1.6;
          color: #1f2937;
          background: #f8fafc;
        }
        
        .ticket-container {
          max-width: 800px;
          margin: 20px auto;
          background: white;
          border-radius: 16px;
          box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
          overflow: hidden;
        }
        
        .header {
          background: linear-gradient(135deg, #4f46e5, #7c3aed);
          color: white;
          padding: 24px;
          text-align: center;
        }
        
        .header h1 {
          font-size: 28px;
          font-weight: 700;
          margin-bottom: 8px;
        }
        
        .header p {
          font-size: 16px;
          opacity: 0.9;
        }
        
        .ticket-info {
          padding: 32px;
        }
        
        .ticket-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 24px;
          padding-bottom: 16px;
          border-bottom: 2px solid #e5e7eb;
        }
        
        .ticket-id {
          font-size: 24px;
          font-weight: 700;
          color: #4f46e5;
        }
        
        .status {
          padding: 8px 16px;
          border-radius: 20px;
          font-size: 14px;
          font-weight: 600;
          text-transform: uppercase;
        }
        
        .status.booked {
          background: #dcfce7;
          color: #166534;
        }
        
        .status.cancelled {
          background: #fef2f2;
          color: #dc2626;
        }
        
        .status.pending {
          background: #fef3c7;
          color: #d97706;
        }
        
        .route-info {
          margin-bottom: 24px;
        }
        
        .route-title {
          font-size: 20px;
          font-weight: 600;
          margin-bottom: 8px;
          color: #374151;
        }
        
        .route-details {
          display: flex;
          align-items: center;
          font-size: 18px;
          color: #6b7280;
        }
        
        .arrow {
          margin: 0 16px;
          color: #4f46e5;
          font-weight: 700;
        }
        
        .journey-details {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 24px;
          margin-bottom: 24px;
        }
        
        .detail-group {
          background: #f9fafb;
          padding: 16px;
          border-radius: 12px;
          border-left: 4px solid #4f46e5;
        }
        
        .detail-label {
          font-size: 12px;
          font-weight: 600;
          color: #6b7280;
          text-transform: uppercase;
          margin-bottom: 4px;
        }
        
        .detail-value {
          font-size: 16px;
          font-weight: 600;
          color: #374151;
        }
        
        .passenger-info {
          background: #f0f9ff;
          padding: 20px;
          border-radius: 12px;
          margin-bottom: 24px;
        }
        
        .passenger-title {
          font-size: 18px;
          font-weight: 600;
          color: #0369a1;
          margin-bottom: 12px;
        }
        
        .passenger-details {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 16px;
        }
        
        .price-section {
          text-align: center;
          padding: 24px;
          background: linear-gradient(135deg, #f8fafc, #e2e8f0);
          border-radius: 12px;
        }
        
        .price-label {
          font-size: 14px;
          color: #6b7280;
          margin-bottom: 8px;
        }
        
        .price-value {
          font-size: 32px;
          font-weight: 700;
          color: #059669;
        }
        
        .footer {
          padding: 24px;
          background: #f9fafb;
          text-align: center;
          border-top: 1px solid #e5e7eb;
        }
        
        .footer p {
          color: #6b7280;
          font-size: 14px;
        }
        
        .qr-section {
          text-align: center;
          padding: 20px;
          background: #f8fafc;
          border-radius: 12px;
          margin-top: 24px;
        }
        
        .qr-placeholder {
          width: 120px;
          height: 120px;
          background: #e5e7eb;
          border-radius: 8px;
          margin: 0 auto 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 12px;
          color: #6b7280;
        }
        
        @media print {
          body {
            background: white;
          }
          
          .ticket-container {
            box-shadow: none;
            margin: 0;
          }
        }
      </style>
    </head>
    <body>
      ${ticketHTML}
    </body>
    </html>
  `);
  
  printWindow.document.close();
  
  // Wait for content to load then print
  printWindow.onload = () => {
    printWindow.print();
    printWindow.close();
  };
};

const generateTicketHTML = (ticket) => {
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
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
  
  const getStatusClass = (status) => {
    switch (status.toLowerCase()) {
      case 'booked':
        return 'booked';
      case 'cancelled':
        return 'cancelled';
      case 'pending cancellation':
        return 'pending';
      default:
        return 'booked';
    }
  };
  
  return `
    <div class="ticket-container">
      <div class="header">
        <h1>🚆 Bangladesh Railway</h1>
        <p>Official Travel Ticket</p>
      </div>
      
      <div class="ticket-info">
        <div class="ticket-header">
          <div class="ticket-id">Ticket #${ticket.ticket_id}</div>
          <div class="status ${getStatusClass(ticket.status)}">${ticket.status}</div>
        </div>
        
        <div class="route-info">
          <div class="route-title">Journey Details</div>
          <div class="route-details">
            <span>${ticket.source}</span>
            <span class="arrow">→</span>
            <span>${ticket.destination}</span>
          </div>
        </div>
        
        <div class="journey-details">
          <div class="detail-group">
            <div class="detail-label">Train</div>
            <div class="detail-value">${ticket.train_name}</div>
          </div>
          
          <div class="detail-group">
            <div class="detail-label">Coach</div>
            <div class="detail-value">${ticket.coach_number}</div>
          </div>
          
          <div class="detail-group">
            <div class="detail-label">Seat</div>
            <div class="detail-value">${ticket.seat_number} (${ticket.class_type})</div>
          </div>
          
          <div class="detail-group">
            <div class="detail-label">Date</div>
            <div class="detail-value">${formatDate(ticket.departure_date)}</div>
          </div>
          
          <div class="detail-group">
            <div class="detail-label">Departure</div>
            <div class="detail-value">${formatTime(ticket.departure_time)}</div>
          </div>
          
          <div class="detail-group">
            <div class="detail-label">Duration</div>
            <div class="detail-value">${ticket.duration} min</div>
          </div>
        </div>
        
        <div class="passenger-info">
          <div class="passenger-title">Passenger Information</div>
          <div class="passenger-details">
            <div>
              <div class="detail-label">Passenger ID</div>
              <div class="detail-value">#${ticket.passenger_id}</div>
            </div>
            <div>
              <div class="detail-label">Booking Date</div>
              <div class="detail-value">${formatDate(ticket.booking_date)}</div>
            </div>
          </div>
        </div>
        
        <div class="price-section">
          <div class="price-label">Total Amount</div>
          <div class="price-value">$${ticket.price}</div>
        </div>
        
        <div class="qr-section">
          <div class="qr-placeholder">
            QR Code<br>Placeholder
          </div>
          <p>Scan for verification</p>
        </div>
      </div>
      
      <div class="footer">
        <p>Thank you for choosing Bangladesh Railway</p>
        <p>For support, contact: support@bangladeshrailway.gov.bd</p>
        <p>Generated on: ${new Date().toLocaleString()}</p>
      </div>
    </div>
  `;
};

// Alternative method using jsPDF (if available)
export const generatePDFWithJsPDF = async (ticket) => {
  try {
    // Dynamic import to avoid issues if jsPDF is not installed
    const { jsPDF } = await import('jspdf');
    
    const doc = new jsPDF();
    
    // Add header
    doc.setFontSize(24);
    doc.setTextColor(79, 70, 229);
    doc.text('🚆 Bangladesh Railway', 105, 20, { align: 'center' });
    
    doc.setFontSize(12);
    doc.setTextColor(107, 114, 128);
    doc.text('Official Travel Ticket', 105, 30, { align: 'center' });
    
    // Add ticket info
    doc.setFontSize(16);
    doc.setTextColor(31, 41, 55);
    doc.text(`Ticket #${ticket.ticket_id}`, 20, 50);
    
    // Add route
    doc.setFontSize(14);
    doc.text(`${ticket.source} → ${ticket.destination}`, 20, 70);
    
    // Add details
    doc.setFontSize(10);
    doc.text(`Train: ${ticket.train_name}`, 20, 90);
    doc.text(`Date: ${new Date(ticket.departure_date).toLocaleDateString()}`, 20, 100);
    doc.text(`Time: ${ticket.departure_time}`, 20, 110);
    doc.text(`Seat: ${ticket.seat_number} (${ticket.class_type})`, 20, 120);
    doc.text(`Price: $${ticket.price}`, 20, 130);
    
    // Save the PDF
    doc.save(`ticket-${ticket.ticket_id}.pdf`);
    
  } catch (error) {
    console.error('jsPDF not available, falling back to print method');
    generateTicketPDF(ticket);
  }
}; 