/** @jsx jsx */

import * as React from 'react';
import {render} from 'react-dom';
import {jsx, css, SerializedStyles} from '@emotion/core';

import {Canvas, Tool} from './canvas';

const styles = {
  container: {
    display: 'inline-flex',
    border: '2px solid red',
    padding: 16,
    flexDirection: 'row',
  },
  toolbar: {
    padding: '0 8',
    display: 'inline-flex',
    flexDirection: 'column',
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
} as {[key: string]: React.CSSProperties};

const fancyStyles = {
  //
} as {[key: string]: SerializedStyles};

type DrawpadProps = {};
type DrawpadState = {
  tool: Tool,
};

export class Drawpad extends React.Component<DrawpadProps, DrawpadState> {
  constructor(props: DrawpadProps) {
    super(props);
    this.state = {
      tool: Tool.PENCIL,
    };
  }

  changeTool = (tool: Tool) => {
    return () => {
      this.setState({tool});
    }
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
        <Canvas tool={this.state.tool} />
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
        </div>
      </div>
    );
  }
}