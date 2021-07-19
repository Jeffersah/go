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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RemovePlayerFromRooms = void 0;
var IRoom_1 = require("./go-common/IRoom");
var IGameRules_1 = require("./go-common/IGameRules");
var ServerSimultaneousGameState_1 = __importDefault(require("./logic/GameStates/ServerSimultaneousGameState"));
var ServerSequentialGameState_1 = __importDefault(require("./logic/GameStates/ServerSequentialGameState"));
var allRooms = {};
var nextRoomId = 0;
function BindRoomEndpoints(app, getPlayer) {
    // Create a new room
    app.put('/room', function (req, res) {
        var _a, _b, _c, _d, _e;
        console.log('PUT: ' + req.url);
        var roomName = (_a = req.query.name) === null || _a === void 0 ? void 0 : _a.toString();
        var playerId = parseInt((_c = (_b = req.query.playerId) === null || _b === void 0 ? void 0 : _b.toString()) !== null && _c !== void 0 ? _c : '');
        var playerSecret = (_e = (_d = req.query.playerSecret) === null || _d === void 0 ? void 0 : _d.toString()) !== null && _e !== void 0 ? _e : '';
        if (roomName === undefined || roomName === '') {
            return res.status(400).send('Room name is required as query parameter "name"');
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
        var roomID = nextRoomId++;
        var room = {
            id: roomID,
            name: roomName,
            players: [player],
            rules: IGameRules_1.defaultGameRules
        };
        allRooms[roomID] = room;
        res.send(IRoom_1.ClientView(room, playerId));
    });
    // List all rooms
    app.get('/room', function (req, res) {
        var displayRooms = [];
        for (var roomID in allRooms) {
            var room = allRooms[roomID];
            if (room.game === undefined && room.players.length < room.rules.maxPlayerCount) {
                displayRooms.push(room);
            }
        }
        res.send(displayRooms.map(IRoom_1.ClientView));
    });
    // Get details of a single room
    app.get('/room/:roomId', function (req, res) {
        var roomId = parseInt(req.params.roomId);
        var room = allRooms[roomId];
        if (room === undefined) {
            res.status(400).send('Room not found');
            return;
        }
        // We don't really care about PID here, it only affects the game, and the game isn't running
        res.send(IRoom_1.ClientView(room, room.players[0].id));
    });
    // Change rules of a room
    app.post('/room/:roomId', function (req, res) {
        var _a, _b, _c, _d;
        console.log('POST: ' + req.url);
        var newRules = req.body;
        var roomId = parseInt(req.params.roomId);
        var playerId = parseInt((_b = (_a = req.query.playerId) === null || _a === void 0 ? void 0 : _a.toString()) !== null && _b !== void 0 ? _b : '');
        var playerSecret = (_d = (_c = req.query.playerSecret) === null || _c === void 0 ? void 0 : _c.toString()) !== null && _d !== void 0 ? _d : '';
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
        var room = allRooms[roomId];
        if (room === undefined) {
            res.status(400).send('Room not found');
            return;
        }
        if (room.players.indexOf(player) === -1) {
            res.status(400).send('Player not in room');
            return;
        }
        if (room.game !== undefined) {
            res.status(400).send('Can\'t change rules while the game is running');
        }
        if (newRules.simultaneous === undefined || newRules.simultaneous === room.rules.simultaneous) {
            room.rules = __assign(__assign({}, room.rules), newRules);
        }
        else if (newRules.simultaneous) {
            room.rules = __assign(__assign({}, IGameRules_1.defaultSimultaneousGameRules), newRules);
        }
        else {
            room.rules = __assign(__assign({}, IGameRules_1.defaultGameRules), newRules);
        }
        room.rules = __assign(__assign({}, room.rules), newRules);
        res.send(IRoom_1.ClientView(room, playerId));
    });
    // Join a room
    app.post('/room/:roomId/join', function (req, res) {
        var _a, _b, _c, _d;
        console.log('POST: ' + req.url);
        var roomId = parseInt(req.params.roomId);
        var playerId = parseInt((_b = (_a = req.query.playerId) === null || _a === void 0 ? void 0 : _a.toString()) !== null && _b !== void 0 ? _b : '');
        var playerSecret = (_d = (_c = req.query.playerSecret) === null || _c === void 0 ? void 0 : _c.toString()) !== null && _d !== void 0 ? _d : '';
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
        var room = allRooms[roomId];
        if (room === undefined) {
            res.status(400).send('Room not found');
            return;
        }
        if (room.game !== undefined) {
            res.status(400).send('Game is already running');
        }
        if (room.players.length < room.rules.maxPlayerCount) {
            room.players.push(player);
            res.send(IRoom_1.ClientView(room, playerId));
        }
        else {
            res.status(400).send('Room is full');
        }
    });
    // Start a game
    app.post('/room/:roomId/start', function (req, res) {
        var _a, _b, _c, _d;
        console.log('POST: ' + req.url);
        var roomId = parseInt(req.params.roomId);
        var playerId = parseInt((_b = (_a = req.query.playerId) === null || _a === void 0 ? void 0 : _a.toString()) !== null && _b !== void 0 ? _b : '');
        var playerSecret = (_d = (_c = req.query.playerSecret) === null || _c === void 0 ? void 0 : _c.toString()) !== null && _d !== void 0 ? _d : '';
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
        var room = allRooms[roomId];
        if (room === undefined) {
            res.status(400).send('Room not found');
            return;
        }
        if (room.game !== undefined) {
            res.status(400).send('Game is already running');
        }
        if (room.players.length < 2) {
            res.status(400).send('Room must have at least 2 players');
        }
        if (room.rules.simultaneous) {
            room.game = new ServerSimultaneousGameState_1.default(room.rules, room.players.length);
        }
        else {
            room.game = new ServerSequentialGameState_1.default(room.rules, room.players.length);
        }
        res.send(IRoom_1.ClientView(room, playerId));
    });
    return function (id) { return allRooms[id]; };
}
exports.default = BindRoomEndpoints;
function RemovePlayerFromRooms(player) {
    for (var _i = 0, _a = Object.values(allRooms); _i < _a.length; _i++) {
        var room = _a[_i];
        if (room.players.indexOf(player) !== -1) {
            room.players.splice(room.players.indexOf(player), 1);
            if (room.players.length === 0) {
                delete allRooms[room.id];
            }
        }
    }
}
exports.RemovePlayerFromRooms = RemovePlayerFromRooms;
