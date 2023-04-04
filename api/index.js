const express = require('express');
const mysql = require('mysql2/promise');
const app = express();

const NUM_INSTANCES = 10;
const NUM_PER_INSTANCE = 1000;

const DB_CONFIG = {
  host: '34.77.83.66',
  user: 'root',
  password: 'DO\K4Rs<_-YPre8x',
  database: 'numbersdb'
};

app.post('/generate', async (req, res) => {
  const connection = await mysql.createConnection(DB_CONFIG);

  for (let i = 0; i < NUM_INSTANCES; i++) {
    const instanceName = `instance-${i}`;
    for (let j = 0; j < NUM_PER_INSTANCE; j++) {
      const randomNumber = Math.floor(Math.random() * 100001);
      await connection.execute('INSERT INTO numbers (instance, value) VALUES (?, ?)', [instanceName, randomNumber]);
    }
  }

  await connection.end();
  res.sendStatus(200);
});

app.get('/results', async (req, res) => {
  const connection = await mysql.createConnection(DB_CONFIG);

  // Get the results
  const [rows] = await connection.execute('SELECT instance, COUNT(*) as count, MIN(value) as min, MAX(value) as max FROM numbers GROUP BY instance');
  const [minRow] = await connection.execute('SELECT instance, value FROM numbers WHERE value = (SELECT MIN(value) FROM numbers)');
  const [maxRow] = await connection.execute('SELECT instance, value FROM numbers WHERE value = (SELECT MAX(value) FROM numbers)');

  await connection.end();

  const output = {
    table: rows,
    smallestNumber: {
      instance: minRow[0].instance,
      value: minRow[0].value
    },
    largestNumber: {
      instance: maxRow[0].instance,
      value: maxRow[0].value
    }
  };

  res.send(output);
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`API server listening on port ${PORT}`);
});
