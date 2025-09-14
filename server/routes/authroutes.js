import express from "express";
import { register, login, logout, sendVerifyOtp, 
verifyemail, isauthenticated, sendresetotp, 
resetpassword } from '../controllers/authcontroller.js';

import userauth from "../middlewares/userauth.js";


const authrouter=express.Router();

authrouter.post('/register',register);
authrouter.post('/login',login);
authrouter.post('/logout',logout);
authrouter.post('/send-Verify-Otp',userauth,sendVerifyOtp);
authrouter.post('/verify-account',userauth,verifyemail);
authrouter.get('/is-auth',userauth,isauthenticated);

authrouter.post('/send-reset-otp',sendresetotp);

authrouter.post('/reset-pass',resetpassword);

export default authrouter;