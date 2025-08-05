const fs = require('fs');
const FormData = require('form-data');
const axios = require('axios');

async function testImport(useValidFiles = true) {
  try {
    const form = new FormData();
    
    if (useValidFiles) {
      // Add the valid CSV files
      form.append('loans', fs.createReadStream('./sample-csv/loans.csv'));
      form.append('consumers', fs.createReadStream('./sample-csv/consumers.csv'));
      form.append('balances', fs.createReadStream('./sample-csv/balances.csv'));
      console.log('Testing with VALID files...');
    } else {
      // Add the invalid CSV files
      form.append('loans', fs.createReadStream('./sample-csv/invalid-loans.csv'));
      form.append('consumers', fs.createReadStream('./sample-csv/invalid-consumers.csv'));
      form.append('balances', fs.createReadStream('./sample-csv/invalid-balances.csv'));
      console.log('Testing with INVALID files...');
    }
    
    const response = await axios.post('http://localhost:3000/import', form, {
      headers: {
        ...form.getHeaders(),
      },
    });
    
    console.log('Import successful!');
    console.log('Response:', JSON.stringify(response.data, null, 2));
  } catch (error) {
    console.error('Import failed:', error.response?.data || error.message);
  }
}

async function runAllTests() {
  console.log('=== Testing Valid Import ===');
  await testImport(true);
  
  console.log('\n=== Testing Invalid Import ===');
  await testImport(false);
}

// Only run if this file is executed directly
if (require.main === module) {
  if (process.argv.includes('--invalid')) {
    testImport(false);
  } else if (process.argv.includes('--all')) {
    runAllTests();
  } else {
    testImport(true);
  }
}

module.exports = { testImport, runAllTests }; 