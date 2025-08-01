-- Check current data
SELECT 'Classes:' as info;
SELECT class_id, class_type FROM class ORDER BY class_id;

SELECT 'Coaches:' as info;
SELECT coach_id, coach_number, class_id FROM coach ORDER BY coach_id;

-- Check if there are any coaches for F_Chair (class_id=51)
SELECT 'Coaches for F_Chair (class_id=51):' as info;
SELECT c.coach_id, c.coach_number, cl.class_type 
FROM coach c 
JOIN class cl ON c.class_id = cl.class_id 
WHERE cl.class_type = 'F_Chair';

-- Check what class F_Chair actually has
SELECT 'F_Chair class details:' as info;
SELECT class_id, class_type FROM class WHERE class_type = 'F_Chair'; 