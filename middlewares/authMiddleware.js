const jwt = require('jsonwebtoken');

const autenticarToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];

  if (!authHeader) return res.status(401).json({ error: 'Token no proporcionado' });

  const token = authHeader.split(' ')[1]; 

  if (!token) return res.status(401).json({ error: 'Token no proporcionado' });

  try {
    const usuario = jwt.verify(token, process.env.JWT_SECRET);
    req.usuario = usuario; q
    next();
  } catch (error) {
    return res.status(403).json({ error: 'Token inválido' });
  }
};

module.exports = autenticarToken;
