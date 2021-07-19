"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.gradientColors = void 0;
var react_1 = __importDefault(require("react"));
var GameInfoComponent_1 = __importDefault(require("./GameInfoComponent"));
require("./InGameComponent.css");
var SingleCellComponent_1 = __importDefault(require("./SingleCellComponent"));
exports.gradientColors = [
    { from: "#444", to: "#111", name: 'black' },
    { from: "#FFF", to: "#ccc", name: 'white' },
    { from: "#F66", to: "#600", name: 'red' },
    { from: "#6F6", to: "#060", name: 'green' },
    { from: "#66F", to: "#006", name: 'blue' },
];
function InGameComponent(props) {
    var _a, _b;
    var _c = react_1.default.useState(props.gameController.currentGameState), gameState = _c[0], setGameState = _c[1];
    var _d = react_1.default.useState(false), waitingForServer = _d[0], setWaitingForServer = _d[1];
    var rules = props.gameController.room.rules;
    var playerIndex = props.gameController.room.players.findIndex(function (p) { return p.id === props.player.id; });
    var myTurn = (_a = gameState === null || gameState === void 0 ? void 0 : gameState.myTurn) !== null && _a !== void 0 ? _a : false;
    react_1.default.useEffect(function () {
        props.gameController.bindHandler(setGameState);
        return function () { return props.gameController.destroy(); };
    }, [props.gameController]);
    var boardMarkings = [];
    for (var i = 0; i < rules.boardSize; i++) {
        boardMarkings.push(<line key={"h" + i} x1={0.5} x2={rules.boardSize - 0.5} y1={i + 0.5} y2={i + 0.5} stroke='black' strokeWidth='1' vectorEffect="non-scaling-stroke"/>);
        boardMarkings.push(<line key={"v" + i} y1={0.5} y2={rules.boardSize - 0.5} x1={i + 0.5} x2={i + 0.5} stroke='black' strokeWidth='1' vectorEffect="non-scaling-stroke"/>);
    }
    for (var starPoint = 0; starPoint < 9; starPoint++) {
        var dx = starPoint % 3;
        var dy = Math.floor(starPoint / 3);
        var cx = dx === 0 ? 3 : dx === 1 ? Math.floor(rules.boardSize / 2) : rules.boardSize - 4;
        var cy = dy === 0 ? 3 : dy === 1 ? Math.floor(rules.boardSize / 2) : rules.boardSize - 4;
        boardMarkings.push(<circle key={"s" + starPoint} cx={cx + 0.5} cy={cy + 0.5} r={.15} fill='black'/>);
    }
    var gradients = [];
    for (var i = 0; i < exports.gradientColors.length; i++) {
        gradients.push(<radialGradient key={'g' + i} id={'g' + i} cx='70%' cy='30%' r='120%'>
                <stop offset='0' stopColor={exports.gradientColors[i].from}/>
                <stop offset='80%' stopColor={exports.gradientColors[i].to}/>
            </radialGradient>);
    }
    function handleCellClicked(x, y) {
        if (waitingForServer)
            return;
        setWaitingForServer(true);
        props.gameController.tryPlayMove(x, y)
            .then(function (r) {
            setWaitingForServer(false);
            if (!r.success) {
                alert("Can't play here! " + r.reason);
            }
        });
    }
    return <div className='flex row'>
        <div className='flex column game'>
            <svg viewBox={'0 0 ' + rules.boardSize + ' ' + rules.boardSize}>
                <defs>
                    {gradients}
                </defs>
                {boardMarkings}
                {gameState === null || gameState === void 0 ? void 0 : gameState.cells.map(function (col, c) {
            return <g key={c} transform={"translate(" + c + ", 0)"}>
                        {col.map(function (cell, r) {
                    var _a, _b, _c, _d;
                    return <g key={r} transform={"translate(0, " + r + ")"} viewBox='0 0 1 1'>
                                <SingleCellComponent_1.default isIllegal={((_b = (_a = gameState === null || gameState === void 0 ? void 0 : gameState.illegalMoves) === null || _a === void 0 ? void 0 : _a.findIndex(function (m) { return m.x === c && m.y === r; })) !== null && _b !== void 0 ? _b : -1) !== -1} isPendingMove={((_c = gameState === null || gameState === void 0 ? void 0 : gameState.previewMove) === null || _c === void 0 ? void 0 : _c.x) === c && ((_d = gameState === null || gameState === void 0 ? void 0 : gameState.previewMove) === null || _d === void 0 ? void 0 : _d.y) === r} value={cell} myTurn={myTurn} myPlayerIndex={playerIndex} x={c} y={r} onClick={handleCellClicked}/>
                            </g>;
                })}
                    </g>;
        })}
            </svg>
        </div>
        <div className='flex column game-info'>
            {gameState === undefined ? <></> : <GameInfoComponent_1.default myTurn={(_b = gameState === null || gameState === void 0 ? void 0 : gameState.myTurn) !== null && _b !== void 0 ? _b : false} gameState={gameState} gsc={props.gameController}/>}
        </div>
    </div>;
}
exports.default = InGameComponent;
