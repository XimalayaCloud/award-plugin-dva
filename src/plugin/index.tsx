/**
 * 该插件默认导出的依赖，可供项目引用
 *
 * 开发者需要在插件说明中提示该插件是否提供依赖引用
 *
 * 如下示例，
```
import { dva } from 'award'

// dva.start
// dva.store
// dva.registerModel

```
 */

/* eslint-disable @typescript-eslint/prefer-for-of */
import * as React from 'react';
import { List, fromJS } from 'immutable';
import { Provider } from 'react-redux';
import { create } from 'dva-core';
import createLoading from 'dva-loading';
import hoistNonReactStatics = require('hoist-non-react-statics');
import { emitter } from 'award-utils';
import { Model, MatchedRoute } from 'award-types';
import { set } from './store';

const OnError = (e: any) => {
  console.error('dva发生错误', e);
};

const onWarning = (info: any) => {
  if (process.env.NODE_ENV !== 'production') {
    console.warn('[生产环境不显示]   ' + info);
  }
};

// 由于dva-immer作者对模块引用做了特殊处理，所以我们需要判断node端引用和web引用
let createImmer = require('dva-immer');
createImmer = createImmer.default || createImmer;

export interface IDVA {
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
    import Award, { start } from 'award'
    // models是model集合的数组，基本是全局使用的model
    // model的概念基于Award.dva
    class App extends React.Component {
      ...
    }
    start(Award.dva.start(models)(App))
   ```
   */
  start: (models: Model[], onError: any) => any;
}

let _store: any = null;
const _default: IDVA = {
  store: {
    dispatch: function() {
      if (_store) {
        return _store.dispatch(...arguments);
      }
      throw new Error('不支持同步调用dispatch，请通过DidMount或者事件触发的形式使用');
    }
  },
  registerModel: () => null,
  start: () => null
};

let app: any = null;
let namespaces: any[] = [];
let globalNamespaces: any[] = [];
let globalModels: List<any> = fromJS([]);

const getInitialStore = (models: Model[], initialState: object, onError: Function) => {
  // 初始化store
  const _namespaces: any[] = [];
  const _app = create({
    initialState,
    onError
  });
  _app.use(createImmer());
  // 服务端不需要运行 dva-loading
  if (!(global as any).inServer) {
    _app.use(createLoading());
  }
  models.forEach((model: Model) => {
    if (_namespaces.indexOf(model.namespace) === -1) {
      _namespaces.push(model.namespace);
      _app.model(model);
    }
  });
  _app.start();

  _default.store = _app._store;
  _store = _app._store;
  set(_default.store);
  app = _app;
  namespaces = _namespaces;
  return _default.store;
};

// 全局出发注册函数
_default.registerModel = (model: Model) => {
  if (model.namespace) {
    if (globalNamespaces.indexOf(model.namespace) === -1) {
      if (typeof window !== 'undefined' && app) {
        app.model(model);
      }
      globalNamespaces.push(model.namespace);
      globalModels = fromJS([model, ...globalModels.toJS()]);
    } else {
      onWarning('使用registerModel函数注册时，出现了重复的model。namespace：' + model.namespace);
    }
  } else {
    onWarning('model没有设置namespace');
  }
};

_default.start = (models: Model[] = [], onError: any = OnError) => (App: any): any => {
  class AwardDva extends React.Component<any> {
    /**
     * 服务端每个请求过来，将生成新的store，存储该次请求的上下文中
     *
     * 客户端初始化的时候，将生成新的store，存储用户浏览器内
     */
    public static createDva(initialState = {}, match_routes = []) {
      const _namespaces: any[] = [];
      const _models: Model[] = [];

      const inquire = (_models_: Model[]) => {
        _models_.forEach(model => {
          if (globalNamespaces.indexOf(model.namespace) === -1) {
            if (_namespaces.indexOf(model.namespace) === -1) {
              _models.push(model);
              _namespaces.push(model.namespace);
            } else {
              onWarning(
                '初始化【根组件或者路由组件】的model内存在重复的model。namespace: ' +
                  model.namespace
              );
            }
          } else {
            onWarning(
              '当前初始化的model已经通过registerModel函数注册过了。namespace: ' + model.namespace
            );
          }
        });
      };

      inquire(models);

      // 获取每个路由上的model
      match_routes.forEach((item: any) => {
        const cmp = item.route.component;
        if (cmp.model) {
          if (cmp.model instanceof Array) {
            inquire(cmp.model);
          } else {
            inquire([cmp.model]);
          }
        }
      });

      // 获取全局上的每个model，这里使用immutable数据
      _models.push(...globalModels.toJS());

      // 客户端执行时，剔除非当前路由下的model
      if (typeof window !== 'undefined') {
        for (let key in initialState) {
          if (Object.prototype.hasOwnProperty.call(initialState, key)) {
            if (_namespaces.indexOf(key) === -1) {
              delete (initialState as any)[key];
            }
          }
        }
      }

      // 初始化store，并返回
      return getInitialStore(_models, initialState, onError);
    }

    // 服务端渲染时和非服务端渲染时都会执行该代码
    // 包括热更新也会触发该代码
    public static async getInitialProps(appContext: any) {
      let appProps: any = {};

      if (typeof App.getInitialProps === 'function') {
        appProps = (await App.getInitialProps(appContext)) || {};
      }

      if (process.env.NODE_ENV === 'development') {
        if (appProps.__store__) {
          throw new Error(
            '根组件的[getInitialProps]函数的返回值的对象结构中，请不要使用【__store__】字段'
          );
        }
      }

      return { ...appProps, __store__: appContext.store };
    }

    public componentDidMount() {
      const emit = emitter.getEmitter();
      if (emit) {
        const routeRegisterModel = (model: Model) => {
          const { namespace } = model;
          if (namespace) {
            if (namespaces.indexOf(namespace) === -1) {
              namespaces.push(namespace);
              app.model(model);
            } else {
              onWarning('当前路由上挂载了和全局重复的model，namespace:' + model.namespace);
            }
          } else {
            onWarning('model没有设置namespace');
          }
        };
        emit.on('setModel', (match_routes: Array<MatchedRoute<{}>>) => {
          match_routes.forEach(item => {
            const { model } = item.route.component!;
            if (model) {
              if (model instanceof Array) {
                model.map(routeRegisterModel);
              } else {
                routeRegisterModel(model);
              }
            }
          });
        });
      }
    }

    public render() {
      if (process.env.NODE_ENV === 'development') {
        if (!app) {
          return (
            <div>
              <p style={{ color: 'red' }}>
                请在award.config.js中，配置dva插件award-plugin-dva，然后重启服务
              </p>
              <code>
                {`
                {
                  plugins:["award-plugin-dva"]
                }
              `}
              </code>
            </div>
          );
        }
      }
      // 保证当前的store是来自当前的getInitialProps函数
      // 这样也保证了服务端数据的一致性
      const { __store__, ...rests } = this.props;
      return (
        <Provider store={__store__}>
          <App {...rests} />
        </Provider>
      );
    }
  }
  hoistNonReactStatics(AwardDva, App, {
    getInitialProps: true,
    createDva: true
  });

  return AwardDva;
};

export default _default;
