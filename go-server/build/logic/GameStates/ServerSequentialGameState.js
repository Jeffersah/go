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
Object.defineProperty(exports, "__esModule", { value: true });
var ServerGameStateBase_1 = __importStar(require("./ServerGameStateBase"));
var ServerSequentialGameState = /** @class */ (function (_super) {
    __extends(ServerSequentialGameState, _super);
    function ServerSequentialGameState(rules, playerCount) {
        var _this = _super.call(this, rules, playerCount) || this;
        _this.moves = [];
        return _this;
    }
    ServerSequentialGameState.prototype.tryPlay = function (playerIndex, x, y) {
        var _a, _b;
        if (playerIndex !== this.moves.length % this.playerCount)
            return { success: false, reason: "Not your turn" };
        if (this.cells[x][y] !== -1)
            return { success: false, reason: "Cell occupied" };
        this.cells[x][y] = playerIndex;
        for (var _i = 0, Neighbors_1 = ServerGameStateBase_1.Neighbors; _i < Neighbors_1.length; _i++) {
            var n = Neighbors_1[_i];
            var tgt = { x: x + n.x, y: y + n.y };
            var cell = (_b = (_a = this.cells[tgt.x]) === null || _a === void 0 ? void 0 : _a[tgt.y]) !== null && _b !== void 0 ? _b : -1;
            if (cell === -1)
                continue;
            if (cell === playerIndex)
                continue;
            var group = ServerGameStateBase_1.default.GetConnectedCells(this.cells, tgt.x, tgt.y);
            if (ServerGameStateBase_1.default.IsGroupDead(this.cells, group)) {
                this.captureCounts[playerIndex] += group.length;
                for (var _c = 0, group_1 = group; _c < group_1.length; _c++) {
                    var cell_1 = group_1[_c];
                    this.cells[cell_1.x][cell_1.y] = -1;
                }
            }
        }
        return { success: true };
    };
    ServerSequentialGameState.prototype.getStateForPlayer = function (index, lastSeenState) {
        if (this.moves.length === lastSeenState)
            return undefined;
        return {
            cells: this.cells,
            captureCounts: this.captureCounts,
            myTurn: index === this.moves.length % this.playerCount,
            state: this.moves.length,
        };
    };
    return ServerSequentialGameState;
}(ServerGameStateBase_1.default));
exports.default = ServerSequentialGameState;
