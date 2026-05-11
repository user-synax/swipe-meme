'use client';

import { motion } from 'framer-motion';
import { Heart, Code, Users, Sparkles } from 'lucide-react';
import Link from 'next/link';
import dynamic from 'next/dynamic';

// Dynamically import framer-motion to avoid SSR issues
const MotionDiv = dynamic(() => import('framer-motion').then((mod) => mod.motion.div), { ssr: false });

export default function AboutPage() {
  const team = [
    {
      name: 'Sujal Srivastav',
      role: 'Founder & Visionary',
      avatar: '/authors/founder.jpeg',
      description: 'The creative mind behind SwipeMeme, Sujal envisioned a platform where humor meets connection. With a passion for bringing people together through shared laughter, he pioneered the concept of meme-based matchmaking.',
      skills: ['Product Strategy', 'Vision', 'Community Building'],
      color: 'from-purple-400 to-pink-400'
    },
    {
      name: 'Ayush',
      role: 'Lead Developer',
      avatar: '/authors/developer.png',
      description: 'The technical architect who brought SwipeMeme to life. Ayush transformed the vision into reality with clean code, innovative features, and a seamless user experience that makes meme matching magical.',
      skills: ['Full-Stack Development', 'React/Next.js', 'System Design'],
      color: 'from-blue-400 to-cyan-400'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-secondary/10" />
        <div className="relative container mx-auto px-6 py-24">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center max-w-4xl mx-auto"
          >
            <div className="flex justify-center mb-6">
              <div className="p-4 bg-primary/10 rounded-full">
                <Heart className="w-12 h-12 text-primary" />
              </div>
            </div>
            <h1 className="text-5xl font-black text-foreground mb-6 tracking-tighter">
              About SwipeMeme
            </h1>
            <p className="text-xl text-muted-foreground mb-8 leading-relaxed">
              Where humor finds its match. We're on a mission to connect people through the universal language of memes, 
              making dating more fun, authentic, and laughter-filled.
            </p>
            <div className="flex justify-center gap-4">
              <Link href="/feed">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-8 py-3 bg-primary text-primary-foreground rounded-xl font-bold shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all"
                >
                  Start Swiping
                </motion.button>
              </Link>
              <Link href="/auth/register">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-8 py-3 bg-secondary text-secondary-foreground rounded-xl font-bold shadow-lg shadow-secondary/20 hover:shadow-secondary/30 transition-all"
                >
                  Join Us
                </motion.button>
              </Link>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Team Section */}
      <div className="container mx-auto px-6 py-24">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <div className="flex justify-center mb-4">
            <Users className="w-8 h-8 text-primary" />
          </div>
          <h2 className="text-3xl font-black text-foreground mb-4 tracking-tighter">
            Meet the Team
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            The passionate individuals behind SwipeMeme, working together to revolutionize how people connect through humor.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-6 md:gap-8 max-w-6xl mx-auto px-4">
          {team.map((member, index) => (
            <motion.div
              key={member.name}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.2 }}
              viewport={{ once: true }}
              className="group w-full"
            >
              <div className="bg-card border border-border rounded-2xl p-4 sm:p-6 md:p-8 shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1 h-full flex flex-col min-h-[400px] sm:min-h-[500px]">
                {/* Avatar - Half the card height, rectangular */}
                <div className="mb-4 sm:mb-6 flex-1 -mx-4 sm:-mx-6 md:-mx-8">
                  <div className={`w-full h-full bg-gradient-to-r ${member.color} p-1 shadow-lg group-hover:scale-105 transition-transform duration-300`}>
                    <img
                      src={member.avatar}
                      alt={member.name}
                      className="w-full h-full bg-white object-cover"
                    />
                  </div>
                </div>

                {/* Info */}
                <div className="text-center flex-1 flex flex-col justify-center px-2 sm:px-0">
                  <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-foreground mb-1 sm:mb-2">{member.name}</h3>
                  <p className="text-primary font-semibold mb-2 sm:mb-4 text-xs sm:text-sm md:text-base">{member.role}</p>
                  <p className="text-muted-foreground mb-3 sm:mb-6 leading-relaxed text-xs sm:text-sm md:text-base flex-1">{member.description}</p>
                  
                  {/* Skills */}
                  <div className="flex flex-wrap justify-center gap-1 sm:gap-2">
                    {member.skills.map((skill) => (
                      <span
                        key={skill}
                        className="px-1.5 sm:px-2 md:px-3 py-1 bg-muted text-muted-foreground rounded-full text-xs sm:text-xs md:text-sm font-medium"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Mission Section */}
      <div className="container mx-auto px-6 py-24">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="max-w-4xl mx-auto text-center"
        >
          <div className="flex justify-center mb-6">
            <div className="p-4 bg-primary/10 rounded-full">
              <Sparkles className="w-8 h-8 text-primary" />
            </div>
          </div>
          <h2 className="text-3xl font-black text-foreground mb-6 tracking-tighter">
            Our Mission
          </h2>
          <p className="text-lg text-muted-foreground mb-8 leading-relaxed">
            We believe that shared laughter is the foundation of meaningful connections. 
            SwipeMeme isn't just another dating app – it's a platform where authenticity meets humor, 
            where your sense of humor becomes your superpower, and where every match has the potential 
            for endless laughter.
          </p>
          <div className="grid md:grid-cols-3 gap-8">
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="text-center"
            >
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Heart className="w-8 h-8 text-primary" />
              </div>
              <h3 className="font-bold text-foreground mb-2">Authentic Connections</h3>
              <p className="text-sm text-muted-foreground">Real people, real humor, real connections</p>
            </motion.div>
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="text-center"
            >
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Code className="w-8 h-8 text-primary" />
              </div>
              <h3 className="font-bold text-foreground mb-2">Smart Matching</h3>
              <p className="text-sm text-muted-foreground">AI-powered humor compatibility</p>
            </motion.div>
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="text-center"
            >
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="w-8 h-8 text-primary" />
              </div>
              <h3 className="font-bold text-foreground mb-2">Community First</h3>
              <p className="text-sm text-muted-foreground">Built by meme lovers, for meme lovers</p>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
