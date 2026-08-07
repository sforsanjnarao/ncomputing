// One error type for everything the client is allowed to see. Anything thrown
// that is *not* an ApiError is treated as a bug and reported as a generic 500,
// so internal messages never leak to the browser.
export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
    public details?: unknown
  ) {
    super(message);
    this.name = "ApiError";
  }
}

export const badRequest = (message: string, details?: unknown) => new ApiError(400, message, details);
export const unauthorized = (message = "You must be signed in.") => new ApiError(401, message);
export const forbidden = (message = "You do not have access to this resource.") => new ApiError(403, message);
export const notFound = (message = "Not found.") => new ApiError(404, message);
