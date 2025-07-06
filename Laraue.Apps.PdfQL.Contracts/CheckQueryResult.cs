namespace Laraue.Apps.PdfQL.Contracts;

public record CheckQueryResult(
    QueryError[] Errors);