const express = require('express');
const { verifyToken } = require('../middleware/auth');
const { checkFamilyRole } = require('../middleware/roleCheck');
const pool = require('../config/database');

const router = express.Router();

// Get shopping items for family
router.get('/:familyId', verifyToken, checkFamilyRole(), async (req, res) => {
  try {
    const { familyId } = req.params;
    const { statut } = req.query;

    let query = `
      SELECT si.*, u.nom, u.prenom, CONCAT(u.nom, ' ', u.prenom) as created_by_name
      FROM shopping_items si
      JOIN users u ON si.created_by = u.id
      WHERE si.family_id = ?
    `;
    const params = [familyId];

    if (statut) {
      query += ' AND si.statut = ?';
      params.push(statut);
    }

    query += ' ORDER BY si.statut ASC, si.created_at DESC';

    const [items] = await pool.query(query, params);
    res.json(items);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erreur lors de la récupération de la liste de courses' });
  }
});

// Create shopping item
router.post('/:familyId', verifyToken, checkFamilyRole(), async (req, res) => {
  try {
    const { familyId } = req.params;
    const { nom_article, quantite, unite, categorie } = req.body;
    const userId = req.user.id;

    if (!nom_article) {
      return res.status(400).json({ error: 'Le nom de l\'article est requis' });
    }

    const [result] = await pool.query(
      `INSERT INTO shopping_items (family_id, nom_article, quantite, unite, categorie, created_by)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [familyId, nom_article, quantite || 1, unite || null, categorie || null, userId]
    );

    res.status(201).json({
      message: 'Article ajouté avec succès',
      item: { id: result.insertId, nom_article, quantite }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erreur lors de l\'ajout de l\'article' });
  }
});

// Update shopping item
router.put('/:familyId/:itemId', verifyToken, checkFamilyRole(), async (req, res) => {
  try {
    const { familyId, itemId } = req.params;
    const { nom_article, quantite, unite, categorie, statut } = req.body;

    const [items] = await pool.query(
      'SELECT id FROM shopping_items WHERE id = ? AND family_id = ?',
      [itemId, familyId]
    );

    if (items.length === 0) {
      return res.status(404).json({ error: 'Article introuvable' });
    }

    await pool.query(
      `UPDATE shopping_items SET nom_article = ?, quantite = ?, unite = ?, categorie = ?, statut = ?
       WHERE id = ?`,
      [nom_article, quantite, unite || null, categorie || null, statut || 'pending', itemId]
    );

    res.json({ message: 'Article mis à jour avec succès' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erreur lors de la mise à jour de l\'article' });
  }
});

// Delete shopping item
router.delete('/:familyId/:itemId', verifyToken, checkFamilyRole(), async (req, res) => {
  try {
    const { familyId, itemId } = req.params;

    const result = await pool.query(
      'DELETE FROM shopping_items WHERE id = ? AND family_id = ?',
      [itemId, familyId]
    );

    if (result[0].affectedRows === 0) {
      return res.status(404).json({ error: 'Article introuvable' });
    }

    res.json({ message: 'Article supprimé avec succès' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erreur lors de la suppression de l\'article' });
  }
});

module.exports = router;
