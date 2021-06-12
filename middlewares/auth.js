const jwt = require('jsonwebtoken');
const DataError = require('../errors/data-err');

module.exports = (req, res, next) => {
  const token = req.cookies.jwt;
  let payload;
  try {
    payload = jwt.verify(token, 'some-secret-key');
  } catch (err) {
    throw new DataError('Неправильные почта или пароль');
  }
  req.user = payload;
  next();
};
