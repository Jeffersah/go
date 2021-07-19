export type GameRules = ISimultaneousGameRules | ISequentialGameRules;

export interface IGameRules
{
    simultaneous: boolean;
    boardSize: number;
    maxPlayerCount: number;
}

export interface ISimultaneousGameRules extends IGameRules {
    simultaneous: true;
    largeGroupsWinBounces: boolean;
}

export interface ISequentialGameRules extends IGameRules {
    simultaneous: false;
    komi: number;
}

export const defaultGameRules: ISequentialGameRules = {
    simultaneous: false,
    boardSize: 19,
    maxPlayerCount: 2,
    komi: 7.5
};

export const defaultSimultaneousGameRules : ISimultaneousGameRules = {
    simultaneous: true,
    boardSize: 19,
    maxPlayerCount: 2,
    largeGroupsWinBounces: true
} 
