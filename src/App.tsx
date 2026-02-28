/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  User, 
  Mail, 
  Lock, 
  Phone, 
  ChevronRight, 
  BookOpen, 
  Map, 
  Calendar, 
  CheckSquare, 
  Briefcase, 
  Linkedin, 
  MessageSquare, 
  Trophy, 
  Users, 
  Plus, 
  Github, 
  Heart,
  Info,
  LogOut,
  Send
} from 'lucide-react';
import Markdown from 'react-markdown';
import { 
  generateRoadmap, 
  generateSchedule, 
  generateCourses, 
  generateJobOpenings, 
  generateLinkedInPortfolio, 
  generateQuizQuestion,
  compareCredits 
} from './services/gemini';

// --- Types ---

type UserType = 'beginner' | 'veteran';
type Page = 'login' | 'signup' | 'onboarding' | 'dashboard';

interface Project {
  id: string;
  name: string;
  description: string;
  githubUrl: string;
  likes: number;
  author: string;
}

// --- Components ---

export default function App() {
  const [currentPage, setCurrentPage] = useState<Page>('login');
  const [userType, setUserType] = useState<UserType | null>(null);
  const [selectedDomain, setSelectedDomain] = useState<string>('');
  const [isPhoneLogin, setIsPhoneLogin] = useState(false);
  const [showReadMore, setShowReadMore] = useState(false);
  const [activeTab, setActiveTab] = useState('roadmap');
  const [credits, setCredits] = useState(0);
  const [projects, setProjects] = useState<Project[]>([]);
  const [likedProjects, setLikedProjects] = useState<Set<string>>(new Set());

  // AI Content States
  const [roadmap, setRoadmap] = useState('');
  const [schedule, setSchedule] = useState('');
  const [courses, setCourses] = useState('');
  const [openings, setOpenings] = useState('');
  const [linkedin, setLinkedin] = useState('');
  const [quiz, setQuiz] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const domains = [
    "Web Development", "Cyber Security", "Block Chain", "IOT", 
    "Cloud Computing", "Machine Learning", "Agentic AI", "DevOps", 
    "Android Development", "Data Analytics", "Game Development"
  ];

  const readMoreText = `1. Technical Development & Engineering
These are the "builders" of the tech world. They focus on writing code and creating systems.
Software Developer (SDE): The most common role. Focuses on building applications, usually specializing in Java, Python, or C++.
Full-Stack Developer: Handles both the "front" (what users see) and the "back" (server and database) of a web application.
Mobile App Developer: Specializes in Android (Kotlin/Java) or iOS (Swift) development.
Embedded Systems Engineer: Works on the intersection of hardware and software (like smartwatches or IoT devices).

2. Quality & Reliability (The "Guardians")
These roles ensure that the software works perfectly and can handle millions of users.
QA / Software Tester: Finding bugs and ensuring the product meets quality standards.
Manual Testing: Human-led checking.
Automation Testing: Writing scripts to test code automatically.
DevOps Engineer: Focuses on the "pipes" that deliver code to the cloud. They automate deployment and monitor system health.
Cybersecurity Analyst: Protects company data from hackers and ensures the system is secure.

3. Data & AI (The "Brain")
Ideal for those who enjoy math, statistics, and finding patterns.
Data Analyst: Uses tools like SQL, Excel, and Power BI to explain what has happened in the past.
Data Scientist: Uses advanced math to predict what will happen next.
AI / ML Engineer: Builds models that allow computers to "learn"—this includes Generative AI and Automation.
Data Engineer: Builds the "plumbing" that moves data from one place to another so analysts can use it.

4. Product & Design (The "Architects")
These roles focus on what should be built and how it should look.
UI/UX Designer: Creates the visual layout and ensures the user has a smooth experience.
Product Management (PM): The bridge between business and tech. They decide the "roadmap" for what features to build next.
Business Analyst (BA): Translates business needs into technical requirements for the developers.`;

  // --- Handlers ---

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage('dashboard');
  };

  const handleSignup = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage('onboarding');
  };

  const handleDomainSelect = (domain: string) => {
    setSelectedDomain(domain);
    if (userType === 'veteran') {
      setCurrentPage('dashboard');
    }
  };

  const fetchRoadmap = async () => {
    setLoading(true);
    const res = await generateRoadmap(selectedDomain);
    setRoadmap(res || '');
    setLoading(false);
  };

  const fetchSchedule = async () => {
    setLoading(true);
    const res = await generateSchedule(selectedDomain);
    setSchedule(res || '');
    setLoading(false);
  };

  const fetchCourses = async () => {
    setLoading(true);
    const res = await generateCourses([selectedDomain]);
    setCourses(res || '');
    setLoading(false);
  };

  const fetchOpenings = async (address: string) => {
    setLoading(true);
    const res = await generateJobOpenings(selectedDomain, address);
    setOpenings(res || '');
    setLoading(false);
  };

  const fetchLinkedin = async () => {
    setLoading(true);
    const res = await generateLinkedInPortfolio(userType || 'beginner', selectedDomain);
    setLinkedin(res || '');
    setLoading(false);
  };

  const fetchQuiz = async (category: string, lang: string, level: string) => {
    setLoading(true);
    const res = await generateQuizQuestion(category, lang, level);
    setQuiz(res);
    setLoading(false);
  };

  const handleLike = (id: string) => {
    if (likedProjects.has(id)) return;
    setProjects(prev => prev.map(p => p.id === id ? { ...p, likes: p.likes + 1 } : p));
    setLikedProjects(prev => new Set(prev).add(id));
  };

  // --- Views ---

  const LoginView = () => (
    <div className="min-h-screen flex items-center justify-center bg-zinc-50 p-4">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md bg-white rounded-3xl shadow-xl p-8 border border-zinc-200"
      >
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-zinc-900">Welcome Back</h1>
          <p className="text-zinc-500 mt-2">Sign in to continue your journey</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          {isPhoneLogin ? (
            <div className="relative">
              <Phone className="absolute left-3 top-3.5 h-5 w-5 text-zinc-400" />
              <input 
                type="tel" 
                placeholder="Phone Number" 
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-zinc-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                required
              />
            </div>
          ) : (
            <div className="relative">
              <Mail className="absolute left-3 top-3.5 h-5 w-5 text-zinc-400" />
              <input 
                type="email" 
                placeholder="Email Address" 
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-zinc-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                required
              />
            </div>
          )}

          <div className="relative">
            <Lock className="absolute left-3 top-3.5 h-5 w-5 text-zinc-400" />
            <input 
              type="password" 
              placeholder="Password" 
              className="w-full pl-10 pr-4 py-3 rounded-xl border border-zinc-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
              required
            />
          </div>

          <button 
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-xl transition-colors shadow-lg shadow-blue-200"
          >
            Sign In
          </button>
        </form>

        <div className="mt-6 text-center space-y-4">
          <button 
            onClick={() => setIsPhoneLogin(!isPhoneLogin)}
            className="text-sm font-medium text-blue-600 hover:text-blue-700"
          >
            {isPhoneLogin ? 'Login with Email' : 'Login with Phone Number'}
          </button>
          <p className="text-sm text-zinc-500">
            Don't have an account? {' '}
            <button onClick={() => setCurrentPage('signup')} className="text-blue-600 font-semibold">Sign Up</button>
          </p>
        </div>
      </motion.div>
    </div>
  );

  const SignupView = () => (
    <div className="min-h-screen flex items-center justify-center bg-zinc-50 p-4">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md bg-white rounded-3xl shadow-xl p-8 border border-zinc-200"
      >
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-zinc-900">Create Account</h1>
          <p className="text-zinc-500 mt-2">Join PlacementPro today</p>
        </div>

        <form onSubmit={handleSignup} className="space-y-4">
          <div className="relative">
            <User className="absolute left-3 top-3.5 h-5 w-5 text-zinc-400" />
            <input 
              type="text" 
              placeholder="Full Name" 
              className="w-full pl-10 pr-4 py-3 rounded-xl border border-zinc-200 focus:ring-2 focus:ring-blue-500 outline-none"
              required
            />
          </div>
          <div className="relative">
            <Mail className="absolute left-3 top-3.5 h-5 w-5 text-zinc-400" />
            <input 
              type="email" 
              placeholder="Email Address" 
              className="w-full pl-10 pr-4 py-3 rounded-xl border border-zinc-200 focus:ring-2 focus:ring-blue-500 outline-none"
              required
            />
          </div>
          <div className="relative">
            <Lock className="absolute left-3 top-3.5 h-5 w-5 text-zinc-400" />
            <input 
              type="password" 
              placeholder="Password" 
              className="w-full pl-10 pr-4 py-3 rounded-xl border border-zinc-200 focus:ring-2 focus:ring-blue-500 outline-none"
              required
            />
          </div>

          <button 
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-xl transition-colors shadow-lg shadow-blue-200"
          >
            Create Account
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-zinc-500">
          Already have an account? {' '}
          <button onClick={() => setCurrentPage('login')} className="text-blue-600 font-semibold">Sign In</button>
        </p>
      </motion.div>
    </div>
  );

  const OnboardingView = () => (
    <div className="min-h-screen bg-zinc-50 p-8 flex flex-col items-center justify-center">
      {!userType ? (
        <div className="max-w-2xl w-full text-center space-y-8">
          <h1 className="text-4xl font-bold text-zinc-900">Tell us about yourself</h1>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <button 
              onClick={() => setUserType('beginner')}
              className="p-8 bg-white rounded-3xl border-2 border-transparent hover:border-blue-500 shadow-lg transition-all group text-left"
            >
              <div className="w-12 h-12 bg-blue-100 rounded-2xl flex items-center justify-center mb-4 group-hover:bg-blue-600 transition-colors">
                <BookOpen className="h-6 w-6 text-blue-600 group-hover:text-white" />
              </div>
              <h3 className="text-xl font-bold text-zinc-900">Beginner</h3>
              <p className="text-zinc-500 mt-2">I'm just starting my tech journey and need guidance.</p>
            </button>
            <button 
              onClick={() => setUserType('veteran')}
              className="p-8 bg-white rounded-3xl border-2 border-transparent hover:border-blue-500 shadow-lg transition-all group text-left"
            >
              <div className="w-12 h-12 bg-emerald-100 rounded-2xl flex items-center justify-center mb-4 group-hover:bg-emerald-600 transition-colors">
                <Trophy className="h-6 w-6 text-emerald-600 group-hover:text-white" />
              </div>
              <h3 className="text-xl font-bold text-zinc-900">Veteran</h3>
              <p className="text-zinc-500 mt-2">I have experience and want to advance or mentor.</p>
            </button>
          </div>
        </div>
      ) : (
        <div className="max-w-4xl w-full space-y-8">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold text-zinc-900">Select your interested domain</h1>
            {userType === 'beginner' && (
              <button 
                onClick={() => setShowReadMore(true)}
                className="flex items-center gap-2 text-blue-600 font-semibold hover:underline"
              >
                <Info className="h-5 w-5" />
                Read More
              </button>
            )}
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {domains.map(domain => (
              <button 
                key={domain}
                onClick={() => handleDomainSelect(domain)}
                className={`p-4 rounded-2xl border transition-all text-sm font-medium ${
                  selectedDomain === domain 
                  ? 'bg-blue-600 text-white border-blue-600 shadow-lg' 
                  : 'bg-white text-zinc-700 border-zinc-200 hover:border-blue-300'
                }`}
              >
                {domain}
              </button>
            ))}
          </div>

          {userType === 'beginner' && selectedDomain && (
            <div className="flex justify-center mt-8">
              <button 
                onClick={() => setCurrentPage('dashboard')}
                className="bg-blue-600 text-white px-12 py-3 rounded-xl font-bold shadow-lg hover:bg-blue-700 transition-all"
              >
                OK
              </button>
            </div>
          )}
        </div>
      )}

      <AnimatePresence>
        {showReadMore && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              className="bg-white rounded-3xl max-w-2xl w-full max-h-[80vh] overflow-y-auto p-8 shadow-2xl"
            >
              <h2 className="text-2xl font-bold mb-6">Tech Career Guide</h2>
              <div className="prose prose-zinc max-w-none whitespace-pre-wrap text-zinc-600">
                {readMoreText}
              </div>
              <button 
                onClick={() => setShowReadMore(false)}
                className="mt-8 w-full bg-zinc-900 text-white py-3 rounded-xl font-bold"
              >
                Close
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );

  const DashboardView = () => {
    const [checklist, setChecklist] = useState<{id: number, text: string, done: boolean}[]>([]);
    const [newTodo, setNewTodo] = useState('');
    const [address, setAddress] = useState('');
    const [showProjectModal, setShowProjectModal] = useState(false);
    const [newProject, setNewProject] = useState({ name: '', description: '', githubUrl: '' });

    const tabs = userType === 'beginner' 
      ? ['roadmap', 'schedule', 'checklist', 'courses', 'openings', 'linkedin', 'communication', 'quiz', 'community']
      : ['linkedin', 'communication', 'quiz', 'community'];

    const renderTabContent = () => {
      if (loading) return (
        <div className="flex flex-col items-center justify-center py-20 space-y-4">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-zinc-500 font-medium">AI is crafting your content...</p>
        </div>
      );

      switch (activeTab) {
        case 'roadmap':
          return (
            <div className="space-y-6">
              <div className="flex items-center justify-between bg-white p-6 rounded-3xl shadow-sm border border-zinc-100">
                <div>
                  <h2 className="text-2xl font-bold">8-Week Learning Roadmap</h2>
                  <p className="text-zinc-500">Personalized path for {selectedDomain}</p>
                </div>
                <button 
                  onClick={fetchRoadmap}
                  className="bg-blue-600 text-white px-6 py-2 rounded-xl font-bold hover:bg-blue-700 transition-all"
                >
                  Generate Roadmap
                </button>
              </div>
              {roadmap && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-white p-8 rounded-3xl shadow-sm border border-zinc-100 prose prose-blue max-w-none">
                  <Markdown>{roadmap}</Markdown>
                </motion.div>
              )}
            </div>
          );
        case 'schedule':
          return (
            <div className="space-y-6">
              <div className="flex items-center justify-between bg-white p-6 rounded-3xl shadow-sm border border-zinc-100">
                <div>
                  <h2 className="text-2xl font-bold">8-Week Study Schedule</h2>
                  <p className="text-zinc-500">Daily routine for {selectedDomain}</p>
                </div>
                <button 
                  onClick={fetchSchedule}
                  className="bg-blue-600 text-white px-6 py-2 rounded-xl font-bold hover:bg-blue-700 transition-all"
                >
                  Generate Schedule
                </button>
              </div>
              {schedule && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-white p-8 rounded-3xl shadow-sm border border-zinc-100 prose prose-blue max-w-none">
                  <Markdown>{schedule}</Markdown>
                </motion.div>
              )}
            </div>
          );
        case 'checklist':
          return (
            <div className="max-w-2xl mx-auto space-y-6">
              <div className="bg-white p-6 rounded-3xl shadow-sm border border-zinc-100">
                <h2 className="text-2xl font-bold mb-4">Your Learning Checklist</h2>
                <div className="flex gap-2">
                  <input 
                    type="text" 
                    value={newTodo}
                    onChange={(e) => setNewTodo(e.target.value)}
                    placeholder="Add a new task..."
                    className="flex-1 px-4 py-2 rounded-xl border border-zinc-200 outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <button 
                    onClick={() => {
                      if (!newTodo) return;
                      setChecklist([...checklist, { id: Date.now(), text: newTodo, done: false }]);
                      setNewTodo('');
                    }}
                    className="bg-blue-600 text-white p-2 rounded-xl"
                  >
                    <Plus className="h-6 w-6" />
                  </button>
                </div>
              </div>
              <div className="space-y-2">
                {checklist.map(item => (
                  <div key={item.id} className="flex items-center gap-3 bg-white p-4 rounded-2xl border border-zinc-100 shadow-sm">
                    <button 
                      onClick={() => setChecklist(checklist.map(i => i.id === item.id ? { ...i, done: !i.done } : i))}
                      className={`w-6 h-6 rounded-md border-2 flex items-center justify-center transition-all ${item.done ? 'bg-blue-600 border-blue-600' : 'border-zinc-300'}`}
                    >
                      {item.done && <CheckSquare className="h-4 w-4 text-white" />}
                    </button>
                    <span className={`flex-1 ${item.done ? 'line-through text-zinc-400' : 'text-zinc-700'}`}>{item.text}</span>
                  </div>
                ))}
              </div>
            </div>
          );
        case 'courses':
          return (
            <div className="space-y-6">
              <div className="flex items-center justify-between bg-white p-6 rounded-3xl shadow-sm border border-zinc-100">
                <div>
                  <h2 className="text-2xl font-bold">Recommended Courses</h2>
                  <p className="text-zinc-500">Latest resources for your domain</p>
                </div>
                <button 
                  onClick={fetchCourses}
                  className="bg-blue-600 text-white px-6 py-2 rounded-xl font-bold hover:bg-blue-700 transition-all"
                >
                  Find Courses
                </button>
              </div>
              {courses && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-white p-8 rounded-3xl shadow-sm border border-zinc-100 prose prose-blue max-w-none">
                  <Markdown>{courses}</Markdown>
                </motion.div>
              )}
            </div>
          );
        case 'openings':
          return (
            <div className="space-y-6">
              <div className="bg-white p-6 rounded-3xl shadow-sm border border-zinc-100">
                <h2 className="text-2xl font-bold mb-4">Job Openings Near You</h2>
                <div className="flex gap-2">
                  <input 
                    type="text" 
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="Enter your address/city..."
                    className="flex-1 px-4 py-2 rounded-xl border border-zinc-200 outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <button 
                    onClick={() => fetchOpenings(address)}
                    className="bg-blue-600 text-white px-6 py-2 rounded-xl font-bold"
                  >
                    Search Jobs
                  </button>
                </div>
              </div>
              {openings && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-white p-8 rounded-3xl shadow-sm border border-zinc-100 prose prose-blue max-w-none">
                  <Markdown>{openings}</Markdown>
                </motion.div>
              )}
            </div>
          );
        case 'linkedin':
          return (
            <div className="space-y-6">
              <div className="flex items-center justify-between bg-white p-6 rounded-3xl shadow-sm border border-zinc-100">
                <div>
                  <h2 className="text-2xl font-bold">LinkedIn Portfolio Builder</h2>
                  <p className="text-zinc-500">AI-optimized profile content</p>
                </div>
                <button 
                  onClick={fetchLinkedin}
                  className="bg-blue-600 text-white px-6 py-2 rounded-xl font-bold hover:bg-blue-700 transition-all"
                >
                  Generate Profile
                </button>
              </div>
              {linkedin && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-white p-8 rounded-3xl shadow-sm border border-zinc-100 prose prose-blue max-w-none">
                  <Markdown>{linkedin}</Markdown>
                </motion.div>
              )}
            </div>
          );
        case 'communication':
          return (
            <div className="space-y-6">
              <div className="bg-white p-6 rounded-3xl shadow-sm border border-zinc-100">
                <h2 className="text-2xl font-bold">Communication & Collaboration</h2>
                {userType === 'beginner' ? (
                  <div className="mt-4 space-y-4">
                    <p className="text-zinc-600">Create your contributor profile by adding your interests.</p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <input placeholder="Interested Courses" className="px-4 py-2 rounded-xl border border-zinc-200" />
                      <input placeholder="Certifications" className="px-4 py-2 rounded-xl border border-zinc-200" />
                    </div>
                    <button className="bg-blue-600 text-white px-6 py-2 rounded-xl font-bold">Create Contributor</button>
                  </div>
                ) : (
                  <div className="mt-4 space-y-4">
                    <p className="text-zinc-600">Analyze project contributions and developer credits.</p>
                    <div className="bg-zinc-50 p-4 rounded-2xl border border-zinc-200">
                      <h4 className="font-bold mb-2">AI Credit Comparison</h4>
                      <p className="text-sm text-zinc-500">Comparing project credits, contribution credits, and developer standing...</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        case 'quiz':
          return (
            <div className="space-y-6">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {['Basic Coding', 'DSA', 'Problem Solving'].map(cat => (
                  <button 
                    key={cat}
                    onClick={() => fetchQuiz(cat, 'JavaScript', 'Intermediate')}
                    className="p-4 bg-white rounded-2xl border border-zinc-200 hover:border-blue-500 transition-all text-center font-bold"
                  >
                    {cat}
                  </button>
                ))}
              </div>
              {quiz && (
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white p-8 rounded-3xl shadow-sm border border-zinc-100">
                  <div className="flex justify-between items-start mb-6">
                    <h3 className="text-xl font-bold">{quiz.question}</h3>
                    <span className="bg-blue-100 text-blue-600 px-3 py-1 rounded-full text-sm font-bold">+{quiz.credits} Credits</span>
                  </div>
                  <div className="space-y-3">
                    {quiz.options?.map((opt: string) => (
                      <button key={opt} className="w-full text-left p-4 rounded-xl border border-zinc-200 hover:bg-blue-50 transition-all">
                        {opt}
                      </button>
                    ))}
                  </div>
                  <div className="mt-6 flex gap-4">
                    <button className="flex-1 bg-blue-600 text-white py-3 rounded-xl font-bold">Submit Answer</button>
                    <button onClick={() => alert(quiz.solution)} className="px-6 py-3 rounded-xl border border-zinc-200 font-bold hover:bg-zinc-50">View Solution</button>
                  </div>
                </motion.div>
              )}
            </div>
          );
        case 'community':
          return (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-3xl font-bold">Community Projects</h2>
                {userType === 'veteran' && (
                  <button 
                    onClick={() => setShowProjectModal(true)}
                    className="flex items-center gap-2 bg-blue-600 text-white px-6 py-2 rounded-xl font-bold shadow-lg"
                  >
                    <Plus className="h-5 w-5" />
                    Create Project
                  </button>
                )}
              </div>

              {projects.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 bg-white rounded-3xl border border-dashed border-zinc-300">
                  <div className="w-32 h-32 bg-zinc-100 rounded-full flex items-center justify-center mb-6">
                    <Github className="h-16 w-16 text-zinc-400" />
                  </div>
                  <h3 className="text-2xl font-bold text-zinc-900">Create your own project now</h3>
                  <p className="text-zinc-500 mt-2 mb-8">Be the first to share your work with the community!</p>
                  {userType === 'veteran' && (
                    <button 
                      onClick={() => setShowProjectModal(true)}
                      className="bg-blue-600 text-white px-12 py-3 rounded-xl font-bold shadow-lg hover:bg-blue-700 transition-all"
                    >
                      Create a project
                    </button>
                  )}
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {projects.map(project => (
                    <div key={project.id} className="bg-white p-6 rounded-3xl shadow-sm border border-zinc-100">
                      <div className="flex justify-between items-start mb-4">
                        <h3 className="text-xl font-bold">{project.name}</h3>
                        <button 
                          onClick={() => handleLike(project.id)}
                          className={`flex items-center gap-2 px-3 py-1 rounded-full text-sm font-bold transition-all ${
                            likedProjects.has(project.id) 
                            ? 'bg-red-100 text-red-600' 
                            : 'bg-zinc-100 text-zinc-600 hover:bg-red-50 hover:text-red-500'
                          }`}
                        >
                          <Heart className={`h-4 w-4 ${likedProjects.has(project.id) ? 'fill-current' : ''}`} />
                          {project.likes}
                        </button>
                      </div>
                      <p className="text-zinc-600 mb-6 line-clamp-3">{project.description}</p>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-zinc-400">By {project.author}</span>
                        <a 
                          href={project.githubUrl} 
                          target="_blank" 
                          rel="noreferrer"
                          className="flex items-center gap-2 text-blue-600 font-bold hover:underline"
                        >
                          <Github className="h-4 w-4" />
                          GitHub
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <AnimatePresence>
                {showProjectModal && (
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                  >
                    <motion.div 
                      initial={{ scale: 0.9, y: 20 }}
                      animate={{ scale: 1, y: 0 }}
                      className="bg-white rounded-3xl max-w-lg w-full p-8 shadow-2xl"
                    >
                      <h2 className="text-2xl font-bold mb-6">Share Your Project</h2>
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-bold text-zinc-700 mb-1">Project Name</label>
                          <input 
                            value={newProject.name}
                            onChange={e => setNewProject({...newProject, name: e.target.value})}
                            className="w-full px-4 py-2 rounded-xl border border-zinc-200 outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="e.g. AI Portfolio Builder"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-bold text-zinc-700 mb-1">Description</label>
                          <textarea 
                            value={newProject.description}
                            onChange={e => setNewProject({...newProject, description: e.target.value})}
                            className="w-full px-4 py-2 rounded-xl border border-zinc-200 outline-none focus:ring-2 focus:ring-blue-500 h-32"
                            placeholder="Tell us about your project..."
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-bold text-zinc-700 mb-1">GitHub URL</label>
                          <input 
                            value={newProject.githubUrl}
                            onChange={e => setNewProject({...newProject, githubUrl: e.target.value})}
                            className="w-full px-4 py-2 rounded-xl border border-zinc-200 outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="https://github.com/..."
                          />
                        </div>
                      </div>
                      <div className="mt-8 flex gap-4">
                        <button 
                          onClick={() => setShowProjectModal(false)}
                          className="flex-1 px-6 py-3 rounded-xl border border-zinc-200 font-bold hover:bg-zinc-50"
                        >
                          Cancel
                        </button>
                        <button 
                          onClick={() => {
                            if (!newProject.name || !newProject.description) return;
                            setProjects([...projects, { ...newProject, id: Date.now().toString(), likes: 0, author: 'You' }]);
                            setShowProjectModal(false);
                            setNewProject({ name: '', description: '', githubUrl: '' });
                          }}
                          className="flex-1 bg-blue-600 text-white py-3 rounded-xl font-bold shadow-lg"
                        >
                          Publish Project
                        </button>
                      </div>
                    </motion.div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        default:
          return null;
      }
    };

    return (
      <div className="min-h-screen bg-zinc-50 flex">
        {/* Sidebar */}
        <div className="w-64 bg-white border-r border-zinc-200 flex flex-col">
          <div className="p-6 border-b border-zinc-100">
            <h1 className="text-xl font-bold text-blue-600">PlacementPro</h1>
            <div className="mt-4 flex items-center gap-3">
              <div className="w-10 h-10 bg-zinc-100 rounded-full flex items-center justify-center">
                <User className="h-5 w-5 text-zinc-600" />
              </div>
              <div className="overflow-hidden">
                <p className="text-sm font-bold truncate">User Profile</p>
                <p className="text-xs text-zinc-400 capitalize">{userType}</p>
              </div>
            </div>
          </div>

          <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
            {tabs.map(tab => (
              <button 
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all ${
                  activeTab === tab 
                  ? 'bg-blue-50 text-blue-600 shadow-sm' 
                  : 'text-zinc-500 hover:bg-zinc-50 hover:text-zinc-900'
                }`}
              >
                {tab === 'roadmap' && <Map className="h-5 w-5" />}
                {tab === 'schedule' && <Calendar className="h-5 w-5" />}
                {tab === 'checklist' && <CheckSquare className="h-5 w-5" />}
                {tab === 'courses' && <BookOpen className="h-5 w-5" />}
                {tab === 'openings' && <Briefcase className="h-5 w-5" />}
                {tab === 'linkedin' && <Linkedin className="h-5 w-5" />}
                {tab === 'communication' && <MessageSquare className="h-5 w-5" />}
                {tab === 'quiz' && <Trophy className="h-5 w-5" />}
                {tab === 'community' && <Users className="h-5 w-5" />}
                <span className="capitalize">{tab}</span>
              </button>
            ))}
          </nav>

          <div className="p-4 border-t border-zinc-100">
            <button 
              onClick={() => setCurrentPage('login')}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold text-red-500 hover:bg-red-50 transition-all"
            >
              <LogOut className="h-5 w-5" />
              Logout
            </button>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col">
          <header className="h-16 bg-white border-b border-zinc-200 flex items-center justify-between px-8">
            <div className="flex items-center gap-2">
              <span className="text-zinc-400">Domain:</span>
              <span className="font-bold text-zinc-900">{selectedDomain}</span>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 bg-blue-50 px-4 py-1.5 rounded-full">
                <Trophy className="h-4 w-4 text-blue-600" />
                <span className="text-sm font-bold text-blue-600">{credits} Credits</span>
              </div>
            </div>
          </header>

          <main className="flex-1 p-8 overflow-y-auto">
            {renderTabContent()}
          </main>
        </div>
      </div>
    );
  };

  return (
    <div className="font-sans text-zinc-900 antialiased">
      {currentPage === 'login' && <LoginView />}
      {currentPage === 'signup' && <SignupView />}
      {currentPage === 'onboarding' && <OnboardingView />}
      {currentPage === 'dashboard' && <DashboardView />}
    </div>
  );
}
