export class ValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ValidationError';
  }
}

export class DuplicateNameError extends ValidationError {
  constructor(itemType: string, name: string) {
    super(`${itemType} with name "${name}" already exists! Please choose a different name.`);
    this.name = 'DuplicateNameError';
  }
}
