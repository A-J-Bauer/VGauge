using System;
using System.Diagnostics;
using System.IO;
using System.Runtime.CompilerServices;
using System.Text;
using System.Text.Json;
using System.Xml;
using System.Xml.Linq;

// author: A.J.Bauer

namespace MinifyVersionPublishToDist
{
    public static class Echo
    {
        public static void WriteLine(string? message)
        {
            Console.WriteLine(message);
        }

        public static class Debug
        {
            public static void WriteLine(string? message)
            {
                Echo.WriteLine($"echo \"::debug::{message}\"");
            }
        }

        public static class Warning
        {
            public static void WriteLine(string? message, [CallerLineNumber] int line = 0, [CallerMemberName] string? caller = null)
            {
                Echo.WriteLine($"echo \"::warning file={"Program.cs"},line={line},endLine={line},title={"warning"}::{message}\"");
            }

        }
    }


    class Program
    {

        static void Main(string[] args)
        {
            Echo.Debug.WriteLine("Houston?");
            Echo.Warning.WriteLine("Texas?");


            Environment.Exit(0);
        }
    }
    //string[] cmdargs = Environment.GetCommandLineArgs();
    //Echo.WriteLine(cmdargs[0]);

    //string currentDirectory = Directory.GetCurrentDirectory();
    //string[] files = Directory.GetFiles(currentDirectory);

    //Echo.WriteLine("Files in the current directory:");
    //foreach (string file in files)
    //{
    //    Debug.WriteLine(file);
    //}

    //string houston = "Houston?";

    //Console.WriteLine($"messageFromEagle={houston}");


    //var minifier = new Microsoft.Ajax.Utilities.Minifier();
    //var minifiedString = minifier.MinifyJavaScript(unMinifiedString);




}





