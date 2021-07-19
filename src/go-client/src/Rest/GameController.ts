import { IGameState } from '../../../go-common/IGameState';
import IPlayer from '../../../go-common/IPlayer';
import { PlayResult } from '../../../go-common/IPlayResult';
import IRoom from '../../../go-common/IRoom';

const POLL_INTERVAL = 1000;

export default class GameController {

    handlers: ((rooms: IGameState) => void)[];
    timeoutHandle: number;
    currentGameState?: IGameState;

    constructor(private urlBase: string, public room: IRoom, public player: IPlayer) {
        this.handlers = [];
        this.timeoutHandle= -1;
    }

    bindHandler(handler: (rooms: IGameState) => void) {
        this.handlers.push(handler);
        if(this.handlers.length === 1){
            this.startUpdateLoop();
        }
    }

    startUpdateLoop() {
        this.pollRoom();
    }

    pollRoom(): void {
        fetch(`${this.urlBase}/room/${this.room.id}/game?lastMoveId=${this.currentGameState?.state ?? -1}&playerId=${this.player.id}&playerSecret=${encodeURIComponent(this.player.secret??'')}`, { method: 'GET' })
        .then(async (res) => {
            if(!res.ok) {
                console.error('Bad response during game poll: ' + res.status + ' ' + await res.text());
            }
            if(res.status === 200)
            {
                const gameState = (await res.json()) as IGameState;
                this.currentGameState = gameState;
                this.handlers.forEach((handler) => handler(gameState));
            }

            this.timeoutHandle = window.setTimeout(()=>this.startUpdateLoop(), POLL_INTERVAL);
        });
    }
    async tryPlayMove(x: number, y: number): Promise<PlayResult> {
        return fetch(`${this.urlBase}/room/${this.room.id}/game/play?x=${x}&y=${y}&playerId=${this.player.id}&playerSecret=${encodeURIComponent(this.player.secret??'')}`, 
            { 
                method: 'POST'
            })
            .then(async res => {
                if(!res.ok) {
                    const errorText = 'Bad response during play move: ' + res.status + ' ' + await res.text();
                    console.error(errorText);
                    return Promise.reject(errorText);
                }
                const result = (await res.json()) as PlayResult;
                if(result.success) {
                    this.currentGameState = result.state;
                    this.handlers.forEach((handler) => handler(result.state));

                }
                return result;
            });
    }

    destroy() {
        clearTimeout(this.timeoutHandle);
    }
}