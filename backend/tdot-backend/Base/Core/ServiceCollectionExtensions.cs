namespace Base.Core;

using System;
using System.Linq;
using System.Reflection;

using Microsoft.Extensions.DependencyInjection;

public static class ServiceCollectionExtensions
{
    /// <summary>
    /// Registers public and internal types of the given assemblies with the unity services. This is necessary
    /// to workaround the internals visible to hacks in the code base.
    /// </summary>
    /// <param name="services">Dependency services.</param>
    /// <param name="liveTime"></param>
    /// <param name="assemblies">List of assemblies in which all types should be registered with their interfaces.
    /// This includes internal types. </param>
    /// <returns>This instance.</returns>
    public static IServiceCollection AddAssemblyIncludingInternals(this IServiceCollection services, ServiceLifetime liveTime, params Assembly[] assemblies)
    {
        foreach (var assembly in assemblies)
        {
            foreach (var type in assembly.GetTypes().Where(t => t.IsClass && !t.IsAbstract))
            {
                var interfaceName = "I" + type.Name;
                var interfaceType = type.GetInterface(interfaceName);
                if (interfaceType != null)
                {
                    services.Add(new ServiceDescriptor(interfaceType, type, liveTime));
                }
            }
        }

        return services;
    }

    public static IServiceCollection AddAssemblyByName(this IServiceCollection services, Func<string, bool> checkName, ServiceLifetime liveTime, params Assembly[] assemblies)
    {
        foreach (var assembly in assemblies)
        {
            foreach (var type in assembly.GetTypes().Where(t => t.IsClass && !t.IsAbstract))
            {
                if (checkName(type.Name))
                {
                    services.Add(new ServiceDescriptor(type, type, liveTime));
                }
            }
        }

        return services;
    }
}