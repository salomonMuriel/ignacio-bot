import React from 'react';

const HomePage: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <h1 className="text-4xl font-bold text-gray-900 mb-4">
        Welcome to Ignacio Bot
      </h1>
      <p className="text-xl text-gray-600 mb-8 text-center max-w-2xl">
        Your construction project assistant
      </p>
      <div className="space-x-4">
        <button className="btn-primary">
          Get Started
        </button>
        <button className="btn-secondary">
          Learn More
        </button>
      </div>
    </div>
  );
};

export default HomePage;