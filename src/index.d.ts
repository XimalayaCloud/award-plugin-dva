declare namespace AwardPlugins {
  export const dva: IDVA;
}

interface Model {
  namespace: string;
  state?: any;
  reducers?: object;
  effects?: object;
  subscriptions?: object;
}

interface IDVA {
  /**
   * 全局 store 来方便开发者自由处理数据
   ```
    import Award from 'award';
    Award.dva.store.disptach({});
   ```
   */
  store: any;
  /**
   * 提供了全局注册函数registerModel
   *
   * 使用registerModel注意事项
   *
   * 1. 必须全局使用，即不能在组件内使用
   *
   * 2.  只支持单个model的注册，多个请自行处理
   *
   * 3.  注册的model将挂载到全局，同时也自动支持按需加载了
   *
   * 4.  非常不推荐大量使用该函数，易导致model冗余以及项目大了以后不易管理的问题，请慎重考虑后使用！
   */
  registerModel: (model: Model) => void;
  /**
   * 在根组件启动dva
   *
   ```js
    import Award,{ start } from 'award'
    // models是model集合的数组，基本是全局使用的model
    // model的概念基于Award.dva
    class App extends React.Component {
      ...
    }
    start(Award.dva.start(models)(App))
   ```
   */
  start: (models: Model[], onError?: any) => any;
}
