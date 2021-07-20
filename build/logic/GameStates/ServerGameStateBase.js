"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Neighbors = void 0;
var IGameState_1 = require("../../go-common/IGameState");
var LinqLike_1 = require("../../go-common/LinqLike");
exports.Neighbors = [{ x: -1, y: 0 }, { x: 1, y: 0 }, { x: 0, y: -1 }, { x: 0, y: 1 }];
var ServerGameStateBase = /** @class */ (function () {
    function ServerGameStateBase(rules, playerCount) {
        this.rules = rules;
        this.playerCount = playerCount;
        this.cells = [];
        for (var i = 0; i < rules.boardSize; i++) {
            var col = [];
            for (var j = 0; j < rules.boardSize; j++) {
                col.push(-1);
            }
            this.cells.push(col);
        }
        this.captureCounts = Array(playerCount).fill(0);
    }
    ServerGameStateBase.GetOpenOrClosedLiberties = function (cells, group) {
        var pid = cells[group[0].x][group[0].y];
        var openOrClosedLiberties = [];
        for (var _i = 0, group_1 = group; _i < group_1.length; _i++) {
            var c = group_1[_i];
            for (var _a = 0, Neighbors_1 = exports.Neighbors; _a < Neighbors_1.length; _a++) {
                var n = Neighbors_1[_a];
                var nx = c.x + n.x;
                var ny = c.y + n.y;
                if (nx < 0 || nx >= cells.length || ny < 0 || ny >= cells[0].length)
                    continue;
                if (cells[nx][ny] !== pid)
                    openOrClosedLiberties.push({ x: nx, y: ny });
            }
        }
        return LinqLike_1.Distinct(openOrClosedLiberties, IGameState_1.MovesEqual);
    };
    ServerGameStateBase.GetGroupsKilledByPlay = function (cells, x, y, alwaysIncludeSelf) {
        var player = cells[x][y];
        var groupsKilled = [];
        for (var _i = 0, Neighbors_2 = exports.Neighbors; _i < Neighbors_2.length; _i++) {
            var c = Neighbors_2[_i];
            var tgt = { x: x + c.x, y: y + c.y };
            if (tgt.x < 0 || tgt.x >= cells.length || tgt.y < 0 || tgt.y >= cells[0].length)
                continue;
            if (cells[tgt.x][tgt.y] === player)
                continue;
            var group = ServerGameStateBase.GetConnectedCells(cells, tgt.x, tgt.y);
            if (group.length === 0)
                continue;
            if (ServerGameStateBase.IsGroupDead(cells, group)) {
                groupsKilled.push(group);
            }
        }
        if (groupsKilled.length === 0 || alwaysIncludeSelf) {
            var selfGroup = ServerGameStateBase.GetConnectedCells(cells, x, y);
            if (ServerGameStateBase.IsGroupDead(cells, selfGroup)) {
                groupsKilled.push(selfGroup);
                return groupsKilled;
            }
        }
        return groupsKilled;
    };
    ServerGameStateBase.GetConnectedCells = function (cells, x, y) {
        var results = [];
        var queue = [{ x: x, y: y }];
        if (cells[x][y] === -1)
            return [];
        var _loop_1 = function () {
            var cell = queue.shift();
            if (results.findIndex(function (r) { return r.x === cell.x && r.y === cell.y; }) !== -1)
                return "continue";
            results.push(cell);
            for (var _i = 0, Neighbors_3 = exports.Neighbors; _i < Neighbors_3.length; _i++) {
                var n = Neighbors_3[_i];
                var nx = cell.x + n.x;
                var ny = cell.y + n.y;
                if (nx < 0 || nx >= cells.length || ny < 0 || ny >= cells[0].length)
                    continue;
                if (cells[nx][ny] !== cells[x][y])
                    continue;
                queue.push({ x: nx, y: ny });
            }
        };
        while (queue.length > 0) {
            _loop_1();
        }
        return results;
    };
    ServerGameStateBase.IsGroupDead = function (cells, group) {
        for (var _i = 0, group_2 = group; _i < group_2.length; _i++) {
            var c = group_2[_i];
            for (var _a = 0, Neighbors_4 = exports.Neighbors; _a < Neighbors_4.length; _a++) {
                var n = Neighbors_4[_a];
                var nx = c.x + n.x;
                var ny = c.y + n.y;
                if (nx < 0 || nx >= cells.length || ny < 0 || ny >= cells[0].length)
                    continue;
                if (cells[nx][ny] === -1)
                    return false;
            }
        }
        return true;
    };
    // A group "ID" is the topmost leftmost move of the group. Useful for comparing if two groups are the same without iterating both of them.
    ServerGameStateBase.GetGroupId = function (group) {
        var minMove = group[0];
        for (var _i = 0, group_3 = group; _i < group_3.length; _i++) {
            var c = group_3[_i];
            if (c.y < minMove.y)
                minMove = c;
            else if (c.y === minMove.y && c.x < minMove.x)
                minMove = c;
        }
        return minMove;
    };
    ServerGameStateBase.ClearGroup = function (cells, group) {
        for (var _i = 0, group_4 = group; _i < group_4.length; _i++) {
            var m = group_4[_i];
            cells[m.x][m.y] = -1;
        }
    };
    return ServerGameStateBase;
}());
exports.default = ServerGameStateBase;
