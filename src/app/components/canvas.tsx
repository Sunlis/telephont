import * as React from 'react';
import {render} from 'react-dom';
import * as _ from 'lodash';

import {RGBColor} from 'react-color';

const CANVAS_WIDTH = 720;
const CANVAS_HEIGHT = 480;

const styles = {
  container: {
    position: 'relative',
    width: CANVAS_WIDTH,
    height: CANVAS_HEIGHT,
  },
  canvas: {
    position: 'absolute',
    top: 0,
    left: 0,
    border: '1px dashed black',
    width: CANVAS_WIDTH,
    height: CANVAS_HEIGHT,
  },
  drawingLayer: {
    position: 'absolute',
    top: 0,
    left: 0,
    // visibility: 'hidden',
    border: '1px dotted black',
    width: CANVAS_WIDTH,
    height: CANVAS_HEIGHT,
    pointerEvents: 'none',
  }
} as {[key: string]: React.CSSProperties};

export enum Tool {
  PENCIL = 0,
  ERASER = 1,
  BUCKET = 2,
}

type Point = {
  x: number,
  y: number,
};

type CanvasProps = {
  tool: Tool,
  color: RGBColor,
  size: number,
};
type CanvasState = {};

const colorString = (color: RGBColor): string => {
  return `rgba(${color.r}, ${color.g}, ${color.b}, ${color.a})`;
};

const stripAlpha = (color: RGBColor): RGBColor => {
  return {...color, a: 1};
};

const getAlpha = (color: RGBColor, fallback: number = 1): number => {
  if (color.a == null || color.a == undefined) {
    return fallback;
  }
  return color.a;
};

const WHITE: RGBColor = {r: 255, g: 255, b: 255, a:1};

export class Canvas extends React.Component<CanvasProps, CanvasState> {

  private canvas = React.createRef<HTMLCanvasElement>();
  private drawingLayer = React.createRef<HTMLCanvasElement>();
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
    ctx.fillStyle = colorString(WHITE);
    ctx.fillRect(0, 0, this.canvas.current.width, this.canvas.current.height);
  }

  componentWillUnmount() {
    if (!this.canvas || !this.canvas.current) return;
    this.canvas.current.removeEventListener('pointerdown', this.mouseDown);
  }

  setupActiveListeners() {
    window.addEventListener('pointermove', this.mouseMove, true);
    window.addEventListener('pointerup', this.mouseUp, true);
  }

  removeActiveListeners() {
    window.removeEventListener('pointermove', this.mouseMove, true);
    window.removeEventListener('pointerup', this.mouseUp, true);
  }

  getBaseContext(): CanvasRenderingContext2D|null {
    if (this.canvas && this.canvas.current) {
      return this.canvas.current.getContext('2d');
    }
    return null;
  }

  getDrawingContext(): CanvasRenderingContext2D|null {
    if (this.drawingLayer && this.drawingLayer.current) {
      return this.drawingLayer.current.getContext('2d');
    }
    return null;
  }

  mouseDown = (e: PointerEvent) => {
    e.preventDefault();
    const baseCtx = this.getBaseContext();
    const drawingCtx = this.getDrawingContext();
    if (!baseCtx || !drawingCtx) return;
    const mousePos = {x: e.offsetX, y: e.offsetY};
    if (this.props.tool == Tool.PENCIL || this.props.tool == Tool.ERASER) {
      this.setupActiveListeners();
      this.lastMousePosition = mousePos;
      this.draw(mousePos, mousePos, 5, this.props.color, drawingCtx);
    } else if (this.props.tool == Tool.BUCKET) {
      this.startFloodFill(mousePos);
    }
  }

  mouseMove = (e: PointerEvent) => {
    e.preventDefault();
    const drawingCtx = this.getDrawingContext();
    if (!drawingCtx) return;
    const mousePos = {x: e.offsetX, y: e.offsetY};
    this.draw(this.lastMousePosition, mousePos, 5, this.props.color, drawingCtx);
    this.lastMousePosition = mousePos;
  }

  mouseUp = (e: PointerEvent) => {
    this.removeActiveListeners();
    this.copyAndClearDrawingLayer();
  }

  draw(from: Point, to: Point, width: number, color: RGBColor, ctx: CanvasRenderingContext2D) {
    ctx.save();
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    if (this.props.tool == Tool.PENCIL) {
      ctx.strokeStyle = colorString(stripAlpha(color));
      ctx.globalCompositeOperation = 'source-over';
    } else if (this.props.tool == Tool.ERASER) {
      // Draw white instead of doing a "real" erase
      // or the fill tool won't work as expected.
      ctx.strokeStyle = colorString(WHITE);
      ctx.globalCompositeOperation = 'source-over';
      // ctx.globalCompositeOperation = 'destination-out';
    }
    ctx.lineWidth = this.props.size;
    ctx.beginPath();
    ctx.moveTo(from.x, from.y);
    ctx.lineTo(to.x, to.y);
    ctx.stroke();
    ctx.restore();
  }

  copyAndClearDrawingLayer() {
    const baseCtx = this.getBaseContext();
    const drawingCtx = this.getDrawingContext();
    if (!baseCtx || !drawingCtx) return;
    baseCtx.save();
    // OK so this is some shit I don't really understand.
    // But basically browser opacity != canvas alpha
    // So we have to adjust for this, which is approx a 85% diff
    baseCtx.globalAlpha = getAlpha(this.props.color) * 0.85;
    console.log('alpha', this.props.color.a, baseCtx.globalAlpha);
    baseCtx.drawImage(drawingCtx.canvas, 0, 0);
    baseCtx.restore();
    drawingCtx.clearRect(0, 0, drawingCtx.canvas.width, drawingCtx.canvas.height);
  }

  startFloodFill(point: Point) {
    if (!this.canvas || !this.canvas.current) return;
    const ctx = this.canvas.current.getContext('2d');
    if (!ctx) return;
    point = {
      x: Math.round(point.x),
      y: Math.round(point.y),
    }
    const matcher = ctx.getImageData(point.x, point.y, 1, 1);
    const pixelData = ctx.getImageData(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    ctx.save();
    const newPixelData = this.floodFill(
        point,
        matcher,
        pixelData,
        ctx,
        [
          this.props.color.r,
          this.props.color.g,
          this.props.color.b,
          getAlpha(this.props.color) * 255,
        ]);
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
    const drawingLayerStyle = {
      ...styles.drawingLayer,
      opacity: getAlpha(this.props.color),
    }
    return (
      <div style={styles.container}>
        <canvas
            ref={this.canvas}
            style={styles.canvas}
            width={CANVAS_WIDTH}
            height={CANVAS_HEIGHT}
            ></canvas>
        <canvas
            ref={this.drawingLayer}
            style={drawingLayerStyle}
            width={CANVAS_WIDTH}
            height={CANVAS_HEIGHT}
            ></canvas>
      </div>
    );
  }
}
