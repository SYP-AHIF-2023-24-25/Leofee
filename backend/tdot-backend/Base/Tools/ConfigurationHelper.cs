namespace Base.Tools;

using System;

using Microsoft.Extensions.Configuration;

public static class ConfigurationHelper
{
    public static IConfiguration GetConfiguration()
    {
        var configuration = new ConfigurationBuilder()
            .SetBasePath(Environment.CurrentDirectory)
            .AddJsonFile("appsettings.json")
            .Build();
        return configuration;
    }


    public static string Get(this IConfiguration configuration, string key, string? section = null)
    {
        if (section != null)
        {
            var appSettingsSection = configuration.GetSection(section);
            if (!appSettingsSection.Exists())
            {
                throw new ApplicationException($"GetConfiguration; Section: {section} doesn't exist");
            }

            var sectionValue = appSettingsSection[key];
            if (string.IsNullOrEmpty(sectionValue))
            {
                throw new ApplicationException($"GetConfiguration; Section: {section}, Key: {key} doesn't exist");
            }

            return sectionValue;
        }

        var value = configuration[key];
        if (string.IsNullOrEmpty(value))
        {
            throw new ApplicationException($"GetConfiguration; Section: {section}, Key: {key} doesn't exist");
        }

        return value;
    }
}