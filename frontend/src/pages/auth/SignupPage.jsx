import { Eye, EyeOff } from "lucide-react";
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../../store/useAuthStore";
import ErrorMessage from "../../components/ErrorMessage";
import toast from "react-hot-toast";
const SignupPage = () => {
    const {signup} = useAuthStore();
    const [errors, setErrors] = useState({
        email: "",
        password: "",
        confirmPassword:""
    });
    const [showPassword, setShowPassword] = useState(false);
    const [formData, setFormData] = useState({
        name:"",
        email: "",
        password: "",
        confirmPassword:""
    })



    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const onSubmit = async () =>{
        if(formData.name === "" || formData.email === "" || formData.password === ""){
            toast.error("Please fill all the fields");
            return;
        }

        if(formData.password !== formData.confirmPassword){
            setErrors({
                ...errors,
                confirmPassword: "Passwords do not match"
            });
            return;
        }

        if(formData.password.length < 8 || !/\d/.test(formData.password) || !/[A-Z]/.test(formData.password)){
            setErrors({
                ...errors,
                password: "Password must be at least 8 characters long, contain a number and an uppercase letter"
            });
            return;
        }


        if(formData.email.indexOf("@") === -1){
            setErrors({
                ...errors,
                email: "Invalid email address"
            });
            return;
        }


        setErrors({
            email: "",
            password: "",
            confirmPassword:""
        });
        const res = await signup(formData.name, formData.email, formData.password);
        console.log("response: ",res);
        if(res.ok){
            toast.success("Signup successful! Please login.");
            navigate("/login");
        }
        else{
            if (res?.error.email)
                toast.error(res?.error.email)
            if (res?.error.password)
                toast.error(res?.error.password)
            
        }
    }

    return (
        <div className="w-screen min-h-screen bg-[#121212] flex items-center justify-center p-4">

            <div className="w-120 px-10 py-10 flex flex-col  items-center shadow rounded-xl border-1 border-purple-500/20">
                <h2 className="text-3xl font-bold tracking">Create Your Account</h2>
                <p className="mt-2 text-[14px]">Join us and get started in seconds.</p>
                <div className="space-y-6 w-full mt-20 ">
                    {/* Full NAme  */}
                    <div className="flex  gap-4 justify-between w-full border-1 border-gray-400/20 rounded-xl items-center px-3">
                        <input type="text" className="w-full outline-0  p-2 " id="" placeholder="Enter Full Name" name="name"
                            onChange={handleChange}
                            value={formData.name}
                            required />
                    </div>
                    

                    {/* Email  */}
                    <div className="flex  gap-4 justify-between w-full border-1 border-gray-400/20 rounded-xl items-center px-3">
                        <input type="text" className="w-full outline-0  p-2 " id="" placeholder="Enter Email" name="email"
                            onChange={handleChange}
                            value={formData.email}
                            required />
                    </div>

                    {/* Password  */}
                    <div className="flex  gap-4 justify-between w-full border-1 border-gray-400/20 rounded-xl items-center px-3">
                        <input type={showPassword ? "text" : "password"} className="w-full outline-0  p-2 " id="" placeholder="Enter Password"
                            name="password"
                            onChange={handleChange}
                            value={formData.password}
                            required />
                        <button onClick={() => { setShowPassword(!showPassword) }}>
                            {showPassword ? <EyeOff className="text-white/80 size-5" /> : <Eye className="text-white/80 size-5" />}
                        </button>
                    </div>
                    

                    {/* Confirm Password  */}
                    <div className="flex  gap-4 justify-between w-full border-1 border-gray-400/20 rounded-xl items-center px-3">
                        <input type={"password"} className="w-full outline-0  p-2 " id="" placeholder="Confirm Password"
                            name="confirmPassword"
                            onChange={handleChange}
                            value={formData.confirmPassword}
                            required />
                    </div>
                    
                </div>

                <button className="mt-12 p-2 rounded-lg font-bold tracking-wide text-lg bg-gradient-to-r from-violet-500 to-pink-500 w-full" onClick={onSubmit}>
                    Signup
                </button>

                <div className="mt-4 text-[13px]">
                    <p>Already have an account? <span className="  text-pink-500"><button
                        onClick={() => navigate("/login")} className="hover:underline cursor-pointer">Login</button></span></p>
                </div>
            </div>
        </div>
    );
};

export default SignupPage;
