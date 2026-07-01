const BASE_URL = "https://sweat-reel.vercel.app";

export function getWorkoutShareUrl(
  workoutTitle: string,
  streakCount: number,
): string {
  const text = `Just crushed "${workoutTitle}" on SweatReel! 🔥
${streakCount} day streak and counting 💪
Save your workout reels FREE 👉 ${BASE_URL}`;
  return `https://wa.me/?text=${encodeURIComponent(text)}`;
}

export function getStreakShareUrl(streakCount: number): string {
  const text = `🔥 ${streakCount} day workout streak on SweatReel!
Started my fitness journey and haven't stopped 💪
Join me FREE 👉 ${BASE_URL}`;
  return `https://wa.me/?text=${encodeURIComponent(text)}`;
}

export function getReferralShareUrl(): string {
  const text = `💚 SweatReel - Your personal workout library
Save workout reels from YouTube, Instagram & TikTok
Plan your week, track your streak - FREE!
👉 ${BASE_URL}`;
  return `https://wa.me/?text=${encodeURIComponent(text)}`;
}
