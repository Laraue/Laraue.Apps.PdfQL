namespace Laraue.Apps.PdfQL.Contracts;

public record RunQueryRequest(
    byte[] PdfBytes,
    string Pdfql,
    ExtractionAlgorithm ExtractionAlgorithm);

public enum ExtractionAlgorithm
{
    BasicExtractionAlgorithm,
    SpreadsheetExtractionAlgorithm,
}    