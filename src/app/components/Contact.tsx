import { motion } from 'motion/react';
import { Mail, Linkedin, Github } from 'lucide-react';

export function Contact() {
  const contacts = [
    {
      icon: <Mail size={24} />,
      label: 'Email',
      value: 'mario.rossi@email.com',
      href: 'mailto:mario.rossi@email.com',
    },
    {
      icon: <Linkedin size={24} />,
      label: 'LinkedIn',
      value: 'linkedin.com/in/mariorossi',
      href: 'https://linkedin.com',
    },
    {
      icon: <Github size={24} />,
      label: 'GitHub',
      value: 'github.com/mariorossi',
      href: 'https://github.com',
    },
  ];

  return (
    <section id="contact" className="min-h-screen flex flex-col justify-center px-4 py-16">
      <div className="max-w-4xl mx-auto w-full">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-white mb-4 text-center">Contatti</h2>
          <p className="text-white/70 text-center mb-12">
            Interessato a collaborare? Contattiamoci!
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {contacts.map((contact, index) => (
            <motion.a
              key={contact.label}
              href={contact.href}
              target="_blank"
              rel="noopener noreferrer"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className="bg-white/5 backdrop-blur-sm rounded-lg p-6 border border-white/10 hover:border-white/20 hover:bg-white/10 transition-all group"
            >
              <div className="text-white/80 group-hover:text-white transition-colors mb-4">
                {contact.icon}
              </div>
              <h3 className="text-white mb-2">{contact.label}</h3>
              <p className="text-white/60 text-sm break-all">{contact.value}</p>
            </motion.a>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="text-center mt-12"
        >
          <p className="text-white/40 text-sm">
            © 2024 Mario Rossi. Tutti i diritti riservati.
          </p>
        </motion.div>
      </div>
    </section>
  );
}
