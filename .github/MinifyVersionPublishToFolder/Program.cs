using Ext.Net.Utilities;
using System;
using System.Diagnostics;
using System.IO;
using System.Linq;
using System.Runtime.CompilerServices;
using System.Security.Cryptography;
using System.Text;
using System.Text.Json;
using System.Xml;
using System.Xml.Linq;

// author: A.J.Bauer

namespace MinifyVersionPublishToDist
{
    public static class Echo
    {
        public static void WriteLine(string message)
        {
            Console.WriteLine(message);
        }

        public static class Debug
        {
            public static void WriteLine(string message)
            {
                Echo.WriteLine($"::debug::{message}");
            }
        }

        public static class Warning
        {
            public static void WriteLine(string message, [CallerLineNumber] int line = 0, [CallerMemberName] string caller = null)
            {
                Echo.WriteLine($"::warning file={"Program.cs"},line={line},endLine={line},title={"warning"}::{message}");
            }
        }

        public static class Error
        {
            public static void WriteLine(string message, [CallerLineNumber] int line = 0, [CallerMemberName] string caller = null)
            {
                Echo.WriteLine($"::error file={"Program.cs"},line={line},endLine={line},title={"error"}::{message}");
            }
        }

        public static class Notice
        {
            public static void WriteLine(string message, [CallerLineNumber] int line = 0, [CallerMemberName] string caller = null)
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

            //string[] files = Directory.GetFiles(currentDirectory);

            bool error = false;

            string currentDirectory = Directory.GetCurrentDirectory();

            string filepath = "";
            string filename = "";
            string version = "";
            string firstline = "";
            string dirpath = "";
            string integrityfilepath = "";
            string filenameWithoutExtension = "";
            string minfilepath = "";
            string unminfilepath = "";
            byte[] sha384HashBytes = { 0 };
            string sha384hashBase64 = "";
            string integrity = "";


            if (args.Length == 2)
            {
                filepath = Path.Combine(currentDirectory, args[0]);
                dirpath = Path.Combine(currentDirectory, args[1]);
                integrityfilepath = Path.Combine(dirpath, "integrity.txt");

                if (File.Exists(filepath))
                {
                    if (Directory.Exists(dirpath))
                    {
                        filename = Path.GetFileName(filepath);
                    }
                    else
                    {
                        error = true;
                        Echo.Debug.WriteLine($"the specified folder '{dirpath}' was not found");
                    }
                }
                else
                {
                    error = true;
                    Echo.Debug.WriteLine($"the specified file '{filename}' was not found");
                }
            }
            else
            {
                error = true;
                Echo.Debug.WriteLine("Bad arguments");
            }

            if (!error)
            {
                try
                {
                    using (StreamReader streamReader = new StreamReader(filepath))
                    {
                        firstline = streamReader.ReadLine();
                        string[] lineSplit = firstline.Split(new string[] { "//", "," }, StringSplitOptions.TrimEntries | StringSplitOptions.RemoveEmptyEntries);

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
                                    unminfilepath = Path.Combine(dirpath, filenameWithoutExtension + "-" + version + ".js");

                                    if (File.Exists(minfilepath))
                                    {
                                        error = true;
                                        Echo.Debug.WriteLine("Minification failed, target min file already exists");
                                    }
                                }
                                else
                                {
                                    error = true;
                                    Echo.Debug.WriteLine($"first line of source file malformed, first string after comment in first line of {filename} does not match the filename");
                                }
                            }
                            else
                            {
                                error = true;
                                Echo.Debug.WriteLine("first line of source file malformed, could not find version in first line of source file");
                            }
                        }
                        else
                        {
                            error = true;
                            Echo.Debug.WriteLine("first line of source file malformed,  e.g. // myfile.js 1.0.2 ");
                        }
                    }
                }
                catch (Exception ex)
                {
                    error = true;
                    Echo.Debug.WriteLine($"could not read first line of source file: {ex.Message}");
                }
            }

            if (!error)
            {
                try
                {
                    File.Copy(filepath, unminfilepath, true);
                }
                catch (Exception ex)
                {
                    error = true;
                    Echo.Debug.WriteLine($"could not create version named copy: {ex.Message}");
                }
            }

            if (!error)
            {
                try
                {
                    var jsMin = new JSMin(firstline!);
                    using (StreamReader streamReader = new StreamReader(filepath))
                    using (StreamWriter streamWriter = new StreamWriter(minfilepath))
                    {
                        jsMin.Minify(streamReader, streamWriter);
                    }
                }
                catch (Exception ex)
                {
                    error = true;
                    Echo.Debug.WriteLine($"JSMin minification failed: {ex.Message}");
                }
            }

            if (!error)
            {
                try
                {
                    using (FileStream fileStream = new FileStream(minfilepath, FileMode.Open, FileAccess.Read))
                    using (SHA384 sha384 = SHA384.Create())
                    {
                        sha384HashBytes = sha384.ComputeHash(fileStream);
                    }
                }
                catch (Exception ex)
                {
                    error = true;
                    Echo.Debug.WriteLine($"could not create sha384 hash of {args[0]}: {ex.Message}");
                }
            }

            if (!error)
            {
                try
                {
                    sha384hashBase64 = Convert.ToBase64String(sha384HashBytes!); ;
                    integrity = $"sha384-{sha384hashBase64}";
                }
                catch (Exception ex)
                {
                    error = true;
                    Echo.Debug.WriteLine($"could not convert sha384 byte array to base64: {ex.Message}");
                }
            }

            if (!error)
            {
                try
                {
                    using (StreamWriter streamWriter = new StreamWriter(integrityfilepath, true))
                    {
                        //vgauge-1.0.0.min.js" integrity="sha384-    " crossorigin="anonymous"
                        streamWriter.WriteLine($"{Path.GetFileName(minfilepath)}\" integrity=\"{integrity}\" crossorigin=\"anonymous\"");
                    }
                }
                catch (Exception ex)
                {
                    error = true;
                    Echo.Debug.WriteLine($"could not create or append to {integrityfilepath}: {ex.Message}");
                }
            }

            if (error)
            {
                Echo.Error.WriteLine("MinifyVersionPublishToFolder failed");
            }
            else
            {
                Echo.Notice.WriteLine($"Minified {filename}, version={version} to {args[1]}, added sha384 hash to {Path.GetFileName(integrityfilepath)}");
                Environment.SetEnvironmentVariable("GITHUB_OUTPUT", $"version={version}");
            }

            Environment.Exit(error ? 1 : 0);
        }
    }



}





