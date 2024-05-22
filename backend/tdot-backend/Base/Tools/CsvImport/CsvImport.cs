/*
  This file is part of  https://github.com/aiten/Framework.

  Copyright (c) Herbert Aitenbichler

  Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"),
  to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense,
  and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

  The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

  THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
  FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY,
  WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
*/

using System;
using System.Collections.Generic;
using System.Globalization;
using System.Linq;
using System.Reflection;
using System.Threading.Tasks;

namespace Base.Tools.CsvImport;

public class CsvImport<T> : CsvImportBase where T : class
{
    public class ColumnMapping
    {
        public required string ColumnName { get; set; }

        public PropertyInfo? MapTo  { get; set; }
        public bool          Ignore { get; set; }

        public string? CsvFormat { get; set; }

        public CultureInfo? DateTimeCultureInfo { get; set; }

        public NumberFormatInfo? NumberFormat { get; set; }

#pragma warning disable CS8632 // The annotation for nullable reference types should only be used in code within a '#nullable' annotations context.
        public Func<string, object?>?  GetValue    { get; set; }
        public Func<object?, object?>? AdjustValue { get; set; }
        public Action<T, string>?      SetValue    { get; set; }

#pragma warning restore CS8632

        public bool IsConfigured => Ignore || MapTo != null || SetValue != null;
        public bool IsMapped     => !Ignore && MapTo != null;
        public bool IsSetValue   => !Ignore && SetValue != null;
    }

    public ICollection<string>?         IgnoreColumns { get; set; }
    public IDictionary<string, string>? MapColumns    { get; set; }

    public IList<T> Read(string[] csvLines)
    {
        var lines = ReadStringMatrixFromCsv(csvLines, false);
        return MapTo(lines);
    }

    public IList<T> Read(string fileName)
    {
        var lines = ReadStringMatrixFromCsv(fileName, false);
        return MapTo(lines);
    }

    public async Task<IList<T>> ReadAsync(string fileName)
    {
        var lines = await ReadStringMatrixFromCsvAsync(fileName, false);
        return MapTo(lines);
    }

    public IList<T> MapTo(IList<IList<string>> lines)
    {
        // first line is columnLineHeader!!!!

        var mapping = GetPropertyMapping(lines[0]);
        CheckPropertyMapping(mapping);

        var list  = new List<T>();
        var first = true;

        foreach (var line in lines)
        {
            if (first)
            {
                first = false;
            }
            else
            {
                list.Add(Map(line, mapping));
            }
        }

        return list;
    }

    private void CheckPropertyMapping(ColumnMapping[] mapping)
    {
        var notConfigured = mapping.Where(m => !m.IsConfigured).ToList();
        if (notConfigured.Any())
        {
            foreach (var col in notConfigured)
            {
                if (typeof(T).GetField(col.ColumnName, BindingFlags.IgnoreCase | BindingFlags.Instance | BindingFlags.NonPublic | BindingFlags.Public) != null)
                {
                    throw new ArgumentException($"Column ist mapped to field instead of a property: {col.ColumnName}");
                }

                if (typeof(T).GetProperty(col.ColumnName, BindingFlags.IgnoreCase | BindingFlags.Instance | BindingFlags.NonPublic | BindingFlags.Public) != null)
                {
                    throw new ArgumentException($"Column ist mapped to none public property: {col.ColumnName}");
                }
            }

            var columnList = string.Join(", ", notConfigured.Select(m => m.ColumnName));
            throw new ArgumentException($"Column cannot be mapped: {columnList}");
        }

        var notCanWrite = mapping.Where(x => x.IsMapped && !x.MapTo!.CanWrite).ToList();
        if (notCanWrite.Any())
        {
            var columnList = string.Join(", ", notCanWrite.Select(m => m.ColumnName));
            throw new ArgumentException($"Column is readonly: {columnList}");
        }
    }

    protected virtual ColumnMapping[] GetPropertyMapping(IList<string> columnNames)
    {
        return columnNames
            .Select(GetColumnMapping)
            .ToArray();
    }

    public Action<ColumnMapping>? ConfigureColumnMapping { get; set; }

    protected virtual ColumnMapping GetColumnMapping(string columnName)
    {
        var ignoreColumn = IgnoreColumns?.Contains(columnName, StringComparer.InvariantCultureIgnoreCase) ?? false;
        var mapToColumn  = (MapColumns?.ContainsKey(columnName) ?? false) ? MapColumns[columnName] : columnName;

        var columnMapping = new ColumnMapping
        {
            ColumnName = columnName,
            Ignore     = ignoreColumn,
            MapTo      = ignoreColumn ? null : GetPropertyInfo(mapToColumn),
        };

        if (columnMapping.MapTo != null)
        {
            if (columnMapping.MapTo.GetCustomAttributes(typeof(CsvImportFormatAttribute)).FirstOrDefault() is CsvImportFormatAttribute formatAttribute)
            {
                columnMapping.CsvFormat = formatAttribute.Format;
                if (!string.IsNullOrEmpty(formatAttribute.Culture))
                {
                    columnMapping.DateTimeCultureInfo = CultureInfo.GetCultureInfo(formatAttribute.Culture);
                }
            }
        }

        ConfigureColumnMapping?.Invoke(columnMapping);
        return columnMapping;
    }

    public static PropertyInfo? GetPropertyInfo(string columnName)
    {
        return typeof(T).GetProperty(columnName, BindingFlags.IgnoreCase | BindingFlags.Public | BindingFlags.Instance);
    }

    private T Map(IList<string> line, ColumnMapping[] mapping)
    {
        // because the T may be with "required", we cant use new() any more 
        // var  newT = new T();
        // now create it with reflection

        var newT = (T)Activator.CreateInstance(typeof(T))!;

        if (mapping.Length < line.Count)
        {
            var message = $"Line '{string.Join(",", line)}' has to many columns";
            throw new ArgumentException(message);
        }

        var idx = 0;
        foreach (var column in line)
        {
            AssignProperty(newT, column, mapping[idx++]);
        }

        return newT;
    }

#pragma warning disable 8632
    private object? GetValue(string valueAsString, Type asType, ColumnMapping mapping)
#pragma warning restore 8632
    {
        if (asType.IsGenericType && asType.GetGenericTypeDefinition() == typeof(Nullable<>))
        {
            if (string.IsNullOrEmpty(valueAsString))
            {
                return null;
            }

            asType = asType.GenericTypeArguments[0];
        }

        try
        {
            if (asType == typeof(string))
            {
                return ExcelString(valueAsString);
            }
            else if (asType == typeof(int))
            {
                return ExcelInt(valueAsString);
            }
            else if (asType == typeof(long))
            {
                return ExcelLong(valueAsString);
            }
            else if (asType == typeof(short))
            {
                return ExcelShort(valueAsString);
            }
            else if (asType == typeof(uint))
            {
                return ExcelUInt(valueAsString);
            }
            else if (asType == typeof(ulong))
            {
                return ExcelULong(valueAsString);
            }
            else if (asType == typeof(ushort))
            {
                return ExcelUShort(valueAsString);
            }
            else if (asType == typeof(decimal))
            {
                return ExcelDecimal(valueAsString, mapping.NumberFormat ?? NumberFormat);
            }
            else if (asType == typeof(byte))
            {
                return ExcelByte(valueAsString);
            }
            else if (asType == typeof(bool))
            {
                return ExcelBool(valueAsString);
            }
            else if (asType == typeof(DateTime))
            {
                return ExcelDateOrDateTime(valueAsString, mapping.CsvFormat, mapping.DateTimeCultureInfo ?? DateTimeCultureInfo);
            }
            else if (asType == typeof(DateOnly))
            {
                return ExcelDateOnly(valueAsString, mapping.CsvFormat ?? DateFormat, mapping.DateTimeCultureInfo ?? DateTimeCultureInfo);
            }
            else if (asType == typeof(TimeOnly))
            {
                return ExcelTimeOnly(valueAsString, mapping.CsvFormat ?? TimeFormat, mapping.DateTimeCultureInfo ?? DateTimeCultureInfo);
            }
            else if (asType == typeof(TimeSpan))
            {
                return ExcelTimeSpan(valueAsString);
            }
            else if (asType == typeof(float))
            {
                return ExcelFloat(valueAsString, mapping.NumberFormat ?? NumberFormat);
            }
            else if (asType == typeof(double))
            {
                return ExcelDouble(valueAsString, mapping.NumberFormat ?? NumberFormat);
            }
            else if (asType.IsEnum)
            {
                return ExcelEnum(asType, valueAsString);
            }
            else if (asType == typeof(byte[]))
            {
                return ExcelImage(valueAsString);
            }
        }
        catch (FormatException e)
        {
            throw new ArgumentException($"Illegal value for column '{mapping.ColumnName}:{asType.Name}': {valueAsString}", e);
        }

        throw new ArgumentException($"Illegal type of column '{mapping.ColumnName}': {asType.Name}");
    }

    private void AssignProperty(object obj, string valueAsString, ColumnMapping mapping)
    {
        if (mapping.IsSetValue)
        {
            mapping.SetValue!((T)obj, valueAsString);
        }
        else if (mapping.IsMapped)
        {
            var mapTo = mapping.MapTo;
#pragma warning disable 8632
            object? val = mapping.GetValue != null
                ? mapping.GetValue(valueAsString)
                : GetValue(valueAsString, mapTo!.PropertyType, mapping);
#pragma warning restore 8632

            if (mapping.AdjustValue != null)
            {
                val = mapping.AdjustValue(val);
            }

            mapTo!.SetValue(obj, val);
        }
    }
}