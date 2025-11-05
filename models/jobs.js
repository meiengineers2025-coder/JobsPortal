// Job Model

const Job = `
CREATE TABLE IF NOT EXISTS jobs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    location VARCHAR(255) NOT NULL,
    salary VARCHAR(255),
    skills VARCHAR(500),
    employerId INT NOT NULL,
    companyName VARCHAR(255),
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (employerId) REFERENCES users(id) ON DELETE CASCADE
);
`;

module.exports = Job;