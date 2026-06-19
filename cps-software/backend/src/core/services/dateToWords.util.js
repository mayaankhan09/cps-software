// This file turns a date of birth into a words version of itself, e.g. the
// date 20 June 2010 becomes "Twentieth June Two Thousand Ten". It is used by
// the registrations module to auto-fill the "dobInWords" field.

const ORDINAL_DAYS = [
  "", // index 0 is unused — days start at 1
  "First", "Second", "Third", "Fourth", "Fifth", "Sixth", "Seventh", "Eighth",
  "Ninth", "Tenth", "Eleventh", "Twelfth", "Thirteenth", "Fourteenth",
  "Fifteenth", "Sixteenth", "Seventeenth", "Eighteenth", "Nineteenth",
  "Twentieth", "Twenty-First", "Twenty-Second", "Twenty-Third",
  "Twenty-Fourth", "Twenty-Fifth", "Twenty-Sixth", "Twenty-Seventh",
  "Twenty-Eighth", "Twenty-Ninth", "Thirtieth", "Thirty-First",
];

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

// Words for 0-19, used as the building blocks for bigger numbers.
const ONES = [
  "Zero", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight",
  "Nine", "Ten", "Eleven", "Twelve", "Thirteen", "Fourteen", "Fifteen",
  "Sixteen", "Seventeen", "Eighteen", "Nineteen",
];

// Words for the tens place (20, 30, 40...90).
const TENS = [
  "", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety",
];

// Converts any number from 0-99 into words, e.g. 84 -> "Eighty-Four".
function twoDigitsToWords(n) {
  if (n < 20) return ONES[n];
  const tens = Math.floor(n / 10);
  const ones = n % 10;
  return ones === 0 ? TENS[tens] : `${TENS[tens]}-${ONES[ones]}`;
}

// Converts any number from 0-999 into words, e.g. 284 -> "Two Hundred Eighty-Four".
function threeDigitsToWords(n) {
  if (n < 100) return twoDigitsToWords(n);
  const hundreds = Math.floor(n / 100);
  const rest = n % 100;
  return rest === 0
    ? `${ONES[hundreds]} Hundred`
    : `${ONES[hundreds]} Hundred ${twoDigitsToWords(rest)}`;
}

// Converts a 4-digit year into the way people normally SAY a year out loud.
// Examples: 2010 -> "Two Thousand Ten", 1984 -> "Nineteen Eighty-Four".
function yearToWords(year) {
  // Years from 1100-1999 are normally said as two 2-digit chunks
  // (e.g. 1984 -> "Nineteen" + "Eighty-Four").
  if (year >= 1100 && year <= 1999) {
    const firstTwo = Math.floor(year / 100);
    const lastTwo = year % 100;
    const firstWords = twoDigitsToWords(firstTwo);

    if (lastTwo === 0) return `${firstWords} Hundred`;
    if (lastTwo < 10) return `${firstWords} Oh ${ONES[lastTwo]}`;
    return `${firstWords} ${twoDigitsToWords(lastTwo)}`;
  }

  // Everything else (including 2000-2099, the most common case for a school's
  // current students) is said as "<thousands> Thousand <remainder>",
  // e.g. 2010 -> "Two" + " Thousand" + " Ten" = "Two Thousand Ten".
  const thousands = Math.floor(year / 1000);
  const remainder = year % 1000;
  const thousandsWords = `${threeDigitsToWords(thousands)} Thousand`;

  return remainder === 0 ? thousandsWords : `${thousandsWords} ${threeDigitsToWords(remainder)}`;
}

// The main function: takes a date (or date string) and returns it in words.
export function dateToWords(date) {
  const d = new Date(date);

  const day = d.getDate();
  const month = d.getMonth();
  const year = d.getFullYear();

  return `${ORDINAL_DAYS[day]} ${MONTH_NAMES[month]} ${yearToWords(year)}`;
}
