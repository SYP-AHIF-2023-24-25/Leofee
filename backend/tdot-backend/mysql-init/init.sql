CREATE DATABASE IF NOT EXISTS db;
USE db;

-- Drop tables if they already exist
DROP TABLE IF EXISTS Bons;
DROP TABLE IF EXISTS Students;


CREATE TABLE Students (
    StudentId CHAR(36) NOT NULL,
    FirstName VARCHAR(20) NOT NULL,
    LastName VARCHAR(20) NOT NULL,
    StudentClass VARCHAR(7) NOT NULL,
    CONSTRAINT PK_Students PRIMARY KEY (StudentId)
);


CREATE TABLE Bons (
    Id INT AUTO_INCREMENT NOT NULL,
    StudentId CHAR(36) NOT NULL,
    Value FLOAT (53) NOT NULL,
    UsedValue FLOAT (53) NOT NULL,
    StartDate DATETIME (6) NOT NULL,
    EndDate DATETIME (6) NOT NULL,
    CONSTRAINT PK_Bons PRIMARY KEY (Id),
    CONSTRAINT FK_Bons_Students FOREIGN KEY (StudentId) REFERENCES Students(StudentId) ON DELETE CASCADE
);


INSERT INTO Students (StudentId, FirstName, LastName, StudentClass) 
VALUES (UUID(), 'John', 'Doe', 'Class A');

INSERT INTO Bons (StudentId, Value, UsedValue, StartDate, EndDate)
SELECT StudentId, 100.0, 0.0, '2024-01-01', '2024-12-31' FROM Students WHERE FirstName = 'John' AND LastName = 'Doe';