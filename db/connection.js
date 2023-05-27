const mysql = require("mysql2");

const db = mysql.createConnection(
  {
    host: "localhost",
    user: "root",
    password: "password",
    database: "employee_tracker",
  },
  console.log("Successfully connected to the employee_tracker database.")
);

module.exports = db;