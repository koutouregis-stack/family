import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

export default function Navigation() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="bg-blue-600 text-white shadow-lg">
      <div className="container flex justify-between items-center py-4">
        <Link to="/" className="text-2xl font-bold">
          👨‍👩‍👧‍👦 Family
        </Link>

        {user ? (
          <div className="flex items-center gap-6">
            <span>Bienvenue, {user.prenom}</span>
            <button
              onClick={handleLogout}
              className="btn btn-secondary"
            >
              Déconnexion
            </button>
          </div>
        ) : (
          <div className="flex gap-4">
            <Link to="/login" className="btn btn-secondary">
              Connexion
            </Link>
            <Link to="/register" className="btn bg-white text-blue-600 hover:bg-gray-100">
              Inscription
            </Link>
          </div>
        )}
      </div>
    </nav>
  );
}