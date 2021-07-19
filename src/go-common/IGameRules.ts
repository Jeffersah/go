export interface IGameRules
{
    simultaneous: boolean;
    boardSize: number;
    maxPlayerCount: number;
    komi: number;
}

export const defaultGameRules: IGameRules = {
    simultaneous: false,
    boardSize: 19,
    maxPlayerCount: 2,
    komi: 7.5
};