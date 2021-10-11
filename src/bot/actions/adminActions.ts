

export const isAdmin = (userId: string) => {
    return process.env.OWNER === userId;
}