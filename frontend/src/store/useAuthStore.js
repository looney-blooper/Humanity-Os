import { create } from "zustand";

const BACKEND_URL =
    import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";

export const useAuthStore = create((set, get) => ({
    user: null,
    token: localStorage.getItem("authToken") || null,
    loading: false,
    error: null,
    isCheckingAuth: false,

    // --------------------------
    // LOGIN
    // --------------------------
    login: async (email, password) => {
        set({ loading: true, error: null });
        email = email.toLowerCase();

        try {
            const res = await fetch(`${BACKEND_URL}/api/auth/login`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, password }),
            });

            // 👇 Important: DO NOT throw — handle 400 silently
            const data = await res.json(); 
            data.ok = res.ok;

            if (!res.ok) {
                return data;
            }

            localStorage.setItem("authToken", data.token);
            set({
                user: data.user,
                token: data.token,
                loading: false,
            });

            return data;
        } catch (err) {
            console.error("🚨 Login error:", err);
            throw err;
        }
        finally {
            set({ loading: false });
        }
    },


    // --------------------------
    // SIGNUP
    // --------------------------
    signup: async (name, email, password) => {
        set({ loading: true, error: null });
        email = email.toLowerCase();
        try {
            const res = await fetch(`${BACKEND_URL}/api/auth/register`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name, email, password }),
            });

            const data = await res.json();
            set({ loading: false });

            if (!res.ok) {
                return { ok: false, error: data.error };
            }

            return { ok: true, user: data };
        } catch (err) {
            set({ loading: false, error: err.message });
            return { ok: false, error: err.message };
        }
    },

    // --------------------------
    // LOGOUT
    // --------------------------
    logout: () => {
        localStorage.removeItem("authToken");
        set({ user: null, token: null });
        window.location.href = "/login"; // correct client-side redirect
    },

    // --------------------------
    // CHECK AUTH (Auto-login)
    // --------------------------
    checkAuth: async () => {
        const token = localStorage.getItem("authToken");
        if (!token) return { ok: false };

        set({ isCheckingAuth: true });

        try {
            const res = await fetch(`${BACKEND_URL}/api/auth/profile`, {
                method: "GET",
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            const data = await res.json();

            if (!res.ok) {
                set({ user: null, token: null, isCheckingAuth: false });
                localStorage.removeItem("authToken");
                return { ok: false };
            }

            set({
                user: data, // backend returns user object directly
                token,
                isCheckingAuth: false,
            });

            return { ok: true, user: data };
        } catch (err) {
            set({ user: null, token: null, isCheckingAuth: false });
            return { ok: false };
        }
    },

    // --------------------------
    // UPDATE PROFILE (if needed)
    // --------------------------
    updateProfile: async (updates) => {
        const { token } = get();
        set({ loading: true, error: null });

        try {
            const res = await fetch(`${BACKEND_URL}/api/auth/profile`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(updates),
            });

            const data = await res.json();
            set({ loading: false });

            if (!res.ok) {
                return { ok: false, error: data.error };
            }

            // update local state + token
            localStorage.setItem("authToken", data.token);
            set({
                user: {
                    _id: data._id,
                    name: data.name,
                    email: data.email,
                },
                token: data.token,
            });

            return { ok: true, user: data };
        } catch (err) {
            set({ loading: false, error: err.message });
            return { ok: false, error: err.message };
        }
    },
}));
