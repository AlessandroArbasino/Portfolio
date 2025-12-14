import Project from '../models/Project.js';

// @desc    Get all projects
// @route   GET /api/projects
export const getProjects = async (req, res) => {
    try {
        const projects = await Project.find({});
        res.json(projects);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Create a project
// @route   POST /api/projects
export const createProject = async (req, res) => {
    try {
        const { id, name, description, tech, github, demo, images, subProjects } = req.body;

        // Check if project exists
        const projectExists = await Project.findOne({ id });
        if (projectExists) {
            return res.status(400).json({ message: 'Project already exists' });
        }

        const project = await Project.create({
            id,
            name,
            description,
            tech,
            github,
            demo,
            images,
            subProjects
        });

        res.status(201).json(project);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
