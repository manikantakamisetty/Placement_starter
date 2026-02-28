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
  Send,
  Bot,
  X
} from 'lucide-react';
import Markdown from 'react-markdown';
import {
  generateRoadmap,
  generateSchedule,
  generateCourses,
  generateJobOpenings,
  generateLinkedInPortfolio,
  generateQuizQuestion,
  compareCredits,
  generateDomainTopics,
  generateKeyConcepts,
  chatWithAI
} from './services/gemini';
import { auth, db, storage, saveUser, getUserByEmail, saveChatMessage, getChatHistory } from './firebase';

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
  const [selectedDomains, setSelectedDomains] = useState<string[]>([]);
  const [isPhoneLogin, setIsPhoneLogin] = useState(false);
  const [showReadMore, setShowReadMore] = useState(false);
  const [activeTab, setActiveTab] = useState('roadmap');
  const [credits, setCredits] = useState(0);
  const [projects, setProjects] = useState<Project[]>([]);
  const [likedProjects, setLikedProjects] = useState<Set<string>>(new Set());
  const [userId, setUserId] = useState<string | null>(null);
  const [userEmail, setUserEmail] = useState<string>('');
  const [userProfile, setUserProfile] = useState({
    fullName: '',
    headline: '',
    photo: '',
    location: '',
    email: '',
    phone: '',
    portfolio: '',
    github: '',
    linkedinUrl: ''
  });

  // AI Content States
  const [domainTopics, setDomainTopics] = useState('');
  const [roadmap, setRoadmap] = useState('');
  const [schedule, setSchedule] = useState('');
  const [courses, setCourses] = useState('');
  const [openings, setOpenings] = useState('');
  const [linkedin, setLinkedin] = useState('');
  const [keyConcepts, setKeyConcepts] = useState('');
  const [quiz, setQuiz] = useState<any>(null);
  const [quizLanguage, setQuizLanguage] = useState('JavaScript');
  const [loading, setLoading] = useState(false);
  const [checklist, setChecklist] = useState<{id: number, text: string, done: boolean, keyPoints: string[]}[]>([]);

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

  const resetAppState = () => {
    setUserType(null);
    setSelectedDomains([]);
    setDomainTopics('');
    setRoadmap('');
    setSchedule('');
    setCourses('');
    setOpenings('');
    setLinkedin('');
    setKeyConcepts('');
    setQuiz(null);
    setCredits(0);
    setChecklist([]);
    setUserId(null);
    setUserEmail('');
    setUserProfile({
      fullName: '',
      headline: '',
      photo: '',
      location: '',
      email: '',
      phone: '',
      portfolio: '',
      github: '',
      linkedinUrl: ''
    });
  };

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;

    if (!email || !password) {
      alert('Please enter email and password');
      return;
    }

    const user = await getUserByEmail(email);
    if (!user) {
      alert('User not found. Please signup first.');
      return;
    }

    if (user.password !== password) {
      alert('Invalid password');
      return;
    }

    setUserId(user.uid);
    setUserEmail(email);
    setCurrentPage('dashboard');
  };

  const handleSignup = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const fullName = formData.get('fullName') as string;
    const email = formData.get('email') as string;
    const phone = formData.get('phone') as string;
    const password = formData.get('password') as string;

    if (!fullName || !email || !password) {
      alert('Please fill all required fields');
      return;
    }

    // Check if user already exists
    const existingUser = await getUserByEmail(email);
    if (existingUser) {
      alert('User already exists. Please login.');
      return;
    }

    // Save user to Firebase
    const result = await saveUser(email, password, fullName);
    if (result.success) {
      setUserId(result.uid);
      setUserEmail(email);
      resetAppState();
      setCurrentPage('onboarding');
    } else {
      alert('Signup failed: ' + result.error);
    }
  };

  const handleDomainToggle = (domain: string) => {
    setSelectedDomains(prev => 
      prev.includes(domain) ? prev.filter(d => d !== domain) : [...prev, domain]
    );
  };

  const handleOnboardingNext = async () => {
    if (selectedDomains.length === 0) return;
    setLoading(true);
    try {
      // 1. Generate Courses Initially
      const coursesRes = await generateCourses(selectedDomains);
      setCourses(coursesRes || '');

      // 2. Generate Domain Topics
      const topics = await generateDomainTopics(selectedDomains, coursesRes || '');
      setDomainTopics(topics || '');
      
      setCurrentPage('dashboard');
      // Default tab for veterans is openings
      if (userType === 'veteran') setActiveTab('openings');
    } catch (error) {
      console.error("Error during onboarding generation:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchRoadmap = async () => {
    setLoading(true);
    const res = await generateRoadmap(selectedDomains, domainTopics, courses);
    setRoadmap(res || '');
    // Also fetch key concepts for the checklist
    const concepts = await generateKeyConcepts(`Based on these courses: ${courses}, list 10 essential key concepts for ${selectedDomains.join(", ")}`);
    setKeyConcepts(concepts || '');
    setLoading(false);
  };

  const fetchQuiz = async (category: string, level: string) => {
    setLoading(true);
    const res = await generateQuizQuestion(category, quizLanguage, level);
    setQuiz(res);
    setLoading(false);
  };

  const fetchScheduleFromRoadmap = async () => {
    if (!roadmap) {
      alert("Please generate a roadmap first!");
      return;
    }
    setLoading(true);
    const res = await generateSchedule(roadmap, courses);
    setSchedule(res || '');
    setLoading(false);
  };

  const fetchCourses = async () => {
    setLoading(true);
    const res = await generateCourses(selectedDomains);
    setCourses(res || '');
    setLoading(false);
  };

  const fetchOpenings = async (address: string) => {
    setLoading(true);
    const res = await generateJobOpenings(selectedDomains.join(", "), address);
    setOpenings(res || '');
    setLoading(false);
  };

  const fetchLinkedin = async () => {
    setLoading(true);
    const res = await generateLinkedInPortfolio(userType || 'beginner', selectedDomains.join(", "));
    setLinkedin(res || '');
    setLoading(false);
  };

  const fetchKeyConcepts = async () => {
    if (selectedDomains.length === 0) return;
    setLoading(true);
    const res = await generateKeyConcepts(`Based on these courses: ${courses}, list 10 essential key concepts for ${selectedDomains.join(", ")}`);
    setKeyConcepts(res || '');
    setLoading(false);
  };

  const addConceptsToChecklist = () => {
    if (!keyConcepts) return;
    const lines = keyConcepts.split('\n');
    const newTasks = lines
      .map(line => line.replace(/^[-*]\s+/, '').replace(/^\d+\.\s+/, '').trim())
      .filter(line => line && line.length > 3 && !line.toLowerCase().includes('here are') && !line.toLowerCase().includes('key concepts'))
      .map(text => ({
        id: Date.now() + Math.random(),
        text,
        done: false,
        keyPoints: []
      }));
    setChecklist(prev => [...prev, ...newTasks]);
  };

  const handleLike = (id: string) => {
    if (likedProjects.has(id)) return;
    setProjects(prev => prev.map(p => p.id === id ? { ...p, likes: p.likes + 1 } : p));
    setLikedProjects(prev => new Set(prev).add(id));
  };

  // --- Views ---

  const exportToICS = () => {
    if (!schedule) return;
    const icsContent = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//PlacementPro AI//Learning Schedule//EN
BEGIN:VEVENT
UID:${Date.now()}@placementpro.ai
DTSTAMP:${new Date().toISOString().replace(/[-:]/g, '').split('.')[0]}Z
DTSTART:${new Date().toISOString().replace(/[-:]/g, '').split('.')[0]}Z
SUMMARY:Learning Schedule: ${selectedDomains.join(", ")}
DESCRIPTION:${schedule.replace(/\n/g, '\\n')}
END:VEVENT
END:VCALENDAR`;
    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
    const link = document.createElement('a');
    link.href = window.URL.createObjectURL(blob);
    link.setAttribute('download', 'learning-schedule.ics');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

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
                name="email"
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
              name="password"
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
            <button onClick={() => { resetAppState(); setCurrentPage('signup'); }} className="text-blue-600 font-semibold">Sign Up</button>
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
              name="fullName"
              placeholder="Full Name"
              className="w-full pl-10 pr-4 py-3 rounded-xl border border-zinc-200 focus:ring-2 focus:ring-blue-500 outline-none"
              required
            />
          </div>
          <div className="relative">
            <Mail className="absolute left-3 top-3.5 h-5 w-5 text-zinc-400" />
            <input
              type="email"
              name="email"
              placeholder="Email Address"
              className="w-full pl-10 pr-4 py-3 rounded-xl border border-zinc-200 focus:ring-2 focus:ring-blue-500 outline-none"
              required
            />
          </div>
          <div className="relative">
            <Phone className="absolute left-3 top-3.5 h-5 w-5 text-zinc-400" />
            <input
              type="tel"
              name="phone"
              placeholder="Phone Number"
              className="w-full pl-10 pr-4 py-3 rounded-xl border border-zinc-200 focus:ring-2 focus:ring-blue-500 outline-none"
              required
            />
          </div>
          <div className="relative">
            <Lock className="absolute left-3 top-3.5 h-5 w-5 text-zinc-400" />
            <input
              type="password"
              name="password"
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
            <h1 className="text-3xl font-bold text-zinc-900">Select your interested domains</h1>
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
                onClick={() => handleDomainToggle(domain)}
                className={`p-4 rounded-2xl border transition-all text-sm font-medium ${
                  selectedDomains.includes(domain)
                  ? 'bg-blue-600 text-white border-blue-600 shadow-lg' 
                  : 'bg-white text-zinc-700 border-zinc-200 hover:border-blue-300'
                }`}
              >
                {domain}
              </button>
            ))}
          </div>

          {selectedDomains.length > 0 && (
            <div className="flex justify-center mt-8">
              <button 
                onClick={handleOnboardingNext}
                disabled={loading}
                className="bg-blue-600 text-white px-12 py-3 rounded-xl font-bold shadow-lg hover:bg-blue-700 transition-all disabled:opacity-50"
              >
                {loading ? 'Preparing...' : 'OK'}
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
    const [newTodo, setNewTodo] = useState('');
    const [newKeyPoints, setNewKeyPoints] = useState('');
    const [address, setAddress] = useState('');
    const [showProjectModal, setShowProjectModal] = useState(false);
    const [newProject, setNewProject] = useState({ name: '', description: '', githubUrl: '' });

    const tabs = userType === 'beginner' 
      ? ['roadmap', 'schedule', 'checklist', 'courses', 'openings', 'linkedin', 'contribution', 'quiz', 'community']
      : ['linkedin', 'contribution', 'quiz', 'community'];

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
                  <p className="text-zinc-500">Personalized path for {selectedDomains.join(", ")}</p>
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
                  <p className="text-zinc-500">Daily routine for {selectedDomains.join(", ")}</p>
                </div>
                <div className="flex gap-2">
                  <button 
                    onClick={fetchScheduleFromRoadmap}
                    className="bg-blue-600 text-white px-6 py-2 rounded-xl font-bold hover:bg-blue-700 transition-all"
                  >
                    Generate Schedule
                  </button>
                  {schedule && (
                    <button 
                      onClick={exportToICS}
                      className="bg-zinc-100 text-zinc-700 px-6 py-2 rounded-xl font-bold hover:bg-zinc-200 transition-all flex items-center gap-2"
                    >
                      <Calendar className="h-5 w-5" />
                      Export to Calendar
                    </button>
                  )}
                </div>
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
            <div className="max-w-4xl mx-auto space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="md:col-span-2 space-y-6">
                  <div className="bg-white p-6 rounded-3xl shadow-sm border border-zinc-100">
                    <h2 className="text-2xl font-bold mb-4">Your Learning Checklist</h2>
                    <div className="space-y-3">
                      <input 
                        type="text" 
                        value={newTodo}
                        onChange={(e) => setNewTodo(e.target.value)}
                        placeholder="Task name..."
                        className="w-full px-4 py-2 rounded-xl border border-zinc-200 outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      <div className="flex gap-2">
                        <input 
                          type="text" 
                          value={newKeyPoints}
                          onChange={(e) => setNewKeyPoints(e.target.value)}
                          placeholder="Key points (comma separated)..."
                          className="flex-1 px-4 py-2 rounded-xl border border-zinc-200 outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        <button 
                          onClick={() => {
                            if (!newTodo) return;
                            const points = newKeyPoints.split(',').map(p => p.trim()).filter(p => p);
                            setChecklist([...checklist, { id: Date.now(), text: newTodo, done: false, keyPoints: points }]);
                            setNewTodo('');
                            setNewKeyPoints('');
                          }}
                          className="bg-blue-600 text-white p-2 rounded-xl"
                        >
                          <Plus className="h-6 w-6" />
                        </button>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-3">
                    {checklist.map(item => (
                      <div key={item.id} className="bg-white p-4 rounded-2xl border border-zinc-100 shadow-sm space-y-3">
                        <div className="flex items-center gap-3">
                          <button 
                            onClick={() => setChecklist(checklist.map(i => i.id === item.id ? { ...i, done: !i.done } : i))}
                            className={`w-6 h-6 rounded-md border-2 flex items-center justify-center transition-all ${item.done ? 'bg-blue-600 border-blue-600' : 'border-zinc-300'}`}
                          >
                            {item.done && <CheckSquare className="h-4 w-4 text-white" />}
                          </button>
                          <span className={`flex-1 font-bold ${item.done ? 'line-through text-zinc-400' : 'text-zinc-700'}`}>{item.text}</span>
                        </div>
                        {item.keyPoints.length > 0 && (
                          <div className="pl-9 space-y-1">
                            {item.keyPoints.map((point, idx) => (
                              <div key={idx} className="flex items-center gap-2 text-sm text-zinc-500">
                                <div className="w-1.5 h-1.5 bg-blue-400 rounded-full" />
                                {point}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
                <div className="space-y-6">
                  <div className="bg-white p-6 rounded-3xl shadow-sm border border-zinc-100">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-bold">Key Concepts</h3>
                      <div className="flex gap-2">
                        <button onClick={addConceptsToChecklist} className="text-xs bg-blue-50 text-blue-600 px-2 py-1 rounded-md font-bold hover:bg-blue-100 transition-colors">Add to Checklist</button>
                        <button onClick={fetchKeyConcepts} className="text-xs text-blue-600 font-bold hover:underline">Refresh</button>
                      </div>
                    </div>
                    {keyConcepts ? (
                      <div className="prose prose-sm prose-blue">
                        <Markdown>{keyConcepts}</Markdown>
                      </div>
                    ) : (
                      <p className="text-sm text-zinc-400 italic">Generate roadmap first to see key concepts here.</p>
                    )}
                  </div>
                </div>
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
              <div className="bg-white p-8 rounded-3xl shadow-sm border border-zinc-100">
                <h2 className="text-2xl font-bold mb-6">LinkedIn Profile Details</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-bold text-zinc-700 mb-1">Full Name *</label>
                      <input 
                        value={userProfile.fullName}
                        onChange={e => setUserProfile({...userProfile, fullName: e.target.value})}
                        className="w-full px-4 py-2 rounded-xl border border-zinc-200 outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="John Doe"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-zinc-700 mb-1">Professional Headline</label>
                      <input 
                        value={userProfile.headline}
                        onChange={e => setUserProfile({...userProfile, headline: e.target.value})}
                        className="w-full px-4 py-2 rounded-xl border border-zinc-200 outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Full Stack Developer | MERN | Open Source Contributor"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-bold text-zinc-700 mb-1">Email</label>
                        <input 
                          value={userProfile.email}
                          onChange={e => setUserProfile({...userProfile, email: e.target.value})}
                          className="w-full px-4 py-2 rounded-xl border border-zinc-200 outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="john@example.com"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-bold text-zinc-700 mb-1">Phone</label>
                        <input 
                          value={userProfile.phone}
                          onChange={e => setUserProfile({...userProfile, phone: e.target.value})}
                          className="w-full px-4 py-2 rounded-xl border border-zinc-200 outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="+1 234 567 890"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-zinc-700 mb-1">Location</label>
                      <input 
                        value={userProfile.location}
                        onChange={e => setUserProfile({...userProfile, location: e.target.value})}
                        className="w-full px-4 py-2 rounded-xl border border-zinc-200 outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="City, Country"
                      />
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-bold text-zinc-700 mb-1">Portfolio Website</label>
                      <input 
                        value={userProfile.portfolio}
                        onChange={e => setUserProfile({...userProfile, portfolio: e.target.value})}
                        className="w-full px-4 py-2 rounded-xl border border-zinc-200 outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="https://johndoe.dev"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-zinc-700 mb-1">GitHub URL</label>
                      <input 
                        value={userProfile.github}
                        onChange={e => setUserProfile({...userProfile, github: e.target.value})}
                        className="w-full px-4 py-2 rounded-xl border border-zinc-200 outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="https://github.com/..."
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-zinc-700 mb-1">LinkedIn URL</label>
                      <input 
                        value={userProfile.linkedinUrl}
                        onChange={e => setUserProfile({...userProfile, linkedinUrl: e.target.value})}
                        className="w-full px-4 py-2 rounded-xl border border-zinc-200 outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="https://linkedin.com/in/..."
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-zinc-700 mb-1">Profile Photo</label>
                      <div className="flex items-center gap-4">
                        {userProfile.photo && (
                          <img src={userProfile.photo} alt="Preview" className="w-12 h-12 rounded-full object-cover border border-zinc-200" />
                        )}
                        <input 
                          type="file"
                          onChange={e => {
                            const file = e.target.files?.[0];
                            if (file) {
                              const reader = new FileReader();
                              reader.onloadend = () => setUserProfile({...userProfile, photo: reader.result as string});
                              reader.readAsDataURL(file);
                            }
                          }}
                          className="flex-1 text-sm text-zinc-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                        />
                      </div>
                    </div>
                  </div>
                </div>
                <div className="mt-8 flex gap-4">
                  <button 
                    onClick={fetchLinkedin}
                    disabled={!userProfile.fullName}
                    className="flex-1 bg-blue-600 text-white py-3 rounded-xl font-bold shadow-lg hover:bg-blue-700 transition-all disabled:opacity-50"
                  >
                    Generate AI Optimized Summary
                  </button>
                </div>
              </div>
              {linkedin && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-white p-8 rounded-3xl shadow-sm border border-zinc-100 prose prose-blue max-w-none">
                  <Markdown>{linkedin}</Markdown>
                </motion.div>
              )}
            </div>
          );
        case 'contribution':
          return (
            <div className="space-y-6">
              <div className="bg-white p-6 rounded-3xl shadow-sm border border-zinc-100">
                <h2 className="text-2xl font-bold">Contribution & Collaboration</h2>
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
              <div className="bg-white p-6 rounded-3xl shadow-sm border border-zinc-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <h2 className="text-2xl font-bold">Skill Assessment</h2>
                  <p className="text-zinc-500">Test your knowledge and earn credits</p>
                </div>
                <div className="flex items-center gap-3">
                  <label className="text-sm font-bold text-zinc-600">Language:</label>
                  <select 
                    value={quizLanguage}
                    onChange={(e) => setQuizLanguage(e.target.value)}
                    className="px-4 py-2 rounded-xl border border-zinc-200 outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {['JavaScript', 'Python', 'Java', 'C++', 'TypeScript', 'Go', 'Rust'].map(lang => (
                      <option key={lang} value={lang}>{lang}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {['Basic Coding', 'DSA', 'Problem Solving'].map(cat => (
                  <button 
                    key={cat}
                    onClick={() => fetchQuiz(cat, 'Intermediate')}
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
                <button 
                  onClick={() => setShowProjectModal(true)}
                  className="flex items-center gap-2 bg-blue-600 text-white px-6 py-2 rounded-xl font-bold shadow-lg"
                >
                  <Plus className="h-5 w-5" />
                  Create Project
                </button>
              </div>

              {projects.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 bg-white rounded-3xl border border-dashed border-zinc-300">
                  <div className="w-32 h-32 bg-zinc-100 rounded-full flex items-center justify-center mb-6">
                    <Github className="h-16 w-16 text-zinc-400" />
                  </div>
                  <h3 className="text-2xl font-bold text-zinc-900">Create your own project now</h3>
                  <p className="text-zinc-500 mt-2 mb-8">Be the first to share your work with the community!</p>
                  <button 
                    onClick={() => setShowProjectModal(true)}
                    className="bg-blue-600 text-white px-12 py-3 rounded-xl font-bold shadow-lg hover:bg-blue-700 transition-all"
                  >
                    Create a project
                  </button>
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
                {tab === 'contribution' && <MessageSquare className="h-5 w-5" />}
                {tab === 'quiz' && <Trophy className="h-5 w-5" />}
                {tab === 'community' && <Users className="h-5 w-5" />}
                <span className="capitalize">{tab}</span>
              </button>
            ))}
          </nav>

          <div className="p-4 border-t border-zinc-100">
            <button 
              onClick={() => { resetAppState(); setCurrentPage('login'); }}
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
              <span className="text-zinc-400">Domains:</span>
              <span className="font-bold text-zinc-900">{selectedDomains.join(", ")}</span>
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

  const ChatBot = () => {
    const [messages, setMessages] = useState<{role: 'user' | 'model', text: string}[]>([]);
    const [input, setInput] = useState('');
    const [isChatOpen, setIsChatOpen] = useState(false);
    const [width, setWidth] = useState(window.innerWidth / 4);
    const [isResizing, setIsResizing] = useState(false);

    const handleSend = async () => {
      if (!input.trim() || !userId) return;
      const userMsg = { role: 'user' as const, text: input };
      setMessages(prev => [...prev, userMsg]);
      setInput('');

      // Save user message to Firebase
      await saveChatMessage(userId, userMsg);

      try {
        const text = await chatWithAI([...messages, userMsg]);
        const aiMsg = { role: 'model' as const, text: text || '' };
        setMessages(prev => [...prev, aiMsg]);

        // Save AI message to Firebase
        await saveChatMessage(userId, aiMsg);
      } catch (error) {
        console.error("Chat error:", error);
      }
    };

    useEffect(() => {
      // Load chat history from Firebase when component mounts or userId changes
      const loadChatHistory = async () => {
        if (userId) {
          const history = await getChatHistory(userId);
          const formattedHistory = history.map(msg => ({
            role: msg.role as 'user' | 'model',
            text: msg.text
          }));
          setMessages(formattedHistory);
        }
      };
      loadChatHistory();
    }, [userId]);

    useEffect(() => {
      const handleMouseMove = (e: MouseEvent) => {
        if (!isResizing) return;
        setWidth(Math.max(300, Math.min(window.innerWidth - e.clientX, window.innerWidth * 0.8)));
      };
      const handleMouseUp = () => setIsResizing(false);

      if (isResizing) {
        window.addEventListener('mousemove', handleMouseMove);
        window.addEventListener('mouseup', handleMouseUp);
      }
      return () => {
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('mouseup', handleMouseUp);
      };
    }, [isResizing]);

    return (
      <>
        {/* Chat Toggle Button */}
        <motion.button 
          onClick={() => setIsChatOpen(!isChatOpen)}
          animate={{ x: isChatOpen ? -width : 0 }}
          className="fixed right-0 top-1/2 -translate-y-1/2 z-[80] bg-blue-600 text-white p-3 rounded-l-2xl shadow-xl hover:bg-blue-700 transition-all"
        >
          {isChatOpen ? <X className="h-6 w-6" /> : <Bot className="h-6 w-6" />}
        </motion.button>

        {/* Chat Window */}
        <AnimatePresence>
          {isChatOpen && (
            <motion.div 
              initial={{ x: width }}
              animate={{ x: 0 }}
              exit={{ x: width }}
              style={{ width }}
              className="fixed right-0 top-0 h-screen bg-white border-l border-zinc-200 shadow-2xl z-[70] flex flex-col"
            >
              {/* Resize Handle */}
              <div 
                onMouseDown={() => setIsResizing(true)}
                className="absolute left-0 top-0 w-1 h-full cursor-col-resize hover:bg-blue-400 transition-colors"
              />

              <div className="p-4 border-b border-zinc-100 flex items-center justify-between bg-blue-600 text-white">
                <div className="flex items-center gap-2">
                  <Bot className="h-5 w-5" />
                  <span className="font-bold">AI Career Assistant</span>
                </div>
                <button onClick={() => setIsChatOpen(false)}>
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.length === 0 && (
                  <div className="text-center py-10 text-zinc-400">
                    <Bot className="h-12 w-12 mx-auto mb-4 opacity-20" />
                    <p>How can I help you today?</p>
                  </div>
                )}
                {messages.map((m, i) => (
                  <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[85%] p-3 rounded-2xl text-sm ${
                      m.role === 'user' 
                      ? 'bg-blue-600 text-white rounded-tr-none' 
                      : 'bg-zinc-100 text-zinc-800 rounded-tl-none'
                    }`}>
                      <Markdown>{m.text}</Markdown>
                    </div>
                  </div>
                ))}
              </div>

              <div className="p-4 border-t border-zinc-100">
                <div className="flex gap-2">
                  <input 
                    value={input}
                    onChange={e => setInput(e.target.value)}
                    onKeyPress={e => e.key === 'Enter' && handleSend()}
                    placeholder="Ask anything..."
                    className="flex-1 px-4 py-2 rounded-xl border border-zinc-200 outline-none focus:ring-2 focus:ring-blue-600"
                  />
                  <button 
                    onClick={handleSend}
                    className="bg-blue-600 text-white p-2 rounded-xl"
                  >
                    <Send className="h-5 w-5" />
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </>
    );
  };

  return (
    <div className="font-sans text-zinc-900 antialiased">
      {currentPage === 'login' && <LoginView />}
      {currentPage === 'signup' && <SignupView />}
      {currentPage === 'onboarding' && <OnboardingView />}
      {currentPage === 'dashboard' && <DashboardView />}
      {(currentPage === 'onboarding' || currentPage === 'dashboard') && <ChatBot />}
    </div>
  );
}
