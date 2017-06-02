using System;

namespace ARMExplorer.SwaggerParser
{
    public interface IFileSystem
    {
        string ReadAllText(string path);
        bool IsCompletePath(string filePath);
        string MakePathRooted(Uri rootPath, string relativePath);
        Uri GetParentDir(string currentFilePath);
    }
}