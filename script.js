const express = require("express")
const sqlite3 = require('sqlite3')
const path = require('path')

const app = express()
const PORT = 3000

app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"))

const db = new sqlite3.Database(path.join(__dirname, 'database.db'), (err) => {
    if (err) {
        console.error("Error connecting to SQLite database: ", err.message);
    } else {
        console.log("Connected to the SQLite Database.");

        // Creating the employee table
        const createTableQuery = `
            CREATE TABLE IF NOT EXISTS employee(
                emp_id TEXT PRIMARY KEY,
                password TEXT NOT NULL,
                name TEXT NOT NULL,
                phone TEXT NOT NULL,
                email TEXT NOT NULL,
                accessToken TEXT NOT NULL
            );
        `;

        db.run(createTableQuery, (err) => {
            if (err) {
                console.error("Error creating employee table: ", err.message);
            } else {
                console.log("Employee table is ready.");

                // Inserting data into the employee table
                const insertQuery = `
                    INSERT INTO employee (
                        emp_id, 
                        password, 
                        name, 
                        phone, 
                        email, 
                        accessToken
                    ) VALUES (?, ?, ?, ?, ?, ?);
                `;

                // Values to insert
                const values = [
                    'EMP003',                      // emp_id
                    'afkwefeaflalflkseljdslkfaj',  // password (use hashed value)
                    'Balma',                       // name
                    '8448068999',                  // phone
                    'takenhero03@gmail.com',       // email
                    '621591685924'                 // accessToken
                ];

                db.run(insertQuery, values, (err) => {
                    if (err) {
                        console.error("Error inserting data into employee table: ", err.message);
                    } else {
                        console.log("Data inserted into Employee table.");
                    }
                });
            }
        });
    }
});

let message = ''
app.get("/", (req, res) => {
    res.render("index.ejs")
})

app.get("/robots.txt", (req, res) => {
    res.send("Instructions for all robots out there!<br><br>Flag: 123077")
})

app.get("/login", (req, res) => {
    res.render("fakeLogin.ejs")
})

app.get("/etc/login", (req, res) => {
    res.render("realLogin.ejs",
        {
            message
        }
    )
})

app.post("/auth", (req, res) => {
    const { emp_id, password } = req.body;

    try {
        if (emp_id === '' || password === '') {
            message = 'Employee ID and password are required.';
            return res.redirect('/etc/login');
        }

        // Vulnerable query with direct user input embedding
        // Ensure the inputs are surrounded by single quotes
        const loginQuery = `SELECT * FROM employee WHERE emp_id='${emp_id}' AND password='${password}';`;
        console.log("Constructed Query: ", loginQuery)
        db.get(loginQuery, [], (err, row) => {
            if (err) {
                console.log(err)
                message = err.message;
                return res.redirect('/etc/login');
            }
            if (row) {
                message = '';
                console.log(row)
                return res.render("dashboard.ejs",
                    {
                        row
                    }
                );
            } else {
                message = 'Invalid employee ID or password.';
                return res.redirect('/etc/login');
            }
        });
    } catch (err) {
        console.error("Caught error:", err);
        message = 'An unexpected error occurred.';
        return res.redirect('/etc/login');
    } finally {
        console.log("Emp_id entered: " + emp_id, "\nPassword entered: " + password);
    }
});


app.listen(PORT, (err) => {
    if (!err) {
        console.log(`server running at: http://127.0.0.1:${PORT}`)
    }
    else {
        console.log("Error starting server: ", err)
    }
})