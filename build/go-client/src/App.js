"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = __importDefault(require("react"));
require("./App.css");
var CreatePlayerComponent_1 = __importDefault(require("./Components/CreatePlayer/CreatePlayerComponent"));
var KeepAlivePlayer_1 = __importDefault(require("./Rest/KeepAlivePlayer"));
var FindRoomComponent_1 = __importDefault(require("./Components/FindRoom/FindRoomComponent"));
var LobbyCompontent_1 = __importDefault(require("./Components/Lobby/LobbyCompontent"));
var InGameComponent_1 = __importDefault(require("./Components/InGame/InGameComponent"));
var baseUrl = 'http://localhost:8080';
function App() {
    var _a = react_1.default.useState(null), playerKeepAlive = _a[0], setPlayer = _a[1];
    var _b = react_1.default.useState(null), room = _b[0], setRoom = _b[1];
    var _c = react_1.default.useState(null), gameStateController = _c[0], setGameStateController = _c[1];
    var contentElement = null;
    if (playerKeepAlive === null) {
        contentElement = <CreatePlayerComponent_1.default baseUrl={baseUrl} onPlayerCreated={function (p) { return setPlayer(new KeepAlivePlayer_1.default(baseUrl, p)); }}/>;
    }
    else if (room === null) {
        contentElement = <FindRoomComponent_1.default baseUrl={baseUrl} player={playerKeepAlive.player} onJoinedRoom={setRoom}/>;
    }
    else if (gameStateController === null) {
        contentElement = <LobbyCompontent_1.default baseUrl={baseUrl} player={playerKeepAlive.player} room={room} onGameStateChanged={setGameStateController}/>;
    }
    else {
        contentElement = <InGameComponent_1.default gameController={gameStateController} player={playerKeepAlive.player}/>;
    }
    return <div className='App'>
    {contentElement}
  </div>;
}
exports.default = App;
