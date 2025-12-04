/**
 * Toast Store
 *
 * Global toast notification state management.
 * Allows showing toasts from anywhere in the app.
 */

import { create } from 'zustand';
import type { ToastType, ToastMessage } from '@/components/Toast';

interface ToastState {
  toasts: ToastMessage[];
  addToast: (type: ToastType, message: string, duration?: number) => string;
  dismissToast: (id: string) => void;
  success: (message: string, duration?: number) => string;
  error: (message: string, duration?: number) => string;
  info: (message: string, duration?: number) => string;
  clearAll: () => void;
}

export const useToastStore = create<ToastState>((set, get) => ({
  toasts: [],

  addToast: (type, message, duration) => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).slice(2)}`;
    set((state) => ({
      toasts: [...state.toasts, { id, type, message, duration }],
    }));
    return id;
  },

  dismissToast: (id) => {
    set((state) => ({
      toasts: state.toasts.filter((t) => t.id !== id),
    }));
  },

  success: (message, duration) => {
    return get().addToast('success', message, duration);
  },

  error: (message, duration) => {
    return get().addToast('error', message, duration);
  },

  info: (message, duration) => {
    return get().addToast('info', message, duration);
  },

  clearAll: () => {
    set({ toasts: [] });
  },
}));
