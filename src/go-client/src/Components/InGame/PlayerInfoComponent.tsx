import IPlayer from "../../../../go-common/IPlayer";
import { gradientColors } from "./InGameComponent";
import './PlayerInfoComponent.css';

export default function PlayerInfoComponent(props: {player: IPlayer, captures:number, isMe: boolean, index: number}) {
    return <div className='player-wrapper'>
        <div className='player-name'>
            {props.player.name}
            {props.isMe ? <span className='is-you'> (You)</span> : <></>}
            <div>Playing {gradientColors[props.index].name}</div>
            <div>Captures: {props.captures}</div>
        </div>
    </div>;
}