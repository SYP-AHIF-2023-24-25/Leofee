FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
ARG BUILD_CONFIGURATION=Release
WORKDIR /src
COPY ["Core/Core.csproj", "Core/"]
COPY ["ImportData/ImportData.csproj", "ImportData/"]
COPY ["Api/Api.csproj", "Api/"]
RUN dotnet restore "./Api/Api.csproj"
COPY . .
WORKDIR "/src/Api"
RUN dotnet build "./Api.csproj" -c $BUILD_CONFIGURATION -o /app/build

FROM mcr.microsoft.com/dotnet/aspnet:8.0 
WORKDIR /app
EXPOSE 8082
EXPOSE 8083

WORKDIR /app
COPY --from=build /app/build .
ENTRYPOINT ["dotnet", "./Api.dll"]