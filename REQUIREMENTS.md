# API Requirements
The company stakeholders want to create an online storefront to showcase their great product ideas. Users need to be able to browse an index of all products, see the specifics of a single product, and add products to an order that they can view in a cart page. You have been tasked with building the API that will support this application, and your coworker is building the frontend.

These are the notes from a meeting with the frontend developer that describe what endpoints the API needs to supply, as well as data shapes the frontend and backend have agreed meet the requirements of the application. 

## API Endpoints
### Order
- [x] RO1 Current Order by user (args: user id)[token required]
	- `get '/orders/current'`
	- User id is retrieved from auth token
	- Returns the latest active order by user, together with products in order
- [x] RO2 [OPTIONAL] Completed Orders by user (args: user id)[token required]
	- `get '/orders/completed'`
	- User id is retrieved from auth token
	- Returns a list of completed orders by user, together with products in those orders

### Product
- [x] RP1 Index
	- `get '/products'`
	- Returns a list of active products
- [x] RP2 Show
	- `get '/products/{{id}}'`
	- Returns the product if available based on id provided
- [x] RP3 Create [token required]
	- `post '/products'`
	- Creates a product based on the following body params provided
		- name
		- category
		- price
	- Returns information about the product created
- [x] RP4 [OPTIONAL] Top 5 most popular products
	- `get '/products/top5'`
	- Top 5 endpoint calls topN(5) method
- [x] RP5 [OPTIONAL] Products by category (args: product category)
	- `get '/products?category={{category}}'`
	- Category filter is provided as an optional query parameter on index as `?category`
	- Sample data uses the following categories (options are not case sensitive)
		- Food
		- Drinks
		- Merch

### User
- [x] RU1 Index [token required]
	- `get '/users'`
	- Returns a list of active users
- [x] RU2 Show [token required]
	- `get '/users/{{id}}'`
	- Returns the user if available based on id provided
- [x] RU3 Create N[token required]
	- `post '/users'`
	- Creates a user based on the following body params provided
		- firstname
		- lastname
		- username
		- password
	- Returns information about the user created (password not returned)

## Data Shapes
#### Product

##### Table - products
- id `SERIAL PRIMARY KEY`
- name `TEXT NOT NULL`
- price `NUMERIC NOT NULL`
- category `TEXT`
- created `TIMESTAMP NOT NULL DEFAULT now()`
- last_update `TIMESTAMP NOT NULL DEFAULT now()`
- historic `BOOLEAN NOT NULL DEFAULT false`

#### User

##### Table - users
- id `SERIAL PRIMARY KEY`
- firstname `TEXT NOT NULL`
- lastname `TEXT NOT NULL`
- username `TEXT UNIQUE NOT NULL`
- password `TEXT`
- created `TIMESTAMP NOT NULL DEFAULT now()`
- last_update `TIMESTAMP NOT NULL DEFAULT now()`
- historic `BOOLEAN NOT NULL DEFAULT false`

#### Orders

##### Type - enum_order_status
- Active
- Complete

##### Table - orders
- id `SERIAL PRIMARY KEY`
- user_id `BIGINT NOT NULL` `REFERENCES users (id) ON DELETE CASCADE`
- status `enum_order_status NOT NULL DEFAULT 'Active'`
- notes `TEXT`
- created `TIMESTAMP NOT NULL DEFAULT now()`
- last_update `TIMESTAMP NOT NULL DEFAULT now()`
- historic `BOOLEAN NOT NULL DEFAULT false`

##### Table - order_products
- id `SERIAL PRIMARY KEY`
- order_id `BIGINT NOT NULL` `REFERENCES orders (id) ON DELETE CASCADE`
- product_id `BIGINT NOT NULL` `REFERENCES products (id) ON DELETE CASCADE`
- quantity `INTEGER NOT NULL DEFAULT 0`
- unit_price `NUMERIC NOT NULL DEFAULT 0`
- created `TIMESTAMP NOT NULL DEFAULT now()`
- last_update `TIMESTAMP NOT NULL DEFAULT now()`
- historic `BOOLEAN NOT NULL DEFAULT false`


