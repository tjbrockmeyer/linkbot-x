

export const removeUndefinedKeys = (obj: Record<string, any>) => {
    return Object.assign({}, ...Object.keys(obj).filter(k => obj[k] !== undefined).map(k => ({[k]: obj[k]})));
}