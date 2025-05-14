
namespace MC.Basic.Application.Contracts.Infrasructure
{
    public interface IGeminiService
    {
        Task<string> TestPrompt(string prompt);
    }
}