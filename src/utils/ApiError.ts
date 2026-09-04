export class ApiError extends Error {
  statusCode: number;
  isOperational: boolean;
  details?: unknown;
  code: string;
  hint?: string;

  constructor(
    statusCode: number,
    message: string,
    details?: unknown,
    options: {
      code?: string;
      hint?: string;
      isOperational?: boolean;
    } = {},
  ) {
    super(message);

    this.statusCode = statusCode;
    this.details = details;
    this.code =
      options.code ??
      ApiError.getDefaultCode(statusCode);
    this.hint = options.hint;
    this.isOperational =
      options.isOperational ?? true;

    Error.captureStackTrace(this, this.constructor);
  }

  private static getDefaultCode(
    statusCode: number,
  ) {
    switch (statusCode) {
      case 400:
        return "bad_request";
      case 401:
        return "unauthorized";
      case 403:
        return "forbidden";
      case 404:
        return "not_found";
      case 409:
        return "conflict";
      case 429:
        return "too_many_requests";
      default:
        return statusCode >= 500
          ? "internal_server_error"
          : "error";
    }
  }
}
