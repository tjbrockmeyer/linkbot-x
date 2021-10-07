import { LogisticRegressionClassifier } from "natural";

import { setBirthday } from "../bot/commands/birthday/set";
import { showBirthday } from "../bot/commands/birthday/show";
import { lookupLeagueOfLegends } from "../bot/commands/leagueOfLegends/lookup";
import { ClassificationResult } from "../types/ClassificationResult";
import { CommandSpec } from "../types/CommandSpec";


const acceptancePercentage = 0.85;
const tooSimilarPercentage = 0.08;

const options: CommandSpec[] = [
    setBirthday,
    showBirthday,
    lookupLeagueOfLegends
];
const nameToOptionMap = new Map(options.map(x => [x.name, x]));

const classifier = new LogisticRegressionClassifier();
options.forEach(x => [x.name, ...x.trainingSet].forEach(text => classifier.addDocument(text, x.name)));
classifier.train();

export const classify = (text: string): ClassificationResult => {
    const classifications = classifier.getClassifications(text);
    const validChoices = classifications.filter(c => c.value > acceptancePercentage);
    if(validChoices.length === 0) {
        return {command: null, status: 'no results', classifications};
    }
    if(validChoices.length > 1 && validChoices[0].value - validChoices[1].value < tooSimilarPercentage) {
        return {command: null, status: 'multiple results', classifications};
    }
    return {
        command: nameToOptionMap.get(validChoices[0].label) as CommandSpec, 
        status: 'success', 
        classifications
    }
};
