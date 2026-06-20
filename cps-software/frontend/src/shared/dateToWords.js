// This mirrors the backend's date-to-words logic (backend/src/core/services/
// dateToWords.util.js) so the registration form can show "dobInWords" live,
// as soon as a date of birth is picked — without waiting for a server
// round-trip. The backend still recalculates this itself when it saves the
// registration, so it remains the source of truth; this copy is just for
// the on-screen preview.

const ORDINAL_DAYS = [
  "",
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

const ONES = [
  "Zero", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight",
  "Nine", "Ten", "Eleven", "Twelve", "Thirteen", "Fourteen", "Fifteen",
  "Sixteen", "Seventeen", "Eighteen", "Nineteen",
];

const TENS = [
  "", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety",
];

function twoDigitsToWords(n) {
  if (n < 20) return ONES[n];
  const tens = Math.floor(n / 10);
  const ones = n % 10;
  return ones === 0 ? TENS[tens] : `${TENS[tens]}-${ONES[ones]}`;
}

function threeDigitsToWords(n) {
  if (n < 100) return twoDigitsToWords(n);
  const hundreds = Math.floor(n / 100);
  const rest = n % 100;
  return rest === 0
    ? `${ONES[hundreds]} Hundred`
    : `${ONES[hundreds]} Hundred ${twoDigitsToWords(rest)}`;
}

function yearToWords(year) {
  if (year >= 1100 && year <= 1999) {
    const firstTwo = Math.floor(year / 100);
    const lastTwo = year % 100;
    const firstWords = twoDigitsToWords(firstTwo);

    if (lastTwo === 0) return `${firstWords} Hundred`;
    if (lastTwo < 10) return `${firstWords} Oh ${ONES[lastTwo]}`;
    return `${firstWords} ${twoDigitsToWords(lastTwo)}`;
  }

  const thousands = Math.floor(year / 1000);
  const remainder = year % 1000;
  const thousandsWords = `${threeDigitsToWords(thousands)} Thousand`;

  return remainder === 0 ? thousandsWords : `${thousandsWords} ${threeDigitsToWords(remainder)}`;
}

// Takes a date string (e.g. from a <input type="date">) and returns it in
// words, e.g. "2010-06-20" -> "Twentieth June Two Thousand Ten". Returns an
// empty string if no date has been chosen yet.
export function dateToWords(dateString) {
  if (!dateString) return "";

  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return "";

  const day = date.getUTCDate();
  const month = date.getUTCMonth();
  const year = date.getUTCFullYear();

  return `${ORDINAL_DAYS[day]} ${MONTH_NAMES[month]} ${yearToWords(year)}`;
}
