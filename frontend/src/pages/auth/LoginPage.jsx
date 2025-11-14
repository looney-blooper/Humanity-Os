import { Eye, EyeOff } from "lucide-react";
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../../store/useAuthStore";
import ErrorMessage from "../../components/ErrorMessage";
const Login = () => {
    const [showPassword, setShowPassword] = useState(false);
    const {login} = useAuthStore();

    const [formData, setFormData] = useState({
        email: "",
        password: ""
    })
    const [errors, setErrors] = useState({
        email: "",
        password: ""
    });   

    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const onSubmit = async () =>{
        if(formData.email === "" || formData.password === ""){
            alert("Please fill all the fields");
            return;
        }
        try{
        const res = await login(formData.email, formData.password);
        if(res.ok){
            navigate("/carepage");
        }
        else{
            setErrors({
                email: res?.error.email,
                password: res?.error.password
            });

        }
        }catch(err){
            console.error("Login error:", err);
        }
    }

    return (
        <div className="w-screen min-h-screen bg-[#121212] flex items-center justify-center p-4">

            <div className="w-120 px-10 py-10 flex flex-col  items-center shadow rounded-xl border-1 border-purple-500/20">
                <h2 className="text-3xl font-bold tracking">Welcome Back</h2>
                <p className="mt-2 text-[14px]">We missed you — let's pick up where we left off.</p>
                <div className="space-y-6 w-full mt-20 ">
                    <div className="flex  gap-4 justify-between w-full border-1 border-gray-400/20 rounded-xl items-center px-3">
                        <input type="text" className="w-full outline-0  p-2 " placeholder="Enter Email" name="email"
                            onChange={handleChange}
                            value={formData.email}
                            required />
                    </div>
                    {errors.email && <ErrorMessage message={errors.email} />}
                    <div className="flex  gap-4 justify-between w-full border-1 border-gray-400/20 rounded-xl items-center px-3">
                        <input type={showPassword ? "text" : "password"} className="w-full outline-0  p-2 " placeholder="Enter Password"
                            name="password"
                            onChange={handleChange}
                            value={formData.password}
                            required />
                        <button onClick={() => { setShowPassword(!showPassword) }}>
                            {showPassword ? <EyeOff className="text-white/80 size-5" /> : <Eye className="text-white/80 size-5" />}
                        </button>
                    </div>
                    {errors.password && <ErrorMessage message={errors.password} />}
                </div>

                <button className="mt-12 p-2 rounded-lg font-bold tracking-wide text-lg bg-gradient-to-r from-violet-500 to-pink-500 w-full" onClick={onSubmit}>
                    Login
                </button>

                <div className="mt-4 text-[13px]">
                    <p>Don't have an account? <span className="  text-pink-500"><button
                        onClick={() => navigate("/signup")} className="hover:underline cursor-pointer">Signup</button></span></p>
                </div>
            </div>
        </div>
    );
};

export default Login;
