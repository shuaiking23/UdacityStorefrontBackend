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
exports.ProductStore = void 0;
// @ts-ignore
var database_1 = __importDefault(require("../database"));
var ProductStore = /** @class */ (function () {
    function ProductStore() {
    }
    ProductStore.prototype.index = function (category) {
        return __awaiter(this, void 0, void 0, function () {
            var conn, sql, result, err_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 3, , 4]);
                        return [4 /*yield*/, database_1["default"].connect()];
                    case 1:
                        conn = _a.sent();
                        sql = "SELECT id, name, category,\n                    created, last_update\n                FROM products\n                WHERE NOT historic\n                    AND (($1)::text IS NULL\n                        OR category ILIKE ($1)::text)\n                ORDER BY name";
                        return [4 /*yield*/, conn.query(sql, [category])];
                    case 2:
                        result = _a.sent();
                        conn.release();
                        return [2 /*return*/, result.rows];
                    case 3:
                        err_1 = _a.sent();
                        return [2 /*return*/, {
                                code: 'EP101',
                                error: "Could not get products. Error: ".concat(err_1)
                            }];
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    ProductStore.prototype.show = function (id) {
        return __awaiter(this, void 0, void 0, function () {
            var sql, conn, result, err_2;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 3, , 4]);
                        sql = "SELECT *\n                FROM products\n                WHERE id=($1) AND NOT historic";
                        return [4 /*yield*/, database_1["default"].connect()];
                    case 1:
                        conn = _a.sent();
                        return [4 /*yield*/, conn.query(sql, [id])];
                    case 2:
                        result = _a.sent();
                        conn.release();
                        if (!result.rows.length) {
                            return [2 /*return*/, {
                                    code: 'EP201',
                                    error: "Could not find product ".concat(id, ".")
                                }];
                        }
                        else {
                            return [2 /*return*/, result.rows[0]];
                        }
                        return [3 /*break*/, 4];
                    case 3:
                        err_2 = _a.sent();
                        return [2 /*return*/, {
                                code: 'EP202',
                                error: "Could not find product ".concat(id, ". Error: ").concat(err_2)
                            }];
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    ProductStore.prototype.create = function (p) {
        return __awaiter(this, void 0, void 0, function () {
            var sql, conn, result, p_result, product, err_3;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 3, , 4]);
                        sql = "INSERT INTO products (name, category, price) \n                VALUES($1, $2, $3) RETURNING *";
                        return [4 /*yield*/, database_1["default"].connect()];
                    case 1:
                        conn = _a.sent();
                        return [4 /*yield*/, conn.query(sql, [p.name, p.category, p.price])];
                    case 2:
                        result = _a.sent();
                        p_result = result.rows[0];
                        product = {
                            id: p_result.id,
                            name: p_result.name,
                            price: p_result.price,
                            category: p_result.category
                        };
                        conn.release();
                        return [2 /*return*/, product];
                    case 3:
                        err_3 = _a.sent();
                        return [2 /*return*/, {
                                code: 'EP301',
                                error: "Could not add new product ".concat(p.name, ". Error: ").concat(err_3)
                            }];
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    ProductStore.prototype["delete"] = function (id) {
        return __awaiter(this, void 0, void 0, function () {
            var sql, conn, result, product, err_4;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 3, , 4]);
                        sql = "UPDATE products\n                SET name = 'd_' || name, historic = true\n                WHERE id=($1)";
                        return [4 /*yield*/, database_1["default"].connect()];
                    case 1:
                        conn = _a.sent();
                        return [4 /*yield*/, conn.query(sql, [id])];
                    case 2:
                        result = _a.sent();
                        product = result.rows[0];
                        conn.release();
                        return [2 /*return*/, product];
                    case 3:
                        err_4 = _a.sent();
                        return [2 /*return*/, {
                                code: 'EP401',
                                error: "Could not delete product ".concat(id, ". Error: ").concat(err_4)
                            }];
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    ProductStore.prototype.topN = function (top_num) {
        return __awaiter(this, void 0, void 0, function () {
            var sql, conn, result, products, err_5;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 3, , 4]);
                        sql = "SELECT tp.id, tp.name, tp.historic, \n                    tp.order_quantity as order_sum\n                FROM top_selling_products(".concat(top_num, ") tp");
                        return [4 /*yield*/, database_1["default"].connect()];
                    case 1:
                        conn = _a.sent();
                        return [4 /*yield*/, conn.query(sql)];
                    case 2:
                        result = _a.sent();
                        products = result.rows;
                        conn.release();
                        return [2 /*return*/, products];
                    case 3:
                        err_5 = _a.sent();
                        return [2 /*return*/, {
                                code: 'EP501',
                                error: "Could not get top5 products. Error: ".concat(err_5)
                            }];
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    return ProductStore;
}());
exports.ProductStore = ProductStore;
