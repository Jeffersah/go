import { IGameState } from "../../../../go-common/IGameState";
import GameController from "../../Rest/GameController";
import PlayerInfoComponent from "./PlayerInfoComponent";

export default function GameInfoComponent(props: { gameState: IGameState, gsc: GameController, myTurn: boolean })
{
    const room = props.gsc.room;
    return (
        <div className='flex col' style={{ textAlign:'left' }}>
            {props.myTurn ? <div className='my-turn'>Your Turn</div> : <div className='waiting-for-players'>Waiting for other players</div>}
            <div>Players:</div>
            {room.players.map((p, i) => <PlayerInfoComponent key={p.id} captures={props.gameState.captureCounts[i]} index={i} player={p} isMe={p.id === props.gsc.player.id} />)}
        </div>
    );
}