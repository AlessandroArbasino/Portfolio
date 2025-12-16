import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import connectDB from './config/db.js';
import projectRoutes from './routes/projectRoutes.js';
import contentRoutes from './routes/contentRoutes.js';
import chatRoutes from './routes/chatRoutes.js';
import translateRoutes from './routes/translateRoutes.js';
import profileRoutes from './routes/profileRoutes.js';
import Project from './models/Project.js';
import FixedText from './models/FixedText.js';
import BackgroundImage from './models/BackgroundImage.js';
import PersonalProfile from './models/PersonalProfile.js';

dotenv.config();

const app = express();
const PORT = 3001;

// Connect to Database
connectDB();

app.use(cors());
app.use(express.json());

// Routes
app.use('/api/projects', projectRoutes);
app.use('/api', contentRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/translate', translateRoutes);
app.use('/api/profile', profileRoutes);

// Seeder Logic (Run once if DB is empty)
const seedData = async () => {
    try {
        const projectCount = await Project.countDocuments();
        if (projectCount === 0) {
            console.log('Seeding initial data...');
            const projects = [
                {
                    id: '1',
                    name: 'E-Commerce Platform',
                    description: 'Piattaforma di e-commerce completa con gestione prodotti, carrello e pagamenti',
                    tech: ['React', 'Node.js', 'PostgreSQL', 'Stripe'],
                    github: '#',
                    demo: '#',
                    images: [
                        'https://images.unsplash.com/photo-1658297063569-162817482fb6?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxlY29tbWVyY2UlMjB3ZWJzaXRlfGVufDF8fHx8MTc2NTYzNTUyMXww&ixlib=rb-4.1.0&q=80&w=1080',
                        'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=800',
                    ],
                    challenges: [
                        { problem: "Gestione concorrenza ordini", solution: "Utilizzo di transazioni database e locking ottimistico" },
                        { problem: "Latenza pagamenti", solution: "Implementazione webhook asincroni per conferme Stripe" }
                    ],
                    subProjects: [
                        {
                            id: '1-1',
                            name: 'Admin Dashboard',
                            description: 'Dashboard per la gestione dei prodotti e ordini',
                            tech: ['React', 'Chart.js', 'TailwindCSS'],
                            link: '#',
                            images: [
                                'https://images.unsplash.com/photo-1551288049-bebda4e38f71?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhZG1pbiUyMGRhc2hib2FyZHxlbnwxfHx8fDE3NjU3MjM4NjJ8MA&ixlib=rb-4.1.0&q=80&w=1080',
                                'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800',
                            ],
                            challenges: [
                                { problem: "Performance dashboard", solution: "Caching dati aggregati con Redis" }
                            ]
                        },
                        {
                            id: '1-2',
                            name: 'Payment Gateway Integration',
                            description: 'Integrazione con Stripe per pagamenti sicuri',
                            tech: ['Node.js', 'Stripe API', 'Webhook'],
                            link: '#',
                            images: [
                                'https://images.unsplash.com/photo-1556740714-a8395b3bf30f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwYXltZW50JTIwZ2F0ZXdheXxlbnwxfHx8fDE3NjU3MjM4NjJ8MA&ixlib=rb-4.1.0&q=80&w=1080',
                                'https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=800',
                            ],
                        },
                    ],
                },
                {
                    id: '2',
                    name: 'Task Management App',
                    description: 'Applicazione per la gestione di progetti e task con collaborazione in team',
                    tech: ['React', 'TypeScript', 'Firebase', 'Tailwind'],
                    github: '#',
                    demo: '#',
                    images: [
                        'https://images.unsplash.com/photo-1651129522359-ce483a8263a7?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx0YXNrJTIwbWFuYWdlbWVudCUyMGFwcHxlbnwxfHx8fDE3NjU3MDEyMTJ8MA&ixlib=rb-4.1.0&q=80&w=1080',
                        'https://images.unsplash.com/photo-1484480974693-6ca0a78fb36b?w=800',
                        'https://images.unsplash.com/photo-1507925921958-8a62f3d1a50d?w=800',
                    ],
                    subProjects: [
                        {
                            id: '2-1',
                            name: 'Real-time Notifications',
                            description: 'Sistema di notifiche in tempo reale per gli aggiornamenti del team',
                            tech: ['Socket.io', 'Node.js'],
                            link: '#',
                            images: [
                                'https://images.unsplash.com/photo-1762340915398-000c216e7cd6?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxub3RpZmljYXRpb24lMjBzeXN0ZW18ZW58MXx8fHwxNzY1NzIzODYyfDA&ixlib=rb-4.1.0&q=80&w=1080',
                                'https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=800',
                            ],
                        },
                    ],
                },
                {
                    id: '3',
                    name: 'Portfolio CMS',
                    description: 'Sistema di gestione contenuti per portfolio creativi',
                    tech: ['Next.js', 'Prisma', 'PostgreSQL'],
                    github: '#',
                    images: [
                        'https://images.unsplash.com/photo-1467232004584-a241de8bcf5d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwb3J0Zm9saW8lMjB3ZWJzaXRlfGVufDF8fHx8MTc2NTcxODE4M3ww&ixlib=rb-4.1.0&q=80&w=1080',
                        'https://images.unsplash.com/photo-1559028012-481c04fa702d?w=800',
                        'https://images.unsplash.com/photo-1483058712412-4245e9b90334?w=800',
                    ],
                },
            ];
            await Project.insertMany(projects);
        }

        const textCount = await FixedText.countDocuments();
        if (textCount === 0) {
            await FixedText.create({
                section: 'hero',
                content: {
                    title: "Mario Rossi",
                    subtitle: "Junior Full Stack Developer",
                    description: "Creo esperienze web moderne e performanti. Appassionato di tecnologia e sempre pronto ad imparare."
                }
            });
            await FixedText.create({
                section: 'about',
                content: {
                    title: "Chi Sono",
                    greeting: "Ciao, sono Alessandro!",
                    description1: "Da sempre appassionato di tecnologia, ho trasformato la mia curiosità in una professione. Mi piace risolvere problemi complessi e creare soluzioni digitali che abbiano un impatto reale.",
                    description2: "Quando non scrivo codice, mi trovi a esplorare nuove tecnologie, contribuire a progetti open source o semplicemente a godermi un buon caffè.",
                    years: "Anni",
                    experience: "di Esperienza",
                    projects: "Progetti",
                    completed: "Completati",
                    training: "Formazione",
                    continuous: "Continua",
                    skills: "Le Mie Skills"
                }
            });
        }

        const imgCount = await BackgroundImage.countDocuments();
        if (imgCount === 0) {
            await BackgroundImage.insertMany([
                { url: "https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=1920&q=80" },
                { url: "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=1920&q=80" },
                { url: "https://images.unsplash.com/photo-1519681393784-d120267933ba?w=1920&q=80" }
            ]);
        }

        const profileCount = await PersonalProfile.countDocuments();
        if (profileCount === 0) {
            await PersonalProfile.create({
                language: 'it',
                name: 'Alessandro Arbasino',
                title: 'Full Stack Developer',
                description: 'Sviluppatore appassionato con esperienza in React, Node.js e architetture cloud. Amo trasformare idee complesse in interfacce utente intuitive e scalabili.',
                greeting: 'Ciao, sono Alessandro! ',
                imageUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&q=80', // Placeholder
                socialLinks: {
                    github: 'https://github.com/mario-rossi',
                    linkedin: 'https://linkedin.com/in/mario-rossi'
                },
                cvUrl: '/assets/cv.pdf',
                experienceYears: 3,
                completedProjects: 12,
                skills: [
                    { name: 'React', level: 90 },
                    { name: 'Node.js', level: 85 },
                    { name: 'TypeScript', level: 80 },
                    { name: 'MongoDB', level: 75 },
                    { name: 'TailwindCSS', level: 95 }
                ]
            });
        }
    } catch (err) {
        console.error("Seeding error:", err);
    }
};

// Execute seeder
seedData();

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
