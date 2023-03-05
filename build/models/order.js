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
exports.OrderStore = exports.order_status = void 0;
// @ts-ignore
var database_1 = __importDefault(require("../database"));
var order_status;
(function (order_status) {
    order_status["Active"] = "Active";
    order_status["Complete"] = "Complete";
})(order_status = exports.order_status || (exports.order_status = {}));
var OrderStore = /** @class */ (function () {
    function OrderStore() {
    }
    OrderStore.prototype.show = function (user_id, order_id) {
        return __awaiter(this, void 0, void 0, function () {
            var order_sql, order_products_sql, conn, result, o, op, order, err_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 4, , 5]);
                        if (user_id === null && order_id === null) {
                            return [2 /*return*/, ({
                                    code: 'EOP101',
                                    error: 'Either user or order must be provided.'
                                })];
                        }
                        ;
                        order_sql = "SELECT id, user_id, status, created\n                FROM orders\n                WHERE (\n                    (($1)::integer NOTNULL AND user_id = ($1) AND status = 'Active')\n                        OR id = ($2))\n                    AND NOT historic\n                ORDER BY created desc\n                LIMIT 1";
                        order_products_sql = "SELECT * FROM products_in_order($1)";
                        return [4 /*yield*/, database_1["default"].connect()];
                    case 1:
                        conn = _a.sent();
                        return [4 /*yield*/, conn.query(order_sql, [
                                user_id,
                                order_id
                            ])];
                    case 2:
                        result = _a.sent();
                        if (!result.rows.length) {
                            conn.release();
                            return [2 /*return*/, ({
                                    code: 'EOP101',
                                    error: "Order does not exist."
                                })];
                        }
                        ;
                        o = result.rows[0];
                        return [4 /*yield*/, conn.query(order_products_sql, [o.id])];
                    case 3:
                        result = _a.sent();
                        conn.release();
                        op = result.rows;
                        order = {
                            id: o.id,
                            user_id: o.user_id,
                            status: o.status,
                            created: o.created,
                            products: op
                        };
                        return [2 /*return*/, order];
                    case 4:
                        err_1 = _a.sent();
                        return [2 /*return*/, ({
                                code: 'EO102',
                                error: "Could not retrieve order. Error: ".concat(err_1)
                            })];
                    case 5: return [2 /*return*/];
                }
            });
        });
    };
    OrderStore.prototype.showByStatus = function (user_id, status) {
        return __awaiter(this, void 0, void 0, function () {
            var orders_sql, order_products_sql, conn, order_list, result, _i, order_list_1, order, result2, op, err_2;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 8, , 9]);
                        orders_sql = "SELECT id, user_id, status, created\n                FROM orders\n                WHERE user_id = ($1) AND status = ($2)\n                    AND NOT historic\n                ORDER BY created desc";
                        order_products_sql = "SELECT * FROM products_in_order($1)";
                        return [4 /*yield*/, database_1["default"].connect()];
                    case 1:
                        conn = _a.sent();
                        order_list = [];
                        return [4 /*yield*/, conn.query(orders_sql, [
                                user_id,
                                status
                            ])];
                    case 2:
                        result = _a.sent();
                        if (!!result.rows.length) return [3 /*break*/, 3];
                        conn.release();
                        return [2 /*return*/, order_list];
                    case 3:
                        order_list = result.rows;
                        console.log(order_list.length);
                        _i = 0, order_list_1 = order_list;
                        _a.label = 4;
                    case 4:
                        if (!(_i < order_list_1.length)) return [3 /*break*/, 7];
                        order = order_list_1[_i];
                        return [4 /*yield*/, conn.query(order_products_sql, [order.id])];
                    case 5:
                        result2 = _a.sent();
                        op = result2.rows;
                        order.products = op;
                        _a.label = 6;
                    case 6:
                        _i++;
                        return [3 /*break*/, 4];
                    case 7:
                        ;
                        conn.release();
                        return [2 /*return*/, order_list];
                    case 8:
                        err_2 = _a.sent();
                        return [2 /*return*/, ({
                                code: 'EO102',
                                error: "Could not retrieve order. Error: ".concat(err_2)
                            })];
                    case 9: return [2 /*return*/];
                }
            });
        });
    };
    OrderStore.prototype.create = function (o) {
        return __awaiter(this, void 0, void 0, function () {
            var sql, conn, result, order, err_3;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 3, , 4]);
                        sql = "INSERT INTO orders (user_id, status)\n                VALUES($1, $2) RETURNING *";
                        return [4 /*yield*/, database_1["default"].connect()];
                    case 1:
                        conn = _a.sent();
                        return [4 /*yield*/, conn.query(sql, [o.user_id, o.status])];
                    case 2:
                        result = _a.sent();
                        order = result.rows[0];
                        conn.release();
                        return [2 /*return*/, order];
                    case 3:
                        err_3 = _a.sent();
                        return [2 /*return*/, ({
                                code: 'EO201',
                                error: "Could not add new order ".concat(o, ". Error: ").concat(err_3)
                            })];
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    OrderStore.prototype.getOrderUser = function (id) {
        return __awaiter(this, void 0, void 0, function () {
            var order_sql, conn, result, err_4;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 3, , 4]);
                        order_sql = "SELECT user_id\n                FROM orders\n                WHERE id = ($1) AND NOT historic";
                        return [4 /*yield*/, database_1["default"].connect()];
                    case 1:
                        conn = _a.sent();
                        return [4 /*yield*/, conn.query(order_sql, [id])];
                    case 2:
                        result = _a.sent();
                        conn.release();
                        if (result.rows.length) {
                            return [2 /*return*/, result.rows[0].user_id];
                        }
                        else {
                            return [2 /*return*/, ({
                                    code: 'EO301',
                                    error: "Order ".concat(id, " does not exist.")
                                })];
                        }
                        return [3 /*break*/, 4];
                    case 3:
                        err_4 = _a.sent();
                        return [2 /*return*/, ({
                                code: 'EO302',
                                error: "Could not retrieve order ".concat(id, ". Error: ").concat(err_4)
                            })];
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    OrderStore.prototype.addProduct = function (op) {
        return __awaiter(this, void 0, void 0, function () {
            var order_sql, product_sql, exists_sql, insert_sql, update_sql, conn, result, order_1, exists, sql, order, err_5;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 6, , 7]);
                        order_sql = "SELECT * \n                FROM orders\n                WHERE id=($1) AND NOT historic";
                        product_sql = "SELECT * \n                FROM products\n                WHERE id=($1) AND NOT historic";
                        exists_sql = "SELECT count(1) > 0\n                FROM order_products\n                WHERE order_id = ($1) AND product_id = ($2)\n                    AND NOT historic";
                        insert_sql = "INSERT INTO order_products (\n                    order_id, product_id, quantity)\n                VALUES($1, $2, $3) RETURNING *";
                        update_sql = "UPDATE order_products\n                SET quantity = quantity + ($3)\n                WHERE order_id = ($1) AND product_id = ($2)";
                        return [4 /*yield*/, database_1["default"].connect()];
                    case 1:
                        conn = _a.sent();
                        return [4 /*yield*/, conn.query(order_sql, [op.order_id])];
                    case 2:
                        result = _a.sent();
                        if (result.rows.length) {
                            order_1 = result.rows[0];
                            if (order_1.status !== 'Active') {
                                conn.release();
                                return [2 /*return*/, ({
                                        code: 'EOP101',
                                        error: "Could not add product ".concat(op.product_id, " to order ").concat(op.order_id, " \n                            because order status is ").concat(order_1.status)
                                    })];
                            }
                        }
                        else {
                            conn.release();
                            return [2 /*return*/, ({
                                    code: 'EOP102',
                                    error: "Order ".concat(op.order_id, " is not valid.")
                                })];
                        }
                        return [4 /*yield*/, conn.query(product_sql, [op.product_id])];
                    case 3:
                        result = _a.sent();
                        if (!result.rows.length) {
                            conn.release();
                            return [2 /*return*/, ({
                                    code: 'EOP103',
                                    error: "Product ".concat(op.product_id, " is not valid.")
                                })];
                        }
                        return [4 /*yield*/, conn.query(exists_sql, [op.order_id, op.product_id])];
                    case 4:
                        result = _a.sent();
                        exists = result.rows[0];
                        sql = insert_sql;
                        if (exists) {
                            sql = update_sql;
                        }
                        return [4 /*yield*/, conn.query(sql, [
                                op.order_id,
                                op.product_id,
                                op.quantity,
                            ])];
                    case 5:
                        result = _a.sent();
                        order = result.rows[0];
                        conn.release();
                        return [2 /*return*/, order];
                    case 6:
                        err_5 = _a.sent();
                        return [2 /*return*/, ({
                                code: 'EOP104',
                                error: "Could not add product ".concat(op.product_id, " to order ").concat(op.order_id, ".\n                    Error: ").concat(err_5)
                            })];
                    case 7: return [2 /*return*/];
                }
            });
        });
    };
    OrderStore.prototype.showProducts = function (orderId) {
        return __awaiter(this, void 0, void 0, function () {
            var order_product_sql, conn, result, order, err_6;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 3, , 4]);
                        order_product_sql = "SELECT op.order_id, p.name, op.quantity\n                FROM order_products op\n                LEFT JOIN products p on p.id = op.product_id\n                LEFT JOIN order o on o.id = op.order_id\n                WHERE op.order_id=($1)\n                    AND NOT op.historic AND NOT o.historic";
                        return [4 /*yield*/, database_1["default"].connect()];
                    case 1:
                        conn = _a.sent();
                        return [4 /*yield*/, conn.query(order_product_sql, [orderId])];
                    case 2:
                        result = _a.sent();
                        order = result.rows;
                        return [2 /*return*/, order];
                    case 3:
                        err_6 = _a.sent();
                        return [2 /*return*/, ({
                                code: 'EOP201',
                                error: "Could not get products from order ".concat(orderId, ".\n                Error: ").concat(err_6)
                            })];
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    OrderStore.prototype.reduceProduct = function (op) {
        return __awaiter(this, void 0, void 0, function () {
            var order_product_sql, remove_product_sql, conn, result, quantity, err_7;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 8, , 9]);
                        order_product_sql = "SELECT op.quantity\n                FROM order_products op\n                LEFT JOIN order o on o.id = op.order_id \n                WHERE op.order_id=($1) AND op.product_id=($2)\n                    AND NOT o.historic AND NOT op.historic";
                        remove_product_sql = "";
                        return [4 /*yield*/, database_1["default"].connect()];
                    case 1:
                        conn = _a.sent();
                        return [4 /*yield*/, conn.query(order_product_sql, [op.order_id, op.product_id])];
                    case 2:
                        result = _a.sent();
                        if (!result.rows.length) return [3 /*break*/, 6];
                        if (!op.quantity) return [3 /*break*/, 3];
                        quantity = result.rows[0];
                        if (op.quantity > quantity) {
                            conn.release();
                            return [2 /*return*/, ({
                                    code: 'EOP301',
                                    error: "Unable to remove ".concat(op.quantity, " quantity\n                                from product ").concat(op.product_id, " in order ").concat(op.order_id, ".")
                                })];
                        }
                        return [3 /*break*/, 5];
                    case 3: return [4 /*yield*/, this.removeProduct(op)];
                    case 4:
                        _a.sent();
                        return [2 /*return*/];
                    case 5: return [3 /*break*/, 7];
                    case 6:
                        conn.release();
                        return [2 /*return*/, ({
                                code: 'EOP302',
                                error: "Unable to find product ".concat(op.product_id, " in order ").concat(op.order_id, ".")
                            })];
                    case 7: return [3 /*break*/, 9];
                    case 8:
                        err_7 = _a.sent();
                        return [2 /*return*/, ({
                                code: 'EOP303',
                                error: "Could not remove product ".concat(op.product_id, " from order ").concat(op.order_id, ".\n                    Error: ").concat(err_7)
                            })];
                    case 9: return [2 /*return*/];
                }
            });
        });
    };
    OrderStore.prototype.removeProduct = function (op) {
        return __awaiter(this, void 0, void 0, function () {
            var active_sql, exists_sql, delete_sql, historic_sql, conn, result, status_active, sql, err_8;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 7, , 8]);
                        active_sql = "SELECT status='Active'\n                FROM order\n                WHERE id = ($1) AND NOT historic";
                        exists_sql = "SELECT count(1)>0 AS exists\n                FROM order_products\n                WHERE order_id=($1) AND product_id=($2) NOT historic";
                        delete_sql = "DELETE FROM order_products\n                WHERE order_id=($1) AND product_id=($2)\n                RETURNING id";
                        historic_sql = "UPDATE order_products\n                SET historic = true\n                WHERE order_id=($1) AND product_id=($2)\n                RETURNING id";
                        return [4 /*yield*/, database_1["default"].connect()];
                    case 1:
                        conn = _a.sent();
                        return [4 /*yield*/, conn.query(active_sql, [op.order_id])];
                    case 2:
                        result = _a.sent();
                        if (!result.rows.length) return [3 /*break*/, 5];
                        status_active = result.rows[0];
                        return [4 /*yield*/, conn.query(exists_sql, [op.order_id, op.product_id])];
                    case 3:
                        result = _a.sent();
                        sql = historic_sql;
                        if (result.rows[0].exists) {
                            // Only delete order_product record if order is active
                            if (status_active) {
                                sql = delete_sql;
                            }
                        }
                        else {
                            conn.release();
                            return [2 /*return*/, ({
                                    code: 'EOP401',
                                    error: "Unable to find product ".concat(op.product_id, " in order ").concat(op.order_id, ".")
                                })];
                        }
                        return [4 /*yield*/, conn.query(sql, [op.order_id, op.product_id])];
                    case 4:
                        result = _a.sent();
                        return [2 /*return*/];
                    case 5:
                        conn.release();
                        return [2 /*return*/, ({
                                code: 'EOP402',
                                error: "Unable to find order ".concat(op.order_id, ".")
                            })];
                    case 6: return [3 /*break*/, 8];
                    case 7:
                        err_8 = _a.sent();
                        return [2 /*return*/, ({
                                code: 'EOP403',
                                error: "Could not remove product ".concat(op.product_id, " from order ").concat(op.order_id, ".\n                    Error: ").concat(err_8)
                            })];
                    case 8: return [2 /*return*/];
                }
            });
        });
    };
    OrderStore.prototype.complete = function (id) {
        return __awaiter(this, void 0, void 0, function () {
            var sql, conn, result, order, err_9;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 3, , 4]);
                        sql = "UPDATE orders status='Complete'\n                WHERE id=($1) AND NOT historic\n                RETURNING id";
                        return [4 /*yield*/, database_1["default"].connect()];
                    case 1:
                        conn = _a.sent();
                        return [4 /*yield*/, conn.query(sql, [id])];
                    case 2:
                        result = _a.sent();
                        conn.release();
                        if (result.rows.length) {
                            order = result.rows[0];
                            return [2 /*return*/, order];
                        }
                        else {
                            return [2 /*return*/, ({
                                    code: 'EO401',
                                    error: "Could not find order ".concat(id, ".")
                                })];
                        }
                        return [3 /*break*/, 4];
                    case 3:
                        err_9 = _a.sent();
                        return [2 /*return*/, ({
                                code: 'EO402',
                                error: "Could not delete order ".concat(id, ". Error: ").concat(err_9)
                            })];
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    OrderStore.prototype["delete"] = function (id) {
        return __awaiter(this, void 0, void 0, function () {
            var sql, conn, result, order, err_10;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 3, , 4]);
                        sql = "UPDATE orders\n                SET historic = true\n                WHERE id=($1)";
                        return [4 /*yield*/, database_1["default"].connect()];
                    case 1:
                        conn = _a.sent();
                        return [4 /*yield*/, conn.query(sql, [id])];
                    case 2:
                        result = _a.sent();
                        order = result.rows[0];
                        conn.release();
                        return [2 /*return*/, order];
                    case 3:
                        err_10 = _a.sent();
                        return [2 /*return*/, ({
                                code: 'EO501',
                                error: "Could not delete order ".concat(id, ". Error: ").concat(err_10)
                            })];
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    return OrderStore;
}());
exports.OrderStore = OrderStore;
