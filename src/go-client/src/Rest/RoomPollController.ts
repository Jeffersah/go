import { IGameRules } from '../../../go-common/IGameRules';
import IPlayer from '../../../go-common/IPlayer';
import IRoom from '../../../go-common/IRoom';
import {Optional} from '../../../go-common/MappedTypes';

const POLL_INTERVAL = 1000;

export default class RoomPollController {

    handlers: ((rooms: IRoom) => void)[];
    timeoutHandle: number;

    constructor(private urlBase: string, private room: IRoom, public player: IPlayer) {
        this.handlers = [];
        this.timeoutHandle= -1;
    }

    bindHandler(handler: (rooms: IRoom) => void) {
        this.handlers.push(handler);
        if(this.handlers.length === 1){
            this.startUpdateLoop();
        }
    }

    startUpdateLoop() {
        this.pollRoom();
    }

    pollRoom(): void {
        fetch(`${this.urlBase}/room/${this.room.id}`, { method: 'GET' })
        .then(async (res) => {
            if(!res.ok) {
                console.error('Bad response during room poll: ' + res.status + ' ' + await res.text());
            }
            const rooms = (await res.json()) as IRoom;
            this.handlers.forEach((handler) => handler(rooms));
            
            this.timeoutHandle = window.setTimeout(()=>this.startUpdateLoop(), POLL_INTERVAL);
        });
    }

    async tryChangeRules(rules: Optional<IGameRules>): Promise<IRoom> {
        return fetch(`${this.urlBase}/room/${this.room.id}?playerId=${this.player.id}&playerSecret=${encodeURIComponent(this.player.secret??'')}`, 
            { 
                method: 'POST', 
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                }, body: JSON.stringify(rules) 
            })
            .then(async res => {
                if(!res.ok) {
                    const errorText = 'Bad response during rule update: ' + res.status + ' ' + await res.text();
                    console.error(errorText);
                    return Promise.reject(errorText);
                }
                return (await res.json()) as IRoom;
            });
    }
    async tryStartGame(): Promise<IRoom> {
        return fetch(`${this.urlBase}/room/${this.room.id}/start?playerId=${this.player.id}&playerSecret=${encodeURIComponent(this.player.secret??'')}`, 
            { 
                method: 'POST',
            })
            .then(async res => {
                if(!res.ok) {
                    const errorText = 'Bad response during start request: ' + res.status + ' ' + await res.text();
                    console.error(errorText);
                    return Promise.reject(errorText);
                }
                return (await res.json()) as IRoom;
            });
    }

    destroy() {
        clearTimeout(this.timeoutHandle);
    }
}