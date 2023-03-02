/* Replace with your SQL commands */
CREATE TABLE order_products (
    id SERIAL PRIMARY KEY,
    order_id BIGINT NOT NULL,
    product_id BIGINT NOT NULL,
    quantity INTEGER NOT NULL DEFAULT 0,
    created TIMESTAMP NOT NULL DEFAULT now(),
    last_update TIMESTAMP NOT NULL DEFAULT now(),
    historic BOOLEAN NOT NULL DEFAULT false,
    CONSTRAINT fk_order_products_orders
        FOREIGN KEY (order_id)
        REFERENCES orders (id),
    CONSTRAINT fk_order_products_products
        FOREIGN KEY (product_id)
        REFERENCES products (id)
);

CREATE OR REPLACE FUNCTION order_products_before_update() RETURNS TRIGGER AS $$
DECLARE
BEGIN
    new.last_update := now();
    RETURN new;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER order_products_before_update
    BEFORE UPDATE ON order_products
    FOR EACH ROW EXECUTE PROCEDURE order_products_before_update();