#FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
#WORKDIR /src

#COPY ./WebAPI/WebAPI.csproj .
#RUN dotnet restore

#COPY . .
#RUN dotnet publish ./WebAPI/WebAPI.csproj -c Release -o /app/publish

#FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS final
#WORKDIR /app

#ENV ASPNETCORE_ENVIRONMENT=Production

#COPY --from=build /app/publish .

#EXPOSE 80
#EXPOSE 443

#ENTRYPOINT ["dotnet", "WebAPI.dll"]
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
ARG BUILD_CONFIGURATION=Release
WORKDIR /src
COPY ["Base/Base.csproj", "Base/"]
COPY ["Core/Core.csproj", "Core/"]
COPY ["Persistence/Persistence.csproj", "Persistence/"]
COPY ["WebAPI/WebAPI.csproj", "WebAPI/"]
RUN dotnet restore "./WebAPI/WebAPI.csproj"
COPY . .
WORKDIR "/src/WebAPI"
RUN dotnet build "./WebAPI.csproj" -c $BUILD_CONFIGURATION -o /app/build

FROM mcr.microsoft.com/dotnet/aspnet:8.0 
WORKDIR /app
EXPOSE 8080
EXPOSE 5015
EXPOSE 8081
ENV ASPNETCORE_ENVIRONMENT=Production

WORKDIR /app
COPY --from=build /app/build .
ENTRYPOINT ["dotnet", "./WebAPI.dll"]
