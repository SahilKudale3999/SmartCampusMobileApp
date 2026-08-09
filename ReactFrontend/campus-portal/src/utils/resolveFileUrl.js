const BACKEND_BASE_URL = "http://localhost:8080";

export function resolveFileUrl(fileUrl) {
  if (!fileUrl) return null;
  if (fileUrl.startsWith("http://") || fileUrl.startsWith("https://")) {
    return fileUrl;
  }
  const path = fileUrl.startsWith("/") ? fileUrl : "/" + fileUrl;
  return BACKEND_BASE_URL + path;
}