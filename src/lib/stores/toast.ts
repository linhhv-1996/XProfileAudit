import { writable } from 'svelte/store';

export type ToastType = 'success' | 'error' | 'info';

export interface Toast {
  id: number;
  type: ToastType;
  message: string;
}

export const toasts = writable<Toast[]>([]);

let counter = 0;

export const addToast = (message: string, type: ToastType = 'info') => {
  const id = ++counter;
  toasts.update((all) => [{ id, type, message }, ...all]);

  // Tự động tắt sau 3 giây
  setTimeout(() => {
    removeToast(id);
  }, 3000);
};

export const removeToast = (id: number) => {
  toasts.update((all) => all.filter((t) => t.id !== id));
};
