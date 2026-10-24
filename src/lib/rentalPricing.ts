
export const DAILY_RATES: Record<string, number> = {
  Textbook: 3,
  Calculator: 5,
  "Lab Equipment": 8,
  Tool: 4,
};

export function getSuggestedDailyRate(category: string): number {
  return DAILY_RATES[category] ?? 3;
}

export function calculateRentalDays(
  startDate: string,
  endDate: string
): number {
  if (!startDate || !endDate) return 0;

  const start = Date.parse(`${startDate}T00:00:00Z`);
  const end = Date.parse(`${endDate}T00:00:00Z`);

  if (!Number.isFinite(start) || !Number.isFinite(end)) {
    return 0;
  }

  return Math.max(
    0,
    Math.round((end - start) / 86400000)
  );
}

export function calculateRentalTotal(
  dailyRate: number,
  startDate: string,
  endDate: string
): number {
  const days = calculateRentalDays(startDate, endDate);

  if (!Number.isFinite(dailyRate) || dailyRate <= 0) {
    return 0;
  }

  return Math.round(days * dailyRate * 100) / 100;
}
