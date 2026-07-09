-- ============================================================
-- Hasan Babu Ka Aspataal - Clinic Management System
-- Database Schema (MySQL)
-- ============================================================

CREATE DATABASE IF NOT EXISTS hasan_babu_clinic
  CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE hasan_babu_clinic;

-- ------------------------------------------------------------
-- 1. USERS TABLE (Staff login and access management)
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS users (
    id            INT AUTO_INCREMENT PRIMARY KEY,
    full_name     VARCHAR(150)  NOT NULL,
    username      VARCHAR(100)  NOT NULL UNIQUE,
    password_hash VARCHAR(255)  NOT NULL,
    role          ENUM('doctor', 'reception', 'pharmacy', 'admin') NOT NULL,
    phone         VARCHAR(20),
    is_active     BOOLEAN DEFAULT TRUE,
    created_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ------------------------------------------------------------
-- 2. PATIENTS TABLE (Master records of all registered patients)
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS patients (
    id            INT AUTO_INCREMENT PRIMARY KEY,
    hba_id        VARCHAR(20) NOT NULL UNIQUE,   -- e.g. HBA-0001
    full_name     VARCHAR(150) NOT NULL,
    age           INT,
    gender        ENUM('Male', 'Female', 'Other'),
    phone         VARCHAR(20),
    address       TEXT,
    guardian_name VARCHAR(150),
    photo_path    VARCHAR(255),
    registered_by INT,                            -- FK -> users.id
    created_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (registered_by) REFERENCES users(id)
);

-- ------------------------------------------------------------
-- 3. OPD VISITS / QUEUE TABLE (Daily token & doctor consultation)
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS opd_visits (
    id            INT AUTO_INCREMENT PRIMARY KEY,
    patient_id    INT NOT NULL,
    token_number  INT NOT NULL,
    -- यहाँ DATE को DATETIME किया ताकि समय भी रिकॉर्ड हो और एरर न आए
    visit_date    DATETIME DEFAULT CURRENT_TIMESTAMP, 
    status        ENUM('waiting', 'with_doctor', 'completed', 'cancelled') DEFAULT 'waiting',
    complaint     TEXT,
    diagnosis     TEXT,
    prescription  TEXT,
    seen_by       INT,                             -- FK -> users.id (doctor)
    created_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (patient_id) REFERENCES patients(id),
    FOREIGN KEY (seen_by) REFERENCES users(id)
);

-- ------------------------------------------------------------
-- 4. MEDICINES / PHARMACY INVENTORY (Stock Tracking)
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS medicines (
    id            INT AUTO_INCREMENT PRIMARY KEY,
    name          VARCHAR(150) NOT NULL,
    batch_no      VARCHAR(50),
    quantity      INT DEFAULT 0,
    unit_price    DECIMAL(10,2),
    expiry_date   DATE,
    created_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
