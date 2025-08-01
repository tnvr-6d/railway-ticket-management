-- Add coaches for F_Chair class (assuming class_id=51)
-- First, let's check what class_id F_Chair actually has
SELECT class_id, class_type FROM class WHERE class_type = 'F_Chair';

-- Add coaches for F_Chair (adjust class_id based on the result above)
INSERT INTO coach (coach_number, class_id) VALUES 
('F1', 51),
('F2', 51),
('F3', 51),
('F4', 51),
('F5', 51)
ON CONFLICT (coach_number) DO NOTHING;

-- Add coaches for other common classes if they don't exist
-- C_Chair (assuming class_id=52)
INSERT INTO coach (coach_number, class_id) VALUES 
('C1', 52),
('C2', 52),
('C3', 52),
('C4', 52)
ON CONFLICT (coach_number) DO NOTHING;

-- S_Chair (assuming class_id=53)
INSERT INTO coach (coach_number, class_id) VALUES 
('S1', 53),
('S2', 53),
('S3', 53),
('S4', 53)
ON CONFLICT (coach_number) DO NOTHING;

-- Show the updated coach data
SELECT c.coach_id, c.coach_number, cl.class_type, c.class_id
FROM coach c 
JOIN class cl ON c.class_id = cl.class_id 
ORDER BY cl.class_type, c.coach_number; 