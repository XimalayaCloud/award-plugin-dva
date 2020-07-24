import model from './model/detail';
import { connect } from 'react-redux';

@connect(({ detail }) => {
  return {
    name: detail.name
  };
})
class Detail extends React.Component {
  static model = model;

  render() {
    return <h1>hello {this.props.name}</h1>;
  }
}

export default Detail;
