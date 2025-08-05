# Loan Importer Challenge

A NestJS backend service for importing and validating loan, consumer, and balance data via CSV files. Designed for reusability and modularity, this feature can be extended to a public API in the future.

---

## Table of Contents

- [Features](#features)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Running the Service](#running-the-service)
- [Project Structure](#project-structure)
- [Usage](#usage)
  - [Endpoint](#endpoint)
  - [Request Format](#request-format)
  - [Response Examples](#response-examples)
- [CSV Specifications](#csv-specifications)
  - [loans.csv](#loanscsv)
  - [consumers.csv](#consumerscsv)
  - [balances.csv](#balancescsv)
  - [Bucket Rules](#bucket-rules)
- [Validation and Error Reporting](#validation-and-error-reporting)
- [Loopload Support](#loopload-support)
- [Future Considerations](#future-considerations)
- [Scripts](#scripts)
- [Testing](#testing)
- [Linting & Formatting](#linting--formatting)
- [Technical Test Implementation](#technical-test-implementation)
- [License](#license)

---

## Features

- **Single-request upload** of three CSV files (`loans.csv`, `consumers.csv`, `balances.csv`).
- **Strict validation** with structured error reports.
- **Loopload support**: fix errors and re-upload without restarting the entire import.
- **Decoupled import logic** for easy API integration and streaming.

## Prerequisites

- Node.js v18+ (tested with v18.16)
- Yarn v1.22+
- (Optional) Nest CLI for scaffolding and dev tools:
  ```bash
  yarn global add @nestjs/cli
  ```

## Installation

1. Clone the repo:

   ```bash
   git clone https://your.repo.url/loan_importer_challenge.git
   cd loan_importer_challenge
   ```

2. Install dependencies:
   ```bash
   yarn install
   ```

## Running the Service

Start in development mode (with hot reload):

```bash
yarn start:dev
```

Build and run production:

```bash
yarn build
yarn start
```

The service listens on [**http://localhost:3000**](http://localhost:3000) by default.

## Project Structure

```
loan_importer_challenge/
├─ src/
│  ├─ import/
│  │  ├─ dto/               # Data Transfer Objects & validation decorators
│  │  ├─ import.controller.ts
│  │  ├─ import.service.ts
│  │  └─ import.module.ts
│  ├─ validators/          # Custom class-validator decorators
│  ├─ app.module.ts
│  └─ main.ts
├─ sample-csv/             # Example loans.csv, consumers.csv, balances.csv
├─ test/                   # Unit tests (Jest)
├─ .eslintrc.js
├─ .prettierrc
├─ tsconfig.json
├─ tsconfig.build.json
├─ package.json
└─ README.md
```

## Usage

### Endpoint

```
POST /import
Content-Type: multipart/form-data
```

### Request Format

| Field     | File          | Required |
| --------- | ------------- | -------- |
| loans     | loans.csv     | Yes      |
| consumers | consumers.csv | Yes      |
| balances  | balances.csv  | Yes      |

Upload all three in a single multipart request:

```bash
curl -X POST http://localhost:3000/import \
  -F "loans=@./sample-csv/loans.csv" \
  -F "consumers=@./sample-csv/consumers.csv" \
  -F "balances=@./sample-csv/balances.csv"
```

### Response Examples

**Success (all valid):**

```json
{
  "message": "Valid import",
  "loans": [...],
  "consumers": [...],
  "balances": [...]
}
```

**Validation errors:**

```json
{
  "loans": [
    {
      "line": 3,
      "column": "contract_date",
      "error": "Invalid or out-of-range date"
    }
  ],
  "consumers": [
    { "line": 5, "column": "birth_date", "error": "Invalid date format" }
  ],
  "balances": [
    {
      "line": 7,
      "column": "bucket",
      "error": "Bucket does not match finance type 'real_estate'"
    }
  ]
}
```

## CSV Specifications

### loans.csv

| Column          | Type    | Rules                                                    |
| --------------- | ------- | -------------------------------------------------------- |
| `number`        | string  | Alphanumeric; **unique** across file                     |
| `contract_date` | date    | `MM/DD/YYYY`; future date ≤ 10 years ahead               |
| `total_amount`  | integer | ≥ 0; must equal sum of `amount` in balances.csv for loan |
| `installments`  | integer | ≥ 1                                                      |

### consumers.csv

| Column         | Type   | Rules                                                |
| -------------- | ------ | ---------------------------------------------------- |
| `loan_number`  | string | Must match a `number` from loans.csv                 |
| `full_name`    | string | Non-empty                                            |
| `birth_date`   | date   | `MM/DD/YYYY`                                         |
| `phone_number` | string | Valid international phone (digits, +, -; 9–15 chars) |

### balances.csv

| Column         | Type   | Rules                                |
| -------------- | ------ | ------------------------------------ |
| `loan_number`  | string | Must match a `number` from loans.csv |
| `finance_type` | string | `auto` or `real_estate`              |
| `bucket`       | string | See [Bucket Rules](#bucket-rules)    |
| `amount`       | number | ≥ 0                                  |

### Bucket Rules

- **auto**: required buckets = `principal`, `interest`
- **real_estate**: required bucket = `principal`

## Validation and Error Reporting

- **Structured errors** per file, listing:
  - `line` number (1-based)
  - `column` name
  - human-readable `error` message
- If _any_ file has errors, the entire import is rejected.

## Loopload Support

Clients may correct a single file (e.g. consumers.csv) and re-upload with the same `/import` endpoint. Validation logic merges with existing state so valid rows are retained and only invalid ones need attention.

## Future Considerations

- **Streaming parsing** for large CSVs
- **Database integration** for persistence
- Expose logic via a **public REST API** or **GraphQL**
- **Authentication**, **rate limiting**, **monitoring**

## Scripts

```bash
# Development (hot reload)
yarn start:dev

# Build
yarn build
yarn start   # Run compiled code

# Lint & format
yarn lint
yarn format

# Tests
yarn test
yarn test:watch
yarn test:cov
```

## Testing

- Unit tests located in `test/` using **Jest**.
- Aim for high coverage on validation rules and service logic.

## Linting & Formatting

- **ESLint** with `@typescript-eslint`
- **Prettier** for code style

## Technical Test Implementation

This project serves as a technical test for implementing a CSV import system. The base structure has been created with all necessary components, but the core implementation needs to be completed.

### 🎯 **For Candidates: Start Here**

If you're implementing this technical test, please refer to **[TECHNICAL_TEST.md](./TECHNICAL_TEST.md)** for detailed implementation tasks and evaluation criteria.

### What's Already Set Up

✅ **Complete project structure** with NestJS framework  
✅ **Import module** with controller, service, and DTOs  
✅ **Custom validators** for business rules  
✅ **Sample CSV files** for testing  
✅ **Unit test framework** ready  
✅ **API endpoint** (`POST /import`) configured

### Quick Start for Implementation

1. **Review the specifications** in this README
2. **Follow the implementation guide** in `TECHNICAL_TEST.md`
3. **Test your implementation** using the provided sample files
4. **Run the test suite** to verify functionality

### Key Implementation Areas

- **CSV parsing and validation logic**
- **Cross-reference validation** between files
- **Error handling and reporting**
- **Custom validator implementation**
- **Comprehensive test coverage**

### Evaluation Focus

The implementation will be evaluated on:

- **Code quality** and structure
- **Validation accuracy** according to specifications
- **Error handling** comprehensiveness
- **Test coverage** and quality
- **Documentation** and comments

---

## License

MIT • See [LICENSE](LICENSE)
