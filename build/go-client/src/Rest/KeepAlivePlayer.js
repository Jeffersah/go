"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var POLL_INTERVAL = 30000;
var RestPlayerController = /** @class */ (function () {
    function RestPlayerController(urlBase, player) {
        var _this = this;
        this.urlBase = urlBase;
        this.player = player;
        this.timeoutHandle = window.setTimeout(function () { return _this.sendKeepAlive(); }, POLL_INTERVAL);
    }
    RestPlayerController.prototype.sendKeepAlive = function () {
        var _this = this;
        fetch(this.urlBase + "/player/" + this.player.id + "?secret=" + this.player.secret);
        this.timeoutHandle = window.setTimeout(function () { return _this.sendKeepAlive(); }, POLL_INTERVAL);
    };
    RestPlayerController.prototype.destroy = function () {
        clearTimeout(this.timeoutHandle);
        fetch(this.urlBase + "/player/" + this.player.id + "?secret=" + this.player.secret, { method: 'DELETE' });
    };
    return RestPlayerController;
}());
exports.default = RestPlayerController;
