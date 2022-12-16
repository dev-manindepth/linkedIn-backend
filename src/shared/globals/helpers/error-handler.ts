import HTTP_STATUS from 'http-status-codes';

export interface IErrorResponse {
  message: string;
  status: string;
  statusCode: number;
  serializeErrors(): IError;
}
export interface IError {
  message: string;
  status: string;
  statusCode: number;
}

export abstract class CustomError extends Error {
  abstract statusCode: number;
  abstract status: string;

  constructor(message: string) {
    super(message);
  }
  serializeErrors(): IError {
    return {
      message: this.message,
      status: this.status,
      statusCode: this.statusCode
    };
  }
}

export class JoiRequestValidationError extends CustomError {
  statusCode: number = HTTP_STATUS.BAD_REQUEST;
  status = 'error';

  constructor(message: string) {
    super(message);
  }
}
export class BadRequestError extends CustomError {
  statusCode: number = HTTP_STATUS.BAD_REQUEST;
  status = 'error';

  constructor(message: string) {
    super(message);
  }
}

export class NotFoundError extends CustomError {
  statusCode: number = HTTP_STATUS.NOT_FOUND;
  status = 'error';

  constructor(message: string) {
    super(message);
  }
}

export class NotAuthorizedError extends CustomError {
  statusCode: number = HTTP_STATUS.UNAUTHORIZED;
  status = 'error';

  constructor(message: string) {
    super(message);
  }
}

export class FileTooLargeError extends CustomError {
  statusCode: number = HTTP_STATUS.REQUEST_TOO_LONG;
  status = 'error';

  constructor(message: string) {
    super(message);
  }
}

export class ServerError extends CustomError {
  statusCode: number = HTTP_STATUS.BAD_REQUEST;
  status = 'error';

  constructor(message: string) {
    super(message);
  }
}
