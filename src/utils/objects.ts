export const removeUndefinedKeys = (obj: Record<string, any>) => {
  return Object.assign(
    {},
    ...Object.keys(obj)
      .filter((k) => obj[k] !== undefined)
      .map((k) => ({ [k]: obj[k] }))
  );
};

export const stringifyError = (error: unknown): string => {
  const trace = new Error().stack;
  return JSON.stringify(
    error instanceof Error
      ? { ...error, error: error.message, stack: error.stack, trace }
      : { error, trace }
  );
};
