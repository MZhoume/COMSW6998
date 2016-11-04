export class LambdaError {
    public code: number;
    public message: string;

    constructor (c: number, m: string) {
        this.code = c;
        this.message = m;
    }
}