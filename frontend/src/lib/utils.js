// shadcn/ui class merging utility
export function cn(...inputs) {
  return inputs.filter(Boolean).join(' ');
}
