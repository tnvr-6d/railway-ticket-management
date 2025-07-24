import React from 'react';

function Footer({ onCreatorsClick }) {
  return (
    <footer className="bg-gray-800 text-gray-300 mt-auto">
      {/* Reduced vertical padding from py-8 to py-6 */}
      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8 grid md:grid-cols-3 gap-8">
        <div>
          <h4 className="font-bold text-lg text-white mb-2">Railway Booking</h4>
          <p className="text-sm">Your trusted partner for train travel across the country.</p>
        </div>
        <div>
          <h4 className="font-bold text-lg text-white mb-2">Quick Links</h4>
          <p className="text-sm">Book Tickets • Cancel Tickets • Customer Support • Terms & Conditions</p>
          <p className="text-sm mt-2">
            <a href="#" onClick={e => { e.preventDefault(); onCreatorsClick && onCreatorsClick(); }} className="text-blue-400 hover:underline" id="creators-link">Creators</a>
          </p>
        </div>
        <div>
          <h4 className="font-bold text-lg text-white mb-2">Contact Us</h4>
          <div className="text-sm space-y-1">
            <p>📞 01577088591</p>
            <p>✉️ support@railway.com</p>
            <p>🏢 Buet Cse Software company limited</p>
          </div>
        </div>
      </div>
      {/* Reduced padding on the bottom bar from py-3 to py-2 */}
      <div className="bg-gray-900 py-2">
        <p className="text-center text-sm text-gray-400">&copy; 2025 Railway Booking System. All rights reserved.</p>
      </div>
    </footer>
  );
}

export default Footer;