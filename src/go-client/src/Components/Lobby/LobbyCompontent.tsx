import React from "react";
import { IGameRules } from "../../../../go-common/IGameRules";
import IPlayer from "../../../../go-common/IPlayer";
import IRoom from "../../../../go-common/IRoom";
import { Optional } from "../../../../go-common/MappedTypes";
import GameController from "../../Rest/GameController";
import RoomPollController from "../../Rest/RoomPollController";
import './LobbyComponent.css';

export default function LobbyComponent(props: { baseUrl: string, player: IPlayer, room: IRoom, onGameStateChanged: (state: GameController) => void}) {
    const roomPollControl = React.useRef<null | RoomPollController>(null);
    const [room, setRoom] = React.useState<IRoom>(props.room);
    const [waitingForServer, setWaitingForServer] = React.useState<boolean>(false);

    const isHost = room.players[0].id === props.player.id;

    if(room.game !== undefined) {
        props.onGameStateChanged(new GameController(props.baseUrl, room, props.player));
    }

    React.useEffect(() => {
        if (roomPollControl.current === null) {
            roomPollControl.current = new RoomPollController(props.baseUrl, props.room, props.player);
            roomPollControl.current.bindHandler(setRoom);
        }
        return () => { roomPollControl.current?.destroy(); roomPollControl.current = null; }
    }, []);

    function tryUpdateRule(rule: Optional<IGameRules>) {
        setWaitingForServer(true);
        (roomPollControl.current as RoomPollController).tryChangeRules(rule).then(room => {
            setWaitingForServer(false);
            setRoom(room);
        });
    }

    function tryStartGame(){
        setWaitingForServer(true);
        (roomPollControl.current as RoomPollController).tryStartGame()
            .then(room => {
                setWaitingForServer(false);
                props.onGameStateChanged(new GameController(props.baseUrl, room, props.player));
            });
    }

    return <div className='lobby-component'>
        <div>{room.name}</div>
        {isHost? <button className='submitButon' onClick={tryStartGame}>Start Game</button>:<div className='wait-text'>Waiting for host to start...</div>}
        <div className='flex row left-align'>
            <div className='flex col collist rule-list'>
                <div>Rules:</div>
                <div className='rule'>
                    <label>Simultaneous:</label>
                    <input disabled={!isHost || waitingForServer} type='checkbox' checked={room.rules.simultaneous} onChange={(ev) => tryUpdateRule({ simultaneous: ev.target.checked })} />
                </div>
                <div className='rule'>
                    <label>Board Size:</label>
                    <input disabled={!isHost || waitingForServer} type='number' value={room.rules.boardSize} onChange={(ev) => tryUpdateRule({ boardSize: ev.target.valueAsNumber })} />
                </div>
                
                <div className='rule'>
                    <label>Max Players:</label>
                    <input disabled={!isHost || waitingForServer} type='number' value={room.rules.maxPlayerCount} onChange={(ev) => tryUpdateRule({ maxPlayerCount: ev.target.valueAsNumber })} />
                </div>
                
                <div className='rule'>
                    <label>Komi:</label>
                    <input disabled={!isHost || waitingForServer} type='number' value={room.rules.komi} onChange={(ev) => tryUpdateRule({ komi: ev.target.valueAsNumber })} />
                </div>
            </div>
            <div className='flex col collist'>
                <div>Players:</div>
                <ul>
                    {room.players.map(p => <li key={p.id}>{p.name}</li>)}
                </ul>
            </div>
        </div>
    </div>;
}