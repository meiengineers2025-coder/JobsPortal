// Applications Model

const Application = `
CREATE TABLE IF NOT EXISTS applications (
    id INT AUTO_INCREMENT PRIMARY KEY,
    jobId INT NOT NULL,
    candidateId INT NOT NULL,
    status ENUM('applied', 'shortlisted', 'rejected') DEFAULT 'applied',
    appliedOn TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (jobId) REFERENCES jobs(id) ON DELETE CASCADE,
    FOREIGN KEY (candidateId) REFERENCES users(id) ON DELETE CASCADE
);
`;

module.exports = Application;