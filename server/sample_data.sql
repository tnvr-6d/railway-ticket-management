-- Sample data for classes and coaches
-- This script adds basic class types and coaches to the database

-- Insert sample class types
INSERT INTO public.class (class_type) VALUES 
('F_Chair'),
('C_Chair'), 
('S_Chair'),
('F_Berth'),
('S_Berth'),
('AC_Chair'),
('AC_Berth'),
('Snigdha'),
('Shovan');

-- Insert sample coaches for each class
-- F_Chair coaches
INSERT INTO public.coach (coach_number, class_id) VALUES 
('A1', 1),
('A2', 1),
('A3', 1),
('B1', 1),
('B2', 1);

-- C_Chair coaches  
INSERT INTO public.coach (coach_number, class_id) VALUES
('C1', 2),
('C2', 2),
('C3', 2),
('D1', 2),
('D2', 2);

-- S_Chair coaches
INSERT INTO public.coach (coach_number, class_id) VALUES
('E1', 3),
('E2', 3),
('E3', 3),
('F1', 3),
('F2', 3);

-- F_Berth coaches
INSERT INTO public.coach (coach_number, class_id) VALUES
('G1', 4),
('G2', 4),
('H1', 4),
('H2', 4);

-- S_Berth coaches
INSERT INTO public.coach (coach_number, class_id) VALUES
('I1', 5),
('I2', 5),
('J1', 5),
('J2', 5);

-- AC_Chair coaches
INSERT INTO public.coach (coach_number, class_id) VALUES
('K1', 6),
('K2', 6),
('L1', 6),
('L2', 6);

-- AC_Berth coaches
INSERT INTO public.coach (coach_number, class_id) VALUES
('M1', 7),
('M2', 7),
('N1', 7),
('N2', 7);

-- Snigdha coaches
INSERT INTO public.coach (coach_number, class_id) VALUES
('O1', 8),
('O2', 8),
('P1', 8);

-- Shovan coaches
INSERT INTO public.coach (coach_number, class_id) VALUES
('Q1', 9),
('Q2', 9),
('R1', 9);

-- Insert sample fare data
INSERT INTO public.fare (per_km_fare, class_id) VALUES
(2.50, 1),  -- F_Chair
(2.00, 2),  -- C_Chair
(1.80, 3),  -- S_Chair
(3.00, 4),  -- F_Berth
(2.50, 5),  -- S_Berth
(4.00, 6),  -- AC_Chair
(5.00, 7),  -- AC_Berth
(6.00, 8),  -- Snigdha
(1.50, 9);  -- Shovan 