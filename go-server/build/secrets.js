"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GenerateSecret = void 0;
var possibleChars = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
function GenerateSecret() {
    var result = '';
    for (var i = 0; i < 32; i++) {
        result += possibleChars[Math.floor(Math.random() * possibleChars.length)];
    }
    return result;
}
exports.GenerateSecret = GenerateSecret;
