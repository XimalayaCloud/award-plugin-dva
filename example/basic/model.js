export default {
  namespace: 'main',
  state: {
    name: 'hello world'
  },
  reducers: {
    change(state, data) {
      Object.assign(state, {
        name: Math.random()
      });
    }
  }
};
