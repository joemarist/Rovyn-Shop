-- Email verification codes (run once if DB already exists)
USE rovyn_db;

CREATE TABLE IF NOT EXISTS email_verification_codes (
  id INT AUTO_INCREMENT PRIMARY KEY,
  email VARCHAR(255) NOT NULL,
  code VARCHAR(6) NOT NULL,
  purpose ENUM('registration', 'google_signup', 'password_reset') NOT NULL,
  setup_token VARCHAR(128) NULL,
  payload JSON NULL,
  expires_at DATETIME NOT NULL,
  used_at DATETIME NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_email_purpose (email, purpose),
  INDEX idx_setup_token (setup_token)
) ENGINE=InnoDB;

-- Add email_verified to users if missing
ALTER TABLE users ADD COLUMN IF NOT EXISTS email_verified TINYINT(1) NOT NULL DEFAULT 0;
