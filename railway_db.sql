CREATE TABLE train (
  train_id SERIAL PRIMARY KEY,
  train_name VARCHAR(100) NOT NULL,
  coach_number VARCHAR(50) NOT NULL,
  class_type VARCHAR(50),
  total_seats INT NOT NULL,
  description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO train (train_name, coach_number, class_type, total_seats)
VALUES 
('Padma Express', 'C1', 'AC', 80),
('Sundarban Express', 'C2', 'Non-AC', 100),
('Ekota Express', 'C3', 'AC', 90);
