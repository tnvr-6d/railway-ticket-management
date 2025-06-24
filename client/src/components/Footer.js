import React from 'react';

function Footer() {
  return (
    <footer className="footer">
      <div className="footer-content">
        <div className="footer-section">
          <h4>Railway Booking</h4>
          <p>Your trusted partner for train travel across the country.</p>
        </div>
        <div className="footer-section">
          <h4>Quick Links</h4>
          <p>Book Tickets • Cancel Tickets • Customer Support • Terms & Conditions</p>
        </div>
        <div className="footer-section">
          <h4>Contact Us</h4>
          <p>
            📞 01577088591<br />
            ✉️ support@railway.com<br />
            🏢 Buet Cse Software company limited
          </p>
        </div>
      </div>
      <div className="footer-bottom">
        <p>&copy; 2025 Railway Booking System. All rights reserved.</p>
      </div>
    </footer>
  );
}

export default Footer;