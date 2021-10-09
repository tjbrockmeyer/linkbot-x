import { ClientSession, Db } from "mongodb";
import { SinonStub, stub } from "sinon";
import { stubInterface } from "ts-sinon";
import * as database from '../src/database';
import { DbContext } from "../src/typings/DbContext";


type ReturnTypeOfObjectMethod<T, K extends keyof T> = T[K] extends (...args: any) => any ? ReturnType<T[K]> : never;
type StubOfObjectField<T, K extends keyof T> = T[K] extends (...args: infer TArgs) => infer TReturnValue ? SinonStub<TArgs, TReturnValue> : SinonStub;
type ReturnSpec<T, K extends keyof T> = ReturnTypeOfObjectMethod<T, K> | (() => ReturnTypeOfObjectMethod<T, K>) | undefined;

const isFunction = <T, K extends keyof T>(
    x: ReturnTypeOfObjectMethod<T, K> | (() => ReturnTypeOfObjectMethod<T, K>)): x is () => ReturnTypeOfObjectMethod<T, K> => {
    return typeof x === 'function'
}

export const autoStub = <T, K extends keyof T>(obj: T, method: K, returns: ReturnSpec<T, K> = undefined): StubOfObjectField<T, K> => {
    const s = stub(obj, method);
    s.restore();
    beforeEach(() => {
        obj[method] = s as unknown as T[K];
        if(returns) {
            if(isFunction(returns)) {
                s.callsFake(returns);
            } else {
                s.returns(returns);
            }
        }
    });
    afterEach(() => {
        s.reset();
        s.restore();
    });
    return s;
};

export const stubWithSession = (): {ctx: DbContext, stub_withSession: SinonStub} => {
    const db = stubInterface<Db>();
    const session = stubInterface<ClientSession>();
    const ctx: DbContext = {db, session};
    const s = autoStub(database, 'withSession');
    beforeEach(() => {
        s.callsFake(async task => await task(ctx));
    });
    return {ctx, stub_withSession: s}
}