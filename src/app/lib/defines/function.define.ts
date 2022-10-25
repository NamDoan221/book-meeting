export const convertFileToBase64 = (file: File): Promise<string | ArrayBuffer> => {
  return new Promise((resolve) => {
    const reader = new FileReader();

    reader.readAsDataURL(file);
    reader.onload = (event) => {
      resolve(event.target?.result ?? '');
    };
  });
};