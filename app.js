const express = require('express');

const { PORT = 3000 } = process.env;
const path = require('path');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const users = require('./routes/users');
const cards = require('./routes/cards');

const app = express();

mongoose.connect('mongodb://localhost:27017/mestodb', {
  useNewUrlParser: true,
  useCreateIndex: true,
  useFindAndModify: false,
  useUnifiedTopology: true,
});

app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.json());

app.use((req, res, next) => {
  req.user = {
    _id: '60b27459236acc35e0bc20e9',
  };

  next();
});

app.use('/', users);
app.use('/', cards);
app.use('/', (req, res) => { res.status(404).send('Данные не найдены'); });

app.listen(PORT);
