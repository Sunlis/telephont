import * as React from 'react';
import {render} from 'react-dom';

class App extends React.Component {
  render () {
    return (
      <div>
        <span>waddup</span>
      </div>
    );
  }
}

render(<App/>, document.getElementById('app'));
