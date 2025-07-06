using Laraue.Apps.PdfQL.Contracts;
using Laraue.PdfQL;
using Laraue.PdfQL.PdfObjects;
using Laraue.PdfQL.PdfObjects.Serializing;
using Tabula.Extractors;

namespace Laraue.Apps.PdfQL.AppServices;

public interface IPdfqlService
{
    RunQueryResult RunQuery(RunQueryRequest request);
    CheckQueryResult CheckQuery(CheckQueryRequest request);
}

public class PdfqlService : IPdfqlService
{
    private readonly IPdfqlExecutor _pSqlExecutor;
    private readonly ISerializer _serializer;

    public PdfqlService(IPdfqlExecutor pSqlExecutor, ISerializer serializer)
    {
        _pSqlExecutor = pSqlExecutor;
        _serializer = serializer;
    }

    public RunQueryResult RunQuery(RunQueryRequest request)
    {
        var pdfDocument = new PdfDocument(
            request.PdfBytes,
            new PdfDocumentOptions
            {
                ExtractionAlgorithm = new SpreadsheetExtractionAlgorithm()
            });

        var executionResult = _pSqlExecutor.TryExecutePdfql(request.Pdfql, pdfDocument);

        var errors = executionResult.Errors.Select(ToError).ToArray();
        
        if (errors.Length > 0)
            return new RunQueryResult(executionResult.Result, errors);
        
        var result = _serializer.ToJsonObject(executionResult.Result!);
        return new RunQueryResult(result, errors);
    }

    public CheckQueryResult CheckQuery(CheckQueryRequest request)
    {
        var checkResult = _pSqlExecutor.CheckSyntax(request.Pdfql);

        var errors = checkResult.Errors.Select(ToError).ToArray();
        
        return new CheckQueryResult(errors);
    }

    private QueryError ToError(PsqlCompileError error)
    {
        return new QueryError(
            error.Message,
            error.StartPosition,
            error.EndPosition,
            error.StartLineNumber,
            error.EndLineNumber);
    }
}