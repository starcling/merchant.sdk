import { HTTPResponseCodes } from "@utils/web/HTTPResponseCodes";

export class ErrorHandler extends Error {
    public message: string;
    public status: number;
    public error: any;

    constructor(_message: string, _error: any) {
        super(_error);
        this.message = _message;
        this.status = HTTPResponseCodes.BAD_REQUEST();
        this.error = _error;
    }

}