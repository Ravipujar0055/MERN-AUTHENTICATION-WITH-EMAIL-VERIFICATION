import React, { useContext } from "react";
import {assets} from '../assets/assets';
import { useNavigate } from "react-router-dom";
import { AppContent } from "../context/AppContext";
import axios from "axios";
import { toast } from "react-toastify";

const Navbar=()=>{
    const navigate=useNavigate();
    const {userdata,backend_url,setuserdata,setisloggedin}=useContext(AppContent);
    const sendverificationotp=async()=>{
        try{
        axios.defaults.withCredentials=true;
        const {data}=await axios.post(backend_url+'/api/auth/send-Verify-Otp');
        if(data.success){
            navigate('/email-verify');
            toast.success(data.message);
        }else{
            toast.error(data.message);
        }
        }catch(error){
            toast.error.message(data.message);
        }
    }
    const logout=async()=>{
        try {
            axios.defaults.withCredentials=true;
            const {data}=await axios.post(backend_url+'/api/auth/logout');
            data.success && setisloggedin(false);
            data.success && setuserdata(false);
            navigate('/')

        } catch (error) {
            toast.error(error.message)
        }
    }
    return (
        <div className="w-full flex justify-between items-center p-4 sm:p-6 sm:px-24 absolute top-0">
            <img src={assets.logo} alt="" className="w-28 sm:w-32"/>
            {userdata?
            <div className="w-8 h-8 flex justify-center items-center rounded-full bg-black text-white relative group">
                {userdata.name[0].toUpperCase()}
                <div className="absolute hidden group-hover:block top-0 right-0 z-10 text-black rounded pt-10">
                    <ul className="list-none m-0 p-2 bg-gray-100 text-sm">
                        {!userdata.isaccountverified && 
                        <li onClick={sendverificationotp} className="py-1 py-2 hover:bg-gray-200 cursor-pointer">Verify Email</li>}
                        
                        <li onClick={logout} className="py-1 py-2 hover:bg-gray-200 cursor-pointer pr-10">Logout</li>
                    </ul>
                </div>
            </div>
            :
            <button onClick={()=>navigate('/Login')} className='flex items-center gap-2 border border-gray-400
            rounded-full px-8 py-2 text-gray-800 hover:bg-gray-100 transition-all'>Login <img src={assets.arrow_icon} alt=""/></button>}
            
        </div>
    )
}
export default Navbar;