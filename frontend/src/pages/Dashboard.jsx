import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useFamily } from '../hooks/useFamily';

export default function Dashboard() {
  const { user } = useAuth();
  const { families, getFamilies, createFamily, loading, error } = useFamily();
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newFamily, setNewFamily] = useState({ nom_famille: '', description: '' });
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      getFamilies();
    }
  }, [user]);

  const handleCreateFamily = async (e) => {
    e.preventDefault();
    try {
      await createFamily(newFamily.nom_famille, newFamily.description);
      setNewFamily({ nom_famille: '', description: '' });
      setShowCreateForm(false);
      getFamilies();
    } catch (err) {
      console.error('Erreur:', err);
    }
  };

  if (!user) {
    return <div className="text-center py-8">Veuillez vous connecter</div>;
  }

  return (
    <div className="container">
      <h1 className="text-3xl font-bold mb-8">Tableau de bord</h1>

      <div className="mb-8">
        <button
          onClick={() => setShowCreateForm(!showCreateForm)}
          className="btn btn-primary"
        >
          + Créer une famille
        </button>

        {showCreateForm && (
          <form onSubmit={handleCreateFamily} className="card mt-4 max-w-md">
            <input
              type="text"
              placeholder="Nom de la famille"
              value={newFamily.nom_famille}
              onChange={(e) => setNewFamily({ ...newFamily, nom_famille: e.target.value })}
              className="input-field mb-4"
              required
            />
            <textarea
              placeholder="Description"
              value={newFamily.description}
              onChange={(e) => setNewFamily({ ...newFamily, description: e.target.value })}
              className="input-field mb-4"
              rows="3"
            />
            <button type="submit" className="btn btn-primary">
              Créer
            </button>
          </form>
        )}
      </div>

      {error && <div className="error mb-4">{error}</div>}

      {loading ? (
        <div>Chargement...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {families.map(family => (
            <div
              key={family.id}
              className="card cursor-pointer hover:shadow-lg transition"
              onClick={() => navigate(`/family/${family.id}`)}
            >
              <h2 className="text-xl font-bold mb-2">{family.nom_famille}</h2>
              <p className="text-gray-600">{family.description || 'Aucune description'}</p>
              <span className="inline-block mt-4 text-sm bg-blue-100 text-blue-800 px-3 py-1 rounded">
                {family.role === 'admin' ? 'Admin' : 'Membre'}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}