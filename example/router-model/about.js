import model from './model/about';
import { connect } from 'react-redux';

@connect(({ about }) => {
  return {
    name: about.name
  };
})
class Detail extends React.Component {
  /**
   * 指定当前路由所需要的model
   * 公共的model需要放到入口的dva执行里面，和原来一致
   * 可以指定单个model或者一系列的model数组
   * static model = model
   * static model = [model1, model2]
   */
  static model = [model];
  static async getInitialProps(ctx) {
    await new Promise(resolve => {
      setTimeout(resolve, 1000);
    });
    await ctx.store.dispatch({ type: 'about/change' });
  }

  render() {
    return <h1>hello {this.props.name}</h1>;
  }
}

export default Detail;
