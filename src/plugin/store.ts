let store: any;

export const set = (_store: any) => {
  store = _store;
};

export const get = () => store;
