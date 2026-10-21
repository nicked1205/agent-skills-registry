# Build context is ./server (see render.yaml), so paths here are relative to that.

FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src

# Restore first so dependency layers cache independently of source changes.
COPY server.csproj ./
RUN dotnet restore

COPY . ./
RUN dotnet publish -c Release -o /app --no-restore

FROM mcr.microsoft.com/dotnet/aspnet:8.0
WORKDIR /app
COPY --from=build /app ./

ENV ASPNETCORE_ENVIRONMENT=Production
ENV ASPNETCORE_URLS=http://+:10000

# SQLite lives on a mounted disk, not in the image. Database__Path points here;
# the app creates the directory and runs migrations on startup.
ENV Database__Path=/var/data/app.db

EXPOSE 10000

ENTRYPOINT ["dotnet", "server.dll"]
