import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useFamily } from '../hooks/useFamily';
import { taskService } from '../services';

export default function Tasks() {
  const { familyId } = useParams();
  const navigate = useNavigate();
  const { currentFamily, selectFamily, getMembers, members } = useFamily();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    titre: '',
    description: '',
    assigned_to: '',
    date_limite: '',
    priority: 'medium'
  });

  useEffect(() => {
    selectFamily(familyId);
    getMembers(familyId);
    loadTasks();
  }, [familyId]);

  const loadTasks = async () => {
    try {
      setLoading(true);
      const response = await taskService.getTasks(familyId);
      setTasks(response.data);
    } catch (err) {
      console.error('Erreur:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTask = async (e) => {
    e.preventDefault();
    try {
      await taskService.createTask(
        familyId,
        formData.titre,
        formData.description,
        formData.assigned_to || null,
        formData.date_limite || null,
        formData.priority
      );
      setFormData({ titre: '', description: '', assigned_to: '', date_limite: '', priority: 'medium' });
      setShowForm(false);
      loadTasks();
    } catch (err) {
      console.error('Erreur:', err);
    }
  };

  const handleDeleteTask = async (taskId) => {
    if (window.confirm('Êtes-vous sûr?')) {
      try {
        await taskService.deleteTask(familyId, taskId);
        loadTasks();
      } catch (err) {
        console.error('Erreur:', err);
      }
    }
  };

  const handleStatusChange = async (taskId, newStatus) => {
    try {
      await taskService.updateTaskStatus(familyId, taskId, newStatus);
      loadTasks();
    } catch (err) {
      console.error('Erreur:', err);
    }
  };

  return (
    <div className="container">
      <h1 className="text-3xl font-bold mb-2">{currentFamily?.nom_famille} - Tâches</h1>

      <button
        onClick={() => setShowForm(!showForm)}
        className="btn btn-primary mb-6"
      >
        + Ajouter une tâche
      </button>

      {showForm && (
        <form onSubmit={handleCreateTask} className="card mb-6 max-w-2xl">
          <input
            type="text"
            placeholder="Titre"
            value={formData.titre}
            onChange={(e) => setFormData({ ...formData, titre: e.target.value })}
            className="input-field mb-4"
            required
          />
          <textarea
            placeholder="Description"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            className="input-field mb-4"
            rows="3"
          />
          <div className="grid grid-cols-3 gap-4 mb-4">
            <select
              value={formData.assigned_to}
              onChange={(e) => setFormData({ ...formData, assigned_to: e.target.value })}
              className="input-field"
            >
              <option value="">Assigner à</option>
              {members.map(member => (
                <option key={member.user_id} value={member.user_id}>
                  {member.prenom} {member.nom}
                </option>
              ))}
            </select>
            <input
              type="date"
              value={formData.date_limite}
              onChange={(e) => setFormData({ ...formData, date_limite: e.target.value })}
              className="input-field"
            />
            <select
              value={formData.priority}
              onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
              className="input-field"
            >
              <option value="low">Basse</option>
              <option value="medium">Moyenne</option>
              <option value="high">Haute</option>
            </select>
          </div>
          <button type="submit" className="btn btn-primary">Créer</button>
        </form>
      )}

      {loading ? (
        <div>Chargement...</div>
      ) : (
        <div className="space-y-4">
          {tasks.map(task => (
            <div key={task.id} className="card">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <h3 className="text-lg font-bold">{task.titre}</h3>
                  {task.description && <p className="text-gray-600">{task.description}</p>}
                  {task.assigned_name && <p className="text-sm text-gray-500">Assigné à: {task.assigned_name}</p>}
                  {task.date_limite && <p className="text-sm text-gray-500">Limite: {task.date_limite}</p>}
                </div>
                <div className="flex gap-2">
                  <select
                    value={task.status}
                    onChange={(e) => handleStatusChange(task.id, e.target.value)}
                    className="input-field text-sm"
                  >
                    <option value="pending">Pending</option>
                    <option value="in_progress">En cours</option>
                    <option value="completed">Complété</option>
                    <option value="cancelled">Annulé</option>
                  </select>
                  <button
                    onClick={() => handleDeleteTask(task.id)}
                    className="btn btn-danger btn-small"
                  >
                    Supprimer
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}