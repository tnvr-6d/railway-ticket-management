
CREATE OR REPLACE FUNCTION process_ticket_cancellation()
RETURNS TRIGGER AS $$
DECLARE
    v_cancellation_reason TEXT;
    v_admin_id INTEGER;
    v_refund_amount NUMERIC(10, 2);
BEGIN
   
    IF OLD.status = 'Pending Cancellation' AND NEW.status = 'Cancelled' THEN

        
        SELECT b.cancellation_reason INTO v_cancellation_reason
        FROM booking b
        JOIN ticket_booking tb ON b.booking_id = tb.booking_id
        WHERE tb.ticket_id = NEW.ticket_id;

        v_admin_id := CAST(current_setting('myapp.current_admin_id', true) AS INTEGER);

        v_refund_amount := (random() * (200 - 50) + 50);

        UPDATE seat_inventory
        SET is_available = TRUE
        WHERE schedule_id = NEW.schedule_id AND seat_number = NEW.seat_number;

        INSERT INTO ticket_cancellation (ticket_id, cancellation_date, refund_amount, reason, processed_by, status)
        VALUES (NEW.ticket_id, CURRENT_TIMESTAMP, v_refund_amount, v_cancellation_reason, v_admin_id, 'Processed');
        
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER after_ticket_cancellation
AFTER UPDATE ON ticket
FOR EACH ROW
EXECUTE FUNCTION process_ticket_cancellation();