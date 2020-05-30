import * as React from 'react';
import {render} from 'react-dom';

class App extends React.Component {
  render () {
    return (
      <div>
        <span>re-learning git time pogg champ</span>
      </div>
    );
  }
}

render(<App/>, document.getElementById('app'));
