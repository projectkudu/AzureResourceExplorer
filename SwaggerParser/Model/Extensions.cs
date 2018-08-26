using System.Text.RegularExpressions;

namespace ARMExplorer.SwaggerParser.Model
{
    public static class Extensions
    {
        public static string AdjustGithubUrl(this string url) => Regex.Replace(url,
            @"^((http|https)\:\/\/)?github\.com\/(?<user>[^\/]+)\/(?<repo>[^\/]+)\/blob\/(?<branch>[^\/]+)\/(?<file>.+)$",
            @"https://raw.githubusercontent.com/${user}/${repo}/${branch}/${file}");

        public static string StripControlCharacters(this string input)
        {
            return string.IsNullOrWhiteSpace(input) ? input : Regex.Replace(input, @"[\ca-\cz-[\cj\cm\ci]]", string.Empty);
        }

    }
}
