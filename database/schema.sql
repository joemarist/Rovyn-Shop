-- Rovyn E-commerce Database Schema
-- Run via phpMyAdmin or: mysql -u root < database/schema.sql

CREATE DATABASE IF NOT EXISTS rovyn_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE rovyn_db;

-- Users (customers, staff, admin)
CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(50) UNIQUE,
  email VARCHAR(255) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NULL,
  first_name VARCHAR(100) DEFAULT '',
  last_name VARCHAR(100) DEFAULT '',
  phone VARCHAR(30) DEFAULT '',
  role ENUM('customer', 'staff', 'admin') NOT NULL DEFAULT 'customer',
  google_id VARCHAR(255) UNIQUE NULL,
  avatar_url VARCHAR(500) NULL,
  is_active TINYINT(1) NOT NULL DEFAULT 1,
  email_verified TINYINT(1) NOT NULL DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_users_role (role),
  INDEX idx_users_email (email)
) ENGINE=InnoDB;

-- Auth session tokens
CREATE TABLE IF NOT EXISTS auth_tokens (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  token VARCHAR(128) NOT NULL UNIQUE,
  expires_at DATETIME NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_auth_tokens_token (token)
) ENGINE=InnoDB;

-- Password reset tokens
CREATE TABLE IF NOT EXISTS password_reset_tokens (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  token VARCHAR(128) NOT NULL UNIQUE,
  expires_at DATETIME NOT NULL,
  used_at DATETIME NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_reset_token (token)
) ENGINE=InnoDB;

-- Email verification codes (registration, Google sign-up, password reset)
CREATE TABLE IF NOT EXISTS email_verification_codes (
  id INT AUTO_INCREMENT PRIMARY KEY,
  email VARCHAR(255) NOT NULL,
  code_hash VARCHAR(255) NOT NULL,
  purpose ENUM('registration', 'google_signup', 'password_reset') NOT NULL,
  setup_token VARCHAR(128) NULL,
  payload JSON NULL,
  expires_at DATETIME NOT NULL,
  used_at DATETIME NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  INDEX idx_email_purpose (email, purpose),
  INDEX idx_setup_token (setup_token)
) ENGINE=InnoDB;

-- Products catalog
CREATE TABLE IF NOT EXISTS products (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  category VARCHAR(50) NOT NULL,
  price DECIMAL(10, 2) NOT NULL,
  original_price DECIMAL(10, 2) NULL,
  image VARCHAR(500) NOT NULL,
  images JSON NOT NULL,
  colors JSON NOT NULL,
  sizes JSON NOT NULL,
  description TEXT NOT NULL,
  full_description TEXT NOT NULL,
  shipping_info TEXT,
  badge VARCHAR(50) NULL,
  rating DECIMAL(2, 1) DEFAULT 0,
  reviews INT DEFAULT 0,
  stock INT NOT NULL DEFAULT 100,
  is_active TINYINT(1) NOT NULL DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_products_category (category),
  INDEX idx_products_active (is_active)
) ENGINE=InnoDB;

-- Customer orders
CREATE TABLE IF NOT EXISTS orders (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  order_number VARCHAR(20) NOT NULL UNIQUE,
  status ENUM('pending', 'processing', 'shipped', 'delivered', 'cancelled') NOT NULL DEFAULT 'pending',
  subtotal DECIMAL(10, 2) NOT NULL,
  shipping_cost DECIMAL(10, 2) NOT NULL,
  total DECIMAL(10, 2) NOT NULL,
  payment_method ENUM('card', 'gcash', 'maya') NOT NULL,
  shipping_first_name VARCHAR(100) NOT NULL,
  shipping_last_name VARCHAR(100) NOT NULL,
  shipping_email VARCHAR(255) NOT NULL,
  shipping_phone VARCHAR(30) NOT NULL,
  shipping_address TEXT NOT NULL,
  shipping_city VARCHAR(100) NOT NULL,
  shipping_province VARCHAR(100) NOT NULL,
  shipping_zip VARCHAR(20) NOT NULL,
  notes TEXT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id),
  INDEX idx_orders_status (status),
  INDEX idx_orders_user (user_id)
) ENGINE=InnoDB;

-- Order line items
CREATE TABLE IF NOT EXISTS order_items (
  id INT AUTO_INCREMENT PRIMARY KEY,
  order_id INT NOT NULL,
  product_id INT NOT NULL,
  product_name VARCHAR(255) NOT NULL,
  quantity INT NOT NULL,
  size VARCHAR(50) NOT NULL,
  color VARCHAR(50) NOT NULL,
  unit_price DECIMAL(10, 2) NOT NULL,
  FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
  FOREIGN KEY (product_id) REFERENCES products(id),
  INDEX idx_order_items_order (order_id)
) ENGINE=InnoDB;
