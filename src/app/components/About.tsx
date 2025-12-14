import { motion } from 'motion/react';
import { Code2, Database, Layout } from 'lucide-react';

export function About() {
  const skills = [
    {
      icon: <Layout size={24} />,
      title: 'Frontend',
      description: 'React, TypeScript, Tailwind CSS',
    },
    {
      icon: <Database size={24} />,
      title: 'Backend',
      description: 'Node.js, Express, PostgreSQL',
    },
    {
      icon: <Code2 size={24} />,
      title: 'Tools',
      description: 'Git, Docker, REST API',
    },
  ];

  return (
    <section id="about" className="min-h-screen flex flex-col justify-center px-4 py-16">
      <div className="max-w-4xl mx-auto w-full">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-white mb-4 text-center">Chi Sono</h2>
          <p className="text-white/70 text-center mb-12 max-w-2xl mx-auto">
            Sviluppatore full stack con passione per la creazione di applicazioni web scalabili e user-friendly. 
            Sempre alla ricerca di nuove sfide e opportunità di crescita professionale.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {skills.map((skill, index) => (
            <motion.div
              key={skill.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className="bg-white/5 backdrop-blur-sm rounded-lg p-6 border border-white/10 hover:border-white/20 transition-colors"
            >
              <div className="text-white/80 mb-4">{skill.icon}</div>
              <h3 className="text-white mb-2">{skill.title}</h3>
              <p className="text-white/60 text-sm">{skill.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
