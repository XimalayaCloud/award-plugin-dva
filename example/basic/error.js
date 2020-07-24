/* eslint-disable @typescript-eslint/explicit-member-accessibility */
import { Link } from 'award-router';

export default class ErrorComponent extends React.Component {
  render() {
    console.log(this.props);
    const { routerError } = this.props;
    return (
      <div>
        <h1>发生错误了</h1>
        {routerError ? <Link to="/">回到首页</Link> : <p>全局错误</p>}
        <br />
        <Link to="/detail/11">去正常页面</Link>
      </div>
    );
  }
}
