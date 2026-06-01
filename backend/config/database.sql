-- Create database
CREATE DATABASE IF NOT EXISTS family_app;
USE family_app;

-- Users table
CREATE TABLE users (
  id INT PRIMARY KEY AUTO_INCREMENT,
  nom VARCHAR(100) NOT NULL,
  prenom VARCHAR(100) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  role ENUM('admin', 'user') DEFAULT 'user',
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_email (email),
  INDEX idx_created_at (created_at)
);

-- Families table
CREATE TABLE families (
  id INT PRIMARY KEY AUTO_INCREMENT,
  nom_famille VARCHAR(255) NOT NULL,
  description TEXT,
  created_by INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_created_by (created_by),
  INDEX idx_created_at (created_at)
);

-- Family members table
CREATE TABLE family_members (
  id INT PRIMARY KEY AUTO_INCREMENT,
  family_id INT NOT NULL,
  user_id INT NOT NULL,
  role ENUM('admin', 'member') DEFAULT 'member',
  joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (family_id) REFERENCES families(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  UNIQUE KEY unique_family_user (family_id, user_id),
  INDEX idx_family_id (family_id),
  INDEX idx_user_id (user_id)
);

-- Invitations table
CREATE TABLE invitations (
  id INT PRIMARY KEY AUTO_INCREMENT,
  family_id INT NOT NULL,
  email VARCHAR(255) NOT NULL,
  token VARCHAR(255) NOT NULL UNIQUE,
  is_used BOOLEAN DEFAULT FALSE,
  created_by INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  expires_at TIMESTAMP NULL,
  FOREIGN KEY (family_id) REFERENCES families(id) ON DELETE CASCADE,
  FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_family_id (family_id),
  INDEX idx_token (token),
  INDEX idx_email (email)
);

-- Tasks table
CREATE TABLE tasks (
  id INT PRIMARY KEY AUTO_INCREMENT,
  family_id INT NOT NULL,
  titre VARCHAR(255) NOT NULL,
  description TEXT,
  assigned_to INT,
  status ENUM('pending', 'in_progress', 'completed', 'cancelled') DEFAULT 'pending',
  priority ENUM('low', 'medium', 'high') DEFAULT 'medium',
  date_limite DATE,
  created_by INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (family_id) REFERENCES families(id) ON DELETE CASCADE,
  FOREIGN KEY (assigned_to) REFERENCES users(id) ON DELETE SET NULL,
  FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_family_id (family_id),
  INDEX idx_status (status),
  INDEX idx_date_limite (date_limite),
  INDEX idx_assigned_to (assigned_to)
);

-- Shopping lists table
CREATE TABLE shopping_items (
  id INT PRIMARY KEY AUTO_INCREMENT,
  family_id INT NOT NULL,
  nom_article VARCHAR(255) NOT NULL,
  quantite INT DEFAULT 1,
  unite VARCHAR(50),
  categorie VARCHAR(100),
  statut ENUM('pending', 'completed') DEFAULT 'pending',
  created_by INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (family_id) REFERENCES families(id) ON DELETE CASCADE,
  FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_family_id (family_id),
  INDEX idx_statut (statut)
);

-- Expenses table
CREATE TABLE expenses (
  id INT PRIMARY KEY AUTO_INCREMENT,
  family_id INT NOT NULL,
  titre VARCHAR(255) NOT NULL,
  montant DECIMAL(10, 2) NOT NULL,
  categorie VARCHAR(100),
  description TEXT,
  date_depense DATE NOT NULL,
  created_by INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (family_id) REFERENCES families(id) ON DELETE CASCADE,
  FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_family_id (family_id),
  INDEX idx_date_depense (date_depense),
  INDEX idx_categorie (categorie)
);

-- Events table
CREATE TABLE events (
  id INT PRIMARY KEY AUTO_INCREMENT,
  family_id INT NOT NULL,
  titre VARCHAR(255) NOT NULL,
  description TEXT,
  date_debut DATETIME NOT NULL,
  date_fin DATETIME,
  location VARCHAR(255),
  couleur VARCHAR(7),
  created_by INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (family_id) REFERENCES families(id) ON DELETE CASCADE,
  FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_family_id (family_id),
  INDEX idx_date_debut (date_debut),
  INDEX idx_date_fin (date_fin)
);

-- Notifications table
CREATE TABLE notifications (
  id INT PRIMARY KEY AUTO_INCREMENT,
  family_id INT NOT NULL,
  user_id INT NOT NULL,
  titre VARCHAR(255),
  message TEXT NOT NULL,
  type ENUM('task', 'event', 'expense', 'shopping', 'member', 'other') DEFAULT 'other',
  entity_type VARCHAR(100),
  entity_id INT,
  lu BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (family_id) REFERENCES families(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_user_id (user_id),
  INDEX idx_family_id (family_id),
  INDEX idx_lu (lu),
  INDEX idx_created_at (created_at)
);

-- Activity logs table
CREATE TABLE activity_logs (
  id INT PRIMARY KEY AUTO_INCREMENT,
  family_id INT NOT NULL,
  user_id INT NOT NULL,
  action VARCHAR(255) NOT NULL,
  entity_type VARCHAR(100),
  entity_id INT,
  details JSON,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (family_id) REFERENCES families(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_family_id (family_id),
  INDEX idx_user_id (user_id),
  INDEX idx_created_at (created_at)
);
