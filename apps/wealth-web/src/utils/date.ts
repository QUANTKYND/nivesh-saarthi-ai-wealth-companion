export function getTodayDateInputValue(): string {
  return toDateInputValue(new Date());
}

export function getDateInputValueFromOffset(monthsAhead: number): string {
  const date = new Date();
  date.setMonth(date.getMonth() + monthsAhead);
  return toDateInputValue(date);
}

export function getTomorrowDateInputValue(): string {
  const date = new Date();
  date.setDate(date.getDate() + 1);
  return toDateInputValue(date);
}

function toDateInputValue(date: Date): string {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, '0');
  const day = `${date.getDate()}`.padStart(2, '0');

  return `${year}-${month}-${day}`;
}
