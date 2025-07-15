CREATE OR REPLACE FUNCTION log_login_attempt(
    p_passenger_id INTEGER,
    p_ip_address VARCHAR(45),
    p_device_info VARCHAR(255),
    p_is_success BOOLEAN
)
RETURNS VOID AS $$
BEGIN
    INSERT INTO login_history (passenger_id, login_time, ip_address, device_info, is_success) -- Use original column name
    VALUES (p_passenger_id, CURRENT_TIMESTAMP, p_ip_address, p_device_info, p_is_success); -- Use original parameter
END;
$$ LANGUAGE plpgsql;