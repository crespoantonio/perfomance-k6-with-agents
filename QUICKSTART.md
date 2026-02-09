# Quick Start Guide

Get up and running with k6 performance testing in 5 minutes!

## 🚀 Steps

### 1. Prerequisites Check

```bash
# Check Node.js (need v16+)
node --version

# Check Podman installation
podman --version
```

**Note:** This project uses **Podman** with the k6 Docker image, so you don't need to install k6 locally.

If Podman is not installed:

- **Windows**: Download from [Podman Desktop](https://podman-desktop.io/downloads)
- **macOS**: `brew install podman`
- **Linux**: See [Podman Installation Guide](https://podman.io/getting-started/installation)

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure Environment

```bash
# Copy example environment file
cp .env.example .env

# Edit .env with your API details
# At minimum, set:
# - BASE_URL
# - API_KEY (if needed)
```

Example `.env`:

```env
ENV=prod
BASE_URL=https://api.practicesoftwaretesting.com
API_KEY=your-key-here
VUS=10
DURATION=1m
```

### 4. Build Tests

```bash
npm run build
```

### 5. Run Your First Test

```bash
# Quick smoke test (30 seconds, 1 user)
npm run test:smoke
```

Expected output:

```
✓ status is 200
✓ response time < 1000ms

checks.........................: 100.00% ✓ 60       ✗ 0
http_req_duration..............: avg=150ms min=100ms max=250ms
```

### 6. Run Load Test

```bash
# Full load test (5 minutes, 10 users)
npm run test:load
```

## 📋 Next Steps

### Customize Your Tests

1. **Edit test files** in `src/tests/`
2. **Add your API endpoints** in the test functions
3. **Adjust thresholds** in `src/config/thresholds.ts`

Example - Add a new API call:

```typescript
// src/tests/load-test.ts

export default function (data: any) {
  // Your existing test...

  // Add your endpoint
  const response = httpGet('/your-endpoint', {
    endpoint: 'your-endpoint-name',
    tags: { operation: 'read' },
  });

  checkGetSuccess(response);
  sleep(1);
}
```

### Run Different Test Types

```bash
# Stress test - Find breaking point
npm run test:stress

# Spike test - Sudden traffic spike
npm run test:spike

# Endurance test - Long duration stability
npm run test:endurance
```

### Customize Test Parameters

```bash
# Custom VUs and duration
VUS=50 DURATION=10m npm run test:load

# Different environment
ENV=staging npm run test:load
```

## 🎯 Common Scenarios

### Scenario 1: Test Single Endpoint

```bash
# Build
npm run build

# Run with minimal load using Podman
podman run --rm -v .:/app:Z -w /app grafana/k6:latest run --vus 1 --duration 30s dist/load-test.js
```

### Scenario 2: Test with Different Loads

```bash
# Light load
VUS=5 DURATION=2m npm run test:load

# Medium load
VUS=20 DURATION=5m npm run test:load

# Heavy load
VUS=50 DURATION=10m npm run test:load
```

### Scenario 3: Save Results

```bash
# Output to JSON using Podman
podman run --rm -v .:/app:Z -w /app grafana/k6:latest run --out json=results/json/my-test.json dist/load-test.js

# View results
cat results/json/my-test.json | jq '.metrics'
```

## 🐛 Troubleshooting

### Build Fails

```bash
# Clean and reinstall
rm -rf node_modules dist
npm install
npm run build
```

### Podman Not Found

Install Podman - see Prerequisites section above

If Podman is installed but not found, ensure it's in your PATH:

```bash
# Windows (PowerShell)
$env:PATH

# macOS/Linux
echo $PATH
```

### Container Image Not Found

Pull the k6 image:

```bash
podman pull grafana/k6:latest
```

### Connection Refused

Check your `.env` file:

- Is `BASE_URL` correct?
- Is the API accessible from your machine?

```bash
# Test connectivity
curl $BASE_URL/status
```

### SSL Certificate Errors

Add to your test file:

```typescript
export const options = {
  insecureSkipTLSVerify: true,
};
```

## 📚 Learn More

- [Full README](README.md) - Complete documentation
- [k6 Docs](https://k6.io/docs/) - Official k6 documentation
- [Test Examples](src/tests/) - Check the test templates

## 💡 Tips

1. **Start small**: Begin with smoke tests, then scale up
2. **Monitor first run**: Watch the output to understand the flow
3. **Iterate**: Adjust VUs and duration based on results
4. **Use tags**: Tag requests for better metrics filtering
5. **Check thresholds**: Tests will pass/fail based on thresholds

## ✅ Verification Checklist

- [ ] Podman installed and working (`podman --version`)
- [ ] k6 Docker image pulled (`podman pull grafana/k6:latest`)
- [ ] Dependencies installed (`npm install`)
- [ ] `.env` configured with correct BASE_URL
- [ ] Tests build successfully (`npm run build`)
- [ ] Smoke test passes (`npm run test:smoke`)
- [ ] Can customize and run tests with different parameters

**You're all set! Happy testing! 🚀**

---

Need help? Check [README.md](README.md) or create an issue.
