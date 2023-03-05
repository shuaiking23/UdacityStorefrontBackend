/* Replace with your SQL commands */
DROP TABLE order_products;

DROP FUNCTION IF EXISTS create_sample_orders(INTEGER, INTEGER, INTEGER);

DROP FUNCTION IF EXISTS top_selling_products(INTEGER);

DROP TYPE IF EXISTS type_top_products CASCADE;

DROP FUNCTION IF EXISTS products_in_order(INTEGER);

DROP TYPE IF EXISTS type_order_products CASCADE;

