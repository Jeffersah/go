"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
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
var __spreadArray = (this && this.__spreadArray) || function (to, from) {
    for (var i = 0, il = from.length, j = to.length; i < il; i++, j++)
        to[j] = from[i];
    return to;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var LinqLike_1 = require("../../go-common/LinqLike");
var ServerGameStateBase_1 = __importDefault(require("./ServerGameStateBase"));
var ServerSimultaneousGameState = /** @class */ (function (_super) {
    __extends(ServerSimultaneousGameState, _super);
    function ServerSimultaneousGameState(rules, playerCount) {
        var _this = _super.call(this, rules, playerCount) || this;
        _this.moves = [Array(_this.playerCount).fill(null)];
        _this.remainingPlayers = [];
        _this.pendingMoves = [];
        _this.illegalMoves = [];
        _this.playerStates = [];
        for (var i = 0; i < playerCount; i++) {
            _this.illegalMoves.push([]);
            _this.pendingMoves.push(null);
            _this.remainingPlayers.push(i);
            _this.playerStates.push(0);
        }
        return _this;
    }
    ServerSimultaneousGameState.prototype.tryPlay = function (playerIndex, x, y) {
        var _this = this;
        if (this.illegalMoves[playerIndex].findIndex(function (m) { return m.x === x && m.y === y; }) !== -1) {
            return { success: false, reason: "Illegal move" };
        }
        if (this.cells[x][y] !== -1) {
            return { success: false, reason: "Cell Occupied" };
        }
        if (this.remainingPlayers.indexOf(playerIndex) === -1) {
            return { success: false, reason: "Other players are resolving their moves" };
        }
        this.pendingMoves[playerIndex] = { x: x, y: y };
        this.playerStates[playerIndex]++;
        // Every remaining player has a pending move
        if (this.remainingPlayers.reduce(function (b, player) { return b && _this.pendingMoves[player] !== null; }, true)) {
            this.resolvePlays();
        }
        return { success: true };
    };
    ServerSimultaneousGameState.prototype.resolvePlays = function () {
        var _this = this;
        var playerMoves = this.remainingPlayers.map(function (i) { return ({ move: _this.pendingMoves[i], player: i }); });
        var groups = LinqLike_1.GroupBy(playerMoves, function (m) { return m.move.x + ',' + m.move.y; });
        var actualPlays = [];
        this.remainingPlayers = [];
        var _loop_1 = function (key) {
            var plays = groups[key];
            if (plays.length === 1) {
                actualPlays.push(plays[0]);
            }
            else {
                var sizes_1 = plays.map(function (p) { return (__assign(__assign({}, p), { size: _this.getAllConnectedGroups(p.move.x, p.move.y, p.player).length })); });
                // If we don't care about group size, we just bounce all the players who played here.
                if (!this_1.rules.largeGroupsWinBounces) {
                    this_1.markIllegalMoves(sizes_1);
                    return "continue";
                }
                sizes_1.sort(function (a, b) { return b.size - a.size; });
                var largest = sizes_1.filter(function (s) { return s.size === sizes_1[0].size; });
                if (largest.length > 1) {
                    // Push
                    this_1.markIllegalMoves(largest);
                }
                else {
                    // Crush
                    actualPlays.push(largest[0]);
                    for (var i = 1; i < largest.length; i++) {
                        actualPlays.push({ crushedBy: largest[0].player, player: largest[i].player, move: largest[i].move });
                    }
                }
            }
        };
        var this_1 = this;
        for (var key in groups) {
            _loop_1(key);
        }
        var lookForKill = [];
        // Play all the resolved moves
        for (var _i = 0, actualPlays_1 = actualPlays; _i < actualPlays_1.length; _i++) {
            var play = actualPlays_1[_i];
            this.moves[this.moves.length - 1][play.player] = play.move;
            if (play.crushedBy !== undefined) {
                var crushed = play.crushedBy;
                this.captureCounts[crushed]++;
            }
            else {
                this.cells[play.move.x][play.move.y] = play.player;
                lookForKill.push(play.move);
            }
        }
        var killedGroups = [];
        // Kill all captured groups
        for (var _a = 0, lookForKill_1 = lookForKill; _a < lookForKill_1.length; _a++) {
            var killMove = lookForKill_1[_a];
            for (var _b = 0, _c = ServerGameStateBase_1.default.GetGroupsKilledByPlay(this.cells, killMove.x, killMove.y, true); _b < _c.length; _b++) {
                var group = _c[_b];
                killedGroups.push({ id: ServerGameStateBase_1.default.GetGroupId(group), items: group });
            }
        }
        killedGroups = LinqLike_1.WithDistinct(killedGroups, function (g) { return g.id; }, function (a, b) { return a.x == b.x && a.y == b.y; });
        // Sort killed groups, smallest first
        // Also put the player groups last, so they are the last to be captured
        killedGroups = this.sortCaptureGroups(killedGroups, lookForKill);
        // Then split these in order into groups of the same size
        var splitBySize = this.splitCaptureGroupsBySize(killedGroups);
        // For each size group...
        for (var _d = 0, splitBySize_1 = splitBySize; _d < splitBySize_1.length; _d++) {
            var sizeGroup = splitBySize_1[_d];
            // Find which (if any) are dead still. (They might've been saved by a smaller group being killed earlier)
            var deadGroups = sizeGroup.filter(function (g) { return ServerGameStateBase_1.default.IsGroupDead(_this.cells, g.items); });
            // Score for each of their capture...
            for (var _e = 0, deadGroups_1 = deadGroups; _e < deadGroups_1.length; _e++) {
                var deadGroup = deadGroups_1[_e];
                var captureCredit = this.getCaptureCredit(deadGroup.items);
                var scorePer = Math.floor(deadGroup.items.length / captureCredit.length);
                for (var _f = 0, captureCredit_1 = captureCredit; _f < captureCredit_1.length; _f++) {
                    var captured = captureCredit_1[_f];
                    this.captureCounts[captured] += scorePer;
                }
            }
            // ...and kill them
            for (var _g = 0, deadGroups_2 = deadGroups; _g < deadGroups_2.length; _g++) {
                var deadGroup = deadGroups_2[_g];
                ServerGameStateBase_1.default.ClearGroup(this.cells, deadGroup.items);
            }
        }
        // Increment all player states
        for (var i = 0; i < this.playerStates.length; i++) {
            this.playerStates[i]++;
        }
        if (this.remainingPlayers.length === 0) {
            // Reset the turn
            this.remainingPlayers = [];
            for (var i = 0; i < this.playerCount; i++) {
                this.remainingPlayers.push(i);
                this.illegalMoves[i] = [];
                this.pendingMoves[i] = null;
            }
            this.moves.push(Array(this.playerCount).fill(null));
        }
    };
    ServerSimultaneousGameState.prototype.sortCaptureGroups = function (killedGroups, playerMoves) {
        // sort groups, smallest first
        killedGroups.sort(function (a, b) { return a.items.length - b.items.length; });
        // Find groups which contain any player move
        var groupsContainingPlayerMove = killedGroups.filter(function (g) { return g.items.some(function (m) { return playerMoves.findIndex(function (p) { return p.x === m.x && p.y === m.y; }) !== -1; }); });
        var groupsMissingPlayerMove = killedGroups.filter(function (g) { return !groupsContainingPlayerMove.some(function (pm) { return g.id === pm.id; }); });
        // We should remove non-player moves first, so that a small group can capture a large group if it's a result of a move by the smaller player
        return __spreadArray(__spreadArray([], groupsMissingPlayerMove), groupsContainingPlayerMove);
    };
    ServerSimultaneousGameState.prototype.splitCaptureGroupsBySize = function (groups) {
        var result = [];
        for (var _i = 0, groups_1 = groups; _i < groups_1.length; _i++) {
            var group = groups_1[_i];
            if (result.length === 0)
                result.push([]);
            var last = result[result.length - 1];
            if (last.length === 0 || last[0].items.length === group.items.length) {
                last.push(group);
            }
            else {
                result.push([group]);
            }
        }
        return result;
    };
    ServerSimultaneousGameState.prototype.getCaptureCredit = function (group) {
        var groupPlayer = this.cells[group[0].x][group[0].y];
        var results = {};
        var liberties = ServerGameStateBase_1.default.GetOpenOrClosedLiberties(this.cells, group);
        for (var _i = 0, liberties_1 = liberties; _i < liberties_1.length; _i++) {
            var l = liberties_1[_i];
            var capturer = this.cells[l.x][l.y];
            if (capturer === -1) {
                continue;
            }
            if (capturer === groupPlayer) {
                continue;
            } // This shouldn't happen, but whatever.
            if (!(capturer in results)) {
                results[capturer] = 0;
            }
            results[capturer]++;
        }
        var arr = Object.keys(results).map(function (k) { return ({ player: parseInt(k), count: results[parseInt(k)] }); });
        arr.sort(function (a, b) { return b.count - a.count; });
        var allMax = arr.filter(function (a) { return a.count === arr[0].count; });
        return allMax.map(function (p) { return p.player; });
    };
    ServerSimultaneousGameState.prototype.markIllegalMoves = function (plays) {
        for (var _i = 0, plays_1 = plays; _i < plays_1.length; _i++) {
            var play = plays_1[_i];
            this.illegalMoves[play.player].push(play.move);
            this.remainingPlayers.push(play.player);
            this.pendingMoves[play.player] = null;
        }
    };
    ServerSimultaneousGameState.prototype.getAllConnectedGroups = function (x, y, playerIndex) {
        this.cells[x][y] = playerIndex;
        var result = ServerGameStateBase_1.default.GetConnectedCells(this.cells, x, y);
        this.cells[x][y] = -1;
        return result;
    };
    ServerSimultaneousGameState.prototype.getStateForPlayer = function (index, lastSeenState) {
        var _a;
        if (this.playerStates[index] === lastSeenState)
            return undefined;
        var highlightMoves = this.moves.length <= 1 ? [] : this.moves[this.moves.length - 2].filter(function (m) { return m !== null; });
        return {
            cells: this.cells,
            captureCounts: this.captureCounts,
            myTurn: this.remainingPlayers.indexOf(index) !== -1,
            previewMove: (_a = this.pendingMoves[index]) !== null && _a !== void 0 ? _a : undefined,
            illegalMoves: this.illegalMoves[index],
            state: this.playerStates[index],
            highlightMoves: highlightMoves
        };
    };
    return ServerSimultaneousGameState;
}(ServerGameStateBase_1.default));
exports.default = ServerSimultaneousGameState;
