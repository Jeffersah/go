import IRoom, { ClientView, IServerRoom } from "./go-common/IRoom";
import { Express } from "express";
import { IServerPlayer } from "./go-common/IPlayer";

export default function BindGameEndpoints(app: Express, getPlayer: (id: number) => IServerPlayer | undefined, getRoom: (id: number) => IServerRoom | undefined) {

    // Get the game state
    app.get('/room/:roomId/game', (req, res) => {
        const roomId = parseInt(req.params.roomId);
        let lastMoveId = parseInt(req.query.lastMoveId?.toString() ?? '-1');
        const playerId = parseInt(req.query.playerId?.toString() ?? '');
        const playerSecret = req.query.playerSecret?.toString() ?? '';
        if(isNaN(lastMoveId)) lastMoveId = -1;

        const room = getRoom(roomId);

        if(room === undefined) {
            res.status(400).send('Room not found');
            return;
        }

        if(room.game === undefined) {
            res.status(400).send('Game not started');
            return;
        }
        
        if(playerId === undefined || isNaN(playerId)) {
            res.status(400).send('Invalid player ID');
            return;
        }
        const player = getPlayer(playerId);
        if(player === undefined) {
            res.status(400).send('Player ID not found');
            return;
        }
        if(player.secret !== playerSecret) {
            res.status(400).send('Invalid player secret');
            return;
        }
        const playerIndex = room.players.findIndex(p => p.id === playerId);
        if(playerIndex === -1) {
            res.status(400).send('Player is not in this game');
            return;
        }

        const game = room.game;
        const state = game.getStateForPlayer(playerIndex, lastMoveId);
        if(state === undefined) {
            res.status(204).end();
            return;
        }
        res.send(state);
    });

    // Try to play a move
    app.post('/room/:roomId/game/play', (req, res) => {
        const roomId = parseInt(req.params.roomId);
        const playerId = parseInt(req.query.playerId?.toString() ?? '');
        const playerSecret = req.query.playerSecret?.toString() ?? '';
        const x = parseInt(req.query.x?.toString() ?? '');
        const y = parseInt(req.query.y?.toString() ?? '');

        if(x === undefined || isNaN(x) || y === undefined || isNaN(y)) {
            res.status(400).send('Invalid play location');
            return;
        }

        if(playerId === undefined || isNaN(playerId)) {
            res.status(400).send('Invalid player ID');
            return;
        }
        const player = getPlayer(playerId);
        if(player === undefined) {
            res.status(400).send('Player ID not found');
            return;
        }
        if(player.secret !== playerSecret) {
            res.status(400).send('Invalid player secret');
            return;
        }
        
        const room = getRoom(roomId);

        if(room === undefined) {
            res.status(400).send('Room not found');
            return;
        }

        if(room.game === undefined) {
            res.status(400).send('Game is not running');
            return;
        }
        const playerIndex = room.players.findIndex(p => p.id === playerId);
        if(playerIndex === -1) {
            res.status(400).send('Player is not in this game');
            return;
        }

        const response = room.game.tryPlay(playerIndex, x, y);
        if(response.success) {
            return res.send({...response, state: room.game.getStateForPlayer(playerIndex, -1)});
        }
        else{
            return res.send(response);
        }
    });
}