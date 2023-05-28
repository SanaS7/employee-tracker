require("console.table");
const db = require("./db/connection");
const validator = require('validator');
const figlet = require("figlet");
const inquirer = require("inquirer");

db.connect((error) => {
    process.stdout.write("\u001b[2J\u001b[0;0H");
    if (error) throw error;
    console.log(
        figlet.textSync("Employee\nTracker", {
            font: "speed",
            lineHeight: 3,
        })
    );
    mainMenu();
});

const validate = {
    validateString(str) {
        return str !== '' || 'Please enter a valid response!';
    },
    validateSalary(num) {
        if (validator.isDecimal(num)) {
            return true;
        }
        return 'Please enter a valid number!';
    },
    isSame(str_1, str_2) {
        if (str_1 === str_2) return true;
    }
};

const mainMenu = () => {
    inquirer
        .prompt([
            {
                name: "choices",
                type: "list",
                message: "Choose the operation you want to perform:",
                choices: [
                    "View All Employees",
                    "View All Roles",
                    "View All Departments",
                    "View Employees By Department",
                    "View Department Budget",
                    "Add Employee",
                    "Add Role",
                    "Add Department",
                    "Update Employee Role",
                    "Update Employee Manager",
                    "Remove Department",
                    "Remove Role",
                    "Remove Employee",
                    "Exit",
                ],
            },
        ])
        .then((answers) => {
            const { choices } = answers;
            switch (choices) {
                case "View All Employees":
                    viewAllEmployees();
                    break;
                case "View All Roles":
                    viewAllRoles();
                    break;
                case "View All Departments":
                    viewAllDepartments();
                    break;
                case "View Department Budget":
                    viewDepartmentBudget();
                    break;
                case "Add Employee":
                    addEmployee();
                    break;
                case "Add Role":
                    addRole();
                    break;
                case "Add Department":
                    addDepartment();
                    break;
                case "Update Employee Role":
                    updateEmployeeRole();
                    break;
                case "Update Employee Manager":
                    updateEmployeeManager();
                    break;
                case "View Employees By Department":
                    viewEmployeesByDepartment();
                    break;
                case "Remove Department":
                    removeDepartment();
                    break;
                case "Remove Role":
                    removeRole();
                    break;
                case "Remove Employee":
                    removeEmployee();
                    break;
                case "Exit":
                    db.end();
                    break;
                default:
                    console.log("Invalid Option");
            }
        });
};


const viewAllEmployees = async () => {
    try {
        const [rows] = await db.promise().query(
            `SELECT e.id, e.first_name, e.last_name, r.title, d.name, r.salary, CONCAT(m.first_name, ' ', m.last_name) AS manager
            FROM employees e
            JOIN roles r ON r.id = e.role_id
            JOIN departments d ON d.id = r.department_id
            LEFT JOIN employees m ON m.id = e.manager_id
            ORDER BY e.id;
            `
        );
        console.log("");
        console.log(`View all Employees`);
        console.log("");
        console.table(rows);
        mainMenu();
    } catch (error) {
        console.error(error);
    }
};

const viewAllRoles = () => {
    console.log(``);
    console.log("Current Roles:");
    console.log(``);
    const query = `SELECT r.id, r.title, d.name AS department FROM roles r INNER JOIN departments d ON r.department_id = d.id`;
    db
        .promise()
        .query(query)
        .then((response) => {
            const results = response[0];
            console.table(results)
            console.log("");
            mainMenu();
        })
        .catch((error) => {
            console.log(error);
        });
};

const viewAllDepartments = () => {
    const query = `SELECT d.id AS id, d.name AS department FROM departments d`;
    db
        .promise()
        .query(query)
        .then((response) => {
            console.log(``);
            console.log(`All Departments:`);
            console.log(``);
            console.table(response[0]);
            mainMenu();
        });
};

const viewEmployeesByDepartment = () => {
    const query = `SELECT e.first_name, e.last_name, departments.name AS deparment FROM employees e LEFT JOIN roles ON e.role_id = roles.id LEFT JOIN departments ON roles.department_id = departments.id`;

    db.query(query, (error, response) => {
        if (error) throw error;
        console.log(``);
        console.log(`Employees by Department:`);
        console.log(``);
        console.table(response);
        mainMenu();
    });
};

const addEmployee = () => {
    inquirer
        .prompt([
            {
                type: "input",
                name: "firstName",
                message: "Employee's first name:",
                validate: (firstName) => {
                    if (firstName) {
                        return true;
                    } else {
                        console.log("Please enter first name");
                        return false;
                    }
                },
            },
            {
                type: "input",
                name: "lastName",
                message: "Employee's last name:",
                validate: (lastName) => {
                    if (lastName) {
                        return true;
                    } else {
                        console.log("Please enter last name");
                        return false;
                    }
                },
            },
        ])
        .then((answer) => {
            const newEmployee = [answer.firstName, answer.lastName];
            const roleNewEmployee = `Select roles.id, roles.title
         FROM roles
        `;
            db
                .promise()
                .query(roleNewEmployee)
                .then(([rows, fields]) => {
                    const roles = rows.map(({ id, title }) => ({
                        name: title,
                        value: id,
                    }));
                    inquirer
                        .prompt([
                            {
                                type: "list",
                                name: "role",
                                message: "Employee's role:",
                                choices: roles,
                            },
                        ])
                        .then((answer) => {
                            const role = answer.role;
                            newEmployee.push(role);
                            const managerNewEmployee = `SELECT * FROM employees`;
                            db
                                .promise()
                                .query(managerNewEmployee)
                                .then(([rows, fields]) => {
                                    const managers = rows.map(
                                        ({ id, first_name, last_name }) => ({
                                            name: first_name + " " + last_name,
                                            value: id,
                                        })
                                    );
                                    inquirer
                                        .prompt([
                                            {
                                                type: "list",
                                                name: "manager",
                                                message: "Employee's manager:",
                                                choices: managers,
                                            },
                                        ])
                                        .then((answer) => {
                                            const manager = answer.manager;
                                            newEmployee.push(manager);
                                            const insertSql = `INSERT INTO employees (first_name, last_name, role_id, manager_id) VALUES (?, ?, ?, ?)`;
                                            db
                                                .promise()
                                                .query(insertSql, newEmployee)
                                                .then(([rows, fields]) => {
                                                    console.log(``);
                                                    console.log(
                                                        "New employee record added successfully!"
                                                    );
                                                    console.log(``);
                                                    viewAllEmployees();
                                                })
                                                .catch((error) => {
                                                    console.log(error);
                                                });
                                        });
                                });
                        });
                })
                .catch((error) => {
                    console.log(error);
                });
        });
};

const addRole = async () => {
    const query = `SELECT * FROM departments`;
    try {
        const response = await db.promise().query(query);
        const arrayOfDepartments = response[0].map(
            (department) => department.name
        );
        arrayOfDepartments.push("Create Department");
        const answer = await inquirer.prompt([
            {
                name: "departmentName",
                type: "list",
                message: "Select department for new role:",
                choices: arrayOfDepartments,
            },
        ]);
        let departmentName;
        if (answer.departmentName === "Create Department") {
            departmentName = await addDepartment();
        } else {
            departmentName = answer.departmentName;
        }
        const newRoleQuestions = [
            {
                name: "newRole",
                type: "input",
                message: "Name of new role:",
                validate: validate.validateString,
            },
            {
                name: "salary",
                type: "input",
                message: "Salary of new role:",
                validate: validate.validateSalary,
            },
        ];
        const roleAnswers = await inquirer.prompt(newRoleQuestions);
        const departmentIdSql = `SELECT * FROM departments WHERE name = ?`;
        const departmentIdResponse = await db
            .promise()
            .query(departmentIdSql, departmentName);
        const departmentId = departmentIdResponse[0][0].id;
        const insertRoleSql = `INSERT INTO roles (title, salary, department_id) VALUES (?, ?, ?)`;
        await db
            .promise()
            .query(insertRoleSql, [
                roleAnswers.newRole,
                roleAnswers.salary,
                departmentId,
            ]);
        console.log(``);
        console.log(`Role created successfully!`);
        viewAllRoles();
    } catch (error) {
        console.log(`An error occurred: ${error}`);
        mainMenu();
    }
};

const addDepartment = async () => {
    try {
        const answer = await inquirer.prompt([
            {
                name: "newDepartment",
                type: "input",
                message: "Department's name:",
                validate: validate.validateString,
            },
        ]);
        const query = `INSERT INTO departments (name) VALUES (?)`;
        await db.promise().query(query, answer.newDepartment);
        console.log(``);
        console.log(`Department added successfully!`);
        console.log(``);
        console.log(answer.newDepartment);
        viewAllDepartments();
        return answer.newDepartment;
    } catch (error) {
        console.log(`An error occurred: ${error}`);
        mainMenu();
    }
};

const updateEmployeeRole = () => {
    let query = `
    SELECT e.id, e.first_name, e.last_name, r.id AS role_id, r.title 
    FROM employees e 
    INNER JOIN roles r ON e.role_id = r.id 
    INNER JOIN departments d ON r.department_id = d.id 
    GROUP BY e.id, r.id;
    `;

    db
        .promise()
        .query(query)
        .then((response) => {
            const results = response[0];

            let arrayOfEmployees = [];
            let arrayOfRoles = [];

            results.forEach((employee) => {
                arrayOfEmployees.push(`${employee.first_name} ${employee.last_name}`);
                arrayOfRoles.push({ id: employee.role_id, title: employee.title });
            });

            let rolesQuery = `SELECT DISTINCT title FROM roles`;

            return db
                .promise()
                .query(rolesQuery)
                .then((response) => {
                    const roleTitles = response[0].map((row) => row.title);

                    return inquirer
                        .prompt([
                            {
                                name: "updateEmployee",
                                type: "list",
                                message: "Select Employee to update role:",
                                choices: arrayOfEmployees,
                            },
                            {
                                name: "updateRole",
                                type: "list",
                                message: "Select new role:",
                                choices: roleTitles,
                            },
                        ])
                        .then((answer) => {
                            let employeeId, newRoleId;

                            results.forEach((employee) => {
                                if (
                                    answer.updateEmployee ===
                                    `${employee.first_name} ${employee.last_name}`
                                ) {
                                    employeeId = employee.id;
                                }
                            });

                            arrayOfRoles.forEach((role) => {
                                if (answer.updateRole === role.title) {
                                    newRoleId = role.id;
                                }
                            });

                            let query = `UPDATE employees SET role_id = ? WHERE id = ?`;
                            return db.promise().query(query, [newRoleId, employeeId]);
                        })
                        .then(() => {
                            console.log(``);
                            console.log("Employee role updated successfully!");
                            console.log(``);
                            mainMenu();
                        })
                        .catch((error) => {
                            console.error(error);
                        });
                });
        });
};

const updateEmployeeManager = () => {
    let query = `SELECT e.id, e.first_name, e.last_name, e.manager_id FROM employees e`;
    db
        .promise()
        .query(query)
        .then((response) => {
            let arrayOfEmployees = [];
            for (const employee of response[0]) {
                arrayOfEmployees.push(`${employee.first_name} ${employee.last_name}`);
            }

            inquirer
                .prompt([
                    {
                        name: "selectEmployee",
                        type: "list",
                        message: " Select employee to update their manager:",
                        choices: arrayOfEmployees,
                    },
                    {
                        name: "newManager",
                        type: "list",
                        message: "Select manager:",
                        choices: arrayOfEmployees,
                    },
                ])
                .then((answer) => {
                    let employeeId, managerId;
                    response.forEach((employee) => {
                        if (
                            answer.selectEmployee ===
                            `${employee.first_name} ${employee.last_name}`
                        ) {
                            employeeId = employee.id;
                        }
                        if (
                            answer.newManager ===
                            `${employee.first_name} ${employee.last_name}`
                        ) {
                            managerId = employee.id;
                        }
                    });
                    if (validate.isSame(answer.selectEmployee, answer.newManager)) {
                        console.log(``);
                        console.log(`Invalid Manager Selection`);
                        console.log(``);
                        mainMenu();
                    } else {
                        let query = `UPDATE employees SET employees.manager_id = ? WHERE employees.id = ?`;
                        db
                            .promise()
                            .query(query, [managerId, employeeId])
                            .then(() => {
                                console.log(``);
                                console.log(
                                    `Employee manager updated successfully!`
                                );
                                console.log(``);
                                mainMenu();
                            })
                            .catch((error) => {
                                throw error;
                            });
                    }
                });
        })
        .catch((error) => {
            throw error;
        });
};

const removeDepartment = () => {
    const query = `SELECT d.id, d.name FROM departments d`;

    db
        .promise()
        .query(query)
        .then((response) => {
            const arrayOfDepartments = response[0].map(
                (department) => department.name
            );

            return inquirer.prompt([
                {
                    name: "departmentName",
                    type: "list",
                    message: "Select Department to be removed:",
                    choices: arrayOfDepartments,
                },
            ]);
        })
        .then((answer) => {
            const departmentName = answer.departmentName;

            const departmentIdSql = `SELECT * FROM departments WHERE name = ?`;
            return db.promise().query(departmentIdSql, departmentName);
        })
        .then((response) => {
            const departmentId = response[0][0].id;

            const deleteDepartmentSql = `DELETE FROM departments WHERE id = ?`;
            return db.promise().query(deleteDepartmentSql, departmentId);
        })
        .then(() => {
            console.log(``);
            console.log(`Department removed successfully!`);
            return viewAllDepartments();
        })
        .catch((error) => {
            console.log(`An error occurred: ${error}`);
            return mainMenu();
        });
};

const removeRole = async () => {
    try {
        const [rows, fields] = await db
            .promise()
            .query(`SELECT r.id, r.title FROM roles r`);
        const arrayOfRoles = rows.map((row) => row.title);

        const answer = await inquirer.prompt([
            {
                name: "roleTitle",
                type: "list",
                message: "Select Role to be removed:",
                choices: arrayOfRoles,
            },
        ]);

        const role = rows.find((row) => row.title === answer.roleTitle);
        const [result] = await db
            .promise()
            .query(`DELETE FROM roles WHERE id = ?`, [role.id]);
        console.log(``);
        console.log("Role removed successfully!");
        viewAllRoles();
    } catch (error) {
        console.error(error);
    }
};

const removeEmployee = async () => {
    try {
        const [rows] = await db
            .promise()
            .query(`SELECT e.id, e.first_name, e.last_name FROM employees e`);

        const arrayOfEmployees = rows.map(
            (employee) => `${employee.first_name} ${employee.last_name}`
        );

        const answer = await inquirer.prompt([
            {
                name: "selectEmployee",
                type: "list",
                message: "Select employee to remove:",
                choices: arrayOfEmployees,
            },
        ]);

        const selectedEmployee = rows.find(
            (employee) =>
                `${employee.first_name} ${employee.last_name}` === answer.selectEmployee
        );

        await db
            .promise()
            .query(`DELETE FROM employees WHERE id = ?`, [selectedEmployee.id]);
        console.log(``);
        console.log(`Employee removed successfully!`);
        viewAllEmployees();
    } catch (error) {
        console.error(error);
    }
};

const viewDepartmentBudget = () => {
    console.log(``);
    console.log(`Budget by Department:`);
    console.log(``);
    const query = `SELECT department_id AS id, departments.name AS department, SUM (salary) AS budget FROM roles INNER JOIN departments ON roles.department_id = departments.id GROUP BY roles.department_id`;

    db.query(query, (error, response) => {
        if (error) throw error;
        console.table(response);
        mainMenu();
    });
};