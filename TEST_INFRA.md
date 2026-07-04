# E2E Test Infra: BRAS Account Migration & Dashboards

## Test Philosophy
- Opaque-box, requirement-driven. No dependency on implementation design.
- Methodology: Category-Partition + BVA + Pairwise + Workload Testing.

## Feature Inventory
| # | Feature | Source (requirement) | Tier 1 | Tier 2 | Tier 3 |
|---|---------|---------------------|:------:|:------:|:------:|
| 1 | Legacy Password Reset Script | ORIGINAL_REQUEST §R1 | 5      | 5      | ✓      |
| 2 | Guest Account Sign-Up | ORIGINAL_REQUEST §R2 | 5      | 5      | ✓      |
| 3 | Standard Account Sign-Up | ORIGINAL_REQUEST §R2 | 5      | 5      | ✓      |
| 4 | Claim Account Sign-Up | ORIGINAL_REQUEST §R2 | 5      | 5      | ✓      |
| 5 | Committee Claim Approval | ORIGINAL_REQUEST §R3 | 5      | 5      | ✓      |
| 6 | Member Dashboard: Past Ratings Table | ORIGINAL_REQUEST §R4 | 5      | 5      | ✓      |
| 7 | Member Dashboard: Fun Facts | ORIGINAL_REQUEST §R4 | 5      | 5      | ✓      |

## Test Architecture
- Test runner: `npx playwright test` (location: `e2e/`)
- Test case format: Playwright TS files `.spec.ts`
- Pass/Fail semantics: Exit code 0 means all tests pass.
- Directory layout:
  - `e2e/tier1/` - Feature Coverage
  - `e2e/tier2/` - Boundary & Corner Cases
  - `e2e/tier3/` - Cross-Feature Combinations
  - `e2e/tier4/` - Real-World Application Scenarios
  - `e2e/fixtures/` - Test fixtures and seeders

## Real-World Application Scenarios (Tier 4)
| # | Scenario | Features Exercised | Complexity |
|---|----------|--------------------|------------|
| 1 | A user votes as a guest, then creates a standard account later. | F2, F3 | Medium |
| 2 | A legacy user claims their account, a committee member approves it, and the user views their dashboard. | F4, F5, F6, F7 | High |
| 3 | The committee rejects a claim, user submits a new correct claim, approved, then views facts. | F4, F5 | High |
| 4 | Bulk reset legacy passwords, then multiple legacy users log in and claim successfully. | F1, F4, F5 | High |
| 5 | A standard member tries to claim an account they don't own, committee ignores/rejects. | F3, F4, F5 | Medium |

## Coverage Thresholds
- Tier 1: ≥5 per feature (Total: 35)
- Tier 2: ≥5 per feature (Total: 35)
- Tier 3: pairwise coverage of major feature interactions (Total: ~10)
- Tier 4: ≥5 realistic application scenarios (Total: 5)
