export const cancellable = <T extends Promise<unknown>>(
  makePromise: T | ((hook: (hook: VoidFunction) => void) => T),
): {
  promise: T;
  cancel: () => void;
} => {
  let isCancelled = false;

  let hooks: VoidFunction[] = [];
  const promise =
    makePromise instanceof Function
      ? makePromise((hook) => hooks.push(hook))
      : makePromise;

  const wrappedPromise = new Promise((resolve, reject) => {
    promise.then(
      (value) => {
        if (!isCancelled) {
          resolve(value);
        }
      },
      (error) => {
        if (!isCancelled) {
          reject(error);
        }
      },
    );
  }) as unknown as T;

  return {
    promise: wrappedPromise,
    cancel() {
      isCancelled = true;

      for (const hook of hooks) {
        hook();
      }

      hooks = [];
    },
  };
};
