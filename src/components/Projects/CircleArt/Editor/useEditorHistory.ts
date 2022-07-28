import { useRef, useState } from "react";

interface Action {
  undo: () => void;
  redo?: () => void;
}

interface Store {
  history: Action[];
  future: Action[];
}

const useEditorHistory = () => {
  const refAllowPush = useRef(true);
  const [store, setStore] = useState<Store>({
    history: [],
    future: [],
  });

  const commit = () => {
    setStore({
      history: [],
      future: [],
    })
  };

  const push = (action: () => void, { undo, redo = action }: Action) => {
    action();

    if (refAllowPush.current) {
      setStore((store) => ({
        history: [...store?.history, { undo, redo }],
        future: [],
      }));
    }
  };

  const pop = () => {
    setStore((store) => {
      const action = store.history[store.history.length - 1];

      if (action) {
        refAllowPush.current = false;
        action.undo();
        refAllowPush.current = true;

        return {
          history: store.history.slice(0, -1),
          future: [...store.future, action],
        };
      }

      return store;
    });
  };

  const replay = () => {
    setStore((store) => {
      const action = store.future[store.future.length - 1];

      if (action) {
        refAllowPush.current = false;
        action.redo?.();
        refAllowPush.current = true;

        return {
          history: [...store.history, action],
          future: store.future.slice(0, -1),
        };
      }

      return store;
    });
  };

  return {
    canUndo: !!store.history.length,
    canRedo: !!store.future.length,
    commit,
    push,
    pop,
    replay,
  };
};

export default useEditorHistory;
