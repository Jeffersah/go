import React from "react";

export default function SingleCellComponent(props: { isIllegal: boolean, isPendingMove: boolean, highlight: boolean, value: number, myTurn: boolean, myPlayerIndex: number, x: number, y: number, onClick: (x: number, y: number) => void }){
    const [hover, setHover] = React.useState(false);

    let displayCell = props.value;
    let isPreview = false;
    let opacity = 1;
    if(hover && props.myTurn && displayCell === -1) {
        displayCell = props.myPlayerIndex;
        isPreview = true;
        opacity = 0.5;
    }
    if(props.isPendingMove && props.value === -1) {
        displayCell = props.myPlayerIndex;
        isPreview = true;
        opacity = 0.75;
    }

    if(props.isIllegal) {
        if(hover) setHover(false);
        return <g transform='scale(0.125)'>
            <path d='M 2 1 L 4 3 L 6 1 L 7 2 L 5 4 L 7 6 L 6 7 L 4 5 L 2 7 L 1 6 L 3 4 L 1 2 Z' fill='#f44' stroke='black' vectorEffect='non-scaling-stroke' />
        </g>;
    }

    return <g>
        <circle 
            cx={0.5} 
            cy={0.5} 
            r={0.4} 
            fill={displayCell === -1 ? 'transparent' : `url('#g${displayCell}')`} 
            opacity={opacity}
            onMouseEnter={e => { if(!props.isIllegal) setHover(true); }}
            onMouseLeave={e => setHover(false)}
            onClick={e => { if(props.myTurn) { props.onClick(props.x, props.y); } }}
            vectorEffect='non-scaling-stroke'
            stroke={props.highlight ? 'yellow' : 'none'}
            strokeWidth={2}
            
        />
    </g>
}