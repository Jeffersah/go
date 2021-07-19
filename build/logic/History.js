"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AreBoardsEqual = void 0;
var IGameState_1 = require("../go-common/IGameState");
var Play_1 = require("./Play");
function GetBoardAtHistory(moves, players, rules) {
    var gameState = IGameState_1.InitializeGameState(rules, players);
    for (var i = 0; i < moves.length; i++) {
        Play_1.PlayMove(gameState, i % players.length, moves[i].x, moves[i].y);
    }
    return gameState.cells;
}
exports.default = GetBoardAtHistory;
function AreBoardsEqual(a, b) {
    if (a.length !== b.length) {
        return false;
    }
    for (var i = 0; i < a.length; i++) {
        if (a[i].length !== b[i].length) {
            return false;
        }
        for (var j = 0; j < a[i].length; j++) {
            if (a[i][j] !== b[i][j]) {
                return false;
            }
        }
    }
    return true;
}
exports.AreBoardsEqual = AreBoardsEqual;
//# sourceMappingURL=History.js.map