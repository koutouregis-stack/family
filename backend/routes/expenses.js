const express = require('express');
const { verifyToken } = require('../middleware/auth');
const { checkFamilyRole } = require('../middleware/roleCheck');
const pool = require('../config/database');

const router = express.Router();

// Get expenses for family
router.get('/:familyId', verifyToken, checkFamilyRole(), async (req, res) => {
  try {
    const { familyId } = req.params;
    const { startDate, endDate, categorie } = req.query;

    let query = `
      SELECT e.*, u.nom, u.prenom, CONCAT(u.nom, ' ', u.prenom) as created_by_name
      FROM expenses e
      JOIN users u ON e.created_by = u.id
      WHERE e.family_id = ?
    `;
    const params = [familyId];

    if (startDate) {
      query += ' AND e.date_depense >= ?';
      params.push(startDate);
    }
    if (endDate) {
      query += ' AND e.date_depense <= ?';
      params.push(endDate);
    }
    if (categorie) {
      query += ' AND e.categorie = ?';
      params.push(categorie);
    }

    query += ' ORDER BY e.date_depense DESC';

    const [expenses] = await pool.query(query, params);
    res.json(expenses);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erreur lors de la récupération des dépenses' });
  }
});

// Get expense statistics
router.get('/:familyId/stats', verifyToken, checkFamilyRole(), async (req, res) => {
  try {
    const { familyId } = req.params;
    const { month, year } = req.query;

    let query = `
      SELECT 
        categorie,
        COUNT(*) as count,
        SUM(montant) as total,
        AVG(montant) as moyenne
      FROM expenses
      WHERE family_id = ?
    `;
    const params = [familyId];

    if (month && year) {
      query += ' AND MONTH(date_depense) = ? AND YEAR(date_depense) = ?';
      params.push(month, year);
    }

    query += ' GROUP BY categorie';

    const [stats] = await pool.query(query, params);

    // Get total
    const [total] = await pool.query(
      `SELECT SUM(montant) as total FROM expenses WHERE family_id = ?${
        month && year ? ' AND MONTH(date_depense) = ? AND YEAR(date_depense) = ?' : ''
      }`,
      month && year ? [familyId, month, year] : [familyId]
    );

    res.json({ byCategory: stats, total: total[0].total || 0 });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erreur lors de la récupération des statistiques' });
  }
});

// Create expense
router.post('/:familyId', verifyToken, checkFamilyRole(), async (req, res) => {
  try {
    const { familyId } = req.params;
    const { titre, montant, categorie, description, date_depense } = req.body;
    const userId = req.user.id;

    if (!titre || !montant || !categorie || !date_depense) {
      return res.status(400).json({ error: 'Tous les champs sont requis' });
    }

    const [result] = await pool.query(
      `INSERT INTO expenses (family_id, titre, montant, categorie, description, date_depense, created_by)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [familyId, titre, montant, categorie, description || null, date_depense, userId]
    );

    res.status(201).json({
      message: 'Dépense créée avec succès',
      expense: { id: result.insertId, titre, montant }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erreur lors de la création de la dépense' });
  }
});

// Update expense
router.put('/:familyId/:expenseId', verifyToken, checkFamilyRole(), async (req, res) => {
  try {
    const { familyId, expenseId } = req.params;
    const { titre, montant, categorie, description, date_depense } = req.body;

    const [expenses] = await pool.query(
      'SELECT id FROM expenses WHERE id = ? AND family_id = ?',
      [expenseId, familyId]
    );

    if (expenses.length === 0) {
      return res.status(404).json({ error: 'Dépense introuvable' });
    }

    await pool.query(
      `UPDATE expenses SET titre = ?, montant = ?, categorie = ?, description = ?, date_depense = ?
       WHERE id = ?`,
      [titre, montant, categorie, description, date_depense, expenseId]
    );

    res.json({ message: 'Dépense mise à jour avec succès' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erreur lors de la mise à jour de la dépense' });
  }
});

// Delete expense
router.delete('/:familyId/:expenseId', verifyToken, checkFamilyRole(), async (req, res) => {
  try {
    const { familyId, expenseId } = req.params;

    const result = await pool.query(
      'DELETE FROM expenses WHERE id = ? AND family_id = ?',
      [expenseId, familyId]
    );

    if (result[0].affectedRows === 0) {
      return res.status(404).json({ error: 'Dépense introuvable' });
    }

    res.json({ message: 'Dépense supprimée avec succès' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erreur lors de la suppression de la dépense' });
  }
});

module.exports = router;
