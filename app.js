const express = require('express');
const path = require('path');
const sqlite3 = require('sqlite3').verbose();
const bodyParser = require('body-parser');

const app = express();

// Middleware for JSON request parsing
app.use(bodyParser.json());

// Serve books folder for PDFs
app.use('/books', express.static(path.join(__dirname, 'books')));

// Set up SQLite3 database
const db = new sqlite3.Database('./highlights.db', (err) => {
    if (err) {
        console.error('Error opening database:', err.message);
    } else {
        db.run(`
            CREATE TABLE IF NOT EXISTS highlights (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                text TEXT,
                color TEXT
            )
        `);
    }
});

// Serve EJS templates
app.set('view engine', 'ejs');

// Main route
app.get('/', (req, res) => {
    res.render('index');
});

// POST route to save highlights
app.post('/save-highlight', (req, res) => {
    const { highlights } = req.body;

    if (!highlights || !Array.isArray(highlights)) {
        return res.status(400).json({ error: 'Invalid highlights format' });
    }

    const stmt = db.prepare('INSERT INTO highlights (text, color) VALUES (?, ?)');
    highlights.forEach(({ text, color }) => {
        stmt.run(text, color, (err) => {
            if (err) {
                console.error('Error saving highlight:', err.message);
            }
        });
    });
    stmt.finalize();

    res.json({ message: 'Highlights saved successfully' });
});

// Start the server
const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});
