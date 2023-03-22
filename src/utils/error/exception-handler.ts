import { HttpException, HttpStatus } from '@nestjs/common';

export class Exception extends Error {
    constructor({
        status,
        message
    }: {
        status: keyof typeof HttpStatus;
        message: string;
    }) {
        super(`${status}-${message}`);
    }

    public static create(error: string) {
        const [status, message] = error.split('-');
        if (status) throw new HttpException(message, HttpStatus[status]);
        else throw new HttpException(message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
}
