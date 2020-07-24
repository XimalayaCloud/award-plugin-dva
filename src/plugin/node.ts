/**
 * 项目在node运行时，会执行该文件，挂载钩子时机，待客户端运行到时触发运行相关逻辑
 *
 * 包括构建、编译、开发运行、生产运行，只要任何在node上运行的场景及时机
 *
 * 请保证你在构建或者编译时机用的webpack库，通过require引用，请不要在全局引用，务必务必！！！
 */

import { NodeHooks } from 'award-plugin';

export default (hooks: NodeHooks) => {
  // 首次修改ctx.award对象结构
  hooks.modifyContextAward(function({ context }: any) {
    const RootComponent = context.award.RootComponent;
    if (RootComponent && RootComponent.createDva) {
      /**
       * 服务端每个请求过来，将生成新的store，存储该次请求的上下文中
       * 如果使用了dva，需要先创建dva
       */
      context.award.store = RootComponent.createDva({}, context.award.match_routes);
      context.award.initialState.award = {
        ...(context.award.initialState.award || {}),
        __store__: context.award.store
      };
    }
  });

  // 针对每次InitialProps，修改其参数，原型链的形式
  hooks.modifyInitialPropsCtx(function({ params, context }: any) {
    params.store = context.award.store;
  });

  hooks.didFetch(function({ context }: any) {
    if (context.award.store) {
      context.award.initialState.store = context.award.store.getState();
    }
  });
};
