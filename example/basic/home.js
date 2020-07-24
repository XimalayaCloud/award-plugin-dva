import { Consumer } from 'award';

class Home extends React.Component {
  static getInitialProps(ctx) {
    return {
      age: 100
    };
  }

  render() {
    return (
      <h1>
        {this.props.age}
        <Consumer>{award => award.name}</Consumer>
      </h1>
    );
  }
}

export default Home;
