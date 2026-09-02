import { create } from 'zustand';

/**
 * uiStore — Global UI state managed via Zustand.
 * Handles ephemeral UI concerns: sidebar, modals, toasts, onboarding.
 * 
 * This store is NOT persisted — it resets on page reload (by design).
 */
export const useUIStore = create((set, get) => ({
 // Sidebar
 sidebarCollapsed: false,
 toggleSidebar: () => set((s) => ({ sidebarCollapsed: !s.sidebarCollapsed })),

 // History panel (per-tool-page)
 historyPanelOpen: false,
 toggleHistoryPanel: () => set((s) => ({ historyPanelOpen: !s.historyPanelOpen })),
 setHistoryPanelOpen: (open) => set({ historyPanelOpen: open }),

 // Active modal
 activeModal: null, // string key or null
 modalProps: {},
 openModal: (modalKey, props = {}) => set({ activeModal: modalKey, modalProps: props }),
 closeModal: () => set({ activeModal: null, modalProps: {} }),

 // Toasts (managed here for global access, rendered by ToastContainer)
 toasts: [],
 addToast: (toast) => {
 const id = Date.now().toString();
 const newToast = { id, ...toast };
 set((s) => ({ toasts: [...s.toasts, newToast] }));
 // Auto-dismiss after duration
 setTimeout(() => {
 set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) }));
 }, toast.duration || 4000);
 return id;
 },
 removeToast: (id) => set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })),

 // Onboarding
 onboardingStep: 0,
 setOnboardingStep: (step) => set({ onboardingStep: step }),
 onboardingComplete: false,
 completeOnboarding: () => set({ onboardingComplete: true, onboardingStep: 0 }),
}));
