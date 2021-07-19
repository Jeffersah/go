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
        while (_) try {
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
Object.defineProperty(exports, "__esModule", { value: true });
var POLL_INTERVAL = 1000;
var GameController = /** @class */ (function () {
    function GameController(urlBase, room, player) {
        this.urlBase = urlBase;
        this.room = room;
        this.player = player;
        this.handlers = [];
        this.timeoutHandle = -1;
    }
    GameController.prototype.bindHandler = function (handler) {
        this.handlers.push(handler);
        if (this.handlers.length === 1) {
            this.startUpdateLoop();
        }
    };
    GameController.prototype.startUpdateLoop = function () {
        this.pollRoom();
    };
    GameController.prototype.pollRoom = function () {
        var _this = this;
        var _a, _b, _c;
        fetch(this.urlBase + "/room/" + this.room.id + "/game?lastMoveId=" + ((_b = (_a = this.currentGameState) === null || _a === void 0 ? void 0 : _a.state) !== null && _b !== void 0 ? _b : -1) + "&playerId=" + this.player.id + "&playerSecret=" + encodeURIComponent((_c = this.player.secret) !== null && _c !== void 0 ? _c : ''), { method: 'GET' })
            .then(function (res) { return __awaiter(_this, void 0, void 0, function () {
            var _a, _b, _c, gameState_1;
            var _this = this;
            return __generator(this, function (_d) {
                switch (_d.label) {
                    case 0:
                        if (!!res.ok) return [3 /*break*/, 2];
                        _b = (_a = console).error;
                        _c = 'Bad response during game poll: ' + res.status + ' ';
                        return [4 /*yield*/, res.text()];
                    case 1:
                        _b.apply(_a, [_c + (_d.sent())]);
                        _d.label = 2;
                    case 2:
                        if (!(res.status === 200)) return [3 /*break*/, 4];
                        return [4 /*yield*/, res.json()];
                    case 3:
                        gameState_1 = (_d.sent());
                        this.currentGameState = gameState_1;
                        this.handlers.forEach(function (handler) { return handler(gameState_1); });
                        _d.label = 4;
                    case 4:
                        this.timeoutHandle = window.setTimeout(function () { return _this.startUpdateLoop(); }, POLL_INTERVAL);
                        return [2 /*return*/];
                }
            });
        }); });
    };
    GameController.prototype.tryPlayMove = function (x, y) {
        var _a;
        return __awaiter(this, void 0, void 0, function () {
            var _this = this;
            return __generator(this, function (_b) {
                return [2 /*return*/, fetch(this.urlBase + "/room/" + this.room.id + "/game/play?x=" + x + "&y=" + y + "&playerId=" + this.player.id + "&playerSecret=" + encodeURIComponent((_a = this.player.secret) !== null && _a !== void 0 ? _a : ''), {
                        method: 'POST'
                    })
                        .then(function (res) { return __awaiter(_this, void 0, void 0, function () {
                        var errorText, _a, result;
                        return __generator(this, function (_b) {
                            switch (_b.label) {
                                case 0:
                                    if (!!res.ok) return [3 /*break*/, 2];
                                    _a = 'Bad response during play move: ' + res.status + ' ';
                                    return [4 /*yield*/, res.text()];
                                case 1:
                                    errorText = _a + (_b.sent());
                                    console.error(errorText);
                                    return [2 /*return*/, Promise.reject(errorText)];
                                case 2: return [4 /*yield*/, res.json()];
                                case 3:
                                    result = (_b.sent());
                                    if (result.success) {
                                        this.currentGameState = result.state;
                                        this.handlers.forEach(function (handler) { return handler(result.state); });
                                    }
                                    return [2 /*return*/, result];
                            }
                        });
                    }); })];
            });
        });
    };
    GameController.prototype.destroy = function () {
        clearTimeout(this.timeoutHandle);
    };
    return GameController;
}());
exports.default = GameController;
