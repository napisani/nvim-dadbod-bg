CREATE DATABASE IF NOT EXISTS mydb;

USE mydb;

CREATE TABLE IF NOT EXISTS example (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(50),
    age INT,
    email VARCHAR(100)
);

INSERT INTO example (name, age, email) VALUES
('Alice', 28, 'alice@example.com'),
('Bob', 35, 'bob@example.com'),
('Charlie', 42, 'charlie@example.com'),
('Diana', 31, 'diana@example.com'),
('Ethan', 25, 'ethan@example.com'),
('Fiona', 39, 'fiona@example.com'),
('George', 45, 'george@example.com'),
('Hannah', 33, 'hannah@example.com'),
('Ian', 29, 'ian@example.com'),
('Julia', 37, 'julia@example.com');

