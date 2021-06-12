const router = require('express').Router();
const { celebrate, Joi } = require('celebrate');

const {
  getUsers, getUserMe, getUser, updateUser, updateAvatar,
} = require('../controllers/users');

router.get('/users', getUsers);
router.get('/users/me', getUserMe);
router.get('/users/:userId', celebrate({
  params: Joi.object().keys({
    userId: Joi.string().required().hex().length(24),
  }),
}), getUser);
router.patch('/users/me/avatar', celebrate({
  body: Joi.object().keys({
    avatar: Joi.string().required().regex(/^https?:\/\/(www\.)?([\w.]+?)\.([a-z]{2,6})([\w\d\-._~:/?#[\]@!$&'()*+,;=]*)#?$/),
  }),
}), updateAvatar);
router.patch('/users/me', celebrate({
  body: Joi.object().keys({
    name: Joi.string().required().min(2).max(30),
    about: Joi.string().required().min(2).max(30),
  }),
}), updateUser);

module.exports = router;
