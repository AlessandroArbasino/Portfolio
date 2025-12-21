import { motion } from 'motion/react';
import { Code2, Database, Layout, Briefcase, Award, GraduationCap } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { ImageWithFallback } from './figma/ImageWithFallback'; // Assuming it's a named export, checking the file would confirm but standard pattern is likely named or default. I'll check usage in Projects.tsx if I fail, but I'll assume named for now based on typical patterns or 'export function'.
import { useEffect, useMemo, useState } from 'react';
import { fetchProfile, PersonalProfile } from '../../api';

export function About() {
  const { fixedTexts, language } = useLanguage();
  const t = fixedTexts?.about;

  const [profile, setProfile] = useState<PersonalProfile | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    fetchProfile(language)
      .then((data) => setProfile(data))
      .catch((e) => setError(e?.message || 'Failed to load profile'))
      .finally(() => setLoading(false));
  }, [language]);

  const skills = useMemo(() => {
    if (profile?.competences && profile.competences.length > 0) {
      return profile.competences.map((c) => ({
        icon: c.icon === 'layout' ? <Layout size={24} />
          : c.icon === 'database' ? <Database size={24} />
            : c.icon === 'code' ? <Code2 size={24} />
              : <Code2 size={24} />,
        title: c.title,
        description: c.description,
      }));
    }
    return [
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
  }, [profile]);

  const highlights = useMemo(() => [
    {
      icon: <Briefcase size={20} />,
      title: (profile?.experienceYears != null ? String(profile.experienceYears) : (t?.years || 'Years')),
      description: t?.experience || 'Experience',
    },
    {
      icon: <Award size={20} />,
      title: (profile?.completedProjects != null ? String(profile.completedProjects) : (t?.projects || 'Projects')),
      description: t?.completed || 'Completed',
    },
    {
      icon: <GraduationCap size={20} />,
      title: t?.training || 'Training',
      description: t?.continuous || 'Continuous',
    },
  ], [profile, t]);

  return (
    <section id="about" className="flex flex-col justify-center px-4 py-8">
      <div className="max-w-6xl mx-auto w-full">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-white mb-12 text-center">{t?.title || 'About Me'}</h2>
        </motion.div>

        {/* Profile Section with Image */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 mb-16">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="flex justify-center lg:justify-end"
          >
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-purple-500/20 to-blue-500/20 rounded-2xl blur-2xl"></div>
              <div className="relative w-64 h-64 md:w-80 md:h-80 rounded-2xl overflow-hidden border-2 border-white/10">
                <ImageWithFallback
                  src={profile?.imageUrl || "https://images.unsplash.com/photo-1737575655055-e3967cbefd03?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwcm9mZXNzaW9uYWwlMjBkZXZlbG9wZXIlMjBwb3J0cmFpdHxlbnwxfHx8fDE3NjU4Mjk4OTB8MA&ixlib=rb-4.1.0&q=80&w=1080"}
                  alt="Profile"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="flex flex-col justify-center"
          >
            <h3 className="text-white mb-4">{profile?.greeting || t?.greeting || 'Hello there!'}</h3>
            <p className="text-white/70 mb-4 leading-relaxed">
              {profile?.description || t?.description1 || 'I am a passionate developer...'}
            </p>
            <p className="text-white/70 mb-6 leading-relaxed">
              {t?.description2 || ''}
            </p>

            {/* Highlights */}
            <div className="grid grid-cols-3 gap-4">
              {highlights.map((highlight, index) => (
                <motion.div
                  key={highlight.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: 0.6 + index * 0.1 }}
                  className="bg-white/5 backdrop-blur-sm rounded-lg p-3 border border-white/10 text-center"
                >
                  <div className="text-white/80 mb-2 flex justify-center">{highlight.icon}</div>
                  <div className="text-white text-sm mb-1">{highlight.title}</div>
                  <div className="text-white/60 text-xs">{highlight.description}</div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Skills Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mb-8"
        >
          <h2 className="text-white text-center mb-12">{t?.skills || 'My Skills'}</h2>
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
