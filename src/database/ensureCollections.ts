import { DbContext } from "../typings/DbContext";
import { ensureBirthdaysCollection } from "./collections/birthdays";
import { ensureMessageErrorsCollection } from "./collections/messageErrors";
import { ensurePostedBirthdaysCollection } from "./collections/postedBirthdays";


export default async (ctx: DbContext) => {
    return await Promise.all([
        ensureBirthdaysCollection(ctx),
        ensurePostedBirthdaysCollection(ctx),
        ensureMessageErrorsCollection(ctx)
    ]);
}