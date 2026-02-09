# Performance Test Plan Template

## Test Information

- **Application**: [Application Name]
- **Version**: [Version Number]
- **Environment**: [dev/qa/staging/prod]
- **Test Date**: [Date]
- **Tester**: [Name]
- **JIRA Ticket**: [TICKET-XXX]

## 1. Objectives

Define what you want to achieve with this performance test:

- [ ] Validate system meets SLA requirements
- [ ] Identify breaking point/maximum capacity
- [ ] Test auto-scaling behavior
- [ ] Detect memory leaks or performance degradation
- [ ] Baseline performance metrics
- [ ] Other: _______________

## 2. Scope

### In Scope
- API endpoints to test
- User journeys to simulate
- Target environments
- Load conditions

### Out of Scope
- What will NOT be tested
- Known limitations

## 3. Test Environment

| Component | Details |
|-----------|---------|
| Base URL | https://api.example.com |
| Environment | staging/prod |
| Infrastructure | Cloud provider, region, size |
| Database | Type, size, location |
| CDN | Yes/No |
| Load Balancer | Yes/No |

## 4. Test Scenarios

### Scenario 1: [Name] - [Test Type]

**Description**: [What this test does]

**Test Type**: Load / Stress / Spike / Endurance

**User Journey**:
1. Step 1: [Action - e.g., Browse products]
2. Step 2: [Action - e.g., View product details]
3. Step 3: [Action - e.g., Add to cart]

**Endpoints**:
- `GET /api/products` - List products
- `GET /api/products/{id}` - Get product details
- `POST /api/cart` - Add to cart

**Load Profile**:
```
Stage 1: Ramp up to [X] VUs over [Y] minutes
Stage 2: Hold at [X] VUs for [Y] minutes  
Stage 3: Ramp down to 0 over [Y] minutes
```

**Expected Behavior**:
- All requests return 2xx status codes
- P95 response time < [X]ms
- Error rate < [X]%
- Throughput > [X] requests/second

---

### Scenario 2: [Name]

[Repeat structure above for each scenario]

## 5. Performance Criteria (SLAs)

| Metric | Target | Critical |
|--------|--------|----------|
| Response Time (P95) | < 500ms | < 1000ms |
| Response Time (P99) | < 1000ms | < 2000ms |
| Error Rate | < 1% | < 5% |
| Throughput | > 100 RPS | > 50 RPS |
| Availability | > 99.9% | > 99% |

## 6. Load Model

### Expected Load
- Normal: [X] concurrent users
- Peak: [X] concurrent users
- Target: [X] requests per minute

### Test Load Configuration

**Load Test:**
```yaml
Virtual Users: 10-50
Duration: 5-10 minutes
Ramp Up: 1 minute
Think Time: 1-3 seconds
```

**Stress Test:**
```yaml
Virtual Users: 50-300+ (incremental)
Duration: 20-30 minutes
Ramp Up: Progressive stages
Think Time: 0.5-1 second
```

**Spike Test:**
```yaml
Baseline VUs: 10
Spike VUs: 200
Spike Duration: 3 minutes
Think Time: 0.5 seconds
```

**Endurance Test:**
```yaml
Virtual Users: 50
Duration: 4-8 hours
Ramp Up: 5 minutes
Think Time: 2 seconds
```

## 7. Test Data

### Required Data
- [ ] User credentials (if authentication needed)
- [ ] Product IDs or test data
- [ ] API keys
- [ ] Sample payloads

### Data Files
- `data/csv/users.csv` - User data
- `data/csv/products.csv` - Product data

### Data Generation Strategy
- Pre-generated CSV files
- Dynamic generation in test
- Database seeding

## 8. Monitoring

### Metrics to Monitor

**Application Metrics:**
- [ ] HTTP response times
- [ ] Error rates
- [ ] Throughput
- [ ] Active connections

**System Metrics:**
- [ ] CPU utilization
- [ ] Memory usage
- [ ] Disk I/O
- [ ] Network bandwidth

**Database Metrics:**
- [ ] Query execution time
- [ ] Connection pool usage
- [ ] Locks/deadlocks

### Monitoring Tools
- k6 metrics (built-in)
- Application Performance Monitoring (APM)
- Infrastructure monitoring (CloudWatch, Datadog, etc.)
- Database monitoring

## 9. Success Criteria

Test passes if:
- [ ] All SLA targets met
- [ ] No critical errors
- [ ] System recovers after test
- [ ] No data corruption
- [ ] No memory leaks detected (endurance test)
- [ ] [Other criteria]

## 10. Risk Assessment

| Risk | Impact | Mitigation |
|------|--------|------------|
| Production database affected | High | Use staging environment |
| Real users impacted | High | Run during low-traffic hours |
| System crash | Medium | Have rollback plan |
| Rate limiting | Low | Use rate limit handling |

## 11. Execution Plan

### Pre-Test Checklist
- [ ] Environment is stable
- [ ] All dependencies are up
- [ ] Test data is prepared
- [ ] Monitoring is configured
- [ ] Stakeholders notified
- [ ] Backup/rollback plan ready

### Test Execution Steps
1. Verify environment health
2. Run smoke test (1 VU, 30s)
3. If smoke passes, run main test
4. Monitor results in real-time
5. Stop test if critical issues occur
6. Collect and save results

### Post-Test Checklist
- [ ] Verify system returned to normal
- [ ] Check for any data issues
- [ ] Save test results
- [ ] Generate reports
- [ ] Document findings

## 12. Results & Analysis

### Test Results

| Test | Date | VUs | Duration | Pass/Fail | Notes |
|------|------|-----|----------|-----------|-------|
| Smoke | | 1 | 30s | | |
| Load | | 50 | 10m | | |
| Stress | | 300 | 30m | | |

### Key Findings

**Performance Metrics:**
- Average response time: [X]ms
- P95 response time: [X]ms
- P99 response time: [X]ms
- Error rate: [X]%
- Throughput: [X] RPS

**Observations:**
- [Key observation 1]
- [Key observation 2]

**Issues Found:**
1. [Issue description]
   - Severity: High/Medium/Low
   - Impact: [Description]
   - Recommendation: [Action]

### Recommendations

1. **Immediate Actions:**
   - [Action 1]
   - [Action 2]

2. **Short-term Improvements:**
   - [Improvement 1]
   - [Improvement 2]

3. **Long-term Optimizations:**
   - [Optimization 1]
   - [Optimization 2]

## 13. Attachments

- Test results: `results/json/[test-name].json`
- Screenshots: [if applicable]
- Monitoring graphs: [if applicable]
- k6 output: [full console output]

---

## Approval

| Role | Name | Signature | Date |
|------|------|-----------|------|
| Test Lead | | | |
| Development Lead | | | |
| DevOps Lead | | | |

---

**Document Version**: 1.0
**Last Updated**: [Date]
**Next Review**: [Date]
