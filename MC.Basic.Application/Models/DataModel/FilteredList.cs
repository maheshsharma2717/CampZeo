namespace MC.Basic.Application.Models.DataModel;

public class FilteredList
{
    public int PageSize { get; set; } = 10;
    public int PageNumber { get; set; } = 1;
    public string SearchText { get; set; } = "";
    public bool? IsDeleted { get; set; }

    public string SortBy { get; set; } = "";
    public bool SortDesc { get; set; } = false;
}
