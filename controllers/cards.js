const Card = require('../models/card');
const NotFoundError = require('../errors/not-found-err');
const RequestError = require('../errors/request-err');
const NotOwnerError = require('../errors/owner-err');

module.exports.getCards = (req, res, next) => {
  Card.find({})
    .then((cards) => res.status(200).send({ data: cards }))
    .catch(next);
};

module.exports.createCard = (req, res, next) => {
  const { name, link } = req.body;
  Card.create({
    name, link, owner: req.user._id,
  })
    .then((card) => res.status(201).send({ data: card }))
    .catch((err) => {
      if (err.name === 'ValidationError') {
        throw new RequestError('Переданы некорректные данные');
      }
    })
    .catch(next);
};

module.exports.deleteCard = (req, res, next) => {
  Card.findById(req.params.cardId)
    .then((card) => {
      if (!card) {
        throw new NotFoundError('Карточка не найдена');
      }
      if (card.owner !== req.user._id) {
        throw new NotOwnerError('Карточка принадлежит другому пользователю');
      }
      Card.findByIdAndRemove(req.params.cardId);
    })
    .then((card) => res.status(200).send({ data: card }))
    .catch(next);
};

module.exports.likeCard = (req, res, next) => {
  Card.findByIdAndUpdate(
    req.params.cardId,
    { $addToSet: { likes: req.user._id } }, // добавить _id в массив, если его там нет
    { new: true },
  )
    .orFail(new Error('PageNotFound'))
    .then((card) => res.status(200).send({ data: card }))
    .catch((err) => {
      if (err.message === 'PageNotFound') {
        throw new NotFoundError('Карточка не найдена');
      }
      if (err.name === 'CastError') {
        throw new RequestError('Переданы некорректные данные');
      }
    })
    .catch(next);
};

module.exports.dislikeCard = (req, res, next) => {
  Card.findByIdAndUpdate(
    req.params.cardId,
    { $pull: { likes: req.user._id } }, // убрать _id из массива
    { new: true },
  )
    .orFail(new Error('PageNotFound'))
    .then((card) => res.status(200).send({ data: card }))
    .catch((err) => {
      if (err.message === 'PageNotFound') {
        throw new NotFoundError('Карточка не найдена');
      }
      if (err.name === 'CastError') {
        throw new RequestError('Переданы некорректные данные');
      }
    })
    .catch(next);
};
