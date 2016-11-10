import { HttpCodes } from './HttpCodes';

export class LambdaError {
    code: HttpCodes;
    message: string;

    constructor(c: HttpCodes, m: string) {
        this.code = c;
        this.message = m;
    }

    toString(): string {
        return JSON.stringify({ code: this.code, message: this.message });
    }

    toError(): Error {
        return new Error(this.toString());
    }
}