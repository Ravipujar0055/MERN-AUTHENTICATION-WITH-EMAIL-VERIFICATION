import express from 'express';
import { getuserdata } from '../controllers/usercontroller.js';
import userauth from "../middlewares/userauth.js";

//export default function xyz() then import { };
//export function xyz() then import;

const userrouter=express.Router();

userrouter.get('/data',userauth,getuserdata);

export default userrouter;