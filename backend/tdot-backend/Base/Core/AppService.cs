namespace Base.Core;

using System;

using Microsoft.Extensions.DependencyInjection;

public static class AppService
{
    public static IServiceCollection? ServiceCollection { get; set; }

    public static void BuildServiceProvider()
    {
        ServiceProvider = ServiceCollection!.BuildServiceProvider();
    }

    public static IServiceProvider? ServiceProvider { get; set; }

    public static T GetRequiredService<T>() where T : notnull
    {
        return ServiceProvider!.GetRequiredService<T>();
    }
}