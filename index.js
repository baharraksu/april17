"use strict";
const express = require('express');
const redis = require('redis');
const app = express();
//const mysql = require('mysql');
const dbConnection = require("./helper/mysql");

// Using Body-parser middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const redisClient = redis.createClient({
    host: "localhost",
    port: 6379
});
redisClient.on('error', (err) => console.log('Redis Client Error', err));
redisClient.connect();

dbConnection.getConnection((err, connection) => {
    if (err) {
        console.log("Database connection error: ", err);
    } else {
        console.log("Database connected");
    }
});


// Express route
app.get('/blogs/:id', (req, res) => {
  const id = req.params.id;

  // Search for data in Redis first
  redisClient.get(`blogs:${id}`, (err, cachedData) => {
    if (err) {
      console.error('Redis cache error:', err);
      res.status(500).send('An error occurred');
      return;
    }

    if (cachedData) {
      // If data is in Redis, send it to the user
      console.log('Data fetched from cache');
      res.send(JSON.parse(cachedData));
    } else {
      // If data is not in Redis, fetch it from MySQL
      mysqlConnection.query('SELECT * FROM data WHERE id = ?', [id], (err, results) => {
        if (err) {
          console.error('MySQL query error:', err);
          res.status(500).send('An error occurred');
          return;
        }

        if (results.length > 0) {
          const data = results[0];
          // Send data from MySQL to the user
          console.log('Data fetched from MySQL');
          res.send(data);
          // Save data to Redis cache
          redisClient.set(`blogs:${id}`, JSON.stringify(data), 'EX', 3600); // Cache for 1 hour (3600 seconds) as an example
        } else {
          // Data not found
          console.log('Data not found');
          res.status(404).send('Data not found');
        }
      });
    }
  });
});

app.listen(3000, () => {
    console.log('Listening on port 3000');
});