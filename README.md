# Employee Tracker

## Table of Contents
* [Problem](#description)
* [Acceptance Criteria](#description)
* [Languages](#languages)
* [Installation](#installation)
* [Demonstration](#demonstration)

## Problem
As a business owner, it would be helpful to be able to view and manage the departments, roles, and employees in your company and organize and plan your business.

## Acceptance Criteria
* GIVEN a command-line application that accepts user input WHEN I start the application
* THEN I am presented with the following options: view all departments, view all roles, view all employees, add a department, add a role, add an employee, and update an employee role
* WHEN I choose to view all departments THEN I am presented with a formatted table showing department names and department ids
* WHEN I choose to view all roles THEN I am presented with the job title, role id, the department that role belongs to, and the salary for that role
* WHEN I choose to view all employees THEN I am presented with a formatted table showing employee data, including employee ids, first names, last names, job titles, departments, salaries, and managers that the employees report to
* WHEN I choose to add a department THEN I am prompted to enter the name of the department and that department is added to the database
* WHEN I choose to add a role THEN I am prompted to enter the name, salary, and department for the role and that role is added to the database
* WHEN I choose to add an employee THEN I am prompted to enter the employee’s first name, last name, role, and manager, and that employee is added to the database
* WHEN I choose to update an employee role THEN I am prompted to select an employee to update and their new role and this information is updated in the database 

## Languages
* NodeJs
* MySQL2
* Inquirer
* JavaScript

## Installation
1. Hit the "Code" button within this GitHub repo to copy link.
2. Use the command "git clone *paste link here*".
3. Run the command "npm install" to install Node Package Manager and the following dependencies from the package.json file:
* inquirer
* mySQL2
* console.table
* boxen
* figlet
* validator
4. **MySql:**
* In integrated terminal, use "mysql -u *username* -p"
* Enter your MySQL password to login
* Download database and tables to your remote workspace from the 'db' folder using commands:
    * 'source db/db.sql'
    * 'source db/table.sql'
    * 'source db/seeds.sql'
## Demonstration
Watch this [demo](#Link).
