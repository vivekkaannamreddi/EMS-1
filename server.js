


const express = require("express");
const mysql = require("mysql2");
const bcrypt = require("bcryptjs");
const bodyParser = require("body-parser");
const cors = require("cors");
const path = require("path");

const app = express();
const port = 3000;

// Configure middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname)));

// Database connection
const db = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "8919071928@v", // Your MySQL password
    database: "employee" // Using the 'employee' database
});

db.connect((err) => {
    if (err) throw err;
    console.log("Connected to MySQL database.");
});

// Register endpoint
app.post("/register", async (req, res) => {
    const { username, password } = req.body;
    
    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert user into database
    const sql = "INSERT INTO usersdetails (username, password) VALUES (?, ?)";
    db.query(sql, [username, hashedPassword], (err, result) => {
        if (err) {
            console.log(err);
            return res.send("Error occurred during registration.");
        }
        res.send("Registration successful! You can now <a href='/login.html'>login</a>.");
    });
});

// Login endpoint
app.post("/login", (req, res) => {
    const { username, password } = req.body;

    const sql = "SELECT * FROM usersdetails WHERE username = ?";
    db.query(sql, [username], async (err, results) => {
        if (err) {
            console.log(err);
            return res.send("An error occurred.");
        }
        
        if (results.length === 0) {
            return res.send("User not found.");
        }

        const user = results[0];
        const isMatch = await bcrypt.compare(password, user.password);
        
        if (isMatch) {
            res.redirect("/index.html"); // Redirect to EMS page after login
        } else {
            res.send("Invalid password.");
        }
    });
});
// Add Employee Endpoint
app.post("/addEmployee", async (req, res) => {
    const { name, email, position, salary } = req.body;

    const hashedPassword = await bcrypt.hash(position, 10); // Hash the position for password

    const sqlInsertEmployee = "INSERT INTO employees (name, email, position, salary) VALUES (?, ?, ?, ?)";
    db.query(sqlInsertEmployee, [name, email, position, salary], (err, result) => {
        if (err) {
            console.log(err);
            return res.send("Error adding employee.");
        }

        // Insert user data into the 'usersdetails' table
        const sqlInsertUser = "INSERT INTO usersdetails (username, password) VALUES (?, ?)";
        db.query(sqlInsertUser, [email, hashedPassword], (err, result) => {
            if (err) {
                console.log(err);
                return res.send("Error creating user account for employee.");
            }

            res.send(`Employee ${name} added successfully, and login account created with email as username and position as default password.`);
        });
    });
});


// Get all employees
app.get("/employees", (req, res) => {
    const sql = "SELECT * FROM employees";
    db.query(sql, (err, results) => {
        if (err) throw err;
        res.json(results);
    });
});

// Add new employee with duplicate email check
app.post("/employees", (req, res) => {
    const { name, email, position, salary } = req.body;

    const checkEmailSql = "SELECT * FROM employees WHERE email = ?";
    db.query(checkEmailSql, [email], (err, results) => {
        if (err) throw err;

        if (results.length > 0) {
            res.status(400).json({ message: "Email already exists!" });
        } else {
            const sql = "INSERT INTO employees (name, email, position, salary) VALUES (?, ?, ?, ?)";
            db.query(sql, [name, email, position, salary], (err, result) => {
                if (err) throw err;
                res.json({ message: "Employee added successfully", employeeId: result.insertId });
            });
        }
    });
});

// Update employee
app.put("/employees/:id", (req, res) => {
    const { name, email, position, salary } = req.body;
    const sql = "UPDATE employees SET name = ?, email = ?, position = ?, salary = ? WHERE id = ?";
    db.query(sql, [name, email, position, salary, req.params.id], (err, result) => {
        if (err) throw err;
        res.json({ message: "Employee updated successfully" });
    });
});

// Delete employee
app.delete("/employees/:id", (req, res) => {
    const sql = "DELETE FROM employees WHERE id = ?";
    db.query(sql, [req.params.id], (err, result) => {
        if (err) throw err;
        res.json({ message: "Employee deleted successfully" });
    });
});

// Start server
app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});
