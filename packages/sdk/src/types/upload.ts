export interface PresignedUploadInput {
  filename: string;
  mimeType: string;
  folder?: string;
}

export interface PresignedUrlResponse {
  uploadUrl: string;
  downloadUrl: string;
  key: string;
}

export interface UploadResponse {
  url: string;
  key: string;
  size: number;
  mimeType: string;
}
