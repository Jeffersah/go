import IPlayer from '../../../go-common/IPlayer';

const POLL_INTERVAL = 30_000;

export default class RestPlayerController {
    private timeoutHandle: number;

    constructor(private urlBase: string, public player: IPlayer) {
        this.timeoutHandle = window.setTimeout(() => this.sendKeepAlive(), POLL_INTERVAL);
    }

    sendKeepAlive() {
        fetch(`${this.urlBase}/player/${this.player.id}?secret=${this.player.secret}`);
        this.timeoutHandle = window.setTimeout(() => this.sendKeepAlive(), POLL_INTERVAL);
    }
    
    destroy() {
        clearTimeout(this.timeoutHandle);
        fetch(`${this.urlBase}/player/${this.player.id}?secret=${this.player.secret}`, { method: 'DELETE' });
    }
}