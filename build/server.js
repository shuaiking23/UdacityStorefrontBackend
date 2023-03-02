"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
exports.__esModule = true;
var express_1 = __importDefault(require("express"));
var body_parser_1 = __importDefault(require("body-parser"));
var orders_1 = __importDefault(require("./handlers/orders"));
var products_1 = __importDefault(require("./handlers/products"));
var users_1 = __importDefault(require("./handlers/users"));
var app = (0, express_1["default"])();
var routes = express_1["default"].Router();
var address = '0.0.0.0:3000';
app.use(body_parser_1["default"].json());
app.use('/api/v1', routes);
routes.get('/', function (req, res) {
    res.send('Storefront API');
});
routes.use('/users', users_1["default"]);
routes.use('/products', products_1["default"]);
routes.use('/orders', orders_1["default"]);
app.listen(3000, function () {
    console.log("starting app on: ".concat(address));
});
