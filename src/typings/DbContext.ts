import { Db, ClientSession } from 'mongodb';

export type DbContext = {
    db: Db,
    session: ClientSession
}