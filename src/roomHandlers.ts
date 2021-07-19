import { ClientView, IServerRoom } from "./go-common/IRoom";
import { Express } from "express";
import { IServerPlayer } from "./go-common/IPlayer";
import { defaultGameRules, defaultSimultaneousGameRules, IGameRules } from "./go-common/IGameRules";
import { Optional } from "./go-common/MappedTypes";
import ServerSimultaneousGameState from "./logic/GameStates/ServerSimultaneousGameState";
import ServerSequentialGameState from "./logic/GameStates/ServerSequentialGameState";

const allRooms: { [id: number]: IServerRoom } = {};
let nextRoomId = 0;

export default function BindRoomEndpoints(app: Express, getPlayer: (id: number) => IServerPlayer | undefined): ((id: number) => IServerRoom | undefined) {

    // Create a new room
    app.put('/room', (req, res) => {
        console.log('PUT: ' + req.url);
        const roomName = req.query.name?.toString();
        const playerId = parseInt(req.query.playerId?.toString() ?? '');
        const playerSecret = req.query.playerSecret?.toString() ?? '';

        if(roomName === undefined || roomName === '') {
            return res.status(400).send('Room name is required as query parameter "name"');
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
        
        const roomID = nextRoomId++;
        const room: IServerRoom = {
            id: roomID,
            name: roomName,
            players: [player],
            rules: defaultGameRules
        };

        allRooms[roomID] = room;
        res.send(ClientView(room, playerId));
    });

    // List all rooms
    app.get('/room', (req, res) => {
        const displayRooms: IServerRoom[] = [];
        for(const roomID in allRooms) {
            const room = allRooms[roomID];
            if(room.game === undefined && room.players.length < room.rules.maxPlayerCount) {
                displayRooms.push(room);
            }
        }
        res.send(displayRooms.map(ClientView));
    });

    // Get details of a single room
    app.get('/room/:roomId', (req, res) => {
        const roomId = parseInt(req.params.roomId);
        const room = allRooms[roomId];

        if(room === undefined) {
            res.status(400).send('Room not found');
            return;
        }
        
        // We don't really care about PID here, it only affects the game, and the game isn't running
        res.send(ClientView(room, room.players[0].id));
    });

    // Change rules of a room
    app.post('/room/:roomId', (req, res) => {
        console.log('POST: ' + req.url);
        const newRules = req.body as any;
        const roomId = parseInt(req.params.roomId);
        const playerId = parseInt(req.query.playerId?.toString() ?? '');
        const playerSecret = req.query.playerSecret?.toString() ?? '';

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
        
        const room = allRooms[roomId];

        if(room === undefined) {
            res.status(400).send('Room not found');
            return;
        }

        if(room.players.indexOf(player) === -1) {
            res.status(400).send('Player not in room');
            return;
        }

        if(room.game !== undefined) {
            res.status(400).send('Can\'t change rules while the game is running');
        }

        if(newRules.simultaneous === undefined || newRules.simultaneous === room.rules.simultaneous) {
            room.rules = {...room.rules, ...newRules};
        }
        else if(newRules.simultaneous) {
            room.rules = {...defaultSimultaneousGameRules, ...newRules };
        }
        else {
            room.rules = {...defaultGameRules, ...newRules };
        }

        room.rules = {...room.rules, ...newRules};

        res.send(ClientView(room, playerId));
    });

    // Join a room
    app.post('/room/:roomId/join', (req, res) => {
        console.log('POST: ' + req.url);
        const roomId = parseInt(req.params.roomId);
        const playerId = parseInt(req.query.playerId?.toString() ?? '');
        const playerSecret = req.query.playerSecret?.toString() ?? '';

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
        
        const room = allRooms[roomId];

        if(room === undefined) {
            res.status(400).send('Room not found');
            return;
        }

        if(room.game !== undefined) {
            res.status(400).send('Game is already running');
        }

        if(room.players.length < room.rules.maxPlayerCount) {
            room.players.push(player);
            res.send(ClientView(room, playerId));
        }
        else {
            res.status(400).send('Room is full');
        }
    });

    // Start a game
    app.post('/room/:roomId/start', (req, res) => {
        console.log('POST: ' + req.url);
        const roomId = parseInt(req.params.roomId);
        const playerId = parseInt(req.query.playerId?.toString() ?? '');
        const playerSecret = req.query.playerSecret?.toString() ?? '';

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
        
        const room = allRooms[roomId];

        if(room === undefined) {
            res.status(400).send('Room not found');
            return;
        }
        
        if(room.game !== undefined) {
            res.status(400).send('Game is already running');
        }

        if(room.players.length < 2) {
            res.status(400).send('Room must have at least 2 players');
        }

        if(room.rules.simultaneous) {
            room.game = new ServerSimultaneousGameState(room.rules, room.players.length);
        }
        else {
            room.game = new ServerSequentialGameState(room.rules, room.players.length);
        }

        res.send(ClientView(room, playerId));
    });

    return id => allRooms[id];
}


export function RemovePlayerFromRooms(player: IServerPlayer) {
    for(const room of Object.values(allRooms)) {
        if(room.players.indexOf(player) !== -1) {
            room.players.splice(room.players.indexOf(player), 1);
            if(room.players.length === 0) {
                delete allRooms[room.id];
            }
        }
    }
}