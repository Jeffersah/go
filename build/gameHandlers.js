"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
Object.defineProperty(exports, "__esModule", { value: true });
function BindGameEndpoints(app, getPlayer, getRoom) {
    // Get the game state
    app.get('/room/:roomId/game', function (req, res) {
        var _a, _b, _c, _d, _e, _f;
        var roomId = parseInt(req.params.roomId);
        var lastMoveId = parseInt((_b = (_a = req.query.lastMoveId) === null || _a === void 0 ? void 0 : _a.toString()) !== null && _b !== void 0 ? _b : '-1');
        var playerId = parseInt((_d = (_c = req.query.playerId) === null || _c === void 0 ? void 0 : _c.toString()) !== null && _d !== void 0 ? _d : '');
        var playerSecret = (_f = (_e = req.query.playerSecret) === null || _e === void 0 ? void 0 : _e.toString()) !== null && _f !== void 0 ? _f : '';
        if (isNaN(lastMoveId))
            lastMoveId = -1;
        var room = getRoom(roomId);
        if (room === undefined) {
            res.status(400).send('Room not found');
            return;
        }
        if (room.game === undefined) {
            res.status(400).send('Game not started');
            return;
        }
        if (playerId === undefined || isNaN(playerId)) {
            res.status(400).send('Invalid player ID');
            return;
        }
        var player = getPlayer(playerId);
        if (player === undefined) {
            res.status(400).send('Player ID not found');
            return;
        }
        if (player.secret !== playerSecret) {
            res.status(400).send('Invalid player secret');
            return;
        }
        var playerIndex = room.players.findIndex(function (p) { return p.id === playerId; });
        if (playerIndex === -1) {
            res.status(400).send('Player is not in this game');
            return;
        }
        var game = room.game;
        var state = game.getStateForPlayer(playerIndex, lastMoveId);
        if (state === undefined) {
            res.status(204).end();
            return;
        }
        res.send(state);
    });
    // Try to play a move
    app.post('/room/:roomId/game/play', function (req, res) {
        var _a, _b, _c, _d, _e, _f, _g, _h;
        var roomId = parseInt(req.params.roomId);
        var playerId = parseInt((_b = (_a = req.query.playerId) === null || _a === void 0 ? void 0 : _a.toString()) !== null && _b !== void 0 ? _b : '');
        var playerSecret = (_d = (_c = req.query.playerSecret) === null || _c === void 0 ? void 0 : _c.toString()) !== null && _d !== void 0 ? _d : '';
        var x = parseInt((_f = (_e = req.query.x) === null || _e === void 0 ? void 0 : _e.toString()) !== null && _f !== void 0 ? _f : '');
        var y = parseInt((_h = (_g = req.query.y) === null || _g === void 0 ? void 0 : _g.toString()) !== null && _h !== void 0 ? _h : '');
        if (x === undefined || isNaN(x) || y === undefined || isNaN(y)) {
            res.status(400).send('Invalid play location');
            return;
        }
        if (playerId === undefined || isNaN(playerId)) {
            res.status(400).send('Invalid player ID');
            return;
        }
        var player = getPlayer(playerId);
        if (player === undefined) {
            res.status(400).send('Player ID not found');
            return;
        }
        if (player.secret !== playerSecret) {
            res.status(400).send('Invalid player secret');
            return;
        }
        var room = getRoom(roomId);
        if (room === undefined) {
            res.status(400).send('Room not found');
            return;
        }
        if (room.game === undefined) {
            res.status(400).send('Game is not running');
            return;
        }
        var playerIndex = room.players.findIndex(function (p) { return p.id === playerId; });
        if (playerIndex === -1) {
            res.status(400).send('Player is not in this game');
            return;
        }
        var response = room.game.tryPlay(playerIndex, x, y);
        if (response.success) {
            return res.send(__assign(__assign({}, response), { state: room.game.getStateForPlayer(playerIndex, -1) }));
        }
        else {
            return res.send(response);
        }
    });
}
exports.default = BindGameEndpoints;
