import { expect } from "chai";
import { isAdmin } from "../../../src/bot/actions/adminActions";


describe('bot adminActions', () => {
    describe('isAdmin', () => {


        it('should return true when the user is the bot owner', () => {
            const result = isAdmin(process.env.OWNER);
            expect(result).is.true;
        });
        it('should return false when the user is not the bot owner', () => {
            const result = isAdmin('this is not the owner');
            expect(result).is.false;
        });
    });
});