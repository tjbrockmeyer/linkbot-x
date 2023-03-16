import {config} from '../../config'

export const isAdmin = (userId: string) => {
    return config.general.ownerId === userId;
}