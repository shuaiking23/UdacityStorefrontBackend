/* Replace with your SQL commands */
CREATE TABLE products (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    price NUMERIC NOT NULL,
    category TEXT,
    created TIMESTAMP NOT NULL DEFAULT now(),
    last_update TIMESTAMP NOT NULL DEFAULT now(),
    historic BOOLEAN NOT NULL DEFAULT false
);

CREATE OR REPLACE FUNCTION products_before_update() RETURNS TRIGGER AS $$
DECLARE
BEGIN
    new.last_update := now();
    RETURN new;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER products_before_update
    BEFORE UPDATE ON products
    FOR EACH ROW EXECUTE PROCEDURE products_before_update();
