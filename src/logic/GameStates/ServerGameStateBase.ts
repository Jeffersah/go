import { IGameRules } from "../../go-common/IGameRules";
import { IMove, MovesEqual } from "../../go-common/IGameState";
import { Distinct } from "../../go-common/LinqLike";

export const Neighbors = [{x: -1, y: 0}, {x: 1, y: 0}, {x: 0, y: -1}, {x: 0, y: 1}];

export default class ServerGameStateBase {
    cells: number[][];
    captureCounts: number[];

    constructor(public rules: IGameRules, public playerCount: number) {
        this.cells = [];
        for(let i = 0; i < rules.boardSize; i++) {
            const col: number[] = [];
            for(let j = 0; j < rules.boardSize; j++) {
                col.push(-1);
            }
            this.cells.push(col);
        }
        this.captureCounts = Array(playerCount).fill(0);
    }

    static GetOpenOrClosedLiberties(cells: number[][], group: IMove[]): IMove[] {
        const pid = cells[group[0].x][group[0].y];

        const openOrClosedLiberties: IMove[] = [];
        for(const c of group) {
            for(const n of Neighbors) {
                const nx = c.x + n.x;
                const ny = c.y + n.y;
                if(nx < 0 || nx >= cells.length || ny < 0 || ny >= cells[0].length) continue;
                if(cells[nx][ny] !== pid) openOrClosedLiberties.push({x: nx, y: ny});
            }
        }
        return Distinct(openOrClosedLiberties, MovesEqual);
    }

    static GetGroupsKilledByPlay(cells: number[][], x: number, y: number): IMove[][] {
        const player = cells[x][y];
        const groupsKilled: IMove[][] = [];
        for(const c of Neighbors) {
            const tgt = { x: x + c.x, y: y + c.y };
            if(tgt.x < 0 || tgt.x >= cells.length || tgt.y < 0 || tgt.y >= cells[0].length) continue;
            if(cells[tgt.x][tgt.y] === player) continue;
            const group = ServerGameStateBase.GetConnectedCells(cells, tgt.x, tgt.y);
            if(group.length === 0) continue;
            if(ServerGameStateBase.IsGroupDead(cells, group)) {
                groupsKilled.push(group);
            }
        }

        if(groupsKilled.length === 0) {
            const selfGroup = ServerGameStateBase.GetConnectedCells(cells, x, y);
            if(ServerGameStateBase.IsGroupDead(cells, selfGroup)) {
                return[selfGroup];
            }
        }
        return groupsKilled;
    }

    static GetConnectedCells(cells: number[][], x: number, y: number): IMove[] {
        const results: IMove[] = [];
        const queue: IMove[] = [{x, y}];
        if(cells[x][y] === -1) return [];

        while(queue.length > 0) {
            const cell = queue.shift() as IMove;
            if(results.findIndex(r => r.x === cell.x && r.y === cell.y) !== -1) continue;

            results.push(cell);
            for(const n of Neighbors) {
                const nx = cell.x + n.x;
                const ny = cell.y + n.y;
                if(nx < 0 || nx >= cells.length || ny < 0 || ny >= cells[0].length) continue;
                if(cells[nx][ny] !== cells[x][y]) continue;

                queue.push({x: nx, y: ny});
            }
        }

        return results;
    }

    static IsGroupDead(cells: number[][], group: IMove[]): boolean {
        for(const c of group) {
            for(const n of Neighbors) {
                const nx = c.x + n.x;
                const ny = c.y + n.y;
                if(nx < 0 || nx >= cells.length || ny < 0 || ny >= cells[0].length) continue;
                if(cells[nx][ny] === -1) return false;
            }
        }
        return true;
    }

    // A group "ID" is the topmost leftmost move of the group. Useful for comparing if two groups are the same without iterating both of them.
    static GetGroupId(group: IMove[]): IMove {
        let minMove = group[0];
        for(const c of group) {
            if(c.y < minMove.y) minMove = c;
            else if(c.y === minMove.y && c.x < minMove.x) minMove = c;
        }
        return minMove;
    }

    static ClearGroup(cells: number[][], group: IMove[]){
        for(const m of group) {
            cells[m.x][m.y] = -1;
        }
    }
}