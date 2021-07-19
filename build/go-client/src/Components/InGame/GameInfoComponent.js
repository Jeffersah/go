"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var PlayerInfoComponent_1 = __importDefault(require("./PlayerInfoComponent"));
function GameInfoComponent(props) {
    var room = props.gsc.room;
    return (<div className='flex col' style={{ textAlign: 'left' }}>
            {props.myTurn ? <div className='my-turn'>Your Turn</div> : <div className='waiting-for-players'>Waiting for other players</div>}
            <div>Players:</div>
            {room.players.map(function (p, i) { return <PlayerInfoComponent_1.default key={p.id} captures={props.gameState.captureCounts[i]} index={i} player={p} isMe={p.id === props.gsc.player.id}/>; })}
        </div>);
}
exports.default = GameInfoComponent;
