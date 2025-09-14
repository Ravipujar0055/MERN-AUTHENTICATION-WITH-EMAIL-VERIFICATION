import userModel from "../models/usermodel.js";

export const getuserdata = async (req, res) => {
  try {
    const { userId } = req.body;
    const user = await userModel.findById(userId);

    if (!user) {
      return res.json({ success: false, message: "User not registered" });
    }

    res.json({
      success: true,
      userData: {
        name: user.name,
        isaccountverified: user.isaccountverified,
      },
    });
  } catch (err) {
    return res.json({ success: false, message: err.message });
  }
};
