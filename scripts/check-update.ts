/**
 * Is a newer version of this kit available?
 *
 *   node scripts/check-update.ts        (npm run check:update)
 *
 * Fetches the remote this copy was cloned from and compares it with the local branch. Prints one line: up to date, or
 * how many commits are new and the command to update. Never changes files. Exit code 0 in every case, so it can run
 * at the start of any task; 2 only when this is not a git checkout.
 */
import { execFileSync } from "node:child_process";

const git = (...args: string[]) => execFileSync("git", args, { encoding: "utf8" }).trim();

try {
  git("rev-parse", "--is-inside-work-tree");
} catch {
  console.log("check-update: this copy is not a git checkout; ask the kit owner for the latest version.");
  process.exit(2);
}

let upstream = "";
try {
  upstream = git("rev-parse", "--abbrev-ref", "--symbolic-full-name", "@{u}");
} catch {
  console.log("check-update: no upstream branch is set; cannot tell whether a newer version exists.");
  process.exit(0);
}

try {
  git("fetch", "--quiet");
} catch {
  console.log(`check-update: could not reach ${upstream} (offline?); the copy may be out of date.`);
  process.exit(0);
}

const behind = Number(git("rev-list", "--count", `HEAD..${upstream}`));
const local = git("log", "-1", "--format=%h %cs");
if (behind === 0) {
  console.log(`check-update: up to date with ${upstream} (${local}).`);
} else {
  const latest = git("log", "-1", "--format=%h %cs %s", upstream);
  console.log(`check-update: ${behind} newer commit(s) on ${upstream}. Latest: ${latest}. You have ${local}.`);
  console.log("check-update: to update, run `git pull`, then `npm install` and `npm run check`.");
}
