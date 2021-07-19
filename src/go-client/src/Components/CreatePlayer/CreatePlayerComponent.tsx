import React from "react";
import IPlayer from "../../../../go-common/IPlayer";
import RestPlayerController from "../../Rest/RestPlayerController";
import './CreatePlayerComponent.css';

export default function CreatePlayerComponent(props: { baseUrl: string, onPlayerCreated: (player: IPlayer) => void }) {
    const playerController = React.useRef(new RestPlayerController(props.baseUrl));
    const [name, setName] = React.useState("");
    const [waitingForServer, setWaitingForServer] = React.useState(false);
    const [errorText, setErrorText] = React.useState("");

    function handlePlayerCreateClicked() {
        if (name.length === 0) {
            return;
        }
        setWaitingForServer(true);
        playerController.current.tryCreatePlayer(name).then(p => {
            setWaitingForServer(false);
            props.onPlayerCreated(p);
        }).catch(reason => 
        {
            setWaitingForServer(false);
            setErrorText(reason?.toString());
        });
    }
    return (
        <div className='flex col align-stretch justify-center player-create-component full-height'>
            <div style={{ fontSize: '200%' }}>Enter a Player Name:</div>
            <div className='flex flex-row form-container'>
                <input className='player-name-input flex-grow' type='text' value={name} onChange={e => setName(e.target.value)} disabled={waitingForServer} onKeyPress={event => { if(event.key === 'Enter') handlePlayerCreateClicked(); }}/>
                <button className='submitButton' onClick={handlePlayerCreateClicked} disabled={waitingForServer}>Go</button>
            </div>
            {errorText === '' ? <></> : <div className='errorText'>{errorText}</div>}
            <div className='blinker' style={{ opacity: waitingForServer ? 1 : 0 }}>
                <div />
                <div />
                <div />
            </div>
        </div>
    );
}