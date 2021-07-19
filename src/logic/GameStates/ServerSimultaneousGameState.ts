import { IGameRules, ISimultaneousGameRules } from "../../go-common/IGameRules";
import { IGameState, IMove } from "../../go-common/IGameState";
import { GamePlayResult, PlayResult } from "../../go-common/IPlayResult";
import { GroupBy, WithDistinct } from "../../go-common/LinqLike";
import { IServerGameState } from "../ServerGameState";
import ServerGameStateBase, { Neighbors } from "./ServerGameStateBase";

export default class ServerSimultaneousGameState extends ServerGameStateBase<ISimultaneousGameRules> implements IServerGameState {
    moves: (IMove|null)[][];
    pendingMoves: (IMove|null)[];
    illegalMoves: IMove[][];
    // Last-seen state numbers for each player
    // Basically idempotency tokens, but sequential.
    // Must be per-player, because we don't want pending moves to trigger a refresh for everybody.
    playerStates: number[];
    remainingPlayers: number[];

    constructor(rules: ISimultaneousGameRules, playerCount: number) {
        super(rules, playerCount);
        this.moves = [Array(this.playerCount).fill(null)];
        this.remainingPlayers = [];
        this.pendingMoves = [];
        this.illegalMoves = [];
        this.playerStates = [];
        for(let i = 0; i < playerCount; i++) {
            this.illegalMoves.push([]);
            this.pendingMoves.push(null);
            this.remainingPlayers.push(i);
            this.playerStates.push(0);
        }
    }
    
    tryPlay(playerIndex: number, x: number, y: number): GamePlayResult {
        if(this.illegalMoves[playerIndex].findIndex(m => m.x === x && m.y === y) !== -1) {
            return { success: false, reason: "Illegal move" };
        }
        if(this.cells[x][y] !== -1) {
            return { success: false, reason: "Cell Occupied" };
        }
        if(this.remainingPlayers.indexOf(playerIndex) === -1) {
            return { success: false, reason: "Other players are resolving their moves" };
        }
        this.pendingMoves[playerIndex] = { x, y };
        this.playerStates[playerIndex]++;

        // Every remaining player has a pending move
        if(this.remainingPlayers.reduce(
            (b, player) => b && this.pendingMoves[player] !== null,
            true))
        {
            this.resolvePlays();
        }
        

        return { success: true };
    }

    resolvePlays() {
        let playerMoves = this.remainingPlayers.map((i) => ({ move: this.pendingMoves[i] as IMove, player: i}));
        let groups = GroupBy(playerMoves, m => m.move.x + ',' + m.move.y);
        let actualPlays: ResolvedPlay[] = [];
        this.remainingPlayers = [];
        

        for(const key in groups) {
            const plays = groups[key];
            if(plays.length === 1) {
                actualPlays.push(plays[0]);
            } else {
                const sizes = plays.map(p => ({...p, size: this.getAllConnectedGroups(p.move.x, p.move.y, p.player).length}));

                // If we don't care about group size, we just bounce all the players who played here.
                if(!this.rules.largeGroupsWinBounces) {
                    this.markIllegalMoves(sizes);
                    continue;
                }

                sizes.sort((a, b) => b.size - a.size);
                const largest = sizes.filter(s => s.size === sizes[0].size);
                if(largest.length > 1) {
                    // Push
                    this.markIllegalMoves(largest);
                }
                else {
                    // Crush
                    actualPlays.push(largest[0]);
                    for(let i = 1; i < largest.length; i++) {
                        actualPlays.push({ crushedBy: largest[0].player, player: largest[i].player, move: largest[i].move });
                    }
                }
            }
        }

        const lookForKill: IMove[] = [];
        // Play all the resolved moves
        for(const play of actualPlays) {
            this.moves[this.moves.length-1][play.player] = play.move;
            if((play as any).crushedBy !== undefined)
            {
                const crushed = (play as any).crushedBy;
                this.captureCounts[crushed]++;
            }
            else {
                this.cells[play.move.x][play.move.y] = play.player;
                lookForKill.push(play.move);
            }
        }

        let killedGroups: { id: IMove, items: IMove[] }[] = [];
        // Kill all captured groups
        for(const killMove of lookForKill) {
            for(const group of ServerGameStateBase.GetGroupsKilledByPlay(this.cells, killMove.x, killMove.y)) {
                killedGroups.push({ id: ServerGameStateBase.GetGroupId(group), items: group });
            }
        }

        killedGroups = WithDistinct(killedGroups, g => g.id, (a, b) => a.x == b.x && a.y == b.y);
        // Sort killed groups, smallest first
        // Also put the player groups last, so they are the last to be captured
        killedGroups = this.sortCaptureGroups(killedGroups, lookForKill);
        // Then split these in order into groups of the same size
        const splitBySize = this.splitCaptureGroupsBySize(killedGroups);

        // For each size group...
        for(const sizeGroup of splitBySize) { 
            // Find which (if any) are dead still. (They might've been saved by a smaller group being killed earlier)
            const deadGroups = sizeGroup.filter(g => ServerGameStateBase.IsGroupDead(this.cells, g.items));

            // Score for each of their capture...
            for(const deadGroup of deadGroups) {
                const captureCredit = this.getCaptureCredit(deadGroup.items);
                const scorePer = Math.floor(deadGroup.items.length / captureCredit.length);
                for(const captured of captureCredit) {
                    this.captureCounts[captured] += scorePer;
                }
            }

            // ...and kill them
            for(const deadGroup of deadGroups) {
                ServerGameStateBase.ClearGroup(this.cells, deadGroup.items);
            }
        }

        // Increment all player states
        for(let i = 0; i < this.playerStates.length; i++) {
            this.playerStates[i]++;
        }

        if(this.remainingPlayers.length === 0) {
            // Reset the turn
            this.remainingPlayers = [];
            for(let i = 0; i < this.playerCount; i++) {
                this.remainingPlayers.push(i);
                this.illegalMoves[i] = [];
                this.pendingMoves[i] = null;
            }
            this.moves.push(Array(this.playerCount).fill(null));
        }
    }

    private sortCaptureGroups(killedGroups: { id: IMove, items: IMove[] }[], playerMoves: IMove[]) {
        // sort groups, smallest first
        killedGroups.sort((a, b) => a.items.length - b.items.length);
        
        // Find groups which contain any player move
        const groupsContainingPlayerMove = killedGroups.filter(g => g.items.some(m => playerMoves.findIndex(p => p.x === m.x && p.y === m.y) !== -1));
        const groupsMissingPlayerMove = killedGroups.filter(g => !groupsContainingPlayerMove.some(pm => g.id === pm.id));

        // We should remove non-player moves first, so that a small group can capture a large group if it's a result of a move by the smaller player
        return [...groupsMissingPlayerMove, ...groupsContainingPlayerMove];
    }

    private splitCaptureGroupsBySize(groups: { id: IMove, items: IMove[] }[]): { id: IMove, items: IMove[] }[][] {
        const result: {id: IMove, items: IMove[]}[][] = [];
        for(const group of groups) {
            if(result.length === 0) result.push([]);
            const last = result[result.length - 1];
            if(last.length === 0 || last[0].items.length === group.items.length) {
                last.push(group);
            }
            else {
                result.push([group]);
            }
        }
        return result;
    }

    private getCaptureCredit(group: IMove[]): number[] {
        const groupPlayer = this.cells[group[0].x][group[0].y];
        const results: {[player: number]: number} = {};
        const liberties = ServerGameStateBase.GetOpenOrClosedLiberties(this.cells, group);
        for(const l of liberties) {
            const capturer = this.cells[l.x][l.y];
            if(capturer === -1) { continue; }
            if(capturer === groupPlayer) { continue; } // This shouldn't happen, but whatever.
            if(!(capturer in results)) { results[capturer] = 0; }
            results[capturer]++;
        }
        const arr = Object.keys(results).map(k => ({ player: parseInt(k), count: results[parseInt(k)]}));
        arr.sort((a, b) => b.count - a.count);
        const allMax = arr.filter(a => a.count === arr[0].count);
        return allMax.map(p => p.player);
    }

    private markIllegalMoves(plays: { move: IMove, player: number }[]) {
        for(const play of plays) {
            this.illegalMoves[play.player].push(play.move);
            this.remainingPlayers.push(play.player);
            this.pendingMoves[play.player] = null;
        }
    }

    private getAllConnectedGroups(x: number, y: number, playerIndex: number): IMove[] {
        this.cells[x][y] = playerIndex;
        const result = ServerGameStateBase.GetConnectedCells(this.cells, x, y);
        this.cells[x][y] = -1;
        return result;
    }

    public getStateForPlayer(index: number, lastSeenState: number): IGameState | undefined {
        if(this.playerStates[index] === lastSeenState) return undefined;

        const highlightMoves = this.moves.length <= 1 ? [] : this.moves[this.moves.length - 2] as IMove[];
        return {
            cells: this.cells,
            captureCounts: this.captureCounts,
            myTurn: this.remainingPlayers.indexOf(index) !== -1,
            previewMove: this.pendingMoves[index] ?? undefined,
            illegalMoves: this.illegalMoves[index],
            state: this.playerStates[index],
            highlightMoves: highlightMoves
        };
    }
}

type ResolvedPlay = { move: IMove, player: number } | { move: IMove, crushedBy: number, player: number };