import Award, { start } from 'award';
import { RouterSwitch, Route } from 'award-router';
import { Link } from 'react-router-dom';

import About from './about';
import Detail from './detail';

@start
@Award.dva.start([])
class App extends React.Component {
  render() {
    return (
      <div>
        <p>hello router-model</p>
        <Link to="/about">跳转about</Link>
        <br />
        <Link to="/detail">跳转detail</Link>
        <RouterSwitch>
          <Route path="/about" component={About} />
          <Route path="/detail" component={Detail} />
        </RouterSwitch>
      </div>
    );
  }
}
