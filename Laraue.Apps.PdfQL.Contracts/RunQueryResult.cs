namespace Laraue.Apps.PdfQL.Contracts;

public record RunQueryResult(
    object? Result,
    QueryError[] Errors);