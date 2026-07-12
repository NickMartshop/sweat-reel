export interface DailyQuote {
  quote: string;
  author: string;
}

export const DAILY_QUOTES: DailyQuote[] = [
  { quote: "The only bad workout is the one that didn't happen.", author: "Unknown" },
  { quote: "Your body can stand almost anything. It's your mind you have to convince.", author: "Unknown" },
  { quote: "Strength does not come from the body. It comes from the will.", author: "Unknown" },
  { quote: "Take care of your body. It's the only place you have to live.", author: "Jim Rohn" },
  { quote: "Success is the sum of small efforts repeated day in and day out.", author: "Robert Collier" },
  { quote: "No pain, no gain. Shut up and train.", author: "Unknown" },
  { quote: "When you feel like quitting, think about why you started.", author: "Unknown" },
  { quote: "Fitness is not about being better than someone else. It's about being better than you used to be.", author: "Unknown" },
  { quote: "Push yourself because no one else is going to do it for you.", author: "Unknown" },
  { quote: "The pain you feel today will be the strength you feel tomorrow.", author: "Unknown" },
  { quote: "Every workout is progress.", author: "Unknown" },
  { quote: "Train insane or remain the same.", author: "Unknown" },
  { quote: "You don't have to be extreme, just consistent.", author: "Unknown" },
  { quote: "Sore today. Strong tomorrow.", author: "Unknown" },
  { quote: "Your health is an investment, not an expense.", author: "Unknown" },
  { quote: "Sweat is fat crying.", author: "Unknown" },
  { quote: "The difference between try and triumph is just a little umph.", author: "Marvin Phillips" },
  { quote: "A one-hour workout is 4% of your day. No excuses.", author: "Unknown" },
  { quote: "It never gets easier. You just get stronger.", author: "Unknown" },
  { quote: "Believe in yourself and all that you are.", author: "Christian D. Larson" },
  { quote: "Do something today that your future self will thank you for.", author: "Sean Patrick Flanery" },
  { quote: "The secret to getting ahead is getting started.", author: "Mark Twain" },
  { quote: "All progress takes place outside the comfort zone.", author: "Michael John Bobak" },
  { quote: "Motivation is what gets you started. Habit is what keeps you going.", author: "Jim Ryun" },
  { quote: "Strive for progress, not perfection.", author: "Unknown" },
  { quote: "The body achieves what the mind believes.", author: "Unknown" },
  { quote: "Champions aren't made in gyms.", author: "Muhammad Ali" },
  { quote: "What seems impossible today will one day become your warm-up.", author: "Unknown" },
  { quote: "Hard work beats talent when talent doesn't work hard.", author: "Tim Notke" },
  { quote: "Results happen over time, not overnight.", author: "Unknown" },
];

export function getDailyQuote(date: Date = new Date()): DailyQuote {
  const start = new Date(date.getFullYear(), 0, 0);
  const diff = date.getTime() - start.getTime();
  const dayOfYear = Math.floor(diff / 86400000);
  return DAILY_QUOTES[dayOfYear % DAILY_QUOTES.length];
}
