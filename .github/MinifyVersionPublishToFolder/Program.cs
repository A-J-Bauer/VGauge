using Ext.Net.Utilities;
using System;
using System.Diagnostics;
using System.IO;
using System.Linq;
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
            //Echo.Notice.WriteLine("Eagle?");
            //Echo.Error.WriteLine("Apollo?");
            //Echo.Debug.WriteLine("Houston?");
            //Echo.Warning.WriteLine("Texas?");

            bool error = false;

            string currentDirectory = Directory.GetCurrentDirectory();
            string filepath = "";
            string filename = "";
            string version = "";
            string? firstline = null;
            string dirpath = args[1];
            string filenameWithoutExtension = "";
            string minfilepath = "";


            //string[] files = Directory.GetFiles(currentDirectory);

            if (args.Length == 2)
            {
                filepath = Path.Combine(currentDirectory, args[0]);
                dirpath = Path.Combine(currentDirectory, args[1]);

                if (File.Exists(filepath))
                {
                    if (Directory.Exists(dirpath))
                    {
                        filename = Path.GetFileName(filepath);
                    }
                    else
                    {
                        error = true;
                        Echo.Error.WriteLine($"the specified folder '{dirpath}' was not found");
                    }
                }
                else
                {
                    error = true;
                    Echo.Error.WriteLine($"the specified file '{filename}' was not found");
                }
            }
            else
            {
                error = true;
                Echo.Error.WriteLine("Bad arguments");
            }

            if (!error)
            {
                try
                {
                    using (StreamReader streamReader = new StreamReader(filepath))
                    {
                        firstline = streamReader.ReadLine();
                        string[] lineSplit = firstline!.Split(new string[] { "//", "," }, StringSplitOptions.TrimEntries | StringSplitOptions.RemoveEmptyEntries);

                        if (lineSplit.Length > 0)
                        {
                            string[] versionSplit = lineSplit[0].Split(' ', StringSplitOptions.RemoveEmptyEntries);
                            if (versionSplit.Length == 2)
                            {
                                if (versionSplit[0] == filename)
                                {
                                    version = versionSplit[1];
                                    filenameWithoutExtension = Path.GetFileNameWithoutExtension(filepath);
                                    minfilepath = Path.Combine(dirpath, filenameWithoutExtension + "-" + version + ".min.js");

                                    if (File.Exists(minfilepath))
                                    {
                                        error = true;
                                        Echo.Error.WriteLine("Minification failed, target min file already exists");
                                    }
                                }
                                else
                                {
                                    error = true;
                                    Echo.Debug.WriteLine($"First string after comment in first line of {filename} does not match the filename");
                                    Echo.Error.WriteLine("Minification failed, first line of source file malformed");
                                }
                            }
                            else
                            {
                                error = true;
                                Echo.Debug.WriteLine("Could not find version in first line of source file");
                                Echo.Error.WriteLine("first line of source file malformed");
                            }
                        }
                        else
                        {
                            error = true;
                            Echo.Debug.WriteLine("The first line in the source file has to start with: // filename.js version e.g. // myfile.js 1.0.2 ");
                            Echo.Error.WriteLine("Minification failed, first line of source file malformed");
                        }
                    }
                }
                catch (Exception ex)
                {
                    error = true;
                    Echo.Debug.WriteLine(ex.Message);
                    Echo.Error.WriteLine("Minification failed, could not read first line of source file");
                }
            }

            if (!error)
            {
                Echo.Notice.WriteLine($"Minifying {filename}, version={version}");

                try
                {
                    var jsMin = new JSMin(firstline!);
                    using (StreamReader streamReader = new StreamReader(filepath))
                    using (StreamWriter streamWriter = new StreamWriter(minfilepath))
                    {
                        jsMin.Minify(streamReader, streamWriter);
                    }

                    Echo.WriteLine($"::exportVariable check_new_version_for_dist=yes");
                }
                catch (Exception ex)
                {
                    error = true;
                    Echo.Debug.WriteLine(ex.Message);
                    Echo.Error.WriteLine("JSMin minification failed");
                }
            }

            Environment.Exit(error ? 1 : 0);
        }
    }



}





