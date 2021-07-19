"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = __importDefault(require("react"));
var RestPlayerController_1 = __importDefault(require("../../Rest/RestPlayerController"));
require("./CreatePlayerComponent.css");
function CreatePlayerComponent(props) {
    var playerController = react_1.default.useRef(new RestPlayerController_1.default(props.baseUrl));
    var _a = react_1.default.useState(""), name = _a[0], setName = _a[1];
    var _b = react_1.default.useState(false), waitingForServer = _b[0], setWaitingForServer = _b[1];
    var _c = react_1.default.useState(""), errorText = _c[0], setErrorText = _c[1];
    function handlePlayerCreateClicked() {
        if (name.length === 0) {
            return;
        }
        setWaitingForServer(true);
        playerController.current.tryCreatePlayer(name).then(function (p) {
            setWaitingForServer(false);
            props.onPlayerCreated(p);
        }).catch(function (reason) {
            setWaitingForServer(false);
            setErrorText(reason === null || reason === void 0 ? void 0 : reason.toString());
        });
    }
    return (<div className='flex col align-stretch justify-center player-create-component full-height'>
            <div style={{ fontSize: '200%' }}>Enter a Player Name:</div>
            <div className='flex flex-row form-container'>
                <input className='player-name-input flex-grow' type='text' value={name} onChange={function (e) { return setName(e.target.value); }} disabled={waitingForServer} onKeyPress={function (event) { if (event.key === 'Enter')
        handlePlayerCreateClicked(); }}/>
                <button className='submitButton' onClick={handlePlayerCreateClicked} disabled={waitingForServer}>Go</button>
            </div>
            {errorText === '' ? <></> : <div className='errorText'>{errorText}</div>}
            <div className='blinker' style={{ opacity: waitingForServer ? 1 : 0 }}>
                <div />
                <div />
                <div />
            </div>
        </div>);
}
exports.default = CreatePlayerComponent;
