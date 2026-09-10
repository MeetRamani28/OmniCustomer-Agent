export const uploadFile = async (
  file: File,
): Promise<{ filename: string; path: string }> => {
  const formData = new FormData();
  formData.append("file", file);

  const response = await fetch("/api/upload", {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    throw new Error("File upload failed");
  }

  return response.json();
};

export const checkHealth = async (): Promise<{ status: string }> => {
  const response = await fetch("/api/health");
  if (!response.ok) {
    throw new Error("Health check failed");
  }
  return response.json();
};
