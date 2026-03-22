-- Hostel Pro 2 — Business Triggers

-- 1. Auto-update updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column() RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END; $$ LANGUAGE plpgsql;

DO $$ DECLARE t TEXT;
  tables TEXT[] := ARRAY['users','applications','documents','rooms','room_allocations','fees','payments','leave_requests','renewals','gateway_payments','leave_types','blackout_dates','notification_rules','interviews','notifications','communications'];
BEGIN FOREACH t IN ARRAY tables LOOP
  EXECUTE format('DROP TRIGGER IF EXISTS trg_%I_updated_at ON %I; CREATE TRIGGER trg_%I_updated_at BEFORE UPDATE ON %I FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();', t, t, t, t);
END LOOP; END $$;

-- 2. Application status transition validation
CREATE OR REPLACE FUNCTION validate_application_status_transition() RETURNS TRIGGER AS $$
DECLARE valid JSONB := '{"DRAFT":["SUBMITTED"],"SUBMITTED":["REVIEW","REJECTED"],"REVIEW":["INTERVIEW","APPROVED","REJECTED"],"INTERVIEW":["APPROVED","REJECTED"],"APPROVED":["ARCHIVED"],"REJECTED":["ARCHIVED"]}'::JSONB; allowed JSONB;
BEGIN
  IF OLD.current_status = NEW.current_status THEN RETURN NEW; END IF;
  allowed := valid -> OLD.current_status;
  IF allowed IS NULL OR NOT allowed ? NEW.current_status THEN RAISE EXCEPTION 'Invalid status transition from % to %', OLD.current_status, NEW.current_status; END IF;
  CASE NEW.current_status WHEN 'SUBMITTED' THEN NEW.submitted_at := NOW(); WHEN 'REVIEW' THEN NEW.reviewed_at := NOW(); WHEN 'INTERVIEW' THEN NEW.interview_scheduled_at := NOW(); WHEN 'APPROVED' THEN NEW.approved_at := NOW(); WHEN 'REJECTED' THEN NEW.rejected_at := NOW(); ELSE NULL; END CASE;
  RETURN NEW;
END; $$ LANGUAGE plpgsql;
DROP TRIGGER IF EXISTS trg_validate_application_status ON applications;
CREATE TRIGGER trg_validate_application_status BEFORE UPDATE ON applications FOR EACH ROW WHEN (OLD.current_status IS DISTINCT FROM NEW.current_status) EXECUTE FUNCTION validate_application_status_transition();

-- 3. Room occupancy management
CREATE OR REPLACE FUNCTION update_room_occupancy() RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' AND NEW.status = 'ACTIVE' THEN UPDATE rooms SET occupied_count = occupied_count + 1, status = CASE WHEN occupied_count + 1 >= capacity THEN 'OCCUPIED' ELSE status END WHERE id = NEW.room_id;
  ELSIF TG_OP = 'UPDATE' AND OLD.status = 'ACTIVE' AND NEW.status != 'ACTIVE' THEN UPDATE rooms SET occupied_count = GREATEST(occupied_count - 1, 0), status = CASE WHEN occupied_count - 1 <= 0 THEN 'AVAILABLE' ELSE status END WHERE id = NEW.room_id;
  ELSIF TG_OP = 'DELETE' AND OLD.status = 'ACTIVE' THEN UPDATE rooms SET occupied_count = GREATEST(occupied_count - 1, 0), status = CASE WHEN occupied_count - 1 <= 0 THEN 'AVAILABLE' ELSE status END WHERE id = OLD.room_id;
  END IF;
  IF TG_OP = 'DELETE' THEN RETURN OLD; END IF; RETURN NEW;
END; $$ LANGUAGE plpgsql;
DROP TRIGGER IF EXISTS trg_update_room_occupancy ON room_allocations;
CREATE TRIGGER trg_update_room_occupancy AFTER INSERT OR UPDATE OR DELETE ON room_allocations FOR EACH ROW EXECUTE FUNCTION update_room_occupancy();

-- 4. Leave status transition validation
CREATE OR REPLACE FUNCTION validate_leave_status_transition() RETURNS TRIGGER AS $$
DECLARE valid JSONB := '{"PENDING":["APPROVED","REJECTED","CANCELLED"],"APPROVED":["COMPLETED","CANCELLED"],"REJECTED":[],"CANCELLED":[],"COMPLETED":[]}'::JSONB; allowed JSONB;
BEGIN
  IF OLD.status = NEW.status THEN RETURN NEW; END IF;
  allowed := valid -> OLD.status;
  IF allowed IS NULL OR NOT allowed ? NEW.status THEN RAISE EXCEPTION 'Invalid leave status transition from % to %', OLD.status, NEW.status; END IF;
  RETURN NEW;
END; $$ LANGUAGE plpgsql;
DROP TRIGGER IF EXISTS trg_validate_leave_status ON leave_requests;
CREATE TRIGGER trg_validate_leave_status BEFORE UPDATE ON leave_requests FOR EACH ROW WHEN (OLD.status IS DISTINCT FROM NEW.status) EXECUTE FUNCTION validate_leave_status_transition();

-- 5. Auto-update fee on payment
CREATE OR REPLACE FUNCTION update_fee_on_payment() RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'PAID' AND NEW.fee_id IS NOT NULL THEN UPDATE fees SET status = 'PAID', paid_at = NOW() WHERE id = NEW.fee_id AND status != 'PAID'; END IF;
  RETURN NEW;
END; $$ LANGUAGE plpgsql;
DROP TRIGGER IF EXISTS trg_update_fee_on_payment ON payments;
CREATE TRIGGER trg_update_fee_on_payment AFTER INSERT OR UPDATE ON payments FOR EACH ROW EXECUTE FUNCTION update_fee_on_payment();

-- 6. Auto-generate tracking number
CREATE OR REPLACE FUNCTION generate_tracking_number() RETURNS TRIGGER AS $$
DECLARE prefix TEXT; year_str TEXT; seq_num INTEGER;
BEGIN
  IF NEW.tracking_number IS NOT NULL THEN RETURN NEW; END IF;
  CASE NEW.vertical WHEN 'BOYS' THEN prefix := 'BH'; WHEN 'BOYS_HOSTEL' THEN prefix := 'BH'; WHEN 'GIRLS' THEN prefix := 'GA'; WHEN 'GIRLS_ASHRAM' THEN prefix := 'GA'; WHEN 'DHARAMSHALA' THEN prefix := 'DS'; ELSE prefix := 'HP'; END CASE;
  year_str := EXTRACT(YEAR FROM NOW())::TEXT;
  SELECT COALESCE(MAX(CASE WHEN tracking_number ~ (prefix || '-' || year_str || '-[0-9]+') THEN CAST(SUBSTRING(tracking_number FROM (prefix || '-' || year_str || '-([0-9]+)')) AS INTEGER) ELSE 0 END), 0) + 1 INTO seq_num FROM applications;
  NEW.tracking_number := prefix || '-' || year_str || '-' || LPAD(seq_num::TEXT, 4, '0');
  RETURN NEW;
END; $$ LANGUAGE plpgsql;
DROP TRIGGER IF EXISTS trg_generate_tracking_number ON applications;
CREATE TRIGGER trg_generate_tracking_number BEFORE INSERT ON applications FOR EACH ROW EXECUTE FUNCTION generate_tracking_number();

-- 7. Prevent audit log modification
CREATE OR REPLACE FUNCTION prevent_audit_log_modification() RETURNS TRIGGER AS $$
BEGIN RAISE EXCEPTION 'Audit logs are immutable'; RETURN NULL; END; $$ LANGUAGE plpgsql;
DROP TRIGGER IF EXISTS trg_prevent_audit_update ON audit_logs;
CREATE TRIGGER trg_prevent_audit_update BEFORE UPDATE ON audit_logs FOR EACH ROW EXECUTE FUNCTION prevent_audit_log_modification();
DROP TRIGGER IF EXISTS trg_prevent_audit_delete ON audit_logs;
CREATE TRIGGER trg_prevent_audit_delete BEFORE DELETE ON audit_logs FOR EACH ROW EXECUTE FUNCTION prevent_audit_log_modification();
