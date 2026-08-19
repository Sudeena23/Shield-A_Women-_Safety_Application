// Constants & Configuration for Shield App
export const APP_NAME = 'Shield';
export const APP_TAGLINE = 'Women-First Safety & Emergency Platform';

export const API_BASE_URL = process.env.NODE_ENV === 'production' 
  ? '/api' 
  : 'http://localhost:3000/api';

export const STATS = [
  { value: '10,000+', label: 'Protected Users' },
  { value: '24/7', label: 'Emergency Support' },
  { value: '<30s', label: 'Response Time' },
  { value: '100%', label: 'Free & Encrypted' },
];

export const TESTIMONIALS = [
  {
    id: 1,
    name: 'Aarati Sharma',
    role: 'College Student, Kathmandu',
    quote: 'Using Shield gives me immense peace of mind when returning late from campus. The 1-tap SOS and live GPS sharing with my parents work flawlessly.',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80',
  },
  {
    id: 2,
    name: 'Pooja Thapa',
    role: 'IT Professional, Lalitpur',
    quote: 'The live GPS tracking and instant guardian SMS alerts work seamlessly. Every woman traveling at night should have this app!',
    avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=150&q=80',
  },
  {
    id: 3,
    name: 'Sunita Maharjan',
    role: 'Healthcare Worker, Bhaktapur',
    quote: 'Having direct access to police 100 and women commission 1145 along with instant guardian alerts makes night shifts feel so much safer.',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=150&q=80',
  },
];

export const FAQS = [
  {
    question: 'How does the Emergency SOS button work?',
    answer: 'When triggered, Shield instantly broadcasts your live GPS coordinates, battery level, and emergency status to all designated guardians and dispatchers.',
  },
  {
    question: 'Is my location tracked continuously in the background?',
    answer: 'No. Your privacy is paramount. GPS tracking is only enabled when you actively press the SOS button or explicitly start a Live Location sharing session.',
  },
  {
    question: 'How are guardians notified during an emergency?',
    answer: 'Designated guardians receive real-time alert notifications containing your active GPS location link and emergency contact details.',
  },
  {
    question: 'Are there any subscription or hidden fees?',
    answer: 'Shield is 100% free forever for all users. Safety is a fundamental human right.',
  },
];
