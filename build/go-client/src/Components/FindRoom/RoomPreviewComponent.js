"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("./RoomPreviewComponent.css");
function RoomPreviewComponent(props) {
    var descriptionString = '';
    var rules = props.room.rules;
    if (rules.simultaneous)
        descriptionString += 'Simultaneous, ';
    else
        descriptionString += 'Standard, ';
    descriptionString += rules.boardSize + 'x' + rules.boardSize + ', ';
    descriptionString += rules.komi + ' komi';
    return <div className='room-preview'>
        <div className='flex row justify-space-between'>
            <div>{props.room.name}</div>
            <button onClick={function () { return props.tryJoinRoom(props.room); }}>Join</button>
        </div>
        <div>Players: {props.room.players.length}/{props.room.rules.maxPlayerCount}</div>
        <div>{descriptionString}</div>
    </div>;
}
exports.default = RoomPreviewComponent;
