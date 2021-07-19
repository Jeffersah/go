import React from 'react';
import logo from './logo.svg';
import './App.css';
import CreatePlayerComponent from './Components/CreatePlayer/CreatePlayerComponent';
import KeepAlivePlayer from './Rest/KeepAlivePlayer';
import FindRoomComponent from './Components/FindRoom/FindRoomComponent';
import LobbyComponent from './Components/Lobby/LobbyCompontent';
import GameController from './Rest/GameController';
import InGameComponent from './Components/InGame/InGameComponent';
import IRoom from '../../go-common/IRoom'

let baseUrl = window.location.href.indexOf('localhost:3000') === -1 ? '' : 'http://localhost:8080';

function App() {
  const [playerKeepAlive, setPlayer] = React.useState<KeepAlivePlayer | null>(null);
  const [room, setRoom] = React.useState<IRoom | null>(null);
  const [gameStateController, setGameStateController] = React.useState<GameController | null>(null);

  let contentElement: JSX.Element|null = null;
  if(playerKeepAlive === null) {
    contentElement = <CreatePlayerComponent baseUrl={baseUrl} onPlayerCreated={p => setPlayer(new KeepAlivePlayer(baseUrl, p))} />;
  }
  else if (room === null) {
    contentElement = <FindRoomComponent baseUrl={baseUrl} player={playerKeepAlive.player} onJoinedRoom={setRoom} />
  }
  else if(gameStateController === null) {
    contentElement = <LobbyComponent baseUrl={baseUrl} player={playerKeepAlive.player} room={room} onGameStateChanged={setGameStateController} />;
  }
  else {  
    contentElement = <InGameComponent gameController={gameStateController} player={playerKeepAlive.player} />
  }

  return <div className='App'>
    {contentElement}
  </div>;
}

export default App;
