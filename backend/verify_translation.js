import axios from 'axios';

const API_URL = 'http://localhost:3001/api/translate';

// Known IDs from seeder
const PROJECT_ID = '1';
const FIXED_TEXT_ID = 'hero';

const runVerification = async () => {
    console.log('Starting Verification...');

    try {
        // Test 1: Translate Project
        console.log(`\nTest 1: Translating Project (ID: ${PROJECT_ID})`);
        const projectRes = await axios.post(API_URL, {
            id: PROJECT_ID,
            type: 'project'
        });
        console.log('Response:', JSON.stringify(projectRes.data, null, 2));

        // Test 2: Translate FixedText
        console.log(`\nTest 2: Translating FixedText (ID: ${FIXED_TEXT_ID})`);
        const textRes = await axios.post(API_URL, {
            id: FIXED_TEXT_ID,
            type: 'fixed'
        });
        console.log('Response:', JSON.stringify(textRes.data, null, 2));

    } catch (error) {
        if (error.response) {
            console.error('Error Response:', error.response.data);
        } else {
            console.error('Error:', error.message);
        }
    }
};

runVerification();
