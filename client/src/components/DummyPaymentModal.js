import React, { useState } from 'react';

function DummyPaymentModal({ open, amount, onClose, onSuccess }) {
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState('');

  if (!open) return null;

  const handlePay = () => {
    setProcessing(true);
    setError('');
    setTimeout(() => {
      // Simulate payment success
      setProcessing(false);
      onSuccess();
    }, 1500);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-2xl p-8 w-full max-w-md relative">
        <button
          className="absolute top-3 right-3 text-gray-500 hover:text-gray-800 text-2xl"
          onClick={onClose}
          aria-label="Close"
          disabled={processing}
        >
          &times;
        </button>
        <h3 className="text-2xl font-bold mb-4 text-gray-800">Dummy Payment Gateway</h3>
        <p className="mb-4 text-gray-700">Enter your payment details to complete the booking.</p>
        <form onSubmit={e => { e.preventDefault(); handlePay(); }} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Card Number</label>
            <input type="text" className="w-full border border-gray-300 rounded-lg px-4 py-2" placeholder="1234 5678 9012 3456" disabled={processing} required maxLength={19} />
          </div>
          <div className="flex gap-2">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">Expiry</label>
              <input type="text" className="w-full border border-gray-300 rounded-lg px-4 py-2" placeholder="MM/YY" disabled={processing} required maxLength={5} />
            </div>
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">CVV</label>
              <input type="password" className="w-full border border-gray-300 rounded-lg px-4 py-2" placeholder="123" disabled={processing} required maxLength={4} />
            </div>
          </div>
          <div className="mt-4">
            <button type="submit" className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-lg" disabled={processing}>
              {processing ? 'Processing Payment...' : `Pay ৳${amount}`}
            </button>
          </div>
          {error && <div className="text-red-600 text-sm mt-2">{error}</div>}
        </form>
      </div>
    </div>
  );
}

export default DummyPaymentModal; 