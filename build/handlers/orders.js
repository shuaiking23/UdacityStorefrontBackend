"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
exports.__esModule = true;
var express_1 = __importDefault(require("express"));
var order_1 = require("../models/order");
var common_1 = require("../utilities/common");
var route = express_1["default"].Router();
var store = new order_1.OrderStore();
// Requirements
/*
RO1 Current Order by user (args: user id)[token required] - DONE
RO2 [OPTIONAL] Completed Orders by user (args: user id)[token required] - DONE
*/
// Order Routes
/*
get '/current', showCurrent, token
get '/completed', showByStatus(order_status.Complete), token
get '/active', showByStatus(order_status.Active), token - DISABLED
get '/:id', show, token - DISABLED
post '/', create, token - DISABLED
delete '/:id', destroy, token - DISABLED
*/
// Middleware to check order user
var orderUserCheck = function (req, res, next) { return __awaiter(void 0, void 0, void 0, function () {
    var user_id, err_1;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                console.log('orderCheck');
                _a.label = 1;
            case 1:
                _a.trys.push([1, 3, , 4]);
                return [4 /*yield*/, store.getOrderUser(parseInt(req.params.id))];
            case 2:
                user_id = _a.sent();
                if (user_id.error) {
                    res.status(400).json(user_id);
                    return [2 /*return*/];
                }
                if (user_id != res.locals.userid) {
                    res.status(403).json({
                        code: 'EOH101',
                        error: "You have no access to this order"
                    });
                    return [2 /*return*/];
                }
                return [3 /*break*/, 4];
            case 3:
                err_1 = _a.sent();
                return [3 /*break*/, 4];
            case 4:
                next();
                return [2 /*return*/];
        }
    });
}); };
// Returns the most recent active order
var showCurrent = function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var order;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                console.log('showCurrent');
                return [4 /*yield*/, store.show(parseInt(res.locals.userid), null)];
            case 1:
                order = _a.sent();
                if (order.error) {
                    res.status(400);
                }
                res.json(order);
                return [2 /*return*/];
        }
    });
}); };
// RO1 Current Order by user (args: user id)[token required]
route.get('/current', (0, common_1.tokenCheck)(null), showCurrent);
var showByStatus = function (status) {
    return function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
        var order;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, store.showByStatus(parseInt(res.locals.userid), status)];
                case 1:
                    order = _a.sent();
                    if (order.error) {
                        res.status(400);
                    }
                    res.json({
                        record_count: order.length,
                        order: order
                    });
                    return [2 /*return*/];
            }
        });
    }); };
};
// RO2 [OPTIONAL] Completed Orders by user (args: user id)[token required]
route.get('/completed', (0, common_1.tokenCheck)(null), showByStatus(order_1.order_status.Complete));
//route.get('/active', tokenCheck(null), showByStatus(order_status.Active));
var show = function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var order;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, store.show(null, parseInt(req.params.id))];
            case 1:
                order = _a.sent();
                if (order.error) {
                    if (order.code == 'EOPH101') {
                        res.status(403);
                    }
                    else {
                        res.status(400);
                    }
                    res.json(order);
                    return [2 /*return*/];
                }
                res.json(order);
                return [2 /*return*/];
        }
    });
}); };
//route.get(cfg.URL_ID, tokenCheck(null), order_user_check, show);
var create = function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var order, newOrder, err_2;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                order = {
                    user_id: res.locals.userid,
                    status: order_1.order_status.Active
                };
                return [4 /*yield*/, store.create(order)];
            case 1:
                newOrder = _a.sent();
                if (newOrder.error) {
                    res.status(400).json(newOrder);
                    return [2 /*return*/];
                }
                res.json(newOrder);
                return [3 /*break*/, 3];
            case 2:
                err_2 = _a.sent();
                res.status(400).json(err_2);
                return [3 /*break*/, 3];
            case 3: return [2 /*return*/];
        }
    });
}); };
// route.post(cfg.URL_BLANK, tokenCheck(null), create);
var destroy = function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var deleted;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, store["delete"](req.body.orderid)];
            case 1:
                deleted = _a.sent();
                if (deleted.error) {
                    res.status(400).json(deleted);
                    return [2 /*return*/];
                }
                res.json(deleted);
                return [2 /*return*/];
        }
    });
}); };
// route.delete('/:id', token_check(null), orderUserCheck, destroy);
// Order Product Routes
/*
post '/:id/products', showProducts - Disabled
post '/:id/product/add', addProduct - Disabled
post '/:id/product/reduce', reduceProduct - Disabled
*/
var showProducts = function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var orderProducts, err_3;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                return [4 /*yield*/, store.showProducts(parseInt(req.params.id))];
            case 1:
                orderProducts = _a.sent();
                if (orderProducts.error) {
                    res.status(400).json(orderProducts);
                    return [2 /*return*/];
                }
                res.json(orderProducts);
                return [3 /*break*/, 3];
            case 2:
                err_3 = _a.sent();
                res.status(400).json(err_3);
                return [3 /*break*/, 3];
            case 3: return [2 /*return*/];
        }
    });
}); };
// route.post(cfg.URL_ID + cfg.URL_PRODUCT, tokenCheck(null), orderUserCheck, showProducts);
var addProduct = function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var op, addedProduct, err_4;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                op = {
                    order_id: parseInt(req.params.id),
                    product_id: parseInt(req.body.productId),
                    quantity: parseInt(req.body.quantity)
                };
                _a.label = 1;
            case 1:
                _a.trys.push([1, 3, , 4]);
                return [4 /*yield*/, store.addProduct(op)];
            case 2:
                addedProduct = _a.sent();
                if (addedProduct.error) {
                    res.status(400).json(addedProduct);
                }
                res.json(addedProduct);
                return [3 /*break*/, 4];
            case 3:
                err_4 = _a.sent();
                res.status(400).json(err_4);
                return [3 /*break*/, 4];
            case 4: return [2 /*return*/];
        }
    });
}); };
// route.post(`${cfg.URL_ID}${cfg.URL_PRODUCT}/add`, tokenCheck(null), orderUserCheck, addProduct);
var reduceProduct = function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var op, reduceProduct_1, err_5;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                op = {
                    order_id: parseInt(req.params.id),
                    product_id: parseInt(req.body.productId),
                    quantity: parseInt(req.body.quantity)
                };
                _a.label = 1;
            case 1:
                _a.trys.push([1, 3, , 4]);
                return [4 /*yield*/, store.reduceProduct(op)];
            case 2:
                reduceProduct_1 = _a.sent();
                if (reduceProduct_1.error) {
                    res.status(400);
                }
                res.json(reduceProduct_1);
                return [3 /*break*/, 4];
            case 3:
                err_5 = _a.sent();
                res.status(400).json(err_5);
                return [3 /*break*/, 4];
            case 4: return [2 /*return*/];
        }
    });
}); };
// route.post(`${cfg.URL_ID}${cfg.URL_PRODUCT}/reduce`, tokenCheck(null), orderUserCheck, reduceProduct);
exports["default"] = route;
