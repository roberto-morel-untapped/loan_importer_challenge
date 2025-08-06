const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
const path = require('path');

async function testAPI() {
  try {
    console.log('🚀 Testing Loan Importer API...\n');

    // Read sample CSV files
    const loansCsv = fs.readFileSync(path.join(__dirname, 'sample-csv', 'loans.csv'));
    const consumersCsv = fs.readFileSync(path.join(__dirname, 'sample-csv', 'consumers.csv'));
    const balancesCsv = fs.readFileSync(path.join(__dirname, 'sample-csv', 'balances.csv'));

    // Create form data
    const form = new FormData();
    form.append('files', loansCsv, { filename: 'loans.csv', contentType: 'text/csv' });
    form.append('files', consumersCsv, { filename: 'consumers.csv', contentType: 'text/csv' });
    form.append('files', balancesCsv, { filename: 'balances.csv', contentType: 'text/csv' });

    console.log('📤 Sending valid CSV files...');

    // Test with valid files
    const response = await axios.post('http://localhost:3000/import', form, {
      headers: {
        ...form.getHeaders(),
      },
    });

    console.log('✅ Success Response:');
    console.log(JSON.stringify(response.data, null, 2));

    // Test with invalid files
    console.log('\n📤 Sending invalid CSV files...');
    
    const invalidLoansCsv = fs.readFileSync(path.join(__dirname, 'sample-csv', 'invalid-loans.csv'));
    const invalidConsumersCsv = fs.readFileSync(path.join(__dirname, 'sample-csv', 'invalid-consumers.csv'));
    const invalidBalancesCsv = fs.readFileSync(path.join(__dirname, 'sample-csv', 'invalid-balances.csv'));

    const invalidForm = new FormData();
    invalidForm.append('files', invalidLoansCsv, { filename: 'invalid-loans.csv', contentType: 'text/csv' });
    invalidForm.append('files', invalidConsumersCsv, { filename: 'invalid-consumers.csv', contentType: 'text/csv' });
    invalidForm.append('files', invalidBalancesCsv, { filename: 'invalid-balances.csv', contentType: 'text/csv' });

    const invalidResponse = await axios.post('http://localhost:3000/import', invalidForm, {
      headers: {
        ...invalidForm.getHeaders(),
      },
    });

    console.log('❌ Error Response:');
    console.log(JSON.stringify(invalidResponse.data, null, 2));

  } catch (error) {
    console.error('❌ Error:', error.response?.data || error.message);
  }
}

// Check if server is running
async function checkServer() {
  try {
    await axios.get('http://localhost:3000');
    console.log('✅ Server is running on http://localhost:3000');
    await testAPI();
  } catch (error) {
    console.log('❌ Server is not running. Please start it with: yarn start:dev');
    console.log('Then run this test script again.');
  }
}

checkServer(); 