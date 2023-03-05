"# UdacityStorefrontBackend" 

## Dependencies:
- Node version - v19.6.1
- NPM version - v9.4.0
- PostgreSQL version - v15.2

- Packages Used - Refer to [DEPENDENCIES.txt](./DEPENDENCIES.txt)

## Notes:

- API app root is set as `0.0.0.0:3000/api/v1`

## Tasks

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
	- Sample data uses the following categories
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
	- Returns information about the user created
