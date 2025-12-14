import axios from 'axios';
import mongoose from 'mongoose';
import Project from './models/Project.js';
import FixedText from './models/FixedText.js';
import dotenv from 'dotenv';
dotenv.config();

const API_URL = 'http://localhost:3001/api/translate';
const PROJECTS_URL = 'http://localhost:3001/api/projects';
const TEXTS_URL = 'http://localhost:3001/api/fixed-texts';

// Known IDs from seeder
const PROJECT_ID = '1';
const FIXED_TEXT_ID = 'hero';

const runVerification = async () => {
    console.log('Starting Verification...');

    try {
        // Connect DB for direct check if needed (optional, API verification is better)
        // await mongoose.connect(process.env.MONGO_URI);

        // Test 1: Translate Project to ES
        console.log(`\nTest 1: Translating Project (ID: ${PROJECT_ID}) to ES...`);
        // Note: The controller now translates to ALL languages ['en', 'es', 'fr', 'de']
        // We will just trigger it.
        const projectRes = await axios.post(API_URL, {
            id: PROJECT_ID,
            type: 'project'
        });
        console.log('Translation Response:', projectRes.data.message);

        // Test 2: Fetch Projects in ES
        console.log(`\nTest 2: Fetching Projects with ?lang=es`);
        const esProjectsRes = await axios.get(`${PROJECTS_URL}?lang=es`);
        const esProjects = esProjectsRes.data;
        console.log(`Found ${esProjects.length} projects in ES.`);
        if (esProjects.length > 0) {
            console.log('Sample Name:', esProjects[0].name);
            console.log('Language Field:', esProjects[0].language);
        }

        // Test 3: Translate FixedText to ES
        console.log(`\nTest 3: Translating FixedText (ID: ${FIXED_TEXT_ID}) to ES...`);
        const textRes = await axios.post(API_URL, {
            id: FIXED_TEXT_ID,
            type: 'fixed'
        });
        console.log('Translation Response:', textRes.data.message);

        // Test 4: Fetch FixedText in ES
        console.log(`\nTest 4: Fetching FixedText with ?lang=es`);
        const esTextRes = await axios.get(`${TEXTS_URL}?lang=es`);
        const esText = esTextRes.data.hero;
        console.log('Hero Title (ES):', esText ? esText.title : 'Not Found');


    } catch (error) {
        if (error.response) {
            console.error('Error Response:', error.response.data);
        } else {
            console.error('Error:', error.message);
        }
    }
};

runVerification();
