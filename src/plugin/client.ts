/**
 * 项目在客户端运行时，会执行该文件，挂载钩子时机，待客户端运行到时触发运行相关逻辑
 *
 * 即保证该文件的依赖都必须可以在客户端运行
 */
import { ClientHooks } from 'award-plugin';
import { get } from './store';

export default (hooks: ClientHooks) => {
  hooks.init(function({ INITIAL_STATE, Component, match_routes }: any) {
    /**
     * 初始化dva
     */
    if (Component.createDva) {
      const __store__ = Component.createDva(INITIAL_STATE.store || {}, match_routes);
      setTimeout(() => {
        delete INITIAL_STATE.store;
      });
      INITIAL_STATE.award = {
        ...INITIAL_STATE.award,
        __store__
      };
    }
  });

  hooks.modifyInitialPropsCtx(function({ params }) {
    params.store = get();
  });

  hooks.routeChangeBeforeLoadInitialProps(function({ emitter, match_routes }) {
    // 路由切换数据加载之前，需要先加载对应路由上的model，实现按需加载
    emitter.emit('setModel', match_routes);
  });
};
