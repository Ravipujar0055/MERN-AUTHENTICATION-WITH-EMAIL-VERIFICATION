import axios from 'axios';
import { createContext, useEffect, useState } from 'react';
import { toast } from 'react-toastify';

export const AppContent = createContext();

export const AppContextProvider = (props) => {
    axios.defaults.withCredentials=true;

  const backend_url = import.meta.env.VITE_BACKEND_URL;

  const [isloggedin, setisloggedin] = useState(false);
  const [userdata, setuserdata] = useState(false);

  const getauthstate=async()=>{
    try {
        const {data}=await axios.get(backend_url+'/api/auth/is-auth')
        if(data.success){
            setisloggedin(true);
            getuserdata();
        }
    } catch (error) {
        
    }
  }

  const getuserdata = async () => {
    try {
      axios.defaults.withCredentials = true;
      const { data } = await axios.get(`${backend_url}/api/user/data`);
      if (data.success) {
        setuserdata(data.userData);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || error.message);
    }
  };

  useEffect(()=>{
    getauthstate();

},[])
  const value = {
    backend_url,
    isloggedin, setisloggedin,
    userdata, setuserdata,
    getuserdata,
  };

  return (
    <AppContent.Provider value={value}>
      {props.children}
    </AppContent.Provider>
  );
};
