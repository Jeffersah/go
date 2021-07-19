import IPlayer from "../../../../go-common/IPlayer";
import IRoom from "../../../../go-common/IRoom";
import './RoomPreviewComponent.css';

export default function RoomPreviewComponent(props: { player: IPlayer, room: IRoom, tryJoinRoom: (room: IRoom)=>void }) {
    let descriptionString = '';
    const rules = props.room.rules;
    if(rules.simultaneous) descriptionString += 'Simultaneous, ';
    else descriptionString += 'Standard, '
    descriptionString += rules.boardSize + 'x' + rules.boardSize + ', ';
    return <div className='room-preview'>
        <div className='flex row justify-space-between'>
            <div>{props.room.name}</div>
            <button onClick={()=>props.tryJoinRoom(props.room)}>Join</button>
        </div>
        <div>Players: {props.room.players.length}/{props.room.rules.maxPlayerCount}</div>
        <div>{descriptionString}</div>
    </div>;
}