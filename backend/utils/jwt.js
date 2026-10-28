const jwt = require('jsonwebtoken');

const generateTokenPair = (user) => {
  const payload = {
    id: user.id,
    nom: user.nom,
    prenom: user.prenom,
    email: user.email,
    role: user.role || 'user'
  };

  const accessToken = jwt.sign(
    payload,
    process.env.JWT_SECRET || 'development_secret',
    { expiresIn: process.env.JWT_EXPIRY || '24h' }
  );

  const refreshToken = jwt.sign(
    { id: user.id },
    process.env.JWT_REFRESH_SECRET || 'refresh_secret',
    { expiresIn: process.env.JWT_REFRESH_EXPIRY || '7d' }
  );

  return { accessToken, refreshToken };
};

module.exports = {
  generateTokenPair
};
