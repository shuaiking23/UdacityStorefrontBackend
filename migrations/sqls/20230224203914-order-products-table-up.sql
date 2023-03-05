/* Replace with your SQL commands */
CREATE TABLE order_products (
    id SERIAL PRIMARY KEY,
    order_id BIGINT NOT NULL,
    product_id BIGINT NOT NULL,
    quantity INTEGER NOT NULL DEFAULT 0,
    unit_price NUMERIC NOT NULL DEFAULT 0,
    created TIMESTAMP NOT NULL DEFAULT now(),
    last_update TIMESTAMP NOT NULL DEFAULT now(),
    historic BOOLEAN NOT NULL DEFAULT false,
    CONSTRAINT fk_order_products_orders
        FOREIGN KEY (order_id)
        REFERENCES orders (id) ON DELETE CASCADE DEFERRABLE INITIALLY IMMEDIATE,
    CONSTRAINT fk_order_products_products
        FOREIGN KEY (product_id)
        REFERENCES products (id) ON DELETE CASCADE DEFERRABLE INITIALLY IMMEDIATE
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

CREATE OR REPLACE FUNCTION create_sample_orders(_user_id INTEGER,
    _o_quantity INTEGER DEFAULT 1,
    _p_quantity INTEGER DEFAULT 1) RETURNS VOID AS $$
DECLARE
    current_order_id INTEGER;
    product_count INTEGER;
BEGIN
    SELECT COUNT(1) INTO product_count FROM products
    WHERE NOT historic;

    IF product_count < _p_quantity THEN
        RAISE NOTICE 'Insufficient products. Creating %.', _p_quantity - product_count;
        PERFORM create_sample_products(_p_quantity - product_count);
    END IF;

    PERFORM 1 FROM users
    WHERE id = _user_id AND NOT historic;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'User not found.';
    END IF;

    FOR cnt IN 1.._o_quantity LOOP
        INSERT INTO orders (user_id, status, notes)
        VALUES (_user_id,
            (('[0:1]={Active, Complete}'::text[])[trunc(random()*2)])::enum_order_status,
            'Sample Order')
        RETURNING id INTO current_order_id;
        
        INSERT INTO order_products (order_id, product_id, quantity, unit_price)
        (SELECT current_order_id, id, (ceil(random()*100000)::integer)%5 +1, price
        FROM products
        WHERE NOT historic
        ORDER BY random()
        LIMIT _p_quantity);
    END LOOP;

END;
$$ LANGUAGE 'plpgsql';

CREATE OR REPLACE FUNCTION clear_sample_orders() RETURNS VOID AS $$
BEGIN

    UPDATE orders
    SET historic = TRUE
    WHERE notes = 'Sample Order' AND NOT historic;

END;
$$ LANGUAGE 'plpgsql';

CREATE TYPE type_top_product AS (
    id INTEGER,
    name TEXT,
    historic BOOLEAN,
    order_quantity INTEGER
);

CREATE OR REPLACE FUNCTION top_selling_products(_count INTEGER DEFAULT 1) RETURNS SETOF type_top_product AS $$
DECLARE
    rec RECORD;
    top_product type_top_product;
BEGIN
    FOR rec IN (
        SELECT p.id, p.name, p.historic,
            sum(op.quantity) as order_sum
        FROM order_products op
        LEFT JOIN products p on p.id = op.product_id
        LEFT JOIN orders o on o.id = op.order_id
        WHERE NOT op.historic
            AND NOT o.historic
            AND o.status = 'Complete'
        GROUP BY p.id, p.historic
        ORDER BY order_sum desc
        LIMIT _count)
    LOOP
        top_product.id = rec.id;
        top_product.name = rec.name;
        top_product.historic = rec.historic;
        top_product.order_quantity = rec.order_sum;
        RETURN NEXT top_product;
    END LOOP;
    RETURN;
END;
$$ LANGUAGE 'plpgsql';

CREATE TYPE type_order_products AS (
    product_id INTEGER,
    order_id INTEGER,
    name TEXT,
    unit_price NUMERIC,
    order_quantity INTEGER
);

CREATE OR REPLACE FUNCTION products_in_order(_order_id INTEGER) RETURNS SETOF type_order_products AS $$
DECLARE
    rec RECORD;
    t_op type_order_products;
BEGIN

    FOR rec IN (
        SELECT op.product_id, op.order_id, p.name,
            op.unit_price, op.quantity
        FROM order_products op
        LEFT JOIN orders o on o.id = op.order_id
        LEFT JOIN products p on p.id = op.product_id
        WHERE (_order_id IS NULL OR op.order_id=_order_id)
            AND NOT op.historic
            AND NOT o.historic)
    LOOP
        t_op.product_id = rec.product_id;
        t_op.order_id = rec.order_id;
        t_op.name = rec.name;
        t_op.unit_price = rec.unit_price;
        t_op.order_quantity = rec.quantity;
        RETURN NEXT t_op;
    END LOOP;
    RETURN;

END;
$$ LANGUAGE 'plpgsql';