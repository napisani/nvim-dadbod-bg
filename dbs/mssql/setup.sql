IF NOT EXISTS (SELECT * FROM sys.databases WHERE name = 'mydb')
BEGIN
    CREATE DATABASE mydb;
END
GO

USE mydb;
GO

IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='example' and xtype='U')
BEGIN
    CREATE TABLE example (
        id INT IDENTITY(1,1) PRIMARY KEY,
        name NVARCHAR(50),
        age INT,
        email NVARCHAR(100)
    );
END
GO

INSERT INTO example (name, age, email) VALUES
(N'Alice', 28, N'alice@example.com'),
(N'Bob', 35, N'bob@example.com'),
(N'Charlie', 42, N'charlie@example.com'),
(N'Diana', 31, N'diana@example.com'),
(N'Ethan', 25, N'ethan@example.com'),
(N'Fiona', 39, N'fiona@example.com'),
(N'George', 45, N'george@example.com'),
(N'Hannah', 33, N'hannah@example.com'),
(N'Ian', 29, N'ian@example.com'),
(N'Julia', 37, N'julia@example.com');
GO
