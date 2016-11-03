import { ILambdaError } from './Interface/ILambdaError'

export class LambdaError implements ILambdaError {
    constructor(
        public code: number,
        public message: string
    ) {
    }

    toString(): string {
        return '[' + this.code + '] ' + this.message;
    }
}