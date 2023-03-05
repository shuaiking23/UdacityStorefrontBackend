export const HOSTNAME: string = '0.0.0.0';
export const PORT: string = '3000';
export const FULLHOST: string = `${HOSTNAME}:${PORT}`;

export const URL_CONTEXT: string = '/api/v1';
export const URL_ID: string = '/:id';
export const URL_BLANK: string = '/';

export const URL_USERS: string = '/users';
export const URL_USERS_INDEX: string = URL_CONTEXT + URL_USERS;
export const URL_USERS_SHOW: string = URL_CONTEXT + URL_USERS + URL_ID;
export const URL_USERS_CREATE: string = URL_CONTEXT + URL_USERS;

export const URL_ORDERS: string = '/orders';

export const URL_PRODUCTS: string = '/products';

export const URL_PRODUCT: string = '/product';
