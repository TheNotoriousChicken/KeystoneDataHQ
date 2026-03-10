import { create } from 'zustand';
import { subDays } from 'date-fns';

export const useDateStore = create((set) => ({
    dateRange: [subDays(new Date(), 30), new Date()],
    setDateRange: (newRange) => set({ dateRange: newRange }),
}));
