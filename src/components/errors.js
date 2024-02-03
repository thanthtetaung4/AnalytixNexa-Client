class FileUploadError extends Error {
  constructor(message, code) {
    super(message);
    this.name = "FileUploadError";
    this.code = code;
  }
}

export { FileUploadError };
