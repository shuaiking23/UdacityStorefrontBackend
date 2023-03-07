"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
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
var product_1 = require("../models/product");
var common_1 = require("../utilities/common");
var cfg = __importStar(require("../utilities/appConfigs"));
var route = express_1["default"].Router();
var store = new product_1.ProductStore();
// Requirements
/*
RP1 Index - DONE
RP2 Show - DONE
RP3 Create [token required] - DONE
RP4 [OPTIONAL] Top 5 most popular products - DONE
RP5 [OPTIONAL] Products by category (args: product category) - DONE
*/
// Product Routes
/*
get '/', index, public
get '/:id', show, public
post '/', create, token
delete '/:id', destroy, token - DISABLED
get '/top5', top5, public
*/
var index = function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var category, products;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                // Optionally allow filter by category
                console.log('test');
                category = req.query.category;
                if (!category) {
                    category = null;
                }
                console.log('test');
                return [4 /*yield*/, store.index(category)];
            case 1:
                products = _a.sent();
                if (products.error) {
                    res.status(400);
                }
                res.json(products);
                return [2 /*return*/];
        }
    });
}); };
// RP01 Index
// RP05 [OPTIONAL] Products by category (args: product category)
route.get(cfg.URL_BLANK, index);
var show = function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var product;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, store.show(parseInt(req.params.id))];
            case 1:
                product = _a.sent();
                if (product.error) {
                    res.status(400);
                }
                res.json(product);
                return [2 /*return*/];
        }
    });
}); };
// RP02 Show
route.get(cfg.URL_ID, show);
var create = function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var product, newProduct, err_1;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                product = {
                    name: req.body.name,
                    price: req.body.price,
                    category: req.body.category
                };
                return [4 /*yield*/, store.create(product)];
            case 1:
                newProduct = _a.sent();
                if (newProduct.error) {
                    res.status(400);
                }
                res.json(newProduct);
                return [3 /*break*/, 3];
            case 2:
                err_1 = _a.sent();
                res.status(400).json(err_1);
                return [3 /*break*/, 3];
            case 3: return [2 /*return*/];
        }
    });
}); };
// RP03 Create [token required]
route.post(cfg.URL_BLANK, (0, common_1.tokenCheck)(null), create);
var destroy = function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var deleted;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, store["delete"](parseInt(req.params.id))];
            case 1:
                deleted = _a.sent();
                if (deleted.error) {
                    res.status(400);
                }
                res.json(deleted);
                return [2 /*return*/];
        }
    });
}); };
// route.delete('/:id', tokenCheck(null), destroy);
var topN = function (t_num) {
    return function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
        var topProducts;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, store.topN(5)];
                case 1:
                    topProducts = _a.sent();
                    if (topProducts.error) {
                        res.status(400);
                    }
                    res.json(topProducts);
                    return [2 /*return*/];
            }
        });
    }); };
};
// RP04 [OPTIONAL] Top 5 most popular products
route.get('/top5', topN(5));
exports["default"] = route;
