//Require dependencies
const inquirer = require("inquirer"); //Inquirer package to interact with the user via the command line
const connection = require("./db/connection");
const validator = require('validator');
const figlet = require("figlet"); // Figlet to add style to text in the terminal
// const { errorMonitor } = require("mysql2/typings/mysql/lib/Connection");
require("console.table"); // Console.table to print MySQL rows to the console

//Establish connection to MySQL database, console log to the console error or success message
connection.connect((error) => {
  if (error) throw error;
  console.log(
      figlet.textSync("Employee\nTracker", {
        font: "Standard",
        lineHeight: 3,
      })
    )
  ;

  // Call function userChoices
  userChoices();
});

// Function to validate user response
const validate = {
    validateString(str) {
      return str !== '' || 'Please enter a valid response!';
    },
    validateSalary(num) {
      if (validator.isDecimal(num)) {
        return true;
      }
      return 'Please enter a valid decimal number!';
    },
    isSame(str1, str2) {
      if (str1 === str2) return true;
    }
  };


// Function to prompt the user to select an option from the list of choices
const userChoices = () => {
  inquirer
    .prompt([
      {
        name: "choices",
        type: "list",
        message: "What would you like to do?",
        choices: [
          "View All Employees",
          "Add Employee",
          "Update Employee Role",
          "View All Roles",
          "Add Role",
          "View All Departments",
          "Add Department",
          //Extra functionality
          "Update Employee Manager",
          "View Employees By Department",
          "Remove Department",
          "Remove Role",
          "Remove Employee",
          "View Department Budget",
          "Close",
        ],
      },
    ])
    //Switch statements to check the value of the answers and call corresponding function for each case
    .then((answers) => {
      const { choices } = answers;

      switch (choices) {
        case "View All Employees":
          viewAllEmployees();
          break;
        case "Add Employee":
          addEmployee();
          break;
        case "Update Employee Role":
          updateEmployeeRole();
          break;
        case "View All Roles":
          viewAllRoles();
          break;
        case "Add Role":
          addRole();
          break;
        case "View All Departments":
          viewAllDepartments();
          break;
        case "Add Department":
          addDepartment();
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
        case "View Department Budget":
          viewDepartmentBudget();
          break;
        case "Close":
          connection.end();
          break;
        default:
          console.log("Invalid choice");
      }
    });
};

//Retrieve data from database using Structured Query Language
//The promise() will wait until the connection is done before moving in to the next step and allows to hanlde the result of the query async
//The query () method takes the sql query as a parameter to be executed and a callback function to handle the result of the sql query
// Function to View All Employees
const viewAllEmployees = async () => {
  try {
    const [rows] = await connection.promise().query(
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
    userChoices();
  } catch (error) {
    console.error(error);
  }
};

//Function to Add Employee
const addEmployee = () => {
  inquirer
    .prompt([
      {
        type: "input",
        name: "firstName",
        message: "What is the employee's first name?",
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
        message: "What is the employee's last name?",
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
      //Prompt user to select role for new employee
      const roleNewEmployee = `Select roles.id, roles.title
         FROM roles
        `;
      connection
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
                message: "Select the employee's role:",
                choices: roles,
              },
            ])
            .then((answer) => {
              const role = answer.role;
              newEmployee.push(role);
              //Prompt user to select manager for new employee
              const managerNewEmployee = `SELECT *
               FROM employees`;
              connection
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
                        message: "Select the employee's manager:",
                        choices: managers,
                      },
                    ])
                    .then((answer) => {
                      const manager = answer.manager;
                      newEmployee.push(manager);
                      // Insert the new employee's information into the database
                      const insertSql = `INSERT INTO employees (first_name, last_name, role_id, manager_id)
                      VALUES (?, ?, ?, ?)`;
                      // Call the connection.query() method with the SQL query and the newEmployee array as parameters
                      connection
                        .promise()
                        .query(insertSql, newEmployee)
                        .then(([rows, fields]) => {
                          console.log(``);
                          console.log(
                            "A new employee has been added to the database"
                          );
                          console.log(``);
                          //Call function viewAllEmployees to see the updated list
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

// Function to Update Employee Role
const updateEmployeeRole = () => {
  // Define SQL query to retrieve employee and role information
  let query = `
    SELECT e.id, e.first_name, e.last_name, r.id AS role_id, r.title 
    FROM employees e 
    INNER JOIN roles r ON e.role_id = r.id 
    INNER JOIN departments d ON r.department_id = d.id 
    GROUP BY e.id, r.id;
  `;

  // Execute the query using the promise-based method
  connection
    .promise()
    .query(query)
    .then((response) => {
      // Extract the results array from the response object
      const results = response[0];

      // Create arrays of employees and roles
      let arrayOfEmployees = [];
      let arrayOfRoles = [];

      // Iterate over each object in the response array and push first name + last name to the array of employees
      results.forEach((employee) => {
        arrayOfEmployees.push(`${employee.first_name} ${employee.last_name}`);
        arrayOfRoles.push({ id: employee.role_id, title: employee.title });
      });

      // Define SQL query to retrieve a distinct list of role titles
      let rolesQuery = `
        SELECT DISTINCT title 
        FROM roles
      `;

      // Execute the roles query using the promise-based method
      return connection
        .promise()
        .query(rolesQuery)
        .then((response) => {
          // Extract the role titles from the response object
          const roleTitles = response[0].map((row) => row.title);

          // Prompt user to select what employee has a new role and what is their new role
          return inquirer
            .prompt([
              {
                name: "updateEmployee",
                type: "list",
                message: "Select employee to update role",
                choices: arrayOfEmployees,
              },
              {
                name: "updateRole",
                type: "list",
                message: "Select new role",
                choices: roleTitles,
              },
            ])
            .then((answer) => {
              // Find the employee and role ids based on the user's input
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

              // Update the employee role in the database
              let query = `
              UPDATE employees 
              SET role_id = ?
              WHERE id = ?
            `;

              return connection.promise().query(query, [newRoleId, employeeId]);
            })
            .then(() => {
              console.log(``);
              console.log("Employee role updated!");
              console.log(``);
              userChoices();
            })
            .catch((error) => {
              console.error(error);
            });
        });
    });
};

// Function to View All ROles
const viewAllRoles = () => {
  console.log(``);
  console.log("Current Roles:");
  console.log(``);
  const query = `SELECT r.id, r.title, d.name AS department
    FROM roles r
    INNER JOIN departments d ON r.department_id = d.id`;
  connection
    .promise()
    .query(query)
    .then((response) => {
      // Extract the results array from the response object
      const results = response[0];

      results.forEach((role) => {
        console.log(role.title);
      });
      console.log("");
      userChoices();
    })
    .catch((error) => {
      console.log(error);
    });
};

// Function to Add Role
const addRole = async () => {
  // Select to which department does the new role belong to
  const query = `SELECT * FROM departments`;
  try {
    const response = await connection.promise().query(query);
    const arrayOfDepartments = response[0].map(
      (department) => department.name
    );
    arrayOfDepartments.push("Create Department");
    const answer = await inquirer.prompt([
      {
        name: "departmentName",
        type: "list",
        message: "Which department is this new role in?",
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
        message: "What is the name of your new role?",
        validate: validate.validateString,
      },
      {
        name: "salary",
        type: "input",
        message: "What is the salary of this new role?",
        validate: validate.validateSalary,
      },
    ];
    const roleAnswers = await inquirer.prompt(newRoleQuestions);
    const departmentIdSql = `SELECT * FROM departments
       WHERE name = ?`;
    const departmentIdResponse = await connection
      .promise()
      .query(departmentIdSql, departmentName);
    const departmentId = departmentIdResponse[0][0].id;
    const insertRoleSql = `INSERT INTO roles (title, salary, department_id) VALUES (?, ?, ?)`;
    await connection
      .promise()
      .query(insertRoleSql, [
        roleAnswers.newRole,
        roleAnswers.salary,
        departmentId,
      ]);
    console.log(``);
    console.log(`Role successfully created!`);
    viewAllRoles();
  } catch (error) {
    console.log(`An error occurred: ${error}`);
    userChoices();
  }
};

// Function to View All Departments
const viewAllDepartments = () => {
  const query = `SELECT d.id AS id, d.name AS department
     FROM departments d`;
  connection
    .promise()
    .query(query)
    .then((response) => {
      console.log(``);
      console.log(`All Departments:`);
      console.log(``);
      console.table(response[0]); // Pass only the rows to console.table
      userChoices();
    });
};

// Function to Add Department
const addDepartment = async () => {
  try {
    const answer = await inquirer.prompt([
      {
        name: "newDepartment",
        type: "input",
        message: "What is the Department's name?",
        validate: validate.validateString,
      },
    ]);
    const query = `INSERT INTO departments (name)
       VALUES (?)`;
    await connection.promise().query(query, answer.newDepartment);
    console.log(``);
    console.log(`Department added!`);
    console.log(``);
    console.log(answer.newDepartment);
    viewAllDepartments();
    return answer.newDepartment;
  } catch (error) {
    console.log(`An error occurred: ${error}`);
    userChoices();
  }
};

// Function to Update Employee Manager
const updateEmployeeManager = () => {
  let query = `SELECT e.id, e.first_name, e.last_name, e.manager_id
     FROM employees e`;
  connection
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
            userChoices();
          } else {
            let query = `UPDATE employees
             SET employees.manager_id = ?
             WHERE employees.id = ?`;

            connection
              .promise()
              .query(query, [managerId, employeeId])
              .then(() => {
                console.log(``);
                console.log(
                  `Employee Manager updated!`
                );
                console.log(``);
                userChoices();
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

// Function to View Employees By Department
const viewEmployeesByDepartment = () => {
  const query = `SELECT e.first_name, e.last_name, departments.name AS deparment
     FROM employees e
     LEFT JOIN roles ON e.role_id = roles.id
     LEFT JOIN departments ON roles.department_id = departments.id`;

  connection.query(query, (error, response) => {
    if (error) throw error;
    console.log(``);
    console.log(`Employees by Department:`);
    console.log(``);
    console.table(response);
    userChoices();
  });
};

// Function to Remove Department
const removeDepartment = () => {
  const query = `SELECT d.id, d.name
     FROM departments d`;

  connection
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
      return connection.promise().query(departmentIdSql, departmentName);
    })
    .then((response) => {
      const departmentId = response[0][0].id;

      const deleteDepartmentSql = `DELETE FROM departments WHERE id = ?`;
      return connection.promise().query(deleteDepartmentSql, departmentId);
    })
    .then(() => {
      console.log(``);
      console.log(`Department removed!`);
      return viewAllDepartments();
    })
    .catch((error) => {
      console.log(`An error occurred: ${error}`);
      return userChoices();
    });
};

//Function to Remove Role
const removeRole = async () => {
  try {
    const [rows, fields] = await connection
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
    const [result] = await connection
      .promise()
      .query(`DELETE FROM roles WHERE id = ?`, [role.id]);
    console.log(``);
    console.log("Role removed!");
    viewAllRoles();
  } catch (error) {
    console.error(error);
  }
};

// Function to Remove Employee
const removeEmployee = async () => {
  try {
    const [rows] = await connection
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

    await connection
      .promise()
      .query(`DELETE FROM employees WHERE id = ?`, [selectedEmployee.id]);
    console.log(``);
    console.log(`Employee Removed!`);
    viewAllEmployees();
  } catch (error) {
    console.error(error);
  }
};

// Function to View Department Budget
const viewDepartmentBudget = () => {
  console.log(``);
  console.log(`Budget by Department:`);
  console.log(``);
  const query = `SELECT department_id AS id, departments.name AS department,
  SUM (salary) AS budget
  FROM roles
  INNER JOIN departments ON roles.department_id = departments.id
  GROUP BY roles.department_id`;

  connection.query(query, (error, response) => {
    if (error) throw error;
    console.table(response);
    userChoices();
  });
};