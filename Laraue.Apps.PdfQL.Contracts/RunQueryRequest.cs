namespace Laraue.Apps.PdfQL.Contracts;

public record RunQueryRequest(
    byte[] PdfBytes,
    string Pdfql);