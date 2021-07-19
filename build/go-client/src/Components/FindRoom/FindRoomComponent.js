"use strict";
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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var React = __importStar(require("react"));
var react_1 = require("react");
var RoomSearchController_1 = __importDefault(require("../../Rest/RoomSearchController"));
require("./FindRoomComponent.css");
var RoomPreviewComponent_1 = __importDefault(require("./RoomPreviewComponent"));
function FindRoomComponent(props) {
    var _a = React.useState(''), roomName = _a[0], setRoomName = _a[1];
    var _b = React.useState(false), waitingForServer = _b[0], setWaitingForServer = _b[1];
    var _c = React.useState([]), rooms = _c[0], setRooms = _c[1];
    var roomPollControl = React.useRef(null);
    react_1.useEffect(function () {
        if (roomPollControl.current === null) {
            roomPollControl.current = new RoomSearchController_1.default(props.baseUrl, props.player);
            roomPollControl.current.bindHandler(setRooms);
        }
        return function () { var _a; (_a = roomPollControl.current) === null || _a === void 0 ? void 0 : _a.destroy(); roomPollControl.current = null; };
    }, []);
    function tryJoinRoom(room) {
        setWaitingForServer(true);
        roomPollControl.current.tryJoinRoom(room, props.player)
            .then(props.onJoinedRoom)
            .catch(function (err) { setWaitingForServer(false); alert('Failed: ' + (err === null || err === void 0 ? void 0 : err.ToString())); });
    }
    function tryCreateRoom() {
        setWaitingForServer(true);
        roomPollControl.current.tryCreateRoom(roomName, props.player)
            .then(props.onJoinedRoom)
            .catch(function (err) { setWaitingForServer(false); alert('Failed: ' + (err === null || err === void 0 ? void 0 : err.ToString())); });
    }
    return (<div className='flex col align-stretch find-room-component full-height'>
            <div>Create a Room: </div>
            <div className='flex flex-row form-container'>
                <input className='room-name-input flex-grow' type='text' value={roomName} onChange={function (e) { return setRoomName(e.target.value); }} disabled={waitingForServer}/>
                <button className='submitButton' disabled={waitingForServer} onClick={tryCreateRoom}>Go</button>
            </div>
            <div className='blinker' style={{ opacity: waitingForServer ? 1 : 0 }}>
                <div />
                <div />
                <div />
            </div>
            <div>Or, Join a Room: </div>
            {rooms.map(function (room) { return <RoomPreviewComponent_1.default key={room.id} player={props.player} room={room} tryJoinRoom={tryJoinRoom}/>; })}
        </div>);
}
exports.default = FindRoomComponent;
