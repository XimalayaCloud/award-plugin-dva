import { Link } from 'react-router-dom';

export default class Detail extends React.Component {
  render() {
    return (
      <div>
        <p>这里是详情页</p>
        <Link to="/">首页</Link>
      </div>
    );
  }
}
