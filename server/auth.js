import express from "express";
import bcrypt from "bcrypt";
import pool from "./db.js";

const router = express.Router();

router.post("/signup", async (req, res) => {
  const { name, email, password } = req.body;
  try {
    const hash = await bcrypt.hash(password, 10);
    await pool.query(
      "INSERT INTO users (name, email, password_hash) VALUES ($1, $2, $3)",
      [name, email, hash]
    );
    res.status(201).json({ message: "User created" });
  } catch (err) {
    console.error(err);
    if (err.code === "23505") {
      return res.status(400).json({ error: "Email already registered" });
    }
    res.status(500).json({ error: err.message });
  }
});

router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  try {
    const result = await pool.query("SELECT * FROM users WHERE email = $1", [
      email,
    ]);
    const user = result.rows[0];
    if (user && (await bcrypt.compare(password, user.password_hash))) {
      res.json({
        message: "Login successful",
        user: { id: user.id, email: user.email },
      });
    } else {
      res.status(401).json({ error: "Invalid credentials" });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

export default router;

// import express from 'express';
// import bcrypt from 'bcrypt';
// import pool from './db.js';

// const router = express.Router();

// router.post('/signup', async (req, res) => {
//   const { name, email, password } = req.body;
//   try {
//     const hash = await bcrypt.hash(password, 10);
//     await pool.execute(
//       'INSERT INTO users (name, email, password_hash) VALUES (?, ?, ?)',
//       [name, email, hash]
//     );
//     res.status(201).json({ message: 'User created' });
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ error: err.message });
//   }
// });

// router.post('/login', async (req, res) => {
//   const { email, password } = req.body;
//   try {
//     const [rows] = await pool.execute('SELECT * FROM users WHERE email = ?', [email]);
//     const user = rows[0];
//     if (user && await bcrypt.compare(password, user.password_hash)) {
//       res.json({ message: 'Login successful', user: { id: user.id,email: user.email } });
//     } else {
//       res.status(401).json({ error: 'Invalid credentials' });
//     }
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// });

// export default router;
