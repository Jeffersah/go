"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ClientView = void 0;
var IPlayer_1 = require("./IPlayer");
function ClientView(room, pid) {
    var _a;
    var playerIndex = room.players.findIndex(function (p) { return p.id === pid; });
    return { id: room.id, name: room.name, rules: room.rules, game: (_a = room.game) === null || _a === void 0 ? void 0 : _a.getStateForPlayer(playerIndex, -1), players: room.players.map(IPlayer_1.ClientPlayerView) };
}
exports.ClientView = ClientView;
