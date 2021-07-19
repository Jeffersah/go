"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.IsSimultaneous = exports.IsSequential = void 0;
function IsSequential(state) {
    return !state.rules.simultaneous;
}
exports.IsSequential = IsSequential;
function IsSimultaneous(state) {
    return state.rules.simultaneous;
}
exports.IsSimultaneous = IsSimultaneous;
