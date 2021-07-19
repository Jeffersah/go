"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PlayMove = exports.TryResolveSimultaneousMoves = exports.TrySubmitSimultaneousMove = exports.TryPlayMove = void 0;
var History_1 = __importDefault(require("./History"));
function TryPlayMove(game, room, player, playerIndex, x, y) {
    if (x < 0 || y < 0 || x >= game.cells.length || y >= game.cells[x].length) {
        return { success: false, reason: 'Cell out of bounds' };
    }
    if (game.cells[x][y] !== -1) {
        return { success: false, reason: 'Cell is occupied' };
    }
    if (PlayMove(game, game.moves.length % room.players.length, x, y)) {
        game.moves.push({ x: x, y: y });
        game.waitingForPlayer = [game.moves.length % room.players.length];
        return { success: true, state: game };
    }
    else {
        game.cells = History_1.default(game.moves, room.players, room.rules);
        return { success: false, reason: 'Suicide move' };
    }
}
exports.TryPlayMove = TryPlayMove;
function TrySubmitSimultaneousMove(game, room, player, playerIndex, x, y) {
    throw new Error('Not implemented');
}
exports.TrySubmitSimultaneousMove = TrySubmitSimultaneousMove;
function TryResolveSimultaneousMoves(game, room) {
    throw new Error('Not implemented');
}
exports.TryResolveSimultaneousMoves = TryResolveSimultaneousMoves;
function PlayMove(game, pid, x, y) {
    game.cells[x][y] = pid;
    game.moves.push({ x: x, y: y });
    TryRemoveCapturedGroup(game, x + 1, y, pid);
    TryRemoveCapturedGroup(game, x - 1, y, pid);
    TryRemoveCapturedGroup(game, x, y + 1, pid);
    TryRemoveCapturedGroup(game, x, y - 1, pid);
    if (TryRemoveCapturedGroup(game, x, y, -1)) {
        // Suicide move!
        return false;
    }
    return true;
}
exports.PlayMove = PlayMove;
var neighbors = [{ x: -1, y: 0 }, { x: 1, y: 0 }, { x: 0, y: -1 }, { x: 0, y: 1 }];
function FindConnectedCells(game, x, y) {
    var connectedCells = [];
    var queue = [{ x: x, y: y }];
    while (queue.length > 0) {
        var cell = queue.pop();
        connectedCells.push(cell);
        for (var _i = 0, neighbors_1 = neighbors; _i < neighbors_1.length; _i++) {
            var n = neighbors_1[_i];
            var nx = cell.x + n.x;
            var ny = cell.y + n.y;
            if (nx >= 0 && nx < game.cells.length && ny >= 0 && ny < game.cells[nx].length && game.cells[nx][ny] === game.cells[x][y]) {
                var ignore = false;
                for (var _a = 0, connectedCells_1 = connectedCells; _a < connectedCells_1.length; _a++) {
                    var alreadyVisited = connectedCells_1[_a];
                    if (alreadyVisited.x === nx && alreadyVisited.y === ny) {
                        ignore = true;
                    }
                }
                if (!ignore) {
                    queue.push({ x: nx, y: ny });
                }
            }
        }
    }
    return connectedCells;
}
function TryRemoveCapturedGroup(game, x, y, capturingPlayer) {
    if (x < 0 || x >= game.cells.length || y < 0 || y >= game.cells[x].length) {
        return false;
    }
    if (game.cells[x][y] === -1 || game.cells[x][y] === capturingPlayer) {
        return false;
    }
    var connectedCells = FindConnectedCells(game, x, y);
    for (var _i = 0, connectedCells_2 = connectedCells; _i < connectedCells_2.length; _i++) {
        var connected = connectedCells_2[_i];
        for (var _a = 0, neighbors_2 = neighbors; _a < neighbors_2.length; _a++) {
            var neighbor = neighbors_2[_a];
            var nx = connected.x + neighbor.x;
            var ny = connected.y + neighbor.y;
            if (nx >= 0 && nx < game.cells.length && ny >= 0 && ny < game.cells[nx].length && game.cells[nx][ny] === -1) {
                return false;
            }
        }
    }
    if (capturingPlayer !== -1) {
        game.captureCounts[capturingPlayer] += connectedCells.length;
    }
    for (var _b = 0, connectedCells_3 = connectedCells; _b < connectedCells_3.length; _b++) {
        var cell = connectedCells_3[_b];
        game.cells[cell.x][cell.y] = -1;
    }
    return true;
}
//# sourceMappingURL=Play.js.map