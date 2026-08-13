const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://api.rugeriosroofing.com/api';

export function getAuthToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('admin_token');
}

export function setAuthToken(token: string): void {
  if (typeof window !== 'undefined') {
    localStorage.getItem('admin_token');
    localStorage.setItem('admin_token', token);
  }
}

export function removeAuthToken(): void {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('admin_token');
  }
}

export async function apiFetch<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = getAuthToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    let errorMessage = `HTTP Error ${response.status}`;
    try {
      const errorData = await response.json();
      errorMessage = errorData.message || errorData.error || errorMessage;
    } catch {
      // Ignore JSON parse error
    }
    throw new Error(errorMessage);
  }

  return response.json() as Promise<T>;
}

export async function uploadFileToS3(
  file: File,
  folder: string = 'portfolio'
): Promise<{ fileUrl: string; s3Key: string }> {
  // 1. Obtener Presigned URL de la API
  const presignedData = await apiFetch<{
    uploadUrl: string;
    fileUrl: string;
    s3Key: string;
  }>('/upload/presigned-url', {
    method: 'POST',
    body: JSON.stringify({
      filename: file.name,
      contentType: file.type || 'image/jpeg',
      folder,
    }),
  });

  // 2. Subir directamente a S3 / CloudFront usando presigned uploadUrl
  const s3Response = await fetch(presignedData.uploadUrl, {
    method: 'PUT',
    headers: {
      'Content-Type': file.type || 'image/jpeg',
    },
    body: file,
  });

  if (!s3Response.ok) {
    throw new Error('Error al subir el archivo directamente a AWS S3');
  }

  return {
    fileUrl: presignedData.fileUrl,
    s3Key: presignedData.s3Key,
  };
}
