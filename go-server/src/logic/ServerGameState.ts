import { IGameRules } from "../go-common/IGameRules";
import { IGameState, IMove } from "../go-common/IGameState";
import { GamePlayResult, PlayResult } from "../go-common/IPlayResult";
import ServerSequentialGameState from "./GameStates/ServerSequentialGameState";
import ServerSimultaneousGameState from "./GameStates/ServerSimultaneousGameState";

type ServerGameState = ServerSequentialGameState | ServerSimultaneousGameState;
export default ServerGameState;

export interface IServerGameState {
    rules: IGameRules;
    getStateForPlayer(index: number, lastSeenState: number): IGameState | undefined;
    tryPlay(playerIndex: number, x: number, y: number): GamePlayResult;
}

export function IsSequential(state: ServerGameState): state is ServerSequentialGameState {
    return !state.rules.simultaneous;
}

export function IsSimultaneous(state: ServerGameState): state is ServerSimultaneousGameState {
    return state.rules.simultaneous;
}