import { ArrowRight, Check, ClipboardList, Link2, CalendarCheck2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { WorkoutCard } from "./WorkoutCard";
import type { Workout } from "@/lib/fitvault-data";

interface Props {
  onGetStarted: () => void;
}

const steps = [
  {
    number: "01",
    title: "Save a workout link",
    detail: "Keep the YouTube, Instagram, or TikTok workout in one library.",
    Icon: Link2,
  },
  {
    number: "02",
    title: "Add the details manually",
    detail: "Write in the exercises, sets, reps, and other details you need.",
    Icon: ClipboardList,
  },
  {
    number: "03",
    title: "Plan it and complete it",
    detail: "Put the workout on your week, then track it when you finish.",
    Icon: CalendarCheck2,
  },
];

const previewWorkout: Workout = {
  id: "landing-workout-preview",
  title: "Example workout",
  muscle_group: "Full Body",
  difficulty: "Medium",
  duration_mins: 30,
  thumbnail_url: null,
  exercises: [],
};

export function LandingScreen({ onGetStarted }: Props) {
  return (
    <div className="min-h-screen w-full bg-background text-foreground">
      <div className="mx-auto w-full max-w-6xl px-5 pb-10 pt-8 sm:px-8 sm:pt-12">
        <header className="flex items-center justify-between gap-4">
          <a href="/" aria-label="SweatReel home" className="text-base font-bold text-foreground">
            SweatReel
          </a>
          <span className="text-sm text-muted-foreground">Your workout library</span>
        </header>

        <main>
          <section className="grid items-center gap-8 py-10 sm:py-14 lg:grid-cols-[1.05fr_0.95fr] lg:gap-16 lg:py-16">
            <div className="max-w-2xl">
              <p className="mb-4 text-sm font-semibold text-action">Save it. Plan it. Do it.</p>
              <h1 className="max-w-xl text-4xl font-bold leading-tight sm:text-5xl">
                Stop losing the workouts you save.
              </h1>
              <p className="mt-5 max-w-xl text-base leading-7 text-muted-foreground sm:text-lg">
                Keep workout links from YouTube, Instagram, and TikTok together. Add the exercises
                yourself, make a weekly plan, and track the workouts you complete.
              </p>
              <div className="mt-7 flex flex-col items-start gap-3 sm:flex-row sm:items-center">
                <Button
                  type="button"
                  onClick={onGetStarted}
                  className="press-scale h-12 w-full justify-center gap-2 px-5 text-base sm:w-auto"
                >
                  Start your free workout library
                  <ArrowRight aria-hidden="true" size={18} />
                </Button>
                <span className="text-sm text-muted-foreground">AI extraction is temporarily unavailable.</span>
              </div>
            </div>

            <aside aria-label="Example SweatReel workout card" className="mx-auto w-full max-w-sm">
              <div className="mb-3 flex items-center justify-between">
                <h2 className="text-sm font-semibold text-foreground">Workout library preview</h2>
                <span className="text-xs text-muted-foreground">Example</span>
              </div>
              <div className="rounded-lg border border-border bg-card p-3 shadow-lg">
                <div className="mb-3 flex items-center gap-2 text-xs font-medium text-muted-foreground">
                  <Check aria-hidden="true" size={15} className="text-success" />
                  Saved to your library
                </div>
                <WorkoutCard workout={previewWorkout} />
                <div className="mt-3 flex items-center gap-2 border-t border-border pt-3 text-xs text-muted-foreground">
                  <ClipboardList aria-hidden="true" size={15} />
                  Add exercises and details yourself
                </div>
              </div>
            </aside>
          </section>

          <section aria-labelledby="workflow-heading" className="border-t border-border py-8 sm:py-10">
            <div className="mb-5 flex flex-col gap-2 sm:mb-6 sm:flex-row sm:items-end sm:justify-between">
              <h2 id="workflow-heading" className="text-xl font-semibold sm:text-2xl">
                From saved link to finished workout
              </h2>
              <p className="text-sm text-muted-foreground">A simple, manual workflow.</p>
            </div>
            <ol className="grid gap-5 sm:grid-cols-3 sm:gap-6">
              {steps.map(({ number, title, detail, Icon }) => (
                <li key={number} className="flex gap-3">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-card text-action">
                    <Icon aria-hidden="true" size={19} />
                  </span>
                  <div>
                    <p className="text-xs font-semibold text-muted-foreground">STEP {number}</p>
                    <h3 className="mt-1 font-semibold text-foreground">{title}</h3>
                    <p className="mt-1 text-sm leading-6 text-muted-foreground">{detail}</p>
                  </div>
                </li>
              ))}
            </ol>
          </section>
        </main>
      </div>
    </div>
  );
}