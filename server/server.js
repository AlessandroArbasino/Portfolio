import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import cors from 'cors';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import connectDB from './config/db.js';
import projectRoutes from './routes/projectRoutes.js';
import contentRoutes from './routes/contentRoutes.js';
import chatRoutes from './routes/chatRoutes.js';
import translateRoutes from './routes/translateRoutes.js';
import profileRoutes from './routes/profileRoutes.js';
import languageRoutes from './routes/languageRoutes.js';
import contactRoutes from './routes/contactRoutes.js';
import documentRoutes from './routes/documentRoutes.js';
import cronRoutes from './routes/cronRoutes.js';
import Project from './models/Project.js';
import FixedText from './models/FixedText.js';
import PersonalProfile from './models/PersonalProfile.js';
import Language from './models/Language.js';
import Document from './models/Document.js';
import ChatMood from './models/ChatMood.js';
import { verifyTranslateApiKey } from './middleware/authMiddleware.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Get dirname for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Connect to Database
await connectDB();

// CORS config for Angular dev server (4200) or production
app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:4200',
    credentials: true
}));
app.use(express.json());
app.use(cookieParser());

// Session cookie middleware for chat endpoints
function ensureSessionCookie(req, res, next) {
    const COOKIE_NAME = 'chat_session_id';
    let sid = req.cookies?.[COOKIE_NAME];
    if (!sid) {
        sid = 'session-' + Math.random().toString(36).substr(2, 9);
        res.cookie(COOKIE_NAME, sid, {
            httpOnly: true,
            sameSite: 'lax',
            secure: false,
            path: '/',
        });
    }
    req.sessionId = sid;
    next();
}

// Routes
app.use('/api/projects', projectRoutes);
app.use('/api', contentRoutes);
app.use('/api/chat', ensureSessionCookie, chatRoutes);
app.use('/api/translate', verifyTranslateApiKey, translateRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/languages', languageRoutes);
app.use('/api/contact', contactRoutes);
app.use('/api/documents', documentRoutes);
app.use('/api/cron', cronRoutes);

// Serve Angular static files in production (ONLY if not on Vercel)
if (process.env.NODE_ENV === 'production' && !process.env.VERCEL) {
    const distPath = path.join(__dirname, '../dist');
    app.use(express.static(distPath));

    // All other routes should serve index.html (for Angular routing)
    app.get('*', (req, res) => {
        res.sendFile(path.join(distPath, 'index.html'));
    });
}

// Seeder Logic (Run once if DB is empty)
const seedData = async () => {
    try {
        const projectCount = await Project.countDocuments();
        if (projectCount === 0) {
            console.log('Seeding initial data...');
            const projects = [
                {
                    "id": "1",
                    "name": "Build the Feed (AI-Driven Instagram Page)",
                    "description": "An autonomous AI-managed Instagram page with a community engagement system, allowing users to submit prompts to determine the content to be posted. Built entirely using free-tier tools and services (Vercel, Neon DB).",
                    "tech": [
                        "React",
                        "Node.js",
                        "JavaScript",
                        "Gemini API",
                        "Meta Graph API",
                        "Cloudinary",
                        "Telegram API",
                        "Vercel",
                        "Neon DB"
                    ],
                    "github": "#",
                    "demo": "#",
                    "images": [
                        "https://images.unsplash.com/photo-1629851722822-4811a0134b2a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhcnRpZmljaWFsJTIwaW50ZWxsaWdlbmNlJTIwZmVlZHxlbnwxfHx8fDE3NjU3MjQwNDd8MA&ixlib=rb-4.1.0&q=80&w=1080",
                        "https://images.unsplash.com/photo-1543286386-713bdd548da7?w=800"
                    ],
                    "challenges": [
                        {
                            "problem": "Ensuring content policy compliance for user prompts",
                            "solution": "Integrating a content moderation check using the Gemini API before queuing the prompt."
                        },
                        {
                            "problem": "Managing the asynchronous content generation and posting flow",
                            "solution": "Implementing a robust, scheduled workflow (e.g., cron jobs or serverless functions) to handle sequential steps: prompt refinement, image generation, asset upload (Cloudinary), caption generation, and final posting (Meta Graph API)."
                        }
                    ],
                    "subProjects": [
                        {
                            "id": "1-1",
                            "name": "User Prompt Submission Web App",
                            "description": "A front-end application to collect user prompts. Submissions are checked against content policies via the Gemini API, queued in the database, and the user receives an estimated content generation time.",
                            "tech": [
                                "React",
                                "JavaScript",
                                "Gemini API"
                            ],
                            "link": "#",
                            "images": [
                                "https://images.unsplash.com/photo-1534536281715-e20c699042b7?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx1c2VyJTIwaW5wdXQlMjBmb3JtfGVufDF8fHx8MTc2NTcyNDA0N3ww&ixlib=rb-4.1.0&q=80&w=1080",
                                "https://images.unsplash.com/photo-1533038590840-1cde66d2d725?w=800"
                            ],
                            "challenges": [
                                {
                                    "problem": "Providing real-time feedback on queue position",
                                    "solution": "Fetching and displaying the current queue size and estimated processing time from the backend/database."
                                }
                            ]
                        },
                        {
                            "id": "1-2",
                            "name": "Automatic Post Workflow",
                            "description": "The core backend workflow. It processes a user-submitted (or AI-generated fallback) prompt, refines it using the Gemini API, generates an image via Flux Dev, uploads the asset to Cloudinary, creates a suitable caption with hashtags and a CTA, and finally posts the content to Instagram via the Meta Graph API. The post is also automatically shared to a dedicated Telegram group.",
                            "tech": [
                                "Meta Graph API",
                                "Gemini API",
                                "JavaScript",
                                "Cloudinary",
                                "Telegram API"
                            ],
                            "link": "#",
                            "images": [
                                "https://images.unsplash.com/photo-1555066931-4365d14bab8c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjb250ZW50JTIwYXV0b21hdGlvbiUyMHBpcGVsaW5lfGVufDF8fHx8MTc2NTcyNDA0N3ww&ixlib=rb-4.1.0&q=80&w=1080",
                                "https://images.unsplash.com/photo-1510511459019-5be77853f753?w=800"
                            ],
                            "challenges": [
                                {
                                    "problem": "Handling different API rate limits",
                                    "solution": "Implementing exponential backoff and retries for critical API calls (e.g., Meta Graph API) and careful scheduling to avoid hitting limits."
                                }
                            ]
                        },
                        {
                            "id": "1-3",
                            "name": "Gamification and Voting System",
                            "description": "Adds a community gamification layer. Weekly, the best images are selected for a weekend voting session. The images are edited (using Cloudinary or programmatic tools) to include corresponding numbers. Voting takes place on a Telegram channel using an inline keyboard. After the voting period, results are tallied, and the winner is announced on Instagram via a carousel post and stories (stories pre-made in Canva).",
                            "tech": [
                                "JavaScript",
                                "Telegram API",
                                "Cloudinary",
                                "Meta Graph API"
                            ],
                            "link": "#",
                            "images": [
                                "https://images.unsplash.com/photo-1557804506-669a8b163d8d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxnYW1pZmljYXRpb24lMjB2b3RpbmclMjBzeXN0ZW18ZW58MXx8fHwxNzY1NzI0MDQ3fDA&ixlib=rb-4.1.0&q=80&w=1080",
                                "https://images.unsplash.com/photo-1512485800893-b08ec1ea5929?w=800"
                            ],
                            "challenges": [
                                {
                                    "problem": "Securely tracking votes and preventing ballot stuffing",
                                    "solution": "Storing votes in the database with user ID validation (where possible via Telegram API) to ensure unique submissions."
                                }
                            ]
                        }
                    ]
                },
                {
                    "id": "3",
                    "name": "Mood-Adaptive AI Portfolio",
                    "description": "A dynamic portfolio website featuring an integrated AI agent. The agent analyzes the user's mood via chat interaction (using Gemini) and adjusts the entire website's primary colors, fonts, and background videos/images (fetched from Pexels API) to match the detected mood.",
                    "tech": [
                        "React",
                        "Node.js",
                        "Gemini API",
                        "Pexels API",
                        "PostgreSQL",
                        "Vercel",
                        "Serverless Functions"
                    ],
                    "github": "#",
                    "demo": "#",
                    "images": [
                        "https://images.unsplash.com/photo-1549490349-869279093e50?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwdXJwbGUlMjB3ZWJzaXRlfGVufDF8fHx8MTc2NTc5NzY2MHww&ixlib=rb-4.1.0&q=80&w=1080",
                        "https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=800"
                    ],
                    "challenges": [
                        {
                            "problem": "Accurate extraction and mapping of user mood to design parameters",
                            "solution": "Developing a structured prompt for the Gemini API to analyze chat sentiment and output specific, quantifiable design variables (color codes, font categories, Pexels search terms)."
                        },
                        {
                            "problem": "Maintaining consistent personalization without user login",
                            "solution": "Storing encrypted session tokens in the user's browser (or database) to persist the personalized settings across multiple visits."
                        }
                    ],
                    "subProjects": [
                        {
                            "id": "3-1",
                            "name": "AI Agent Integration and Personalization Persistence",
                            "description": "Integration of the Gemini API for natural language understanding and mood extraction from user chat. Personalization settings are persisted via a securely stored (encrypted) session token instead of requiring a full login. A scheduled cron job is implemented to periodically delete old session data (chats older than X days) to maintain database hygiene and performance.",
                            "tech": [
                                "Gemini API",
                                "Node.js",
                                "PostgreSQL",
                                "Session Tokens",
                                "Cron Job"
                            ],
                            "link": "#",
                            "images": [
                                "https://images.unsplash.com/photo-1510915228367-e6fa2c191a27?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjaGF0Ym90JTIwZGF0YWJhc2UlMjBzY2hlZHVsZXJ8ZW58MXx8fHwxNzY1Nzk3NjYwfDA&ixlib=rb-4.1.0&q=80&w=1080",
                                "https://images.unsplash.com/photo-1548685913-fe7870c538a0?w=800"
                            ],
                            "challenges": [
                                {
                                    "problem": "Ensuring the session token is secure and tamper-proof",
                                    "solution": "Using industry-standard encryption algorithms (e.g., AES-256) for token content and secure HTTPS cookies for transmission."
                                }
                            ]
                        },
                        {
                            "id": "3-2",
                            "name": "Dynamic UI and Pexels Integration",
                            "description": "Front-end components (primary colors and fonts) are dynamically updated using CSS variables based on the mood data extracted by the AI agent. The background is dynamically set by querying the public Pexels API for relevant video/image content (e.g., searching 'calm' or 'energetic') and displaying the chosen asset in a looping background element.",
                            "tech": [
                                "React",
                                "CSS Variables",
                                "Pexels API"
                            ],
                            "link": "#",
                            "images": [
                                "https://images.unsplash.com/photo-1582213600609-b7b51e5e062f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxkeW5hbWljJTIwd2ViJTIwZGVzaWduJTIwY29sb3JzfGVufDF8fHx8MTc2NTc5NzY2MHww&ixlib=rb-4.1.0&q=80&w=1080",
                                "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=800"
                            ],
                            "challenges": [
                                {
                                    "problem": "Optimizing Pexels background video load time and performance",
                                    "solution": "Implementing lazy loading and selecting low-bandwidth video formats/resolutions provided by the Pexels API."
                                }
                            ]
                        },
                        {
                            "id": "3-3",
                            "name": "AI-Powered Infinite Language Support",
                            "description": "The entire website's static text is stored in a centralized system (e.g., database or JSON files). A dedicated API endpoint is implemented to allow developers to add a new language, which automatically translates all existing text content into the target language using the AI (Gemini API). Italian and English translations are maintained manually for maximum quality, while all other languages are AI-generated, offering virtually unlimited language support.",
                            "tech": [
                                "Gemini API",
                                "Node.js",
                                "Internationalization (i18n)",
                                "API Gateway"
                            ],
                            "link": "#",
                            "images": [
                                "https://images.unsplash.com/photo-1502444330083-b78971f65492?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxsb2NhbGl6YXRpb24lMjBzdXN0ZW1zfGVufDF8fHx8MTc2NTc5ODk4MHww&ixlib=rb-4.1.0&q=80&w=1080",
                                "https://images.unsplash.com/photo-1582213600609-b7b51e5e062f?w=800"
                            ],
                            "challenges": [
                                {
                                    "problem": "Maintaining translation accuracy and context for AI-generated languages",
                                    "solution": "Employing highly specific prompts (e.g., 'Translate this website content into X language, maintaining a professional and concise tone') and implementing a manual review/override system for critical strings."
                                }
                            ]
                        }
                    ]
                }
            ];
            await Project.insertMany(projects);
        }

        const seedSection = async (section, content) => {
            const exists = await FixedText.findOne({ section, language: 'en' });
            if (!exists) {
                await FixedText.create({ section, language: 'en', content });
                console.log(`Seeded ${section} (en)`);
            }
        };

        await seedSection('hero', {
            title: "Alessandro Arbasino",
            subtitle: "Full Stack Developer",
            description: "I create modern and high-performance web experiences. Passionate about technology and always ready to learn."
        });

        await seedSection('about', {
            title: "About Me",
            years: "Years",
            experience: "of Experience",
            projects: "Projects",
            completed: "Completed",
            training: "Training",
            continuous: "Continuous",
            skills: "My Skills"
        });

        await seedSection('chat', {
            tooltipTitle: 'AI Assistant',
            tooltipDesc: 'I can personalize the site for you!',
            chatTitle: 'AI Assistant',
            welcome: 'Hi! Ask me to modify the site\'s moodboard.',
            initialMessage: 'Hello! How can I help you today?',
            placeholder: 'Write a message...',
            send: 'Send',
            subtitle: 'Ask me to modify the site\'s moodboard',
            typing: 'Typing...'
        });

        await seedSection('contact', {
            title: 'Contact',
            subtitle: 'Interested in collaborating? Let\'s connect!',
            copyright: '© 2025 Alessandro Arbasino. All rights reserved.'
        });

        await seedSection('projects', {
            title: 'Projects',
            subtitle: 'Some of the projects I have worked on',
            webTitle: 'Web Projects',
            videogameTitle: 'Videogames',
            challengesTitle: 'Challenges and Solutions',
            solutionLabel: 'Solution:',
            subProjectsLabel: 'Sub-projects:'
        });

        await seedSection('documents', {
            title: 'Documents',
            subtitle: 'Download or view my documents'
        });


        const langCount = await Language.countDocuments();
        if (langCount === 0) {
            await Language.insertMany([
                { id: 'en', text: 'EN-en' },
                { id: 'it', text: 'IT-it' },
                { id: 'es', text: 'ES-es' },
                { id: 'fr', text: 'FR-fr' }
            ]);
        }

        const profileCount = await PersonalProfile.countDocuments({ language: 'en' });
        if (profileCount === 0) {
            await PersonalProfile.create({
                language: 'en',
                name: 'Alessandro Arbasino',
                title: 'Full Stack Developer',
                description: 'A passionate and proactive Full-Stack Developer with a solid foundation in enterprise architectures, coupled with a strong dedication to modern stacks like React, Node.js, and TypeScript. I am focused on transforming ideas into clean code and scalable solutions.',
                greeting: 'Hello, I\'m Alessandro!',
                imageUrl: 'https://res.cloudinary.com/dwpapdlgk/image/upload/v1765960795/AlessandroArbasino_etyt9y.jpg',
                socialLinks: {
                    github: 'https://github.com/mario-rossi',
                    linkedin: 'https://linkedin.com/in/mario-rossi'
                },
                cvUrl: '/assets/cv.pdf',
                experienceYears: 1,
                completedProjects: 6,
                skills: [
                    { name: 'React', level: 90 },
                    { name: 'Node.js', level: 85 },
                    { name: 'TypeScript', level: 80 },
                    { name: 'MongoDB', level: 75 },
                    { name: 'TailwindCSS', level: 95 }
                ]
            });
        }

        const docCount = await Document.countDocuments({ language: 'en' });
        if (docCount === 0) {
            await Document.insertMany([
                {
                    title: 'Curriculum Vitae',
                    description: 'My CV updated for 2025',
                    fileUrl: 'https://example.com/cv.pdf',
                    type: 'PDF',
                    language: 'en'
                },
                {
                    title: 'Portfolio Presentation',
                    description: 'Extended presentation of my projects',
                    fileUrl: 'https://example.com/portfolio.pdf',
                    type: 'PDF',
                    language: 'en'
                }
            ]);
            console.log('Seeded documents (en)');
        }

        const moodCount = await ChatMood.countDocuments();
        if (moodCount === 0) {
            await ChatMood.insertMany([
                {
                    name: 'tech',
                    keywords: 'digital nexus cyberpunk data high-tech grid'
                },
                {
                    name: 'minimal',
                    keywords: 'minimal abstract architecture clean white bright'
                },
                {
                    name: 'deep_sea',
                    keywords: 'abstract dark blue water ocean wave'
                },
                {
                    name: 'vibrant',
                    keywords: 'abstract colorful liquid gradient neon'
                }
            ]);
            console.log('Seeded initial chat moods');
        }
    } catch (err) {
        console.error("Seeding error:", err);
    }
};

// Execute seeder
// Execute seeder
seedData();

if (process.argv[1] === fileURLToPath(import.meta.url)) {
    app.listen(PORT, () => {
        console.log(`Server running on http://localhost:${PORT}`);
    });
}

export default app;
