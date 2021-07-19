import IPlayer from '../../../go-common/IPlayer';
import IRoom from '../../../go-common/IRoom';

const POLL_INTERVAL = 1000;

export default class RoomSearchController {

    handlers: ((rooms: IRoom[]) => void)[];
    timeoutHandle: number;

    constructor(private urlBase: string, public player: IPlayer) {
        this.handlers = [];
        this.timeoutHandle= -1;
    }

    bindHandler(handler: (rooms: IRoom[]) => void) {
        this.handlers.push(handler);
        if(this.handlers.length === 1){
            this.startUpdateLoop();
        }
    }

    startUpdateLoop() {
        this.pollRooms();
    }

    pollRooms(): void {
        fetch(`${this.urlBase}/room`, { method: 'GET' })
        .then(async (res) => {
            if(!res.ok) {
                console.error('Bad response during room poll: ' + res.status + ' ' + await res.text());
            }
            const rooms = (await res.json()) as IRoom[];
            this.handlers.forEach((handler) => handler(rooms));
            
            this.timeoutHandle = window.setTimeout(()=>this.startUpdateLoop(), POLL_INTERVAL);
        });
    }

    async tryJoinRoom(room: IRoom, player: IPlayer): Promise<IRoom> {
        return fetch(`${this.urlBase}/room/${room.id}/join?playerId=${player.id}&playerSecret=${encodeURIComponent(player.secret??'')}`, { method: 'POST'})
            .then(async res => {
                if(!res.ok) {
                    const errorText = 'Bad response during join room: ' + res.status + ' ' + await res.text();
                    console.error(errorText);
                    return Promise.reject(errorText);
                }
                return (await res.json()) as IRoom;
            });
    }

    async tryCreateRoom(roomName: string, player: IPlayer): Promise<IRoom> {
        return fetch(`${this.urlBase}/room?name=${encodeURIComponent(roomName)}&playerId=${player.id}&playerSecret=${encodeURIComponent(player.secret??'')}`, { method: 'PUT'})
            .then(async res => {
                if(!res.ok) {
                    const errorText = 'Bad response during create room: ' + res.status + ' ' + await res.text();
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