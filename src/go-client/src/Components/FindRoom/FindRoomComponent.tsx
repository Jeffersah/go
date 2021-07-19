import * as React from 'react';
import { useEffect } from 'react';
import IPlayer from '../../../../go-common/IPlayer';
import IRoom from '../../../../go-common/IRoom';
import RoomSearchController from '../../Rest/RoomSearchController';
import './FindRoomComponent.css';
import RoomPreviewComponent from './RoomPreviewComponent';

export default function FindRoomComponent(props: {baseUrl: string, player: IPlayer, onJoinedRoom: (room: IRoom) => void}) {
    const [roomName, setRoomName] = React.useState('');
    const [waitingForServer, setWaitingForServer] = React.useState(false);
    const [rooms, setRooms] = React.useState<IRoom[]>([]);
    const roomPollControl = React.useRef<null | RoomSearchController>(null);

    useEffect(() => {
        if (roomPollControl.current === null) {
            roomPollControl.current = new RoomSearchController(props.baseUrl, props.player);
            roomPollControl.current.bindHandler(setRooms);
        }
        return () => { roomPollControl.current?.destroy(); roomPollControl.current = null; }
    }, []);

    function tryJoinRoom(room: IRoom){
        setWaitingForServer(true);
        (roomPollControl.current as RoomSearchController).tryJoinRoom(room, props.player)
            .then(props.onJoinedRoom)
            .catch(err => { setWaitingForServer(false);alert('Failed: ' + err?.ToString()); });
    }

    function tryCreateRoom(){
        setWaitingForServer(true);
        (roomPollControl.current as RoomSearchController).tryCreateRoom(roomName, props.player)
            .then(props.onJoinedRoom)
            .catch(err => { setWaitingForServer(false); alert('Failed: ' + err?.ToString()); });
    }

    return (
        <div className='flex col align-stretch find-room-component full-height'>
            <div>Create a Room: </div>
            <div className='flex flex-row form-container'>
                <input className='room-name-input flex-grow' type='text' value={roomName} onChange={e => setRoomName(e.target.value)} disabled={waitingForServer}/>
                <button className='submitButton' disabled={waitingForServer} onClick={tryCreateRoom}>Go</button>
            </div>
            <div className='blinker' style={{ opacity: waitingForServer ? 1 : 0 }}>
                <div />
                <div />
                <div />
            </div>
            <div>Or, Join a Room: </div>
            {rooms.map(room => <RoomPreviewComponent key={room.id} player={props.player} room={room} tryJoinRoom={tryJoinRoom} />)}
        </div>
    );
}