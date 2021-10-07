import { LogisticRegressionClassifierClassification } from "natural";
import { CommandSpec } from "./CommandSpec";

export type ClassificationResult = {
    command: CommandSpec|null,
    status: 'success'|'multiple results'|'no results',
    classifications: LogisticRegressionClassifierClassification[]
}