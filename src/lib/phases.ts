import type { ProgressItem } from './types';

/**
 * What a phase in the progress rail means for this applicant.
 *
 * Derived from the status text the site prints on the card, and from the
 * phase's position relative to the active one. The site only prints a status
 * for some phases ("Assigned", "Waiting List", …), so the positions carry the
 * rest: everything before the active phase was necessarily passed.
 *
 * `activeStatus` is the heading status of the current phase
 * (`Summary.phaseStatus`); the final phase reports "Waiting List" there even
 * when its rail row has no status text.
 */
export type PhaseOutcome =
  | 'passed'
  | 'failed'
  | 'waitlist'
  | 'pending'
  | 'next'
  | 'upcoming';

const WAITLIST = /wait(?:ing)?[\s-]*list|waitlist|on\s*hold/i;
const FAILED =
  /not\s*accepted|not\s*passed|not\s*attend|reject|fail|absent|disqualif|declin|withdraw/i;
const PASSED =
  /pass|accept|approv|complete|done|attend|succeed|qualified|eligible/i;

export function phaseOutcome(
  items: ProgressItem[],
  index: number,
  activeName?: string,
  activeStatus?: string,
): PhaseOutcome {
  const item = items[index];
  if (!item) return 'upcoming';

  const status = item.status ?? '';

  if (WAITLIST.test(status)) return 'waitlist';
  if (FAILED.test(status)) return 'failed';
  if (PASSED.test(status)) return 'passed';

  let activeIndex = items.findIndex(entry => entry.active);
  if (activeIndex === -1 && activeName) {
    const wanted = activeName.trim().toLowerCase();
    activeIndex = items.findIndex(
      entry => entry.name.trim().toLowerCase() === wanted,
    );
  }

  if (activeIndex === -1) return 'upcoming';

  if (index === activeIndex) {
    // The current phase often carries its result on the card heading
    // (summary.phaseStatus) rather than on the rail row — that is where the
    // "Waiting List" outcome shows up at the final phase.
    const current = activeStatus ?? '';
    if (WAITLIST.test(current)) return 'waitlist';
    if (FAILED.test(current)) return 'failed';
    if (PASSED.test(current)) return 'passed';
    return 'pending';
  }

  if (index < activeIndex) return 'passed';
  if (index === activeIndex + 1) return 'next';
  return 'upcoming';
}
