import { HttpException, HttpStatus } from '@nestjs/common';

export class Exception extends Error {
    constructor({
        message,
        status
    }: {
        message: string;
        status: keyof typeof HttpStatus;
    }) {
        super(`${message} :|: ${status}`);
    }

    public static catch(error: string) {
        const [message, status] = error.split(' :|: ');
        if (message && status)
            throw new HttpException(message, HttpStatus[status]);
        else throw new HttpException(message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
}
