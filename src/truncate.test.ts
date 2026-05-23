import {
  truncateDiff,
  truncateCommits,
  truncationNotice,
  DEFAULT_MAX_DIFF_CHARS,
  DEFAULT_MAX_COMMITS,
} from "./truncate";

describe("truncateDiff", () => {
  it("returns the diff unchanged when within limit", () => {
    const diff = "small diff content";
    expect(truncateDiff(diff, 100)).toBe(diff);
  });

  it("truncates diff exceeding maxChars and appends notice", () => {
    const diff = "a".repeat(200) + "\n" + "b".repeat(200);
    const result = truncateDiff(diff, 100);
    expect(result.length).toBeLessThan(diff.length);
    expect(result).toContain("diff truncated");
  });

  it("cuts at a newline boundary when possible", () => {
    const diff = "line one\nline two\nline three";
    const result = truncateDiff(diff, 15);
    expect(result).toContain("line one");
    expect(result).toContain("diff truncated");
  });

  it("uses DEFAULT_MAX_DIFF_CHARS when no limit provided", () => {
    const shortDiff = "tiny";
    expect(truncateDiff(shortDiff)).toBe(shortDiff);
  });

  it("handles diff with no newlines gracefully", () => {
    const diff = "x".repeat(50);
    const result = truncateDiff(diff, 20);
    expect(result).toContain("diff truncated");
  });
});

describe("truncateCommits", () => {
  const makeCommits = (n: number) =>
    Array.from({ length: n }, (_, i) => `commit message ${i + 1}`);

  it("returns all commits when under limit", () => {
    const commits = makeCommits(10);
    const result = truncateCommits(commits, 50);
    expect(result.commits).toHaveLength(10);
    expect(result.truncated).toBe(false);
    expect(result.originalCount).toBe(10);
  });

  it("truncates commits exceeding maxCommits", () => {
    const commits = makeCommits(80);
    const result = truncateCommits(commits, DEFAULT_MAX_COMMITS);
    expect(result.commits).toHaveLength(DEFAULT_MAX_COMMITS);
    expect(result.truncated).toBe(true);
    expect(result.originalCount).toBe(80);
  });

  it("keeps the first (newest) commits", () => {
    const commits = makeCommits(10);
    const result = truncateCommits(commits, 3);
    expect(result.commits[0]).toBe("commit message 1");
    expect(result.commits[2]).toBe("commit message 3");
  });
});

describe("truncationNotice", () => {
  it("returns null when nothing was truncated", () => {
    expect(truncationNotice(false, false, 10, 50)).toBeNull();
  });

  it("mentions diff truncation", () => {
    const notice = truncationNotice(true, false, 10, 50);
    expect(notice).toContain("diff was truncated");
  });

  it("mentions commit truncation with counts", () => {
    const notice = truncationNotice(false, true, 80, 50);
    expect(notice).toContain("50 of 80");
  });

  it("mentions both when both truncated", () => {
    const notice = truncationNotice(true, true, 100, 50);
    expect(notice).toContain("diff was truncated");
    expect(notice).toContain("50 of 100");
  });
});
