namespace Laraue.Apps.PdfQL.Contracts;

public record QueryError(
    string Message,
    int StartPosition,
    int EndPosition,
    int StartLineNumber,
    int EndLineNumber);