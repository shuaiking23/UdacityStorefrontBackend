/* Replace with your SQL commands */
CREATE TYPE enum_order_status AS ENUM (
    'Active', 'Complete');

CREATE TABLE orders (
    id SERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL,
    status enum_order_status NOT NULL DEFAULT 'Active'::enum_order_status,
    notes TEXT,
    created TIMESTAMP NOT NULL DEFAULT now(),
    last_update TIMESTAMP NOT NULL DEFAULT now(),
    historic BOOLEAN NOT NULL DEFAULT false,
    CONSTRAINT fk_orders_users
        FOREIGN KEY (user_id)
        REFERENCES users (id) ON DELETE CASCADE
);

CREATE OR REPLACE FUNCTION orders_before_update() RETURNS TRIGGER AS $$
DECLARE
BEGIN
    new.last_update := now();
    RETURN new;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER orders_before_update
    BEFORE UPDATE ON orders
    FOR EACH ROW EXECUTE PROCEDURE orders_before_update();