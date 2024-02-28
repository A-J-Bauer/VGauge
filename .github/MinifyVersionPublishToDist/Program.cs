
using System;
using System.Diagnostics;
using System.IO;
using System.Text;
using System.Text.Json;
using System.Xml;
using System.Xml.Linq;

// author: A.J.Bauer

/*  
    Input path to .csproj relative to repo root e.g. myproj/myproj.csproj

    Parse.csproj file for Version and Title
    Get json versions array from NuGet
    Check if version found in csproj is in the array
   
    if successful writes:
    
    check_version_published=yes
    check_version_published=no

    return 0     on success    
    return >0   failure
*/

Console.WriteLine("");

string currentDirectory = Directory.GetCurrentDirectory();
string[] files = Directory.GetFiles(currentDirectory);

Console.WriteLine("Files in the current directory:");
foreach (string file in files)
{
    Console.WriteLine(file);
}


//var minifier = new Microsoft.Ajax.Utilities.Minifier();
//var minifiedString = minifier.MinifyJavaScript(unMinifiedString);