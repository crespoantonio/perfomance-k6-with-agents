# k6 Performance Testing Framework with TypeScript

[![k6](https://img.shields.io/badge/k6-latest-7d64ff)](https://k6.io/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue)](https://www.typescriptlang.org/)
[![License](https://img.shields.io/badge/license-ISC-green)](LICENSE)

Enterprise-grade k6 performance testing framework with TypeScript support, designed for scalable and maintainable API performance tests.

## 📋 Table of Contents

- [Features](#features)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Project Structure](#project-structure)
- [Configuration](#configuration)
- [Running Tests](#running-tests)
- [Test Types](#test-types)
- [Utilities](#utilities)
- [Custom Metrics](#custom-metrics)
- [CI/CD Integration](#cicd-integration)
- [Best Practices](#best-practices)
- [Troubleshooting](#troubleshooting)

## ✨ Features

- ✅ **TypeScript Support**: Type-safe test development with full IDE support
- ✅ **Modular Architecture**: Reusable utilities and configurations
- ✅ **Multiple Test Types**: Load, Stress, Spike, and Endurance test templates
- ✅ **Environment Management**: Multi-environment configuration (dev, qa, staging, prod)
- ✅ **Custom Metrics**: Comprehensive business and technical metrics
- ✅ **Rate Limit Handling**: Smart rate limit detection and handling
- ✅ **HTTP Utilities**: Pre-built helpers for common HTTP operations
- ✅ **Validation Checks**: Reusable validation functions
- ✅ **CI/CD Ready**: GitHub Actions integration
- ✅ **Configurable Thresholds**: Environment-specific SLA validation

## 🔧 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js**: v16 or higher ([Download](https://nodejs.org/))
- **Podman**: Latest version (replaces Docker/local k6)
- **npm** or **yarn**: Comes with Node.js

### Install Podman

**Note:** This project uses **Podman with the k6 Docker image**, so you don't need to install k6 locally.

**Windows:**

```bash
# Download and install Podman Desktop from:
# https://podman-desktop.io/downloads
```

**macOS (Homebrew):**

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

Verify installation:

```bash
podman --version
```

### Pull k6 Docker Image

```bash
podman pull grafana/k6:latest
```

## 📦 Installation

1. **Clone the repository:**

```bash
git clone <repository-url>
cd performance-k6-typescript
```

2. **Install dependencies:**

```bash
npm install
```

3. **Configure environment:**

```bash
cp .env.example .env
# Edit .env with your configuration
```

4. **Build TypeScript:**

```bash
npm run build
```

### 🐳 About Podman/Docker Usage

This project uses **containerized k6** via Podman, eliminating the need for local k6 installation:

- **Local Development**: Uses Podman commands (configured in package.json scripts)
- **CI/CD**: Uses Docker commands (GitHub Actions)
- **Compatibility**: Podman and Docker commands are interchangeable

**Using Docker instead of Podman:**
If you prefer Docker, simply replace `podman` with `docker` in the package.json scripts:

```bash
# The commands are identical:
podman run --rm -v .:/app:Z -w /app grafana/k6:latest run dist/load-test.js
docker run --rm -v .:/app:Z -w /app grafana/k6:latest run dist/load-test.js
```

**Advantages:**

- ✅ No local k6 installation required
- ✅ Consistent k6 version across team
- ✅ Easy version updates (just pull new image)
- ✅ Works on any platform with Podman/Docker

## 📁 Project Structure

```
performance-k6-typescript/
├── src/
│   ├── config/
│   │   ├── config.ts          # Test options and configurations
│   │   ├── environments.ts    # Environment-specific settings
│   │   └── thresholds.ts      # SLA thresholds
│   ├── utils/
│   │   ├── http.ts            # HTTP request helpers
│   │   ├── auth.ts            # Authentication utilities
│   │   ├── checks.ts          # Validation checks
│   │   ├── metrics.ts         # Custom metrics
│   │   └── rate-limit.ts      # Rate limit handling
│   └── tests/
│       ├── load-test.ts       # Load test template
│       ├── stress-test.ts     # Stress test template
│       ├── spike-test.ts      # Spike test template
│       └── endurance-test.ts  # Endurance/Soak test
├── data/
│   └── csv/                   # Test data files
├── results/
│   ├── json/                  # JSON test results
│   └── html/                  # HTML reports
├── dist/                      # Compiled JavaScript
├── package.json               # Dependencies
├── tsconfig.json              # TypeScript config
├── webpack.config.js          # Webpack bundler config
└── README.md                  # This file
```

## ⚙️ Configuration

### Environment Variables

Create a `.env` file in the project root:

```env
# Environment
ENV=prod

# API Configuration
BASE_URL=https://api.practicesoftwaretesting.com
API_KEY=your-api-key-here

# Load Test Configuration
VUS=10
DURATION=5m
RAMP_UP_DURATION=30s
RAMP_DOWN_DURATION=30s

# Thresholds
HTTP_REQ_DURATION_P95=500
HTTP_REQ_DURATION_P99=1000
HTTP_REQ_FAILED_RATE=0.01
```

### Environment-Specific Configuration

Edit `src/config/environments.ts` to configure different environments:

```typescript
export const environments = {
  dev: { baseUrl: 'https://dev.api.example.com', maxVUs: 50 },
  qa: { baseUrl: 'https://qa.api.example.com', maxVUs: 100 },
  staging: { baseUrl: 'https://staging.api.example.com', maxVUs: 200 },
  prod: { baseUrl: 'https://api.example.com', maxVUs: 500 },
};
```

### Thresholds

Customize SLA thresholds in `src/config/thresholds.ts`:

```typescript
export const defaultThresholds = {
  http_req_duration: ['p(95)<500', 'p(99)<1000'],
  http_req_failed: ['rate<0.01'],
  http_reqs: ['rate>100'],
};
```

## 🚀 Running Tests

### Build Tests

```bash
npm run build
```

### Run Individual Tests

```bash
# Load test
npm run test:load

# Stress test
npm run test:stress

# Spike test
npm run test:spike

# Endurance test
npm run test:endurance

# Smoke test (quick validation)
npm run test:smoke
```

### Run with Custom Parameters

```bash
# Custom VUs and duration
VUS=50 DURATION=10m npm run test:load

# Specific environment
ENV=staging npm run test:load

# Direct Podman execution with custom parameters
podman run --rm -v .:/app:Z -w /app grafana/k6:latest run --vus 20 --duration 5m dist/load-test.js
```

### Output to File

```bash
# JSON output (note: output files are created inside the container's /app directory, which is mounted to current directory)
podman run --rm -v .:/app:Z -w /app grafana/k6:latest run --out json=results/json/output.json dist/load-test.js

# Multiple outputs
podman run --rm -v .:/app:Z -w /app grafana/k6:latest run \
  --out json=results/json/output.json \
  --out csv=results/csv/output.csv \
  dist/load-test.js
```

**Note:** All npm test scripts use Podman with the k6 Docker image, so no local k6 installation is required.

## 📊 Test Types

### Load Test

Tests system performance under expected normal load.

**Use case**: Validate system meets SLAs under typical traffic

```bash
npm run test:load
```

**Configuration**: Gradual ramp-up → sustained load → ramp-down

### Stress Test

Gradually increases load to find the system's breaking point.

**Use case**: Identify maximum capacity and failure modes

```bash
npm run test:stress
```

**Configuration**: Multiple stages with increasing VUs

### Spike Test

Sudden increase in load to test auto-scaling and recovery.

**Use case**: Test system behavior during traffic spikes

```bash
npm run test:spike
```

**Configuration**: Baseline → sudden spike → recovery

### Endurance Test (Soak Test)

Extended duration test to detect memory leaks and degradation.

**Use case**: Validate system stability over time

```bash
npm run test:endurance
```

**Configuration**: Sustained moderate load for 4+ hours

## 🛠️ Utilities

### HTTP Utilities

```typescript
import { httpGet, httpPost, httpPut, httpDelete } from '../utils/http';

// GET request
const response = httpGet('/api/items', {
  endpoint: 'list-items',
  tags: { operation: 'read' },
});

// POST request
const createResponse = httpPost('/api/items', payload, {
  endpoint: 'create-item',
  tags: { operation: 'create' },
});
```

### Validation Checks

```typescript
import { checkGetSuccess, checkApiSuccess, checkStatusOk } from '../utils/checks';

// Comprehensive check
checkApiSuccess(response, 1000); // Max 1000ms

// Status check
checkStatusOk(response);

// Combined GET checks
checkGetSuccess(response);
```

### Custom Metrics

```typescript
import { recordApiCall, recordCreate, customCounters } from '../utils/metrics';

// Record API call
recordApiCall(success, response.timings.duration);

// Record CRUD operations
recordCreate(success, duration);
recordUpdate(success, duration);
recordDelete(success, duration);

// Custom counters
customCounters.apiCallsTotal.add(1);
```

### Rate Limit Handling

```typescript
import { handleRateLimit, updateRateLimitMetrics } from '../utils/rate-limit';

// Automatically handle rate limiting
handleRateLimit(response); // Waits if rate limited

// Update metrics
updateRateLimitMetrics(response);
```

## 📈 Custom Metrics

The framework includes comprehensive custom metrics:

**Counters:**

- `api_calls_total`, `api_calls_success`, `api_calls_failed`
- `items_created`, `items_updated`, `items_deleted`
- `login_attempts`, `login_success`, `validation_errors`

**Trends (Timing):**

- `login_duration`, `create_item_duration`, `search_duration`
- `time_to_first_byte`, `checkout_duration`

**Rates (Percentages):**

- `api_success_rate`, `client_error_rate`, `server_error_rate`
- `checkout_success_rate`, `data_validation_rate`

**Gauges (Instantaneous):**

- `active_users`, `rate_limit_remaining`

## 🔄 CI/CD Integration

### GitHub Actions

Create `.github/workflows/k6-tests.yml`:

```yaml
name: K6 Performance Tests

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]
  schedule:
    - cron: '0 2 * * *' # Daily at 2 AM

jobs:
  performance-tests:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'

      - name: Install dependencies
        run: npm ci

      - name: Build tests
        run: npm run build

      - name: Install k6
        run: |
          sudo gpg -k
          sudo gpg --no-default-keyring --keyring /usr/share/keyrings/k6-archive-keyring.gpg --keyserver hkp://keyserver.ubuntu.com:80 --recv-keys C5AD17C747E3415A3642D57D77C6C491D6AC1D69
          echo "deb [signed-by=/usr/share/keyrings/k6-archive-keyring.gpg] https://dl.k6.io/deb stable main" | sudo tee /etc/apt/sources.list.d/k6.list
          sudo apt-get update
          sudo apt-get install k6

      - name: Run smoke tests
        run: npm run test:smoke
        env:
          BASE_URL: ${{ secrets.API_BASE_URL }}
          API_KEY: ${{ secrets.API_KEY }}

      - name: Upload results
        uses: actions/upload-artifact@v3
        if: always()
        with:
          name: k6-results
          path: results/
```

### Environment Secrets

Add these secrets to your repository:

- `API_BASE_URL`: Target API URL
- `API_KEY`: API authentication key

## 💡 Best Practices

### 1. Use Setup and Teardown

```typescript
export function setup() {
  // Authentication, data preparation
  return { authToken: authenticate() };
}

export default function (data) {
  // Use data.authToken
}

export function teardown(data) {
  // Cleanup operations
}
```

### 2. Tag All Requests

```typescript
httpGet('/api/items', {
  endpoint: 'list-items',
  tags: {
    operation: 'read',
    critical: 'true',
  },
});
```

### 3. Use Realistic Think Times

```typescript
sleep(2); // Simulates user reading time
```

### 4. Load Test Data from Files

```typescript
import papaparse from 'papaparse';
import { SharedArray } from 'k6/data';

const csvData = new SharedArray('users', function () {
  return papaparse.parse(open('./data/csv/users.csv'), { header: true }).data;
});
```

### 5. Group Related Requests

```typescript
import { group } from 'k6';

group('User Journey', function () {
  group('Browse', function () {
    httpGet('/items');
  });

  group('Purchase', function () {
    httpPost('/cart/checkout', payload);
  });
});
```

## 🐛 Troubleshooting

### Build Errors

**Issue**: TypeScript compilation errors

**Solution**:

```bash
npm run type-check
npm run lint
```

### k6 Not Found

**Issue**: `k6: command not found`

**Solution**: Install k6 following the [Prerequisites](#prerequisites) section

### Rate Limiting

**Issue**: Tests hitting rate limits

**Solution**:

- Enable rate limit handling: `handleRateLimit(response)`
- Increase think times
- Reduce VU count

### Module Resolution Errors

**Issue**: Cannot find module errors during build

**Solution**:

```bash
rm -rf node_modules package-lock.json
npm install
npm run build
```

### SSL Certificate Errors

**Solution**: Add to test options:

```typescript
export const options = {
  insecureSkipTLSVerify: true,
};
```

## 📚 Additional Resources

- [k6 Documentation](https://k6.io/docs/)
- [k6 TypeScript Template](https://github.com/grafana/k6-template-typescript)
- [JavaScript API](https://k6.io/docs/javascript-api/)
- [Cloud Integration](https://k6.io/docs/cloud/)

## 📝 JIRA Reference

- **Ticket**: INTTP002-163
- **Summary**: Setup k6 Performance Testing Framework with TypeScript
- **Status**: Done
- **Assignee**: Antonio Crespo

## 👥 Contributing

1. Create feature branch: `git checkout -b feature/new-test`
2. Commit changes: `git commit -am 'Add new test scenario'`
3. Push branch: `git push origin feature/new-test`
4. Create Pull Request

## 📄 License

ISC

## 🆘 Support

For issues or questions:

- Create an issue in the repository
- Contact: Antonio.Crespo@endava.com
- Check [k6 Community Forum](https://community.k6.io/)

---

**Happy Load Testing! 🚀**
