export class RequiredParameterError extends Error {
    constructor(param) {
        super(`${param} cannot be null or undefined`);

        if (Error.captureStackTrace) {
            Error.captureStackTrace(this, RequiredParameterError);
        }
    }
}

export class InvalidPropertyError extends Error {
    constructor(msg) {
        super(msg);

        if (Error.captureStackTrace) {
            Error.captureStackTrace(this, InvalidPropertyError);
        }
    }
}

export class UniqueContantError extends Error {
    constructor(value) {
        super(`${value} must be unique.`)

        if (Error.captureStackTrace) {
            Error.captureStackTrace(this, UniqueConstraintError)
        }
    }
}

