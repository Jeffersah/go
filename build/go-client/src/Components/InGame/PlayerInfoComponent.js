"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var InGameComponent_1 = require("./InGameComponent");
require("./PlayerInfoComponent.css");
function PlayerInfoComponent(props) {
    return <div className='player-wrapper'>
        <div className='player-name'>
            {props.player.name}
            {props.isMe ? <span className='is-you'> (You)</span> : <></>}
            <div>Playing {InGameComponent_1.gradientColors[props.index].name}</div>
            <div>Captures: {props.captures}</div>
        </div>
    </div>;
}
exports.default = PlayerInfoComponent;
