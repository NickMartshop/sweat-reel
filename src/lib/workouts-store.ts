import { useSyncExternalStore } from "react";
import { mockWorkouts, type Workout } from "./fitvault-data";

let workouts: Workout[] = [...mockWorkouts];
const listeners = new Set<() => void>();

function emit() {
  listeners.forEach((l) => l());
}

export const workoutsStore = {
  get: () => workouts,
  subscribe: (l: () => void) => {
    listeners.add(l);
    return () => listeners.delete(l);
  },
  add: (w: Workout) => {
    workouts = [w, ...workouts];
    emit();
  },
  remove: (id: string) => {
    workouts = workouts.filter((w) => w.id !== id);
    emit();
  },
};

export function useWorkouts() {
  return useSyncExternalStore(
    workoutsStore.subscribe,
    workoutsStore.get,
    workoutsStore.get,
  );
}
