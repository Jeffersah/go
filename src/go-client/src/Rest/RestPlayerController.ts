import IPlayer from '../../../go-common/IPlayer';

export default class RestPlayerController {

    public currentPlayerInfo: IPlayer | null;

    constructor(private urlBase: string) {
        this.currentPlayerInfo = null;
    }

    async tryCreatePlayer(name: string): Promise<IPlayer> {
        return fetch(`${this.urlBase}/player?name=${encodeURIComponent(name)}`, { method: 'PUT' })
        .then(async (res) => {
            if(!res.ok) {
                return Promise.reject(res.statusText + ': ' + await res.text());
            }
            return (await res.json()) as IPlayer;
        });
    }
}