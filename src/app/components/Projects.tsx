import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronDown, Github, ExternalLink } from 'lucide-react';
import Slider from 'react-slick';
import { ImageWithFallback } from './figma/ImageWithFallback';



import { getProjects, Project } from '../../api';
import { useLanguage } from '../context/LanguageContext';

export function Projects() {
  const [expandedProject, setExpandedProject] = useState<string | null>(null);
  const [expandedSubProject, setExpandedSubProject] = useState<string | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  const projectRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});
  const subProjectRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});

  const { language, fixedTexts } = useLanguage();
  const t = fixedTexts?.projects;

  useEffect(() => {
    if (expandedProject && projectRefs.current[expandedProject]) {
      setTimeout(() => {
        projectRefs.current[expandedProject]?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 400);
    }
  }, [expandedProject]);

  useEffect(() => {
    if (expandedSubProject && subProjectRefs.current[expandedSubProject]) {
      setTimeout(() => {
        subProjectRefs.current[expandedSubProject]?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }, 400);
    }
  }, [expandedSubProject]);

  useEffect(() => {
    setLoading(true);
    getProjects(language)
      .then((data) => {
        setProjects(data);
        setLoading(false);
      })
      .catch((error) => {
        console.error('Error fetching projects:', error);
        setLoading(false);
      });
  }, [language]);

  if (loading) {
    return <div className="text-white text-center py-20">Loading projects...</div>;
  }

  const toggleProject = (id: string) => {
    setExpandedProject(expandedProject === id ? null : id);
    setExpandedSubProject(null);
  };

  const toggleSubProject = (id: string) => {
    setExpandedSubProject(expandedSubProject === id ? null : id);
  };

  const sliderSettings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: false,
    arrows: true,
  };

  return (
    <section id="projects" className="min-h-screen flex flex-col justify-center px-4 py-16">
      <div className="max-w-4xl mx-auto w-full">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-white mb-4 text-center">{t?.title || 'Progetti'}</h2>
          <p className="text-white/70 text-center mb-12">
            {t?.subtitle || 'Alcuni dei progetti su cui ho lavorato'}
          </p>
        </motion.div>

        <div className="space-y-4">
          {projects.map((project, index) => (
            <motion.div
              key={project.id}
              ref={(el: HTMLDivElement | null) => {
                if (el) projectRefs.current[project.id] = el;
              }}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              style={{ scrollMarginTop: '100px' }}
              className="bg-white/5 backdrop-blur-sm rounded-lg border border-white/10 overflow-hidden"
            >
              <button
                onClick={() => toggleProject(project.id)}
                className="w-full px-6 py-4 flex items-center justify-between hover:bg-white/5 transition-colors"
              >
                <div className="text-left flex-1">
                  <h3 className="text-white mb-1">{project.name}</h3>
                  <p className="text-white/60 text-sm">{project.description}</p>
                </div>
                <motion.div
                  animate={{ rotate: expandedProject === project.id ? 180 : 0 }}
                  transition={{ duration: 0.3 }}
                  className="text-white/60 ml-4"
                >
                  <ChevronDown size={20} />
                </motion.div>
              </button>

              <AnimatePresence>
                {expandedProject === project.id && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="overflow-hidden"
                  >
                    <div className="px-6 pb-4 border-t border-white/10">
                      <div className="pt-4">
                        {/* Image Carousel */}
                        {project.images && project.images.length > 0 && (
                          <div className="mb-4 project-slider px-10">
                            <Slider {...sliderSettings}>
                              {project.images.map((image, idx) => (
                                <div key={idx} className="px-1">
                                  <div className="relative aspect-video rounded-lg overflow-hidden">
                                    <ImageWithFallback
                                      src={image}
                                      alt={`${project.name} - Image ${idx + 1}`}
                                      className="w-full h-full object-cover"
                                    />
                                  </div>
                                </div>
                              ))}
                            </Slider>
                          </div>
                        )}

                        <div className="flex flex-wrap gap-2 mb-4">
                          {project.tech.map((tech) => (
                            <span
                              key={tech}
                              className="px-3 py-1 bg-white/10 text-white/80 rounded-full text-sm"
                            >
                              {tech}
                            </span>
                          ))}
                        </div>

                        {/* Challenges and Solutions */}
                        {project.challenges && project.challenges.length > 0 && (
                          <div className="mb-6 space-y-2">
                            <h4 className="text-white/80 font-medium mb-3">Sfide e Soluzioni</h4>
                            {project.challenges.map((challenge, cIndex) => (
                              <div
                                key={cIndex}
                                className="bg-white/5 rounded-lg border border-white/10 overflow-hidden"
                              >
                                <button
                                  onClick={() => {
                                    // Helper function or inline state management for generic accordion needed if we want independent toggle
                                    // For simplicity using a local map or just use details/summary or Radix.
                                    // Let's implement a simple inline toggle for this specific map if possible, 
                                    // BUT, implementing state for dynamic list inside a mapped component (Project) is tricky without extracting a component.
                                    // Let's Extract 'ChallengeItem' component inline or use details element for native behavior 
                                    // OR better: Create a ChallengeAccordion component outside.
                                    // Since I can't create new file easily without planning, I will make a simple toggle using state is hard here.
                                    // User asked for "Drop Down", so native <details> is perfect and simple.
                                  }}
                                  className="w-full text-left"
                                >
                                  <details className="group">
                                    <summary className="px-4 py-3 flex items-center justify-between cursor-pointer list-none hover:bg-white/5 transition-colors">
                                      <span className="text-white/90 text-sm font-medium">{challenge.problem}</span>
                                      <span className="text-white/60 group-open:rotate-180 transition-transform">
                                        <ChevronDown size={16} />
                                      </span>
                                    </summary>
                                    <div className="px-4 py-3 border-t border-white/10 bg-white/5 text-white/70 text-sm">
                                      <p><span className="text-green-400 font-medium">Soluzione:</span> {challenge.solution}</p>
                                    </div>
                                  </details>
                                </button>
                              </div>
                            ))}
                          </div>
                        )}

                        <div className="flex gap-3 mb-4">
                          {project.github && (
                            <a
                              href={project.github}
                              className="flex items-center gap-2 text-white/70 hover:text-white transition-colors text-sm"
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              <Github size={16} />
                              <span>GitHub</span>
                            </a>
                          )}
                          {project.demo && (
                            <a
                              href={project.demo}
                              className="flex items-center gap-2 text-white/70 hover:text-white transition-colors text-sm"
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              <ExternalLink size={16} />
                              <span>Demo</span>
                            </a>
                          )}
                        </div>

                        {project.subProjects && project.subProjects.length > 0 && (
                          <div className="mt-4 space-y-2">
                            <p className="text-white/60 text-sm mb-2">Sotto-progetti:</p>
                            {project.subProjects.map((subProject) => (
                              <div
                                key={subProject.id}
                                ref={(el: HTMLDivElement | null) => {
                                  if (el) subProjectRefs.current[subProject.id] = el;
                                }}
                                style={{ scrollMarginTop: '120px' }}
                                className="bg-white/5 rounded-lg border border-white/10 overflow-hidden"
                              >
                                <button
                                  onClick={() => toggleSubProject(subProject.id)}
                                  className="w-full px-4 py-3 flex items-center justify-between hover:bg-white/5 transition-colors"
                                >
                                  <span className="text-white/80 text-sm">{subProject.name}</span>
                                  <motion.div
                                    animate={{ rotate: expandedSubProject === subProject.id ? 180 : 0 }}
                                    transition={{ duration: 0.3 }}
                                    className="text-white/60"
                                  >
                                    <ChevronDown size={16} />
                                  </motion.div>
                                </button>

                                <AnimatePresence>
                                  {expandedSubProject === subProject.id && (
                                    <motion.div
                                      initial={{ height: 0, opacity: 0 }}
                                      animate={{ height: 'auto', opacity: 1 }}
                                      exit={{ height: 0, opacity: 0 }}
                                      transition={{ duration: 0.3 }}
                                      className="overflow-hidden"
                                    >
                                      <div className="px-4 pb-3 border-t border-white/10">
                                        {/* SubProject Image Carousel */}
                                        {subProject.images && subProject.images.length > 0 && (
                                          <div className="mt-3 mb-3 subproject-slider px-10">
                                            <Slider {...sliderSettings}>
                                              {subProject.images.map((image, idx) => (
                                                <div key={idx} className="px-1">
                                                  <div className="relative aspect-video rounded-lg overflow-hidden">
                                                    <ImageWithFallback
                                                      src={image}
                                                      alt={`${subProject.name} - Image ${idx + 1}`}
                                                      className="w-full h-full object-cover"
                                                    />
                                                  </div>
                                                </div>
                                              ))}
                                            </Slider>
                                          </div>
                                        )}

                                        {/* SubProject Challenges */}
                                        {subProject.challenges && subProject.challenges.length > 0 && (
                                          <div className="mb-4 space-y-2">
                                            <p className="text-white/60 text-xs font-medium">Sfide:</p>
                                            {subProject.challenges.map((challenge, scIndex) => (
                                              <div key={scIndex} className="bg-white/5 rounded border border-white/5 overflow-hidden">
                                                <details className="group">
                                                  <summary className="px-3 py-2 flex items-center justify-between cursor-pointer list-none hover:bg-white/5">
                                                    <span className="text-white/80 text-xs">{challenge.problem}</span>
                                                    <ChevronDown size={12} className="text-white/40 group-open:rotate-180 transition-transform" />
                                                  </summary>
                                                  <div className="px-3 py-2 border-t border-white/5 bg-black/20 text-white/60 text-xs">
                                                    <span className="text-green-400/80">Soluzione: </span> {challenge.solution}
                                                  </div>
                                                </details>
                                              </div>
                                            ))}
                                          </div>
                                        )}

                                        <p className="text-white/60 text-sm mb-3">
                                          {subProject.description}
                                        </p>
                                        <div className="flex flex-wrap gap-2 mb-2">
                                          {subProject.tech.map((tech) => (
                                            <span
                                              key={tech}
                                              className="px-2 py-1 bg-white/10 text-white/70 rounded-full text-xs"
                                            >
                                              {tech}
                                            </span>
                                          ))}
                                        </div>
                                        {subProject.link && (
                                          <a
                                            href={subProject.link}
                                            className="flex items-center gap-1 text-white/70 hover:text-white transition-colors text-xs"
                                            target="_blank"
                                            rel="noopener noreferrer"
                                          >
                                            <ExternalLink size={12} />
                                            <span>Vedi dettagli</span>
                                          </a>
                                        )}
                                      </div>
                                    </motion.div>
                                  )}
                                </AnimatePresence>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>
      </div >
    </section >
  );
}
