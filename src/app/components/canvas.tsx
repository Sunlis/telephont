import * as React from 'react';
import {render} from 'react-dom';
import * as _ from 'lodash';

const CANVAS_WIDTH = 720;
const CANVAS_HEIGHT = 480;

const styles = {
  canvas: {
    border: '1px solid black',
    width: CANVAS_WIDTH,
    height: CANVAS_HEIGHT,
  },
};

export enum Tool {
  PENCIL = 0,
  ERASER = 1,
  BUCKET = 2,
}

type Point = {
  x: number,
  y: number,
};

type CustomImageData = {
  width: number,
  height: number,
  data: Uint32Array,
};

type CanvasProps = {
  tool: Tool,
};
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
    const ctx = this.canvas.current.getContext('2d');
    if (!ctx) return;
    ctx.fillStyle = 'rgba(255, 255, 255, 1)';
    ctx.fillRect(0, 0, this.canvas.current.width, this.canvas.current.height);
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
    const mousePos = {x: e.offsetX, y: e.offsetY};
    if (this.props.tool == Tool.PENCIL || this.props.tool == Tool.ERASER) {
      this.setupActiveListeners();
      this.lastMousePosition = mousePos;
      this.draw(mousePos, mousePos, 5, 'rgb(0, 0, 0)');
    } else if (this.props.tool == Tool.BUCKET) {
      this.startFloodFill(mousePos);
    }
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
    if (this.props.tool == Tool.PENCIL) {
      ctx.strokeStyle = color;
      ctx.globalCompositeOperation = 'source-over';
    } else if (this.props.tool == Tool.ERASER) {
      // Draw white instead of doing a "real" erase
      // or the fill tool won't work as expected.
      ctx.strokeStyle = 'rgba(255, 255, 255, 1)';
      ctx.globalCompositeOperation = 'source-over';
      // ctx.globalCompositeOperation = 'destination-out';
    }
    ctx.lineWidth = width;
    ctx.beginPath();
    ctx.moveTo(from.x, from.y);
    ctx.lineTo(to.x, to.y);
    ctx.stroke();
    ctx.restore();
  }

  startFloodFill(point: Point) {
    if (!this.canvas || !this.canvas.current) return;
    const ctx = this.canvas.current.getContext('2d');
    if (!ctx) return;
    const matcher = ctx.getImageData(point.x, point.y, 1, 1);
    const pixelData = ctx.getImageData(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    ctx.save();
    const newPixelData = this.floodFill(
        point, matcher, pixelData, ctx, [0, 0, 0, 255]);
    ctx.putImageData(newPixelData, 0, 0);
    ctx.restore();
  }

  floodFill(
      source: Point,
      matcher: ImageData,
      pixelData: ImageData,
      ctx: CanvasRenderingContext2D,
      color: number[]): ImageData {
    const newData: ImageData = {
      width: pixelData.width,
      height: pixelData.height,
      data: new Uint8ClampedArray(pixelData.data.buffer),
    }
    const toCheck = [source];
    const alreadyChecked: boolean[][] = [];
    const counts = {
      checked: 0,
      colored: 0,
    };
    for (let x = 0; x < CANVAS_WIDTH; x++) {
      alreadyChecked[x] = [];
      for (let y = 0; y < CANVAS_HEIGHT; y++) {
        alreadyChecked[x][y] = false;
      }
    }
    while (toCheck.length) {
      const search = toCheck.pop();
      counts.checked++;
      if (!search || search.x < 0 || search.y < 0
          || search.x >= newData.width
          || search.y >= newData.height) {
        continue;
      }
      if (alreadyChecked[search.x][search.y]) continue;
      alreadyChecked[search.x][search.y] = true;
      if (this.imageDataMatch(matcher, newData, search.x, search.y, 0.1)) {
        const offset = ((search.y * newData.width) + search.x) * 4;
        for (let i = 0; i < 4; i++) newData.data[offset + i] = color[i];
        counts.colored++;
        toCheck.push({x: search.x + 0, y: search.y - 1});
        toCheck.push({x: search.x + 1, y: search.y - 1});
        toCheck.push({x: search.x + 1, y: search.y + 0});
        toCheck.push({x: search.x + 1, y: search.y + 1});
        toCheck.push({x: search.x + 0, y: search.y + 1});
        toCheck.push({x: search.x - 1, y: search.y + 1});
        toCheck.push({x: search.x - 1, y: search.y + 0});
        toCheck.push({x: search.x - 1, y: search.y - 1});
      }
    }
    console.info('counts', counts);
    return new ImageData(
      new Uint8ClampedArray(newData.data.buffer),
      newData.width,
      newData.height);
  }

  imageDataMatch(
      matcher: ImageData,
      pixelData: ImageData,
      x: number,
      y: number,
      tolerance: number = 0) {
    const getPixel = (imageData: ImageData, x: number, y: number): number[] => {
      const start = ((y * imageData.width) + x) * 4;
      return Array.from(imageData.data.slice(start, start + 4));
    };
    const check = getPixel(pixelData, x, y);
    for (let i = 0; i < 4; i++) {
      if (Math.abs(matcher.data[i] - check[i]) > tolerance * 255) return false;
    }
    return true;
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
