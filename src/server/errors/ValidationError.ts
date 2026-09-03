import AppError from "./AppError"
export default class ValidationError extends AppError {
  constructor(message = 'Validation Failed') {
    super(400, message);
  }
}

