import React from 'react';

const LoginPage: React.FC = () => {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-lg shadow-md">
        <h2 className="text-3xl font-bold text-center text-gray-900">
          Login to Ignacio
        </h2>
        <p className="text-center text-gray-600">
          Enter your phone number to receive an OTP
        </p>
        {/* TODO: Add login form */}
      </div>
    </div>
  );
};

export default LoginPage;