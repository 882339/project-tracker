// fetchProjects.int.test.ts
import { describe, it, expect } from "vitest";
import { fetchProjects } from "../src/utils/fetchUtils";
import { fetchMilestones } from "../src/utils/fetchUtils";

describe("API Integration", () => {
  it("should fetch projects from Supabase", async () => {
    const projects = await fetchProjects();
    expect(Array.isArray(projects)).toBe(true);
    expect(projects.length).toBeGreaterThan(0);
  },30000);

  it("should fetch milestones from Supabase", async () => {
    const milestones = await fetchMilestones();
    console.log(milestones);
    expect(Array.isArray(milestones)).toBe(true);
    expect(milestones.length).toBeGreaterThan(0);
  },30000);
});
