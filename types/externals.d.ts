// Ambient-Deklarationen für Libraries ohne mitgelieferte Typen.
// Beide werden zur Laufzeit als externe CommonJS-Module geladen (siehe
// next.config.mjs -> serverComponentsExternalPackages); der Default-Export
// entspricht dann module.exports.

declare module "mammoth" {
  const mammoth: {
    extractRawText(input: {
      buffer: Buffer;
    }): Promise<{ value: string; messages: unknown[] }>;
  };
  export default mammoth;
}

declare module "pdf-parse/lib/pdf-parse.js" {
  const pdfParse: (
    buffer: Buffer,
  ) => Promise<{ text: string; numpages: number; info: unknown }>;
  export default pdfParse;
}
