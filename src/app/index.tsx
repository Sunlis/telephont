import * as React from 'react';
import {render} from 'react-dom';

import {Canvas} from './components/canvas';

const styles = {
  container: {
    padding: 32,
  }
};

class App extends React.Component {
  render () {
    return (
      <div style={styles.container}>
        <Canvas />
      </div>
    );
  }
}

render(<App/>, document.getElementById('app'));
