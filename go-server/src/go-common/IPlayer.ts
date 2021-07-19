export default interface IPlayer {
    id: number;
    name: string;
    secret?: string;
}

export interface IServerPlayer extends IPlayer {
    lastHeardFrom: number;
}

export function ClientPlayerView(player: IServerPlayer): IPlayer {
    return { id: player.id, name: player.name };
}

export function ClientPlayerViewWithSecret(player: IServerPlayer): IPlayer {
    return { id: player.id, name: player.name, secret: player.secret };
}