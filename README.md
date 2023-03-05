"# UdacityStorefrontBackend" 

## Dependencies:
- Node version - v19.6.1
- NPM version - v9.4.0
- PostgreSQL version - v15.2

- Packages Used - Refer to [DEPENDENCIES.txt](./DEPENDENCIES.txt)

## Tasks

### Order
- [x] RO1 Current Order by user (args: user id)[token required]
	- User id is retrieved from auth token
	- Returns the latest active order by user, together with products in order
- [x] RO2 [OPTIONAL] Completed Orders by user (args: user id)[token required]
	- User id is retrieved from auth token
	- Returns a list of completed orders by user, together with products in those orders

### Product
- [x] RP1 Index
	- Returns a list of active products
- [x] RP2 Show
	- Returns the product if available based on id provided
- [x] RP3 Create [token required]
	- Creates a product based on body params provided
	- Returns information about the product created
- [x] RP4 [OPTIONAL] Top 5 most popular products
	- Top 5 endpoint calls topN(5) method
- [x] RP5 [OPTIONAL] Products by category (args: product category)
	- category filter is provided as an optional query parameter on index as `?category`

### User
- [x] RU1 Index [token required]
	- Returns a list of active users
- [x] RU2 Show [token required]
	- Returns the user if available based on id provided
- [x] RU3 Create N[token required]
	- Creates a user based on body params provided
	- Returns information about the user created
