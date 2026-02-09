# Podman Setup Guide for k6 Tests

This project uses **Podman** (or Docker) to run k6 tests, eliminating the need for local k6 installation.

## Quick Start

### 1. Install Podman

**Windows:**

1. Download and install [Podman Desktop](https://podman-desktop.io/downloads)
2. Follow the installation wizard
3. Start Podman Desktop

**macOS:**

```bash
brew install podman
podman machine init
podman machine start
```

**Linux:**

```bash
# Fedora/RHEL
sudo dnf install podman

# Ubuntu/Debian
sudo apt-get install podman
```

### 2. Pull k6 Image

```bash
podman pull grafana/k6:latest
```

### 3. Verify Setup

```bash
# Check Podman
podman --version

# Check k6 image
podman images | grep k6
```

## Running Tests

All npm scripts are pre-configured to use Podman:

```bash
# Build tests
npm run build

# Run smoke test
npm run test:smoke

# Run load test
npm run test:load

# Run stress test
npm run test:stress

# Run spike test
npm run test:spike

# Run endurance test
npm run test:endurance
```

## Manual Execution

If you need to run tests manually with custom parameters:

```bash
# Basic run
podman run --rm -v .:/app:Z -w /app grafana/k6:latest run dist/load-test.js

# With custom VUs and duration
podman run --rm -v .:/app:Z -w /app grafana/k6:latest run --vus 20 --duration 5m dist/load-test.js

# With output to file
podman run --rm -v .:/app:Z -w /app grafana/k6:latest run --out json=results/json/output.json dist/load-test.js

# With environment variables
podman run --rm -v .:/app:Z -w /app -e BASE_URL=https://api.example.com grafana/k6:latest run dist/load-test.js
```

## Command Explanation

```bash
podman run --rm -v .:/app:Z -w /app grafana/k6:latest run dist/load-test.js
```

- `podman run` - Run a container
- `--rm` - Automatically remove the container when it exits
- `-v .:/app:Z` - Mount current directory to /app in container (`:Z` for SELinux labeling)
- `-w /app` - Set working directory to /app
- `grafana/k6:latest` - Use the official k6 image
- `run dist/load-test.js` - k6 run command with test file

## Using Docker Instead

Podman and Docker commands are interchangeable. To use Docker:

### Option 1: Replace in package.json

Change all `podman` occurrences to `docker` in [package.json](package.json):

```json
"test:smoke": "docker run --rm -v .:/app:Z -w /app grafana/k6:latest run --vus 1 --duration 30s dist/load-test.js"
```

### Option 2: Use Docker directly

```bash
docker run --rm -v .:/app:Z -w /app grafana/k6:latest run dist/load-test.js
```

## Troubleshooting

### Podman not found

- Ensure Podman is installed and in your PATH
- On Windows, restart your terminal after installation
- On macOS, ensure podman machine is running: `podman machine start`

### Image not found

```bash
podman pull grafana/k6:latest
```

### Permission denied (Linux)

Add your user to the podman group:

```bash
sudo usermod -aG podman $USER
newgrp podman
```

### Volume mount fails on Windows

- Ensure you're running in a WSL2 environment or using PowerShell with proper paths
- Try using absolute paths: `-v C:/path/to/project:/app`

### SELinux issues (Linux)

The `:Z` flag handles SELinux labeling. If you still have issues:

```bash
# Temporarily disable SELinux (not recommended for production)
sudo setenforce 0

# Or relabel the directory
chcon -Rt svirt_sandbox_file_t .
```

## CI/CD Integration

The project includes [GitHub Actions workflow](.github/workflows/k6-tests.yml) that uses Docker (pre-installed in GitHub runners).

The workflow automatically:

- Pulls the k6 Docker image
- Builds the TypeScript tests
- Runs tests with Docker
- Uploads results as artifacts

## Benefits

✅ **No local k6 installation** - Run tests with just Podman/Docker
✅ **Version consistency** - Everyone uses the same k6 version
✅ **Easy updates** - Update k6 by pulling the latest image
✅ **Cross-platform** - Works identically on Windows, macOS, and Linux
✅ **Isolated environment** - No conflicts with system packages
✅ **CI/CD ready** - Same commands work in CI pipelines

## Version Management

### Use Specific k6 Version

```bash
# Pull specific version
podman pull grafana/k6:0.48.0

# Update scripts to use specific version
"test:smoke": "podman run --rm -v .:/app:Z -w /app grafana/k6:0.48.0 run ..."
```

### Check k6 Version

```bash
podman run --rm grafana/k6:latest version
```

## Additional Resources

- [Podman Documentation](https://docs.podman.io/)
- [k6 Documentation](https://k6.io/docs/)
- [k6 Docker Image](https://hub.docker.com/r/grafana/k6)
- [Project README](README.md)
- [Quick Start Guide](QUICKSTART.md)
