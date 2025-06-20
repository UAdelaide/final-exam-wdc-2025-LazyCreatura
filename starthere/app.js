var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var mysql = require('mysql2/promise');

var app = express();

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

let db;

(async () => {
  try {
    //connect to the created database
    db = await mysql.createConnection({
      host: '127.0.0.1',
      user: 'root',
      password: '',
      database: 'DogWalkService'
    });
    // Insert Data for Users
    const [rows] = await db.execute('SELECT COUNT(*) AS count FROM Users');
    if (rows[0].count === 0) {
      await db.execute(`
      INSERT INTO Users (username, email, password_hash, role)
      VALUES
      ('alice123', 'alice@example.com', 'hashed123', 'owner'),
      ('bobwalker', 'bob@example.com', 'hashed456', 'walker'),
      ('carol123', 'carol@example.com', 'hashed789', 'owner'),
      ('Hye', 'miniHye@example.com', 'hashed777', 'owner'),
      ('wanwan', 'Wank@example.com', 'hashed777', 'walker');
      `);
    //Insert Data for Dogs
      await db.execute(`
      INSERT INTO Dogs (owner_id, name, size)
      VALUES
      ((SELECT user_id FROM Users WHERE username = 'alice123'), 'Max', 'medium'),
      ((SELECT user_id FROM Users WHERE username = 'carol123'), 'Bella', 'small' ),
      ((SELECT user_id FROM Users WHERE username = 'bobwalker'), 'Chicharon', 'large'),
      ((SELECT user_id FROM Users WHERE username = 'Hye'), 'Jolibee', 'large'),
      ((SELECT user_id FROM Users WHERE username = 'wanwan'), 'BBQ', 'small');
      `);
    }
    //Insert Data for WalkRequest
      await db.execute(`
      INSERT INTO WalkRequests (dog_id, requested_time, duration_minutes, location, status)
      VALUES
      ((SELECT dog_id FROM Dogs WHERE name = 'Max'), '2025-06-10 08:00:00', 30, 'Parklands', 'open'),
      ((SELECT dog_id FROM Dogs WHERE name = 'Bella'), '2025-06-10 09:30:00', 45, 'Beachside Ave', 'accepted'),
      ((SELECT dog_id FROM Dogs WHERE name = 'Chicharon'), '2025-06-11 10:00:00', 60, 'Central Market', 'cancelled'),
      ((SELECT dog_id FROM Dogs WHERE name = 'Jolibee'), '2025-06-30 18:49:00', 10, 'Central Hub', 'accepted'),
      ((SELECT dog_id FROM Dogs WHERE name = 'BBQ'), '2026-02-28 12:06:30', 80, 'Blue Square', 'open');
      `);


  } catch (err) {
    console.error('Error setting up database. Ensure Mysql is running: service mysql start', err);
  }
})();

// Route to return dogs as JSON
app.get('/', async (req, res) => {
  try {
    const [dogs] = await db.execute(`
      SELECT
        d.name AS dog_name,
        d.size,
        u.username AS owner_username
      FROM Dogs d
      JOIN Users u ON d.owner_id = u.user_id`
    );
    res.setHeader('Content-Type', 'application/json');
    res.send(JSON.stringify(dogs, null, 2));
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch dogs list' });
  }
});

app.get('/', async (req, res) => {
  try {
    const [req] = await db.execute(`
      SELECT
        request_id,
        d.name AS dog_name,
        requested_time,
        duration,
        location,
        u.username AS owner_
      `);

app.use(express.static(path.join(__dirname, 'public')));

module.exports = app;