const express = require('express');
const crypto = require('crypto');
const { verifyToken } = require('../middleware/auth');
const { checkFamilyRole } = require('../middleware/roleCheck');
const pool = require('../config/database');

const router = express.Router();

router.get('/', verifyToken, async (req, res) => {
  try {
    const [families] = await pool.query(
      `SELECT f.*, fm.role
       FROM family_members fm
       JOIN families f ON f.id = fm.family_id
       WHERE fm.user_id = ?
       ORDER BY f.created_at DESC`,
      [req.user.id]
    );

    res.json(families);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erreur lors de la récupération des familles' });
  }
});

router.post('/', verifyToken, async (req, res) => {
  try {
    const { nom_famille, description } = req.body;

    if (!nom_famille || !String(nom_famille).trim()) {
      return res.status(400).json({ error: 'Le nom de la famille est requis' });
    }

    const [result] = await pool.query(
      'INSERT INTO families (nom_famille, description, created_by) VALUES (?, ?, ?)',
      [String(nom_famille).trim(), description || null, req.user.id]
    );

    await pool.query(
      'INSERT INTO family_members (family_id, user_id, role) VALUES (?, ?, ?)',
      [result.insertId, req.user.id, 'admin']
    );

    const [familyRows] = await pool.query(
      `SELECT f.*, fm.role
       FROM families f
       JOIN family_members fm ON fm.family_id = f.id
       WHERE f.id = ? AND fm.user_id = ?`,
      [result.insertId, req.user.id]
    );

    res.status(201).json({
      message: 'Famille créée avec succès',
      family: familyRows[0]
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erreur lors de la création de la famille' });
  }
});

router.get('/:familyId', verifyToken, checkFamilyRole(), async (req, res) => {
  try {
    const { familyId } = req.params;

    const [rows] = await pool.query(
      `SELECT f.*, fm.role
       FROM families f
       JOIN family_members fm ON fm.family_id = f.id
       WHERE f.id = ? AND fm.user_id = ?`,
      [familyId, req.user.id]
    );

    if (!rows.length) {
      return res.status(404).json({ error: 'Famille introuvable' });
    }

    res.json(rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erreur lors de la récupération de la famille' });
  }
});

router.get('/:familyId/members', verifyToken, checkFamilyRole(), async (req, res) => {
  try {
    const { familyId } = req.params;

    const [rows] = await pool.query(
      `SELECT fm.id AS membership_id, fm.role, u.id AS user_id, u.nom, u.prenom, u.email
       FROM family_members fm
       JOIN users u ON u.id = fm.user_id
       WHERE fm.family_id = ?
       ORDER BY u.prenom ASC`,
      [familyId]
    );

    res.json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erreur lors de la récupération des membres' });
  }
});

router.post('/:familyId/members/invite', verifyToken, checkFamilyRole(['admin']), async (req, res) => {
  try {
    const { familyId } = req.params;
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ error: 'L\'email est requis' });
    }

    const [existingUserRows] = await pool.query('SELECT id FROM users WHERE email = ? AND is_active = TRUE', [email]);

    if (!existingUserRows.length) {
      return res.status(404).json({ error: 'Aucun utilisateur trouvé avec cet email' });
    }

    const userId = existingUserRows[0].id;
    const [memberRows] = await pool.query(
      'SELECT id FROM family_members WHERE family_id = ? AND user_id = ?',
      [familyId, userId]
    );

    if (memberRows.length) {
      return res.status(409).json({ error: 'Cet utilisateur est déjà membre de la famille' });
    }

    const token = crypto.randomBytes(32).toString('hex');

    await pool.query(
      'INSERT INTO invitations (family_id, email, token, created_by, expires_at) VALUES (?, ?, ?, ?, DATE_ADD(NOW(), INTERVAL 7 DAY))',
      [familyId, email, token, req.user.id]
    );

    res.status(201).json({
      message: 'Invitation envoyée',
      token
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erreur lors de l\'invitation' });
  }
});

router.post('/invite/:token/accept', verifyToken, async (req, res) => {
  try {
    const { token } = req.params;

    const [invitationRows] = await pool.query(
      `SELECT * FROM invitations
       WHERE token = ? AND is_used = FALSE AND expires_at > NOW()`,
      [token]
    );

    if (!invitationRows.length) {
      return res.status(400).json({ error: 'Invitation invalide ou expirée' });
    }

    const invitation = invitationRows[0];
    const userEmail = req.user.email;

    if (invitation.email !== userEmail) {
      return res.status(403).json({ error: 'Cette invitation ne correspond pas à votre compte' });
    }

    const [existingMemberRows] = await pool.query(
      'SELECT id FROM family_members WHERE family_id = ? AND user_id = ?',
      [invitation.family_id, req.user.id]
    );

    if (!existingMemberRows.length) {
      await pool.query(
        'INSERT INTO family_members (family_id, user_id, role) VALUES (?, ?, ?)',
        [invitation.family_id, req.user.id, 'member']
      );
    }

    await pool.query(
      'UPDATE invitations SET is_used = TRUE WHERE token = ?',
      [token]
    );

    res.json({ message: 'Invitation acceptée avec succès' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erreur lors de l\'acceptation de l\'invitation' });
  }
});

router.delete('/:familyId/members/:memberId', verifyToken, checkFamilyRole(['admin']), async (req, res) => {
  try {
    const { familyId, memberId } = req.params;

    const [result] = await pool.query(
      'DELETE FROM family_members WHERE family_id = ? AND id = ?',
      [familyId, memberId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Membre introuvable' });
    }

    res.json({ message: 'Membre supprimé avec succès' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erreur lors de la suppression du membre' });
  }
});

module.exports = router;
