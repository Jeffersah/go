import React from "react";
import IPlayer from "../../../../go-common/IPlayer";
import GameController from "../../Rest/GameController";
import GameInfoComponent from "./GameInfoComponent";
import './InGameComponent.css';
import SingleCellComponent from "./SingleCellComponent";

export const gradientColors:{ from: string, to: string, name: string }[] = [
    { from: "#444", to: "#111", name:'black' },
    { from: "#FFF", to: "#ccc", name:'white' },
    { from: "#F66", to: "#600", name:'red' },
    { from: "#6F6", to: "#060", name:'green' },
    { from: "#66F", to: "#006", name:'blue' },
];

export default function InGameComponent(props: { gameController: GameController, player: IPlayer }) {
    const [gameState, setGameState] = React.useState(props.gameController.currentGameState);
    const [waitingForServer, setWaitingForServer] = React.useState(false);

    const rules = props.gameController.room.rules;
    const playerIndex = props.gameController.room.players.findIndex(p => p.id === props.player.id);
    const myTurn = gameState?.myTurn ?? false;

    React.useEffect(() => {
        props.gameController.bindHandler(setGameState);
        return ()=>props.gameController.destroy();
    }, [props.gameController]);

    const boardMarkings:JSX.Element[] = [];

    for (let i = 0; i < rules.boardSize; i++) {
        boardMarkings.push(<line key={`h${i}`} x1={0.5} x2={rules.boardSize - 0.5} y1={i + 0.5} y2={i + 0.5} stroke='black' strokeWidth='1' vectorEffect="non-scaling-stroke" />);
        boardMarkings.push(<line key={`v${i}`} y1={0.5} y2={rules.boardSize - 0.5} x1={i + 0.5} x2={i + 0.5} stroke='black' strokeWidth='1' vectorEffect="non-scaling-stroke" />);
    }

    for(let starPoint = 0; starPoint < 9; starPoint++) {
        const dx = starPoint % 3;
        const dy = Math.floor(starPoint / 3);
        const cx = dx === 0 ? 3 : dx === 1 ? Math.floor(rules.boardSize / 2) : rules.boardSize - 4;
        const cy = dy === 0 ? 3 : dy === 1 ? Math.floor(rules.boardSize / 2) : rules.boardSize - 4;

        boardMarkings.push(<circle key={`s${starPoint}`} cx={cx + 0.5} cy={cy + 0.5} r={.15} fill='black' />);
    }

    const gradients: JSX.Element[] = [];
    for(let i = 0; i < gradientColors.length; i++){
        gradients.push(
            <radialGradient key={'g'+i} id={'g'+i} cx='70%' cy='30%' r='120%'>
                <stop offset='0' stopColor={gradientColors[i].from} />
                <stop offset='80%' stopColor={gradientColors[i].to} />
            </radialGradient>
        );
    }

    function handleCellClicked(x: number, y: number) {
        if(waitingForServer) return;

        setWaitingForServer(true);
        props.gameController.tryPlayMove(x, y)
            .then(r => {
                setWaitingForServer(false);
                if(!r.success) {
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
                {gameState?.cells.map((col, c) => 
                    <g key={c} transform={`translate(${c}, 0)`}>
                        {col.map((cell, r) =>
                            <g key={r} transform={`translate(0, ${r})`} viewBox='0 0 1 1'>
                                <SingleCellComponent 
                                    isIllegal={(gameState?.illegalMoves?.findIndex(m => m.x === c && m.y === r) ?? -1) !== -1}
                                    isPendingMove={gameState?.previewMove?.x === c && gameState?.previewMove?.y === r}
                                    value={cell}
                                    myTurn={myTurn}
                                    myPlayerIndex={playerIndex}
                                    x={c}
                                    y={r}
                                    onClick={handleCellClicked} />
                            </g>
                        )}
                    </g>
                )}
            </svg>
        </div>
        <div className='flex column game-info'>
            {gameState === undefined ? <></> : <GameInfoComponent myTurn={gameState?.myTurn ?? false} gameState={gameState} gsc={props.gameController} />}
        </div>
    </div>;
}