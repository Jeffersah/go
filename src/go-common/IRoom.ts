import ServerGameState from "../logic/ServerGameState";
import { GameRules, IGameRules } from "./IGameRules";
import { IGameState, IMove } from "./IGameState";
import IPlayer, { ClientPlayerView, IServerPlayer } from "./IPlayer";

export default interface IRoom {
    id: number;
    name: string;
    players: IPlayer[];
    rules: GameRules;
    game?: IGameState;
}

export interface IServerRoom {
    id: number;
    name: string;
    players: IServerPlayer[];
    rules: GameRules;
    game?: ServerGameState;
}

export function ClientView(room: IServerRoom, pid: number): IRoom {
    const playerIndex = room.players.findIndex(p => p.id === pid);
    return { id: room.id, name: room.name, rules: room.rules, game: room.game?.getStateForPlayer(playerIndex, -1), players: room.players.map(ClientPlayerView) };
}