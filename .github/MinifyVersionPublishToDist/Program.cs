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
                Echo.WriteLine($"::debug::{message}");
            }
        }

        public static class Warning
        {
            public static void WriteLine(string? message, [CallerLineNumber] int line = 0, [CallerMemberName] string? caller = null)
            {
                Echo.WriteLine($"::warning file={"Program.cs"},line={line},endLine={line},title={"warning"}::{message}");
            }
        }

        public static class Error
        {
            public static void WriteLine(string? message, [CallerLineNumber] int line = 0, [CallerMemberName] string? caller = null)
            {
                Echo.WriteLine($"::error file={"Program.cs"},line={line},endLine={line},title={"error"}::{message}");
            }
        }

        public static class Notice
        {
            public static void WriteLine(string? message, [CallerLineNumber] int line = 0, [CallerMemberName] string? caller = null)
            {
                Echo.WriteLine($"::notice file={"Program.cs"},line={line},endLine={line},title={"notice"}::{message}");
            }
        }
    }


    class Program
    {

        static void Main(string[] args)
        {
            Echo.Notice.WriteLine("Eagle?");
            Echo.Error.WriteLine("Apollo?");
            Echo.Debug.WriteLine("Houston?");
            Echo.Warning.WriteLine("Texas?");

            //string[] args = Environment.GetCommandLineArgs();
            for (int i = 0; i < args.Length; i++)
            {
                Echo.Debug.WriteLine(args[i]);
            }

            string currentDirectory = Directory.GetCurrentDirectory();
            string[] files = Directory.GetFiles(currentDirectory);

            Echo.Debug.WriteLine("Files in the current directory:");
            foreach (string file in files)
            {
                Echo.Debug.WriteLine(file);
            }


            //var minifier = new Microsoft.Ajax.Utilities.Minifier();
            //var minifiedString = minifier.MinifyJavaScript(unMinifiedString);





            Environment.Exit(0);
        }
    }





}





