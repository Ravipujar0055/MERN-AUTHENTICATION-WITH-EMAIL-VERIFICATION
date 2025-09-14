import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import userModel from '../models/usermodel.js';
import transporter from '../config/nodemailer.js'
import { EMAIL_VERIFY_TEMPLATE,PASSWORD_RESET_TEMPLATE } from '../config/emailtemplate.js';

// 🔹 Register
export const register = async (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ success: false, message: 'Missing details' });
  }

  try {
    const existingUser = await userModel.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ success: false, message: 'User already exists' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Save user with hashed password
    const user = new userModel({ name, email, password: hashedPassword });
    await user.save();

    // Create JWT
    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    // Set cookie
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production', // only https in prod
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    //sending an welcome email
    const mailOptions={
      from:process.env.SENDER_EMAIL,
      to:email,
      subject:'welcome to Ravis mail',
      text:`welcome to my page.Your account has been created with email id:${email}`
    }
    try {
      await transporter.sendMail(mailOptions);
    } catch (mailErr) {
      console.error("Email not sent:", mailErr.message);
    }

//above this for the email sending

    return res.status(201).json({ success: true, message: "User registered successfully" });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// 🔹 Login
export const login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ success: false, message: 'Email and password are required' });
  }

  try {
    const user = await userModel.findOne({ email });
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    // Compare password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid Password' });
    }

    // Create JWT
    // jwt.sign(payload, secret, options);
    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    // Set cookie
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return res.json({ success: true, message: "Login successful" });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// 🔹 Logout
export const logout = async (req, res) => {
  try {
    res.clearCookie('token', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'strict',
    });
    return res.json({ success: true, message: "Logged Out" });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

//verify the otp
export const sendVerifyOtp=async(req,res)=>{
  try {
    const {userId}=req.body;
    const user=await userModel.findById(userId);

    if(user.isaccountverified){
      return res.json({success:false,message:'Account Already Verified'})
    }
    const otp=String(Math.floor(10000+Math.random()*900000));
    user.verifyotp=otp;
    user.verifyotpexpireAt=Date.now()+24*60*60*1000;
    await user.save();
//send the mail to the user 
    const mailOptions={
    from:process.env.SENDER_EMAIL,
    to:user.email,
    subject:'Account Verification OTP',
    // text:`Your OTP is ${otp}.Verify your account using this OTP.`,
    html:EMAIL_VERIFY_TEMPLATE.replace("{{otp}}",otp).replace("{{email}}",user.email),
    }
    await transporter.sendMail(mailOptions);
    res.json({success:true,message:'Verification OTP sent on Email'});

  } catch (err) {
    res.json({success:false,message:err.message});
  }
}

// verify the email
export const verifyemail = async (req, res) => {
  const { userId, otp } = req.body;

  if (!userId || !otp) {
    return res.json({ success: false, message: 'Missing details' });
  }

  try {
    // find the user
    const user = await userModel.findById(userId);
    if (!user) {
      return res.json({ success: false, message: 'User not found' });
    }

    // check OTP value
    if (user.verifyotp === '' || user.verifyotp !== otp) {
      return res.json({ success: false, message: 'Invalid OTP' });
    }

    // check OTP expiry
    if (user.verifyotpexpireAt < Date.now()) {
      return res.json({ success: false, message: 'OTP expired' });
    }

    // update verification status
    user.isaccountverified = true;
    user.verifyotp = '';
    user.verifyotpexpireAt = 0;

    await user.save();

    return res.json({ success: true, message: 'Email verified successfully' });

  } catch (err) {
    return res.json({ success: false, message: err.message });
  }
};

// check if the user is authenticated or not 
export const isauthenticated = async (req, res) => {
  try {
    return res.json({ success: true });
  } catch (err) {
    return res.json({ success: false, message: err.message });
  }
};

//send reset otp
export const sendresetotp=async(req,res)=>{
  const {email}=req.body;

  if(!email){
    return res.json({success:false,message:'Email is required'});
  }
  try {
    const user=await userModel.findOne({email});
    if(!user){
      return res.json({success:false,message:'user not found'});
    }
    const otp=String(Math.floor(10000+Math.random()*900000));
    user.resetotp=otp;
    user.resetotpexpireat=Date.now()+24*60*60*1000;
    await user.save();
//send the mail to the user 
    const mailOptions={
    from:process.env.SENDER_EMAIL,
    to:user.email,
    subject:'Password Reset OTP',
    // text:`Your OTP for resetting your password is ${otp}.Use this OTP to proceed with resetting your password.`
    html:PASSWORD_RESET_TEMPLATE.replace("{{otp}}",otp).replace("{{email}}",user.email),
    }
    await transporter.sendMail(mailOptions);
    return res.json({success:true,message:'Otp sent to your email'})

  } catch (err) {
    return res.json({success:false,message:err.message});
  }
}

//verify the otp and reset user password
export const resetpassword = async (req, res) => {
  const { email, otp, newpassword } = req.body;

  if (!email || !otp || !newpassword) {
    return res.json({ success: false, message: "Missing Credentials" });
  }

  try {
    const user = await userModel.findOne({ email });
    if (!user) {
      return res.json({ success: false, message: "User not found" });
    }

    // check otp
    if (user.resetotp === "" || user.resetotp !== otp) {
      return res.json({ success: false, message: "Invalid OTP" });
    }

    // check expiry
    if (user.resetotpexpireat < Date.now()) {
      return res.json({ success: false, message: "OTP Expired" });
    }

    // hash new password and update
    const hashedpassword = await bcrypt.hash(newpassword, 10);
    user.password = hashedpassword;

    // clear reset fields
    user.resetotp = "";
    user.resetotpexpireat = 0;

    await user.save();

    return res.json({ success: true, message: "Password reset successful" });
  } catch (err) {
    return res.json({ success: false, message: err.message });
  }
};
