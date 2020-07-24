/* eslint-disable @typescript-eslint/explicit-member-accessibility */
import { dva } from 'award';
import { RouterSwitch, Route, Link } from 'award-router';
import { connect } from 'react-redux';
import Home from './home';
import Detail from './detail';

import model from './model';

@dva.start([model])
@connect(({ main }) => {
  return {
    name: main.name
  };
})
export default class App extends React.Component {
  static getInitialProps(ctx) {
    ctx.store.dispatch({
      type: 'main/change'
    });
  }

  render() {
    return (
      <>
        <p>{this.props.name}</p>
        <RouterSwitch>
          <Route path="/" component={Home} exact />
          <Route path="/detail/:id" component={Detail} exact />
        </RouterSwitch>
      </>
    );
  }
}
