import AppError from "./AppError"
export default class NotFoundError extends AppError {
  constructor(message = 'Resource not found') {
    super(404, message);
  }
}