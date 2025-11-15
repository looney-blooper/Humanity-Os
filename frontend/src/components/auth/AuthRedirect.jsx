import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../../store/useAuthStore";

function AuthRedirect() {
  const { user } = useAuthStore();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      navigate("/dashboard", { replace: true });   // if logged in → chat
    } else {
      navigate("/login", { replace: true });       // if not logged in → onboarding
    }
  }, [user]);

  return null; // nothing to render, just redirects
}

export default AuthRedirect;