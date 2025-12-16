import { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { fetchProfile, PersonalProfile } from '../../api';
import { useLanguage } from '../context/LanguageContext';

export function PersonalIntro() {
    const { language } = useLanguage();
    const [profile, setProfile] = useState<PersonalProfile | null>(null);

    useEffect(() => {
        fetchProfile(language)
            .then(setProfile)
            .catch(console.error);
    }, [language]);

    if (!profile) return null;

    return (
        <section className="relative py-20 px-6 z-20 overflow-hidden">
            <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center gap-12">
                {/* Profile Image */}
                <motion.div
                    initial={{ opacity: 0, x: -50 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8 }}
                    className="w-full md:w-1/3 flex justify-center"
                >
                    <div className="relative w-64 h-64 md:w-80 md:h-80 rounded-full overflow-hidden border-4 border-primary shadow-2xl">
                        {profile.imageUrl ? (
                            <img
                                src={profile.imageUrl}
                                alt={profile.name}
                                className="w-full h-full object-cover"
                            />
                        ) : (
                            <div className="w-full h-full bg-muted flex items-center justify-center text-4xl text-muted-foreground">
                                {profile.name.charAt(0)}
                            </div>
                        )}
                    </div>
                </motion.div>

                {/* Info & Skills */}
                <motion.div
                    initial={{ opacity: 0, x: 50 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8 }}
                    className="w-full md:w-2/3 backdrop-blur-sm bg-background/30 p-8 rounded-3xl border border-white/10"
                >
                    <h2 className="text-4xl md:text-5xl font-bold mb-2 text-primary-foreground">{profile.name}</h2>
                    <h3 className="text-xl md:text-2xl text-secondary-foreground mb-6 font-medium bg-secondary/80 inline-block px-3 py-1 rounded-lg">
                        {profile.title}
                    </h3>
                    <p className="text-lg text-primary-foreground/90 leading-relaxed mb-8">
                        {profile.description}
                    </p>

                    <div className="space-y-4">
                        <h4 className="text-xl font-semibold text-primary-foreground mb-4">Core Skills</h4>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {profile.skills.map((skill, index) => (
                                <div key={index} className="space-y-1">
                                    <div className="flex justify-between text-sm font-medium text-primary-foreground/80">
                                        <span>{skill.name}</span>
                                        <span>{skill.level}%</span>
                                    </div>
                                    <div className="w-full bg-black/20 rounded-full h-2.5 overflow-hidden border border-white/10">
                                        <motion.div
                                            className="bg-accent h-2.5 rounded-full"
                                            initial={{ width: 0 }}
                                            whileInView={{ width: `${skill.level}%` }}
                                            viewport={{ once: true }}
                                            transition={{ duration: 1, delay: 0.2 + index * 0.1 }}
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </motion.div>
            </div>
        </section>
    );
}
