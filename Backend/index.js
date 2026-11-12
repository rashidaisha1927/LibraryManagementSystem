import express from "express";
import mysql from "mysql2/promise";

const app = express();
app.use(express.json());

const pool = mysql.createPool({
    host: "localhost",
    user: "root",
    password: "Pass47",
    database: "lib_db",
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

app.get("/api/library", async (req, res) => {
    try {
        const [rows] = await pool.query("SELECT * FROM borrowed_books");
        res.json(rows);
    }
    catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post("/api/library", async (req, res) => {
    try {
        const { bookName, bookBorrower, price } = req.body;
        await pool.query(
            "INSERT INTO borrowed_books (book_name, borrowed_by, price) VALUES (?, ?, ?)",
            [bookName, bookBorrower, price]
        );

        res.json({
            status: true,
            message: "Successfully inserted library"
        });
    }
    catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.put("/api/library/:id", async (req, res) => {
    const UPDATE_LIBRARY =
        "UPDATE borrowed_books SET book_name = COALESCE(?, book_name), borrowed_by = COALESCE(?, borrowed_by), price = COALESCE(?, price) WHERE id = ?";
    try {
        const libraryId = Number(req.params.id);
        const { bookName, bookBorrower, price } = req.body;

        await pool.query(UPDATE_LIBRARY, [
            bookName ?? null,
            bookBorrower ?? null,
            price ?? null,
            libraryId
        ]);

        res.json({
            status: true,
            message: "Successfully updated library"
        });
    }
    catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.delete("/api/library/:id", async (req, res) => {
    try {
        const libraryId = Number(req.params.id);

        await pool.query(
            "DELETE FROM borrowed_books WHERE id = ?",
            [libraryId]
        );

        res.json({
            status: true,
            message: "Successfully deleted library"
        });
    }
    catch (err) {
        res.status(500).json({ error: err.message });
    }
});

const PORT = 6777;

app.listen(PORT, () => {
    console.log(`Your server is running on ${PORT}`);
});