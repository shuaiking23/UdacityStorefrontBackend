/* Replace with your SQL commands */
CREATE TYPE enum_order_status AS ENUM (
	'Active', 'Complete');

CREATE TABLE orders (
	id SERIAL PRIMARY KEY,
	user_id INTEGER,
	status enum_order_status,
	CONSTRAINT fk_orders_users
		FOREIGN KEY (user_id)
		REFERENCES users (id)
);