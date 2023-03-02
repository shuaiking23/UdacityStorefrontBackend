"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
exports.__esModule = true;
exports.token_check = void 0;
var jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
var token_check = function (authorizationHeader, user_id) {
    try {
        var token = authorizationHeader.split(' ')[1];
        var decoded = jsonwebtoken_1["default"].verify(token, process.env.TOKEN_SECRET);
        if (user_id != null && decoded.id !== user_id) {
            throw new Error('User id does not match!');
        }
    }
    catch (err) {
        return err;
    }
    return 'OK';
};
exports.token_check = token_check;
