export interface PdfqlError {
    message: string;
    startPosition: number;
    endPosition: number;
    startLineNumber: number;
    endLineNumber: number;
}