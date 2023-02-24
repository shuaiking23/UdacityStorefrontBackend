/* Replace with your SQL commands */
CREATE TABLE order_products (
	id SERIAL PRIMARY KEY,
	order_id INTEGER,
	product_id INTEGER,
	quantity INTEGER,
	CONSTRAINT fk_order_products_orders
		FOREIGN KEY (order_id)
		REFERENCES orders (id),
	CONSTRAINT fk_order_products_products
		FOREIGN KEY (product_id)
		REFERENCES products (id),
);