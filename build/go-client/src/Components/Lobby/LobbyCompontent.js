"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = __importDefault(require("react"));
var GameController_1 = __importDefault(require("../../Rest/GameController"));
var RoomPollController_1 = __importDefault(require("../../Rest/RoomPollController"));
require("./LobbyComponent.css");
function LobbyComponent(props) {
    var roomPollControl = react_1.default.useRef(null);
    var _a = react_1.default.useState(props.room), room = _a[0], setRoom = _a[1];
    var _b = react_1.default.useState(false), waitingForServer = _b[0], setWaitingForServer = _b[1];
    var isHost = room.players[0].id === props.player.id;
    if (room.game !== undefined) {
        props.onGameStateChanged(new GameController_1.default(props.baseUrl, room, props.player));
    }
    react_1.default.useEffect(function () {
        if (roomPollControl.current === null) {
            roomPollControl.current = new RoomPollController_1.default(props.baseUrl, props.room, props.player);
            roomPollControl.current.bindHandler(setRoom);
        }
        return function () { var _a; (_a = roomPollControl.current) === null || _a === void 0 ? void 0 : _a.destroy(); roomPollControl.current = null; };
    }, []);
    function tryUpdateRule(rule) {
        setWaitingForServer(true);
        roomPollControl.current.tryChangeRules(rule).then(function (room) {
            setWaitingForServer(false);
            setRoom(room);
        });
    }
    function tryStartGame() {
        setWaitingForServer(true);
        roomPollControl.current.tryStartGame()
            .then(function (room) {
            setWaitingForServer(false);
            props.onGameStateChanged(new GameController_1.default(props.baseUrl, room, props.player));
        });
    }
    return <div className='lobby-component'>
        <div>{room.name}</div>
        {isHost ? <button className='submitButon' onClick={tryStartGame}>Start Game</button> : <div className='wait-text'>Waiting for host to start...</div>}
        <div className='flex row left-align'>
            <div className='flex col collist rule-list'>
                <div>Rules:</div>
                <div className='rule'>
                    <label>Simultaneous:</label>
                    <input disabled={!isHost || waitingForServer} type='checkbox' checked={room.rules.simultaneous} onChange={function (ev) { return tryUpdateRule({ simultaneous: ev.target.checked }); }}/>
                </div>
                <div className='rule'>
                    <label>Board Size:</label>
                    <input disabled={!isHost || waitingForServer} type='number' value={room.rules.boardSize} onChange={function (ev) { return tryUpdateRule({ boardSize: ev.target.valueAsNumber }); }}/>
                </div>
                
                <div className='rule'>
                    <label>Max Players:</label>
                    <input disabled={!isHost || waitingForServer} type='number' value={room.rules.maxPlayerCount} onChange={function (ev) { return tryUpdateRule({ maxPlayerCount: ev.target.valueAsNumber }); }}/>
                </div>
                
                <div className='rule'>
                    <label>Komi:</label>
                    <input disabled={!isHost || waitingForServer} type='number' value={room.rules.komi} onChange={function (ev) { return tryUpdateRule({ komi: ev.target.valueAsNumber }); }}/>
                </div>
            </div>
            <div className='flex col collist'>
                <div>Players:</div>
                <ul>
                    {room.players.map(function (p) { return <li key={p.id}>{p.name}</li>; })}
                </ul>
            </div>
        </div>
    </div>;
}
exports.default = LobbyComponent;
