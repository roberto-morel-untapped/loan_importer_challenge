# Loan Importer Technical Test

## Overview

This technical test involves implementing a CSV import system for loan data using NestJS. The system should validate three CSV files (`loans.csv`, `consumers.csv`, `balances.csv`) and provide detailed error reporting.

**📋 Before starting, please read the complete specifications in [README.md](./README.md) which contains:**

- Detailed CSV format specifications
- Validation rules and business logic
- API endpoint documentation
- Error response formats
- Sample data and testing instructions

## What's Already Set Up

The base structure has been created with:

- ✅ NestJS project setup with all dependencies
- ✅ Import module structure (`src/import/`)
- ✅ DTOs for validation (`src/import/dto/`)
- ✅ Custom validators (`src/validators/`)
- ✅ Import service with basic structure
- ✅ Sample CSV files for testing
- ✅ Unit test setup
- ✅ API endpoint (`POST /import`)

**Note:** The implementation has been removed to allow candidates to implement from scratch. All files contain TODO comments and basic structure.

## What You Need to Complete

### 1. Fix the Import Controller

The current controller has an issue with file handling. You need to:

- Fix the file extraction logic
- Ensure proper multipart form handling
- Add proper error handling for missing files

### 2. Complete the Import Service

The service needs implementation for:

- CSV parsing with proper error handling
- Validation logic for each file type
- Cross-reference validation between files
- Error aggregation and reporting

### 3. Implement Custom Validators

Complete the custom validators:

- `IsDateInRange`: Validate contract dates are future dates ≤ 10 years
- `IsValidBucket`: Validate bucket rules based on finance type

### 4. Add Comprehensive Tests

Create tests for:

- Valid CSV imports
- Invalid data scenarios
- Cross-reference validation
- Error reporting format

### 5. Enhance Error Handling

Improve error handling for:

- Malformed CSV files
- Missing required fields
- Invalid data types
- Cross-reference violations

## Testing Your Implementation

### 1. Start the Server

```bash
yarn start:dev
```

### 2. Test with Sample Files

```bash
node test-import.js
```

### 3. Test with Invalid Data

Create test files with invalid data to verify error reporting.

### 4. Run Unit Tests

```bash
yarn test
```

## Expected API Behavior

### Successful Import

```json
{
  "message": "Valid import",
  "loans": [...],
  "consumers": [...],
  "balances": [...]
}
```

### Error Response

```json
{
  "errors": {
    "loans": [
      {
        "line": 3,
        "column": "contract_date",
        "error": "Date must be in the future and not more than 10 years ahead"
      }
    ],
    "consumers": [...],
    "balances": [...]
  }
}
```

## Validation Rules

**📖 For complete validation specifications, see [README.md](./README.md#csv-specifications)**

### loans.csv

- `number`: Alphanumeric, unique across file
- `contract_date`: MM/DD/YYYY, future date ≤ 10 years
- `total_amount`: Integer ≥ 0, must equal sum of balance amounts
- `installments`: Integer ≥ 1

### consumers.csv

- `loan_number`: Must exist in loans.csv
- `full_name`: Non-empty string
- `birth_date`: MM/DD/YYYY format
- `phone_number`: 9-15 chars, digits, +, -

### balances.csv

- `loan_number`: Must exist in loans.csv
- `finance_type`: "auto" or "real_estate"
- `bucket`: "principal" for real_estate, "principal" or "interest" for auto
- `amount`: Number ≥ 0

## Cross-Reference Validation

- Consumer loan_number must exist in loans.csv
- Balance loan_number must exist in loans.csv
- Sum of balance amounts for each loan must equal loan total_amount

## Evaluation Criteria

1. **Code Quality**: Clean, readable, well-structured code
2. **Error Handling**: Comprehensive error handling and reporting
3. **Validation**: Accurate implementation of all validation rules
4. **Testing**: Good test coverage
5. **Documentation**: Clear code comments and documentation

## Submission

1. Complete the implementation
2. Add comprehensive tests
3. Document any assumptions or design decisions
4. Provide a brief summary of your approach

## Reference Documentation

- **[README.md](./README.md)** - Complete project specifications and API documentation
- **[Sample CSV files](./sample-csv/)** - Test data for validation
- **[Test script](./test-import.js)** - API testing utility

Good luck!
