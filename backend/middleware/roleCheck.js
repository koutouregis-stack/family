const pool = require('../config/database');

const checkFamilyRole = (allowedRoles = ['admin', 'member']) => async (req, res, next) => {
  const familyId = Number(req.params.familyId);
  const userId = req.user?.id;

  if (!familyId || !userId) {
    return res.status(403).json({ error: 'Accès refusé' });
  }

  try {
    const [rows] = await pool.query(
      'SELECT role FROM family_members WHERE family_id = ? AND user_id = ?',
      [familyId, userId]
    );

    if (!rows.length) {
      return res.status(403).json({ error: 'Vous n\'êtes pas membre de cette famille' });
    }

    const familyRole = rows[0].role;

    if (allowedRoles && !allowedRoles.includes(familyRole)) {
      return res.status(403).json({ error: 'Vous n\'êtes pas autorisé à accéder à cette famille' });
    }

    req.familyRole = familyRole;
    next();
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Erreur lors de la vérification des permissions' });
  }
};

module.exports = {
  checkFamilyRole
};
