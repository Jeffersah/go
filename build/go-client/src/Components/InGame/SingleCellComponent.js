"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = __importDefault(require("react"));
function SingleCellComponent(props) {
    var _a = react_1.default.useState(false), hover = _a[0], setHover = _a[1];
    var displayCell = props.value;
    var isPreview = false;
    var opacity = displayCell === -1 ? 0 : 1;
    if (hover && props.myTurn && displayCell === -1) {
        displayCell = props.myPlayerIndex;
        isPreview = true;
        opacity = 0.5;
    }
    if (props.isPendingMove && props.value === -1) {
        displayCell = props.myPlayerIndex;
        isPreview = true;
        opacity = 0.75;
    }
    if (props.isIllegal) {
        return <g transform='scale(0.125)'>
            <path d='M 2 1 L 4 3 L 6 1 L 7 2 L 5 4 L 7 6 L 6 7 L 4 5 L 2 7 L 1 6 L 3 4 L 1 2 Z' fill='#f44' stroke='black' vectorEffect='non-scaling-stroke'/>
        </g>;
    }
    return <g>
        <circle cx={0.5} cy={0.5} r={0.4} fill={displayCell === -1 ? 'white' : "url('#g" + displayCell + "')"} opacity={opacity} onMouseEnter={function (e) { return setHover(true); }} onMouseLeave={function (e) { return setHover(false); }} onClick={function (e) { if (props.myTurn)
        props.onClick(props.x, props.y); }}/>
    </g>;
}
exports.default = SingleCellComponent;
