const express = require('express');
const { verifyToken } = require('../middleware/auth');
const { checkFamilyRole } = require('../middleware/roleCheck');
const pool = require('../config/database');

const router = express.Router();

// Get tasks for family
router.get('/:familyId', verifyToken, checkFamilyRole(), async (req, res) => {
  try {
    const { familyId } = req.params;
    const { status } = req.query;

    let query = `
      SELECT t.*, u.nom, u.prenom, 
             CONCAT(u.nom, ' ', u.prenom) as assigned_name
      FROM tasks t
      LEFT JOIN users u ON t.assigned_to = u.id
      WHERE t.family_id = ?
    `;
    const params = [familyId];

    if (status) {
      query += ' AND t.status = ?';
      params.push(status);
    }

    query += ' ORDER BY t.date_limite ASC, t.priority DESC';

    const [tasks] = await pool.query(query, params);
    res.json(tasks);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erreur lors de la récupération des tâches' });
  }
});

// Create task
router.post('/:familyId', verifyToken, checkFamilyRole(), async (req, res) => {
  try {
    const { familyId } = req.params;
    const { titre, description, assigned_to, date_limite, priority } = req.body;
    const userId = req.user.id;

    if (!titre) {
      return res.status(400).json({ error: 'Le titre est requis' });
    }

    const [result] = await pool.query(
      `INSERT INTO tasks (family_id, titre, description, assigned_to, date_limite, priority, created_by)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [familyId, titre, description || null, assigned_to || null, date_limite || null, priority || 'medium', userId]
    );

    res.status(201).json({
      message: 'Tâche créée avec succès',
      task: { id: result.insertId, titre, description }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erreur lors de la création de la tâche' });
  }
});

// Update task
router.put('/:familyId/:taskId', verifyToken, checkFamilyRole(), async (req, res) => {
  try {
    const { familyId, taskId } = req.params;
    const { titre, description, assigned_to, status, date_limite, priority } = req.body;

    const [tasks] = await pool.query(
      'SELECT id FROM tasks WHERE id = ? AND family_id = ?',
      [taskId, familyId]
    );

    if (tasks.length === 0) {
      return res.status(404).json({ error: 'Tâche introuvable' });
    }

    await pool.query(
      `UPDATE tasks SET titre = ?, description = ?, assigned_to = ?, status = ?, date_limite = ?, priority = ?
       WHERE id = ?`,
      [titre, description, assigned_to || null, status, date_limite || null, priority, taskId]
    );

    res.json({ message: 'Tâche mise à jour avec succès' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erreur lors de la mise à jour de la tâche' });
  }
});

// Delete task
router.delete('/:familyId/:taskId', verifyToken, checkFamilyRole(), async (req, res) => {
  try {
    const { familyId, taskId } = req.params;

    const result = await pool.query(
      'DELETE FROM tasks WHERE id = ? AND family_id = ?',
      [taskId, familyId]
    );

    if (result[0].affectedRows === 0) {
      return res.status(404).json({ error: 'Tâche introuvable' });
    }

    res.json({ message: 'Tâche supprimée avec succès' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erreur lors de la suppression de la tâche' });
  }
});

// Change task status
router.patch('/:familyId/:taskId/status', verifyToken, checkFamilyRole(), async (req, res) => {
  try {
    const { familyId, taskId } = req.params;
    const { status } = req.body;

    const validStatuses = ['pending', 'in_progress', 'completed', 'cancelled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: 'Statut invalide' });
    }

    await pool.query(
      'UPDATE tasks SET status = ? WHERE id = ? AND family_id = ?',
      [status, taskId, familyId]
    );

    res.json({ message: 'Statut de la tâche mise à jour' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erreur lors de la mise à jour du statut' });
  }
});

module.exports = router;
