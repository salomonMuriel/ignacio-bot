import React from 'react';

const LoginPage: React.FC = () => {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-lg shadow-md">
        <h2 className="text-3xl font-extrabold text-center text-ignia-dark-gray">
          Iniciar Sesión en Ignacio
        </h2>
        <p className="text-center text-gray-700">
          Ingresa tu número de teléfono para recibir un código OTP
        </p>
        {/* TODO: Add login form */}
      </div>
    </div>
  );
};

export default LoginPage;
