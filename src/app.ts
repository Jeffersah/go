import express from 'express';
import cors from 'cors';
import { ClientPlayerViewWithSecret, IServerPlayer } from './go-common/IPlayer';
import { IServerRoom } from './go-common/IRoom';
import BindRoomEndpoints, { RemovePlayerFromRooms } from './roomHandlers';
import { GenerateSecret } from './secrets';
import { StartExpiredPlayersTimer } from './sweep';
import BindGameEndpoints from './gameHandlers';
const app = express();

const allPlayers: { [id: number]: IServerPlayer} = {};
let nextPlayerId = 0;

app.use(cors());
app.use(express.json());
app.use(express.static('./src/go-client/build/'));

app.get('/player/:pid', (req, res) => {
    const id = parseInt(req.params.pid);

    if(isNaN(id)) {
        res.status(400).send('Invalid player id');
        return;
    }

    if(allPlayers[id]) {
        allPlayers[id].lastHeardFrom = Date.now();
        res.statusCode = 204;
        res.end();
        return;
    }
    res.status(404).send('Player not found');
});

app.put('/player', (req, res) => {
    console.log('PUT: ' + req.url);
    const name = (req.query).name?.toString() ?? '';

    if(name === '') {
        res.status(400).send('Required URL parameter "name" is missing/empty');
        return;
    }

    const id = nextPlayerId++;
    const secret = GenerateSecret();
    const player: IServerPlayer = {
        id, secret, name, lastHeardFrom: Date.now()
    };
    allPlayers[id] = player;
    res.send(ClientPlayerViewWithSecret(player));
});

const getRoom = BindRoomEndpoints(app, pid => allPlayers[pid]);
BindGameEndpoints(app, pid => allPlayers[pid], getRoom);

console.log('Env port: ' + process.env.PORT);
let portString = process.env.PORT;
if(portString === undefined || portString === null || portString === '') {
    portString = '8080';
}
const port = parseInt(portString);

app.listen(port, function () {
    console.log(`Started on port ${port}`);
});

function RemovePlayers(players: IServerPlayer[]) {
    for(const player of players) {
        delete allPlayers[player.id];
        RemovePlayerFromRooms(player);
    }
}

StartExpiredPlayersTimer(allPlayers, RemovePlayers);