INSERT INTO department (dpt_name)
VALUES
    ('Accounting'),
    ('Marketing'),
    ('Sales'),
    ('Information Technology'),
    ('Human Resources');

INSERT INTO emp_role (title, salary, dpt_id)
VALUES
  ('Sales Lead', '75000', 3),
  ('Sales Associate', '50000', 3),
  ('Tech Lead', '160000', 4),
  ('Junior Engineer', '70000', 4),
  ('Account Manager', '70000', 1),
  ('Accountant', '80000', 1),
  ('Payroll Specialist', '60000', 5),

    
INSERT INTO employee (first_name, last_name, role_id, mgr_id)
VALUES
  ('Hassan', 'Tahir', 2, NULL),
  ('Hizar', 'Sajjad', 1, NULL),
  ('Anas', 'Abrar', 4, 2),
  ('Waqas', 'Ahmad', 2, 2),
  ('Sheraz', 'Ahmad', 3, 3),
  ('Hamza', 'Syed', 6, 3),
  ('Shumile', 'Mirza', 8, 4);