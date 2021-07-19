import { IGameState } from "./IGameState";

export type PlayResult = ISuccessfulPlayResult | IFailedPlayResult;

export interface ISuccessfulPlayResult {
    success: true;
    state: IGameState;
}

export interface IFailedPlayResult  {
    success: false;
    reason: string;
}

export interface IPartialSuccessfulPlayResult {
    success: true;
}

export type GamePlayResult = IPartialSuccessfulPlayResult | IFailedPlayResult;