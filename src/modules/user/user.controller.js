import { userModel } from "../../../db/models/user.model.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { sendEmail } from "../../email/sendEmail.js";
import { handleError } from "../../middleware/handleAsyncError.js";
export const signUp = handleError(async (req, res, next) => {
  try {
    let { name, email, password, code, subject, role, phoneNum } = req.body;
    let existUser = await userModel.findOne({ email });

    if (existUser) {
      return res.status(400).json({ err: "Email already exists" });
    }

    let hashedPassword = bcrypt.hashSync(
      password,
      parseInt(process.env.SALTROUNDS)
    );
    let addedUser = await userModel.create({
      name,
      email,
      password: hashedPassword,
      subject,
      role,
      code,
      phoneNum,
    });
    let verifyToken = jwt.sign(
      { id: addedUser._id },
      process.env.VERIFY_SECRET
    );
    sendEmail({
      email,
      api: `http://localhost:3000/api/v1/user/verfiy/${verifyToken}`,
      name,
    });
    res.json({ message: "Success", addedUser });
  } catch (error) {
    console.log(error);
    res.status(500).json({ err: "Internal Server Error" });
  }
});

export const signIn = handleError(async (req, res, next) => {
  try {
    let { email, password } = req.body;
    let existUser = await userModel.findOne({ email });

    if (!existUser) {
      return res.status(401).json({ err: "You have to register first" });
    }

      let matched = bcrypt.compareSync(password, existUser.password);

      if (matched) {
        let token = jwt.sign(
          { id: existUser._id, role: existUser.role, verified: existUser.verified },
          process.env.SECRET_KEY
        );
        res.json({ message: "Welcome", token });
      } else {
        res.status(400).json({ err: "Wrong password" });
      }
    
  } catch (error) {
    res.status(500).json({ err: "Internal Server Error" });
  }
});

export const verifyEmail = (req, res) => {
  try {
    let { token } = req.params;
    jwt.verify(token, process.env.VERIFY_SECRET, async (err, decoded) => {
      if (err) return res.status(400).json({ err: "Invalid token" });

      let updatedUser = await userModel.findByIdAndUpdate(
        decoded.id,
        { verified: true },
        { new: true }
      );
      res.json({ message: "Success", updatedUser });
    });
  } catch (error) {
    res.status(500).json({ err: "Internal Server Error" });
  }
};


// ###########################################################





// Controller for creating a new user
export const createUser = handleError(async (req, res) => {
  try {

    const { name, email, password, code, subject, role, phoneNum } = req.body;

    const existingUser = await userModel.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'Email already exists' });
    }

    const newUser = await userModel.create({
      name,
      email,
      password,
      code,
      subject,
      role,
      phoneNum,
    });

    res.status(201).json({ success: true, message: 'User created successfully', user: newUser });
  } catch (error) {
    console.error('Error creating user:', error);
    res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
});

export const getAllUsers = handleError(async (req, res) => {
  try {
    const users = await userModel.find();
    res.json({ success: true, data: users });
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
});

export const getUserById = handleError(async (req, res) => {
  try {
    const user = await userModel.findById(req.params.userId).select('-password');

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    res.json({ success: true, data: user });
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
});

export const updateUserById = handleError(async (req, res) => {
  try {
   
    const updatedUser = await userModel.findByIdAndUpdate(req.params.userId, req.body, { new: true });

    if (!updatedUser) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    res.json({ success: true, message: 'User updated successfully', user: updatedUser });
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
});

// Controller for deleting a user by ID
export const deleteUserById = handleError(async (req, res) => {
  try {
    const deletedUser = await userModel.findByIdAndDelete(req.params.userId);

    if (!deletedUser) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    res.json({ success: true, message: 'User deleted successfully', user: deletedUser });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
});