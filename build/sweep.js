"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.StartExpiredPlayersTimer = void 0;
var MAX_TIME = 120 * 1000;
var POLL_INTEVAL = 10000;
function FindExpiredPlayers(players) {
    var result = [];
    var now = Date.now();
    for (var id in players) {
        var player = players[id];
        if (now - player.lastHeardFrom > MAX_TIME) {
            result.push(player);
        }
    }
    return result;
}
function StartExpiredPlayersTimer(players, callback) {
    callback(FindExpiredPlayers(players));
    setTimeout(function () {
        StartExpiredPlayersTimer(players, callback);
    }, POLL_INTEVAL);
}
exports.StartExpiredPlayersTimer = StartExpiredPlayersTimer;
;
