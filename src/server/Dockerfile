# syntax=docker/dockerfile:1

FROM mcr.microsoft.com/dotnet/sdk:9.0

WORKDIR /app

# Copy project files
COPY . .

EXPOSE 3001

# Ensure Kestrel listens on all interfaces
ENV ASPNETCORE_URLS=http://0.0.0.0:3001
ENV ASPNETCORE_ENVIRONMENT=Development

# Improve file watching inside containers
ENV DOTNET_USE_POLLING_FILE_WATCHER=1

# Run in watch mode for developer experience
CMD ["dotnet", "watch", "run", "--environment", "Development"]
