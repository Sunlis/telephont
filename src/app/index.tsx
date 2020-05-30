import * as React from 'react';
import {render} from 'react-dom';

import {Drawpad} from './components/drawpad';

const styles = {
  container: {
  }
};

class App extends React.Component {
  render () {
    return (
      <div style={styles.container}>
        <Drawpad />
      </div>
    );
  }
}

render(<App/>, document.getElementById('app'));
