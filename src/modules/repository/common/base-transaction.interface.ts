export interface BaseTransaction<T = unknown> {
    startTransaction(): Promise<T>;
    commitTransaction(transaction: T): Promise<T>;
    abortTransaction(transaction: T): Promise<T>;
}
