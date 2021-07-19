import { IGameRules, ISequentialGameRules } from "../../go-common/IGameRules";
import { IGameState, IMove } from "../../go-common/IGameState";
import { GamePlayResult, PlayResult } from "../../go-common/IPlayResult";
import { IServerGameState } from "../ServerGameState";
import ServerGameStateBase, { Neighbors } from "./ServerGameStateBase";

export default class ServerSequentialGameState extends ServerGameStateBase<ISequentialGameRules> implements IServerGameState {
    moves: IMove[];
    
    constructor(rules: ISequentialGameRules, playerCount: number) {
        super(rules, playerCount);
        this.moves = [];
    }

    tryPlay(playerIndex: number, x: number, y: number): GamePlayResult {
        if(playerIndex !== this.moves.length % this.playerCount) return { success: false, reason: "Not your turn" };
        if(this.cells[x][y] !== -1) return { success: false, reason: "Cell occupied" };

        this.cells[x][y] = playerIndex;
        for(const n of Neighbors){
            let tgt = {x: x + n.x, y: y + n.y};
            const cell = this.cells[tgt.x]?.[tgt.y]??-1;
            if(cell === -1) continue;
            if(cell === playerIndex) continue;
            const group = ServerGameStateBase.GetConnectedCells(this.cells, tgt.x, tgt.y);
            if(ServerGameStateBase.IsGroupDead(this.cells, group))
            {
                this.captureCounts[playerIndex] += group.length;
                for(const cell of group) {
                    this.cells[cell.x][cell.y] = -1;
                }
            }
        }

        return { success: true };
    }

    public getStateForPlayer(index: number, lastSeenState: number): IGameState | undefined {
        if(this.moves.length === lastSeenState) return undefined;
        return {
            cells: this.cells,
            captureCounts: this.captureCounts,
            myTurn: index === this.moves.length % this.playerCount,
            state: this.moves.length,
        };
    }
}