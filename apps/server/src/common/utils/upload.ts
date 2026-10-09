import { v7 as uuidv7 } from 'uuid';
import { ApiError } from '../errors/api-error.js';

const FOLDER_PATTERN = /^[a-zA-Z0-9_-]+(?:\/[a-zA-Z0-9_-]+)*$/;
const DEFAULT_FOLDER = 'uploads';
const MAX_FOLDER_LENGTH = 128;
const MAX_FILENAME_LENGTH = 200;

export function resolveUploadFolder(value: unknown): string {
  if (typeof value !== 'string' || value.length === 0) {
    return DEFAULT_FOLDER;
  }
  if (value.length > MAX_FOLDER_LENGTH || !FOLDER_PATTERN.test(value)) {
    throw ApiError.badRequest('Invalid upload folder');
  }
  return value;
}

function sanitizeFilename(filename: string): string {
  const sanitized = filename
    .replace(/[^a-zA-Z0-9._-]/g, '_')
    .replace(/^\.+/, '')
    .slice(0, MAX_FILENAME_LENGTH);
  return sanitized.length > 0 ? sanitized : 'file';
}

export function buildObjectKey(folder: string, filename: string): string {
  const safeFolder = resolveUploadFolder(folder);
  return `${safeFolder}/${uuidv7()}-${sanitizeFilename(filename)}`;
}
