/**
 * The one name string a submission is guaranteed to have.
 *
 * The contact form asks for a first name and a last name separately, so
 * nothing downstream has to split anything. That is the point of asking
 * twice: a splitter is a guess, and it guesses wrong in a particular
 * direction — Spanish two-surname names, Chinese family-name-first
 * names, mononyms, anything with a particle — for people who notice it
 * about themselves. pawsq's `contacts` holds the two as separate
 * columns, so the form collects them that way and they are already
 * right whenever this form is wired into pawsq (it is not today — see
 * README).
 *
 * This composes rather than splits, which is the safe direction.
 */
export function fullName(first: string, last: string): string {
  return [first, last]
    .map((part) => part.trim())
    .filter(Boolean)
    .join(" ");
}
