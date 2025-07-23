import React from 'react';

const creators = [
  {
    name: 'Mamun',
    image: '/mamun.png',
    description: 'Mamun is a passionate software developer and co-creator of this Railway Booking System. He specializes in backend development and system design, ensuring the platform is robust and reliable.'
  },
  {
    name: 'Tahmid',
    image: '/tahmid.jpg',
    description: 'Tahmid is a talented frontend engineer and co-creator of this website. He focuses on user experience and interface design, making the booking process smooth and intuitive for everyone.'
  }
];

function Creators({ onBack }) {
  return (
    <div className="max-w-3xl mx-auto py-12 px-4">
      {onBack && (
        <button
          onClick={onBack}
          className="mb-6 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
        >
          ← Back
        </button>
      )}
      <h2 className="text-3xl font-bold text-center mb-8">Meet the Creators</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {creators.map((creator) => (
          <div key={creator.name} className="bg-white rounded-lg shadow p-6 flex flex-col items-center">
            <img
              src={creator.image}
              alt={creator.name}
              className="w-40 h-40 object-cover rounded-full mb-4 border-4 border-blue-500"
            />
            <h3 className="text-xl font-semibold mb-2">{creator.name}</h3>
            <p className="text-gray-700 text-center">{creator.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Creators; 