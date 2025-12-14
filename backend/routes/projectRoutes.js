import express from 'express';
import { getProjects, createProject } from '../controllers/projectController.js';

const router = express.Router();

router.route('/').get(getProjects).post(createProject);

export default router;
