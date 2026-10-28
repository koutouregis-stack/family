const validateRegister = ({ nom, prenom, email, password, confirmPassword }) => {
  if (!nom || !prenom || !email || !password || !confirmPassword) {
    return 'Tous les champs sont requis';
  }

  if (password.length < 8) {
    return 'Le mot de passe doit contenir au moins 8 caractères';
  }

  if (password !== confirmPassword) {
    return 'Les mots de passe ne correspondent pas';
  }

  return null;
};

const validateLogin = ({ email, password }) => {
  if (!email || !password) {
    return 'Email et mot de passe requis';
  }

  return null;
};

const validateInput = (validator) => (req, res, next) => {
  const error = validator(req.body);

  if (error) {
    return res.status(400).json({ error });
  }

  next();
};

module.exports = {
  validateRegister,
  validateLogin,
  validateInput
};
