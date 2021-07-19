import { IGameRules } from "./IGameRules";
import { IServerPlayer } from "./IPlayer";

export interface IGameState {
    cells: number[][];
    captureCounts: number[];
    myTurn: boolean;
    previewMove?: IMove;
    illegalMoves?: IMove[];
    highlightMoves?: IMove[];
    state: number;
}

export interface IMove {
    x: number;
    y: number;
}

export function MovesEqual(a: IMove, b: IMove) {
    return a.x === b.x && a.y === b.y;
}