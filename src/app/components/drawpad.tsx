/** @jsx jsx */

import * as React from 'react';
import {render} from 'react-dom';
import {jsx, css, SerializedStyles} from '@emotion/core';

import {
  AlphaPicker,
  Color,
  ColorResult,
  CompactPicker,
  RGBColor,
} from 'react-color';

import {Canvas, Tool} from './canvas';

const styles = {
  container: {
    display: 'inline-flex',
    border: '2px solid red',
    padding: 16,
    flexDirection: 'column',
  },
  toolbar: {
    margin: '8px 0',
    display: 'inline-flex',
    flexDirection: 'row',
  },
  icon: {
    color: 'inherit',
    fill: 'inherit',
  },
  button: {
    background: 'none',
    outline: 'none',
    width: 32,
    height: 32,
    padding: 4,
    border: '1px solid black',
    margin: '0 8px 8px 0',
  },
  picker: {
    width: 240,
    display: 'inline-flex',
    flexDirection: 'column',
  },
  colorPicker: {
    margin: '0 0 16px 0',
  },
  alphaPicker: {},
} as {[key: string]: React.CSSProperties};

const fancyStyles = {
  //
} as {[key: string]: SerializedStyles};

type DrawpadProps = {};
type DrawpadState = {
  tool: Tool,
  color: RGBColor,
  size: number,
};

export class Drawpad extends React.Component<DrawpadProps, DrawpadState> {
  constructor(props: DrawpadProps) {
    super(props);
    this.state = {
      tool: Tool.PENCIL,
      color: {r: 255, g: 0, b: 0, a: 1},
      size: 10,
    };
  }

  changeTool = (tool: Tool) => {
    return () => {
      this.setState({tool});
    }
  }

  onColorChange = (result: ColorResult) => {
    this.setState({color: result.rgb});
  }

  onSizeChange = (e: React.FormEvent) => {
    this.setState({
      size: parseInt((e.target as HTMLInputElement).value, 10),
    });
  }

  render() {
    const pencilStyle = {
      ...styles.button,
    };
    if (this.state.tool == Tool.PENCIL) {
      pencilStyle.borderColor = 'rgb(0, 0, 255)';
      pencilStyle.backgroundColor = 'rgba(0, 0, 255, 0.2)';
    }
    const eraserStyle = {
      ...styles.button,
    };
    if (this.state.tool == Tool.ERASER) {
      eraserStyle.borderColor = 'rgb(0, 0, 255)';
      eraserStyle.backgroundColor = 'rgba(0, 0, 255, 0.2)';
    }
    const bucketStyle = {
      ...styles.button,
    };
    if (this.state.tool == Tool.BUCKET) {
      bucketStyle.borderColor = 'rgb(0, 0, 255)';
      bucketStyle.backgroundColor = 'rgba(0, 0, 255, 0.2)';
    }
    return (
      <div style={styles.container}>
        <Canvas
            color={this.state.color}
            tool={this.state.tool}
            size={this.state.size}
            />
        <div style={styles.toolbar}>
          <button
              css={css(pencilStyle)}
              onClick={this.changeTool(Tool.PENCIL)}>
            <img style={styles.icon} src="/icons/pencil.svg" />
          </button>
          <button
              css={css(eraserStyle)}
              onClick={this.changeTool(Tool.ERASER)}>
            <img style={styles.icon} src="/icons/eraser.svg" />
          </button>
          <button
              css={css(bucketStyle)}
              onClick={this.changeTool(Tool.BUCKET)}>
            <img style={styles.icon} src="/icons/paint.svg" />
          </button>
          <div>
            <label>
              Size ({this.state.size})
              <input
                  type="range" min="0" max="100"
                  value={this.state.size}
                  onChange={this.onSizeChange}
                  />
            </label>
          </div>
        </div>
        <div style={styles.picker}>
          <div style={styles.colorPicker}>
            <CompactPicker
                color={this.state.color}
                onChangeComplete={this.onColorChange}
                />
          </div>
          <div style={styles.alphaPicker}>
            <AlphaPicker
                width="240"
                color={this.state.color}
                onChange={this.onColorChange}
                />
          </div>
        </div>
      </div>
    );
  }
}