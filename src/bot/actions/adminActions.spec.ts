import { expect } from "chai";
import { SinonStub, stub } from "sinon";
import * as config from "../../config";
import { isAdmin } from "./adminActions";
import {fakeConfig} from '../../testUtils/data';


describe('bot adminActions', () => {
    describe('isAdmin', () => {

        let stub_getConfig: SinonStub;

        beforeEach(() => {
            stub_getConfig = stub(config, 'getConfig').resolves(fakeConfig)
        });

        it('should return true when the user is the bot owner', async () => {
            const result = await isAdmin(fakeConfig.general.ownerId);
            expect(result).is.true;
        });
        it('should return false when the user is not the bot owner', async () => {
            const result = await isAdmin('this is not the owner');
            expect(result).is.false;
        });
    });
});