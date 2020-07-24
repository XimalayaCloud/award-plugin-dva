export default {
  namespace: 'about',
  state: {
    name: ''
  },
  reducers: {
    change(state) {
      return {
        name: Math.random()
      };
    }
  }
};
