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

CREATE OR REPLACE FUNCTION create_sample_products(_quantity INTEGER) RETURNS VOID AS $$
DECLARE
    current_id INTEGER;
BEGIN
    SELECT last_value INTO current_id FROM products_id_seq;

    INSERT INTO products(name, price, category)
    SELECT 'Sample_Product_' || (current_id + num)::TEXT,
        (random() * 100)::numeric::money,
        ('[0:2]={Food,Merch,Drinks}'::text[])[trunc(random()*3)] 
    FROM generate_series(1, _quantity) num;

END;
$$ LANGUAGE 'plpgsql';

CREATE OR REPLACE FUNCTION clear_sample_products() RETURNS VOID AS $$
BEGIN

    UPDATE products
    SET historic = TRUE
    WHERE name like 'Sample_Product_%' AND NOT historic;

END;
$$ LANGUAGE 'plpgsql';