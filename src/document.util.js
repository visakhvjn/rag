export const chunkDocument = (document, chunkSize) => {
  const chunks = [];
  
  for (let i = 0; i < document.length; i += chunkSize) {
    chunks.push(document.slice(i, i + chunkSize));
  }

  return chunks;
};