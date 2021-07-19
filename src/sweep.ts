import { IServerPlayer } from "./go-common/IPlayer";

const MAX_TIME = 120 * 1000;
const POLL_INTEVAL = 10_000;

function FindExpiredPlayers(players: {[id:number]:IServerPlayer}): IServerPlayer[] {
    var result: IServerPlayer[] = [];
    const now = Date.now();
    for (var id in players) {
        var player = players[id];
        if (now - player.lastHeardFrom > MAX_TIME) {
            result.push(player);
        }
    }
    return result;
}

export function StartExpiredPlayersTimer(players: {[id:number]:IServerPlayer}, callback: (players: IServerPlayer[]) => void) {
    callback(FindExpiredPlayers(players));
    setTimeout(() => {
        StartExpiredPlayersTimer(players, callback);
    }, POLL_INTEVAL);
};