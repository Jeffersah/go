"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var express_1 = __importDefault(require("express"));
var cors_1 = __importDefault(require("cors"));
var IPlayer_1 = require("./go-common/IPlayer");
var roomHandlers_1 = __importStar(require("./roomHandlers"));
var secrets_1 = require("./secrets");
var sweep_1 = require("./sweep");
var gameHandlers_1 = __importDefault(require("./gameHandlers"));
var app = express_1.default();
var allPlayers = {};
var nextPlayerId = 0;
app.use(cors_1.default());
app.use(express_1.default.json());
app.use(express_1.default.static('./src/go-client/build/'));
app.get('/player/:pid', function (req, res) {
    var id = parseInt(req.params.pid);
    if (isNaN(id)) {
        res.status(400).send('Invalid player id');
        return;
    }
    if (allPlayers[id]) {
        allPlayers[id].lastHeardFrom = Date.now();
        res.statusCode = 204;
        res.end();
        return;
    }
    res.status(404).send('Player not found');
});
app.put('/player', function (req, res) {
    var _a, _b;
    console.log('PUT: ' + req.url);
    var name = (_b = (_a = (req.query).name) === null || _a === void 0 ? void 0 : _a.toString()) !== null && _b !== void 0 ? _b : '';
    if (name === '') {
        res.status(400).send('Required URL parameter "name" is missing/empty');
        return;
    }
    var id = nextPlayerId++;
    var secret = secrets_1.GenerateSecret();
    var player = {
        id: id,
        secret: secret,
        name: name,
        lastHeardFrom: Date.now()
    };
    allPlayers[id] = player;
    res.send(IPlayer_1.ClientPlayerViewWithSecret(player));
});
var getRoom = roomHandlers_1.default(app, function (pid) { return allPlayers[pid]; });
gameHandlers_1.default(app, function (pid) { return allPlayers[pid]; }, getRoom);
console.log('Env port: ' + process.env.PORT);
var portString = process.env.PORT;
if (portString === undefined || portString === null || portString === '') {
    portString = '8080';
}
var port = parseInt(portString);
app.listen(port, function () {
    console.log("Started on port " + port);
});
function RemovePlayers(players) {
    for (var _i = 0, players_1 = players; _i < players_1.length; _i++) {
        var player = players_1[_i];
        delete allPlayers[player.id];
        roomHandlers_1.RemovePlayerFromRooms(player);
    }
}
sweep_1.StartExpiredPlayersTimer(allPlayers, RemovePlayers);
