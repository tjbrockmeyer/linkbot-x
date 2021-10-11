

export type MessageError = {
    messageId: string,
    errorMessage: string,
    stackTrace: string|null,
    insertionTime: Date
};