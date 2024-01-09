import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import connect from './database/connect.js';
import router from './router/route.js';

import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.PORT || 8000;

app.use(express.static(path.join(__dirname, './client/build')));

app.get('*', function (req, res) {
  res.sendFile(path.join(__dirname, './client/build/index.html'));
});


app.use(express.json());
app.use(cors());
app.use(morgan('tiny'));
app.disable('x-powered-by');

app.get('/', (req, res) => {
  res.status(201).json('Password');
});

app.use('/api', router);

connect()
  .then(() => {
    try {
      app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
      });
    } catch (error) {
      console.log(error);
    }
  })
  .catch(error => {
    console.log(error);
  });
