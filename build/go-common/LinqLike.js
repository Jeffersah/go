"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Distinct = exports.WithDistinct = exports.GroupBy = void 0;
function GroupBy(arr, keySelector) {
    var result = {};
    for (var _i = 0, arr_1 = arr; _i < arr_1.length; _i++) {
        var item = arr_1[_i];
        var key = keySelector(item);
        if (!result[key]) {
            result[key] = [];
        }
        result[key].push(item);
    }
    return result;
}
exports.GroupBy = GroupBy;
function WithDistinct(arr, keySelector, eq) {
    var equalityComparer = eq !== null && eq !== void 0 ? eq : (function (a, b) { return a === b; });
    var keys = [];
    var results = [];
    var _loop_1 = function (item) {
        var key = keySelector(item);
        if (keys.some(function (k) { return equalityComparer(k, key); })) {
            return "continue";
        }
        results.push(item);
    };
    for (var _i = 0, arr_2 = arr; _i < arr_2.length; _i++) {
        var item = arr_2[_i];
        _loop_1(item);
    }
    return results;
}
exports.WithDistinct = WithDistinct;
function Distinct(arr, eq) {
    var equalityComparer = eq !== null && eq !== void 0 ? eq : (function (a, b) { return a === b; });
    var result = [];
    var _loop_2 = function (item) {
        if (!result.some(function (r) { return equalityComparer(r, item); })) {
            result.push(item);
        }
    };
    for (var _i = 0, arr_3 = arr; _i < arr_3.length; _i++) {
        var item = arr_3[_i];
        _loop_2(item);
    }
    return result;
}
exports.Distinct = Distinct;
