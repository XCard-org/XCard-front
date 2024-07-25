export const timeAgo = (date: string): string => {
  const seconds = Math.floor((new Date().getTime() - new Date(date).getTime()) / 1000);

  const getDeclension = (num: number, one: string, twoFour: string, fivePlus: string): string => {
    const mod10 = num % 10;
    const mod100 = num % 100;
    if (mod10 === 1 && mod100 !== 11) {
      return one;
    } else if (mod10 >= 2 && mod10 <= 4 && (mod100 < 10 || mod100 >= 20)) {
      return twoFour;
    } else {
      return fivePlus;
    }
  };

  const interval = Math.floor(seconds / 31536000);
  if (interval >= 1) {
    return `${interval} ${getDeclension(interval, 'год', 'года', 'лет')} назад`;
  }

  const months = Math.floor(seconds / 2628000);
  if (months >= 1) {
    return `${months} ${getDeclension(months, 'месяц', 'месяца', 'месяцев')} назад`;
  }

  const days = Math.floor(seconds / 86400);
  if (days >= 1) {
    return `${days} ${getDeclension(days, 'день', 'дня', 'дней')} назад`;
  }

  const hours = Math.floor(seconds / 3600);
  if (hours >= 1) {
    return `${hours} ${getDeclension(hours, 'час', 'часа', 'часов')} назад`;
  }

  const minutes = Math.floor(seconds / 60);
  if (minutes >= 1) {
    return `${minutes} ${getDeclension(minutes, 'минуту', 'минуты', 'минут')} назад`;
  }

  return 'только что';
};

