export interface BlogPost {
  slug: string;
  title: string;
  metaTitle: string;
  metaDescription: string;
  excerpt: string;
  date: string;
  readMinutes: number;
  /** Body blocks rendered in order. */
  body: Array<
    | { type: "p"; text: string }
    | { type: "h2"; text: string }
    | { type: "ol"; items: string[] }
    | { type: "ul"; items: string[] }
  >;
}

export const BLOG_POSTS: BlogPost[] = [
  {
    slug: "why-you-never-do-saved-workouts",
    title: "Why You Never Do the Workouts You Save on Instagram",
    metaTitle: "Why You Never Do the Workouts You Save on Instagram — SweatReel",
    metaDescription:
      "Saving a reel feels like progress. It isn't. Here's why your saved folder is a graveyard, and the one change that fixes it. Free.",
    excerpt:
      "Saving a reel feels like progress. It isn't. Here's why your saved folder became a graveyard.",
    date: "2026-01-14",
    readMinutes: 4,
    body: [
      { type: "p", text: "You save the reel. You feel good. You never do it." },
      {
        type: "p",
        text: "That's not a discipline problem. That's a system problem. And it happens to almost everyone with a phone and a gym membership.",
      },
      { type: "h2", text: "Saving is a dopamine hit, not a commitment" },
      {
        type: "p",
        text: "Hitting the bookmark icon gives your brain the same little reward as doing the thing. Intention registered. Box ticked. Move on.",
      },
      {
        type: "p",
        text: "Except nothing happened. No weight moved. No set got logged. You bought the feeling of progress for free, and your brain accepted the trade.",
      },
      {
        type: "p",
        text: "Do that forty times and you have forty receipts for workouts you never did.",
      },
      { type: "h2", text: "The saved folder is where workouts go to die" },
      {
        type: "p",
        text: "Open it right now. Grid of thumbnails. No titles. No exercises. No idea which one was the good push day and which one was a guy selling supplements.",
      },
      {
        type: "p",
        text: "There is no sorting. No search that actually works. Nothing tells you what's in a video without watching it again. So at 6pm, tired, standing in the gym, you don't scroll for it. You do the same three machines you always do.",
      },
      {
        type: "p",
        text: "The folder isn't a library. It's a graveyard. Nothing in it is scheduled, so nothing in it happens.",
      },
      { type: "h2", text: "The fix: split discovery from execution" },
      {
        type: "p",
        text: "Scrolling is discovery. It's supposed to be messy and infinite. That's fine — keep scrolling.",
      },
      {
        type: "p",
        text: "Training is execution. It needs the opposite: one short list, decided in advance, sitting somewhere you'll actually look.",
      },
      {
        type: "p",
        text: "The mistake is trying to do both in the same app. Instagram will never be your training plan. It isn't built to be. It's built to keep you scrolling past the workout you saved last Tuesday.",
      },
      { type: "h2", text: "What that looks like in practice" },
      {
        type: "ul",
        items: [
          "Save whatever you want, wherever you want. Discovery stays free.",
          "Push the ones you actually intend to do into a real plan, with the exercises written out.",
          "Assign them to days. Monday has a workout. Not a vibe — a workout.",
          "Show up, open one screen, lift.",
        ],
      },
      {
        type: "p",
        text: "This is exactly what SweatReel does. You paste a link, AI pulls the exercises with sets and reps, and it lands on a day of your week. The video stops being a bookmark and becomes a plan.",
      },
      {
        type: "p",
        text: "Then the streak takes over. Miss a day and you lose it. Simple, slightly annoying, extremely effective.",
      },
      { type: "h2", text: "Stop collecting workouts. Start doing them." },
      {
        type: "p",
        text: "You already found the training. It's sitting in your saved folder. It just needs a system that turns saved into scheduled.",
      },
    ],
  },
  {
    slug: "turn-reel-into-workout-plan",
    title: "How to Turn a Saved Reel Into a Real Workout Plan in Under 60 Seconds",
    metaTitle: "Turn a Saved Reel Into a Real Workout Plan in 60 Seconds — SweatReel",
    metaDescription:
      "Paste the link, let AI pull the exercises, drop it on a day. Here's the full 60-second how-to for turning saved reels into a plan. Free.",
    excerpt:
      "Paste the link. AI pulls the exercises. Drop it on a day. That's the whole thing.",
    date: "2026-02-03",
    readMinutes: 3,
    body: [
      {
        type: "p",
        text: "You don't need a coach to turn a saved video into a workout. You need sixty seconds and a place to put it.",
      },
      { type: "h2", text: "The 60-second method" },
      {
        type: "ol",
        items: [
          "Copy the link. YouTube, Instagram, TikTok — open the workout you saved and hit share, then copy link.",
          "Paste it into SweatReel. Tap the plus button, drop the link in, give it a name if you want. Takes about five seconds.",
          "Let AI read the video. It pulls out the exercises and writes sets and reps for each one, so you get a text list instead of a thumbnail you have to rewatch.",
          "Check the list. Swap anything that doesn't fit your gym or your body. It's your plan, not the influencer's.",
          "Drop it on a day. Assign the workout to Monday, Thursday, whatever. Rest days get marked as rest days.",
          "Show up. Open the app at the gym, follow the list, mark it done. The streak counts up.",
        ],
      },
      { type: "h2", text: "Why the text list is the whole point" },
      {
        type: "p",
        text: "Video is terrible at the gym. You have to scrub, unmute, hold the phone, lose your place, do it again next set.",
      },
      {
        type: "p",
        text: "A written list of exercises with sets and reps is glanceable. Three seconds between sets and you know exactly what's next. The video is still there when you need to check form — but you're not living inside it.",
      },
      { type: "h2", text: "Do this with your backlog, not just new saves" },
      {
        type: "p",
        text: "Open your saved folder. Pick the five workouts you'd genuinely do. Run each one through the steps above. That's five minutes of work and a full week of training that doesn't need to be invented at 6pm.",
      },
      {
        type: "p",
        text: "Ignore the other thirty-five. If you were going to do them, you'd have done them.",
      },
      { type: "h2", text: "Then just don't break the streak" },
      {
        type: "p",
        text: "Once the week is planned, the hard part is over. Every completed workout adds a day. Miss one and the number goes back to zero. That's the trick, and it works better than motivation.",
      },
      {
        type: "p",
        text: "SweatReel is free to start, no card. Paste one link and see how fast it goes.",
      },
    ],
  },
  {
    slug: "best-apps-organize-saved-workout-videos",
    title: "Best Apps to Organize Saved Workout Videos in 2026",
    metaTitle: "Best Apps to Organize Saved Workout Videos in 2026 — SweatReel",
    metaDescription:
      "Most fitness apps build you a new plan from scratch. None of them touch the videos you already saved. Here's what actually works in 2026.",
    excerpt:
      "Most fitness apps build you a new plan. None of them touch the workouts you already saved.",
    date: "2026-03-11",
    readMinutes: 5,
    body: [
      {
        type: "p",
        text: "There are hundreds of fitness apps. Almost none of them solve the problem you actually have.",
      },
      {
        type: "p",
        text: "Your problem isn't a lack of workouts. You have forty of them, saved, sitting in a folder. Your problem is that nothing turns them into a plan.",
      },
      { type: "h2", text: "What most fitness apps do instead" },
      {
        type: "p",
        text: "JEFIT, Fitbod, Load Muscle and the rest are built around one idea: they generate a brand new program for you. Answer some questions, get a plan the app wrote.",
      },
      {
        type: "p",
        text: "That's genuinely useful if you're starting from nothing. It's useless if you've spent two years collecting training you already like. These apps have no concept of a link. You can't hand them an Instagram reel and get a workout back.",
      },
      {
        type: "ul",
        items: [
          "JEFIT — huge exercise database and solid logging. Builds its own routines. No video import.",
          "Fitbod — smart auto-generated sessions based on recovery. Again, its plan, not your saved content.",
          "Load Muscle and similar trackers — strong at sets, reps and progression history. Nothing for the backlog in your saved folder.",
        ],
      },
      { type: "h2", text: "The gap: nobody serves the backlog" },
      {
        type: "p",
        text: "If you save workout videos, you're a specific kind of user. You're not short on ideas. You're short on structure. You need something that reads what you already saved and turns it into days of the week.",
      },
      {
        type: "p",
        text: "That category basically didn't exist until recently. Note apps and spreadsheets were the workaround, and they all die within two weeks because you have to type everything out yourself.",
      },
      { type: "h2", text: "Top pick for saved videos: SweatReel" },
      {
        type: "p",
        text: "SweatReel is built for exactly this use case and nothing else. Paste a YouTube, Instagram or TikTok link. AI reads the video and writes out the exercises with sets and reps. Drop that workout onto a day. Keep the streak alive.",
      },
      {
        type: "ul",
        items: [
          "Works from links you already have — no rebuilding your training from scratch.",
          "Turns video into a glanceable text list you can actually use mid-set.",
          "Weekly planner with rest days, so the week is decided before you're tired.",
          "Streaks and milestones, because that's what keeps people showing up.",
          "Free tier, no credit card.",
        ],
      },
      { type: "h2", text: "Use it alongside a tracker, not instead of one" },
      {
        type: "p",
        text: "If you love logging every set and watching your bench go up over eighteen months, keep your tracker. SweatReel isn't trying to replace it.",
      },
      {
        type: "p",
        text: "SweatReel answers \"what am I doing today, and where did that workout go?\" Your tracker answers \"how much stronger am I than in March?\" Different jobs. They sit fine next to each other.",
      },
      { type: "h2", text: "The short version" },
      {
        type: "p",
        text: "Starting from zero? Use a plan generator. Sitting on a folder full of saved reels you've never done? Use SweatReel. It's the only one built for that pile.",
      },
    ],
  },
];

export function getPost(slug: string): BlogPost | undefined {
  return BLOG_POSTS.find((p) => p.slug === slug);
}
