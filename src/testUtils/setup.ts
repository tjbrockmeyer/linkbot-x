import sinonChai from "sinon-chai";
import chai from 'chai';
import { restore } from "sinon";

chai.use(sinonChai);


afterEach(() => {
    restore();
});