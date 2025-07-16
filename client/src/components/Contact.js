import React from 'react';

const Contact = () => {
  return (
    <div className="max-w-4xl mx-auto p-8">
      <h2 className="text-3xl font-bold text-gray-800 mb-6">Contact Us</h2>
      <p className="text-lg text-gray-600 mb-4">
        For any inquiries or support, please reach out to us through the following channels:
      </p>
      <ul className="list-disc list-inside text-lg text-gray-600">
        <li>Email: support@bdrailway.gov.bd</li>
        <li>Phone: +880 1234 567890</li>
        <li>Address: Railway Bhaban, Dhaka, Bangladesh</li>
      </ul>
    </div>
  );
};

export default Contact;
