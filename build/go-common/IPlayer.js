"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ClientPlayerViewWithSecret = exports.ClientPlayerView = void 0;
function ClientPlayerView(player) {
    return { id: player.id, name: player.name };
}
exports.ClientPlayerView = ClientPlayerView;
function ClientPlayerViewWithSecret(player) {
    return { id: player.id, name: player.name, secret: player.secret };
}
exports.ClientPlayerViewWithSecret = ClientPlayerViewWithSecret;
