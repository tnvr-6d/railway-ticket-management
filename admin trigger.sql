-- Create the function to process the cancellation
CREATE OR REPLACE FUNCTION process_ticket_cancellation()
RETURNS TRIGGER AS $$
DECLARE
    v_cancellation_reason TEXT;
    v_admin_id INTEGER;
    v_refund_amount NUMERIC(10, 2);
BEGIN
    -- This logic only runs when a ticket status changes from 'Pending' to 'Cancelled'
    IF OLD.status = 'Pending Cancellation' AND NEW.status = 'Cancelled' THEN

        -- Get the cancellation reason from the booking table
        SELECT b.cancellation_reason INTO v_cancellation_reason
        FROM booking b
        JOIN ticket_booking tb ON b.booking_id = tb.booking_id
        WHERE tb.ticket_id = NEW.ticket_id;

        -- Get the admin_id from the session variable set by the Node.js app
        v_admin_id := CAST(current_setting('myapp.current_admin_id', true) AS INTEGER);

        -- Generate a random refund amount
        v_refund_amount := (random() * (200 - 50) + 50);

        -- Make the seat available again
        UPDATE seat_inventory
        SET is_available = TRUE
        WHERE schedule_id = NEW.schedule_id AND seat_number = NEW.seat_number;

        -- Insert the log into the ticket_cancellation table
        INSERT INTO ticket_cancellation (ticket_id, cancellation_date, refund_amount, reason, processed_by, status)
        VALUES (NEW.ticket_id, CURRENT_TIMESTAMP, v_refund_amount, v_cancellation_reason, v_admin_id, 'Processed');
        
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create the trigger that calls the function
CREATE TRIGGER after_ticket_cancellation
AFTER UPDATE ON ticket
FOR EACH ROW
EXECUTE FUNCTION process_ticket_cancellation();