using Laraue.Apps.PdfQL.AppServices;
using Laraue.Apps.PdfQL.Contracts;
using Microsoft.AspNetCore.Mvc;

namespace Laraue.Apps.PdfQL.WebApi.Controllers;

[ApiController]
[Route("api/v1/psql")]
public class PSqlController : ControllerBase
{
    private readonly IPdfqlService _pdfqlService;

    public PSqlController(IPdfqlService pdfqlService)
    {
        _pdfqlService = pdfqlService;
    }

    [HttpPost("run-query")]
    public RunQueryResult RunQuery(
        [FromBody] RunQueryRequest request)
    {
        return _pdfqlService.RunQuery(request);
    }
    
    [HttpPost("check-query")]
    public CheckQueryResult CheckQuery(
        [FromBody] CheckQueryRequest request)
    {
        return _pdfqlService.CheckQuery(request);
    }
}