const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/user');
const NotFoundError = require('../errors/not-found-err');
const MongoError = require('../errors/mongo-err');
const RequestError = require('../errors/request-err');
const DataError = require('../errors/data-err');

module.exports.getUsers = (req, res, next) => {
  User.find({})
    .then((users) => res.status(200).send({ data: users }))
    .catch(next);
};

module.exports.getUser = (req, res, next) => {
  const { userId } = req.user._id;
  return User.findById(userId)
    .then((user) => {
      if (!user) {
        throw new Error('PageNotFound');
      }
      res.status(200).send({ data: user });
    })
    .catch((err) => {
      if (err.name === 'CastError') {
        throw new RequestError('Переданы некорректные данные');
      }
      if (err.message === 'PageNotFound') {
        throw new NotFoundError('Пользователь не найден');
      }
    })
    .catch(next);
};

module.exports.createUser = (req, res, next) => {
  const {
    name, about, avatar, email, password,
  } = req.body;
  bcrypt.hash(password, 10)
    .then((hash) => User.create({
      name, about, avatar, email, password: hash,
    })
      .catch((err) => {
        if (err.name === 'MongoError' && err.code === 11000) {
          throw new MongoError('Пользователь уже существует');
        }
        if (err.name === 'CastError') {
          throw new RequestError('Переданы некорректные данные');
        }
      }))
    .then((user) => res.status(201).send({ data: user }))
    .catch(next);
};

module.exports.updateUser = (req, res, next) => {
  User.findByIdAndUpdate(
    req.user._id,
    {
      name: req.body.name,
      about: req.body.about,
    },
    { new: true },
  )
    .then((user) => {
      if (!user) {
        throw new Error('PageNotFound');
      }
      res.status(200).send({ data: user });
    })
    .catch((err) => {
      if (err.name === 'ValidationError') {
        throw new RequestError('Переданы некорректные данные');
      }
      if (err.message === 'PageNotFound') {
        throw new NotFoundError('Пользователь не найден');
      }
    })
    .catch(next);
};

module.exports.updateAvatar = (req, res, next) => {
  User.findByIdAndUpdate(
    req.user._id,
    { avatar: req.body.avatar },
    { new: true },
  )
    .then((user) => {
      if (!user) {
        throw new Error('PageNotFound');
      }
      res.status(200).send({ data: user });
    })
    .catch((err) => {
      if (err.name === 'ValidationError') {
        throw new RequestError('Переданы некорректные данные');
      }
      if (err.message === 'PageNotFound') {
        throw new NotFoundError('Пользователь не найден');
      }
    })
    .catch(next);
};

module.exports.login = (req, res, next) => {
  const { email, password } = req.body;
  return User.findUserByCredentials(email, password)
    .then((user) => {
      const token = jwt.sign({ _id: user._id }, 'some-secret-key', { expiresIn: '7d' });
      res
        .cookie('jwt', token, {
          maxAge: 604800000,
          httpOnly: true,
        })
        .end();
    })
    .catch(() => {
      throw new DataError('Неправильные почта или пароль');
    })
    .catch(next);
};
