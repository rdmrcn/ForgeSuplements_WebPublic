import type { GoalId } from "../types";

export interface Goal {
  id: GoalId;
  name: string;
  /** Short label for chips and tiles. */
  short: string;
  blurb: string;
  /** Plain-language note shown on the goal page; keeps claims honest. */
  note?: string;
}

export const goals: Goal[] = [
  {
    id: "muscle-gain",
    name: "Muscle Gain",
    short: "Muscle gain",
    blurb: "Protein, creatine and amino acids for building lean muscle alongside training.",
    note: "Supplements support a training plan and a balanced diet; they do not build muscle on their own.",
  },
  {
    id: "mass-gain",
    name: "Mass & Weight Gain",
    short: "Mass gain",
    blurb: "High-calorie and slow-release powders for hitting a calorie surplus when gaining weight.",
    note: "Weight gain comes from eating more energy than you use; these products are an easy way to add calories.",
  },
  {
    id: "fat-burn",
    name: "Fat Burn",
    short: "Fat burn",
    blurb: "Carnitine, caffeine and lean protein for cutting phases and calorie-controlled plans.",
    note: "No supplement burns fat by itself. These suit a calorie-controlled diet and regular training.",
  },
  {
    id: "performance",
    name: "Performance",
    short: "Performance",
    blurb: "Pre-workouts, creatine, caffeine and amino acids for training sessions.",
  },
  {
    id: "health",
    name: "Health",
    short: "Health",
    blurb: "Daily essentials: omega-3 and a multivitamin.",
    note: "Food supplements must not replace a varied and balanced diet.",
  },
];

export function getGoal(id: string): Goal | undefined {
  return goals.find((g) => g.id === id);
}

export function isGoalId(value: string): value is GoalId {
  return goals.some((g) => g.id === value);
}
