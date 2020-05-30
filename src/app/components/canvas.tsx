import * as React from 'react';
import {render} from 'react-dom';

const CANVAS_WIDTH = 720;
const CANVAS_HEIGHT = 480;

const styles = {
  canvas: {
    border: '1px solid black',
    width: CANVAS_WIDTH,
    height: CANVAS_HEIGHT,
  },
};

type Point = {
  x: number,
  y: number,
};

type CanvasProps = {};
type CanvasState = {};

export class Canvas extends React.Component<CanvasProps, CanvasState> {
  
  private canvas = React.createRef<HTMLCanvasElement>();
  private lastMousePosition: Point = {x:0, y:0};

  constructor(props: CanvasProps) {
    super(props);
    this.state = {};
  }

  componentDidMount() {
    if (!this.canvas || !this.canvas.current) return;
    this.canvas.current.addEventListener('pointerdown', this.mouseDown);
  }

  componentWillUnmount() {
    if (!this.canvas || !this.canvas.current) return;
    this.canvas.current.removeEventListener('pointerdown', this.mouseDown);
  }

  setupActiveListeners() {
    if (!this.canvas || !this.canvas.current) return;
    this.canvas.current.addEventListener('pointermove', this.mouseMove);
    this.canvas.current.addEventListener('pointerup', this.mouseUp);
  }

  removeActiveListeners() {
    if (!this.canvas || !this.canvas.current) return;
    this.canvas.current.removeEventListener('pointermove', this.mouseMove);
    this.canvas.current.removeEventListener('pointerup', this.mouseUp);
  }

  mouseDown = (e: PointerEvent) => {
    e.preventDefault();
    this.setupActiveListeners();
    const mousePos = {x: e.offsetX, y: e.offsetY};
    this.lastMousePosition = mousePos;
    this.draw(mousePos, mousePos, 5, 'rgb(0, 0, 0)');
  }

  mouseMove = (e: PointerEvent) => {
    e.preventDefault();
    const mousePos = {x: e.offsetX, y: e.offsetY};
    this.draw(this.lastMousePosition, mousePos, 5, 'rgb(0, 0, 0)');
    this.lastMousePosition = mousePos;
  }

  mouseUp = (e: PointerEvent) => {
    this.removeActiveListeners();
  }

  draw(from: Point, to: Point, width: number, color: string) {
    if (!this.canvas || !this.canvas.current) return;
    const ctx = this.canvas.current.getContext('2d');
    if (!ctx) return;
    ctx.save();
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.globalCompositeOperation = 'source-over';
    // ctx.globalCompositeOperation = 'destination-out';
    ctx.strokeStyle = color;
    ctx.lineWidth = width;
    ctx.beginPath();
    ctx.moveTo(from.x, from.y);
    ctx.lineTo(to.x, to.y);
    ctx.stroke();
    ctx.restore();
  }

  render () {
    return (
      <canvas
          ref = {this.canvas}
          style = {styles.canvas}
          width = {CANVAS_WIDTH}
          height = {CANVAS_HEIGHT}
          ></canvas>
    );
  }
}
