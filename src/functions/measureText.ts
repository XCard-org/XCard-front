export function getTextWidth(
  text: string,
  weight: 400 | 500,
  size: number,
  type: 'Roboto' | 'Roboto Mono' | string,
): number {
  const canvas = document.createElement('canvas');
  const context = canvas.getContext('2d');

  if (context) {
    context.font = `${weight} ${size}px ${type}`;
  }

  return context?.measureText(text).width || 0;
}

