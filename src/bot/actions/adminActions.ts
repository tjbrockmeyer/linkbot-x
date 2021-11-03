import {getConfig} from '../../config'

export const isAdmin = async (userId: string) => {
    return (await getConfig()).general.ownerId === userId;
}