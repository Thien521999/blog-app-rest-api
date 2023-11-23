import bcrypt from "bcrypt";
import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import jwt_decode from "jwt-decode";
import {
  generateAccessToken,
  generateActiveToken,
  generateRefreshToken,
} from "../config/generateToken";
import { IDecodedToken, IUser, IUserParams } from "../config/interface";
import sendEmail from "../config/sendMail";
import { sendSMS, smsOTP, smsVerify } from "../config/sendSMS";
import { validPhone, validateEmail } from "../middleware/valid";
import Users from "../models/userModel";

const CLIENT_URL = `${process.env.BASE_URL}`;

const authCtrl = {
  register: async (req: Request, res: Response) => {
    try {
      const { name, account, password } = req.body;

      // find in database
      const user = await Users.findOne({ account });
      if (user)
        return res
          .status(400)
          .json({ msg: "Email or Phone number already exists." });

      const passwordHash = await bcrypt.hash(password, 12); // ma hoa password

      // encode password
      const newUser = {
        name,
        account,
        password: passwordHash,
      };

      // handle active token
      const active_token = generateActiveToken({ newUser });
      // URl không chứa được dấu .(tìm hiểu thêm)
      const replacedToken = active_token?.replace(/\./g, "~");
      const url = `${CLIENT_URL}/active/${replacedToken}`;

      // check mail valid
      if (validateEmail(account)) {
        // send email , use nodemailer
        sendEmail(account, url, "Verify your email address");

        return res.json({
          msg: "Success! Please check your email",
        });
      } else if (validPhone(account)) {
        // send sms, use Twilio
        sendSMS(account, url, "Verify your phone number");
        return res.json({
          msg: "Success! Please check phone.",
        });
      }
    } catch (err: any) {
      // next(err) //neu dùng next(err) thi expessjs se dua ve xu ly loi tap trung chinh la "Middleware xu ly loi tap trung"
      return res.status(500).json({ msg: err.message });
    }
  },
  activeAccount: async (req: Request, res: Response) => {
    try {
      const { active_token } = req.body;
      const decoded = <IDecodedToken>(
        jwt.verify(active_token, `${process.env.ACTIVE_TOKEN_SECRET}`)
      );
      const { newUser } = decoded;
      if (!newUser)
        return res.status(400).json({ msg: "Invalid authentication." });

      const user = await Users.findOne({ account: newUser?.account });
      if (user) return res.status(400).json({ msg: "Account already exists." });

      const new_user = new Users(newUser);

      await new_user.save();
      res.json({ msg: "Account has been activated!" });
    } catch (err: any) {
      // let errMsg;
      // if (err.code === 11000) {
      //   errMsg = Object.keys(err.keyValue)[0] + " aready exists.";
      // } else {
      //   let name = Object.keys(err.errors)[0];
      //   errMsg = err.errors[`${name}`].message;
      // }

      return res.status(500).json({ msg: err.message });
    }
  },
  login: async (req: Request, res: Response) => {
    try {
      const { account, password } = req.body;

      const user = await Users.findOne({ account });
      if (!user)
        return res.status(400).json({ msg: "This account does not exits." });

      // if user exist
      loginUser(user, password, res);
    } catch (err: any) {
      return res.status(500).json({ msg: err.message });
    }
  },
  logout: async (req: Request, res: Response) => {
    try {
      res.clearCookie("refreshtoken", { path: `/api/refresh_token` });

      return res.json({ msg: "Logged out" });
    } catch (err: any) {
      return res.status(500).json({ msg: err.message });
    }
  },
  refreshToken: async (req: Request, res: Response) => {
    try {
      const rf_token = req.body.refreshToken;
      if (!rf_token) return res.status(400).json({ msg: "Please login now!" });

      const decoded = <IDecodedToken>(
        jwt.verify(rf_token, `${process.env.REFRESH_TOKEN_SECRET}`)
      );
      if (!decoded.id)
        return res.status(400).json({ msg: "Please login now!" });

      const user = await Users.findById(decoded.id).select("-password");
      if (!user)
        return res.status(400).json({ msg: "This account does not exist." });

      const access_token = generateAccessToken({ id: user._id });

      return res.json({ access_token, user });
    } catch (err: any) {
      return res.status(500).json({ msg: err.message });
    }
  },
  googleLogin: async (req: Request, res: Response) => {
    try {
      const { access_token } = req.body;

      const decoded = jwt_decode(access_token);

      const { email, email_verified, name, picture }: any = decoded;

      if (!email_verified)
        return res.status(500).json({ msg: "Email verification failed!" });

      const password = email + "your google secret password";
      const passwordHash = await bcrypt.hash(password, 12);

      const user = await Users.findOne({ account: email });
      if (user) {
        loginUser(user, password, res);
      } else {
        const user: IUserParams = {
          name,
          account: email,
          password: passwordHash,
          avatar: picture,
          type: "google",
        };

        registerUser(user, res);
      }
    } catch (err: any) {
      return res.status(500).json({ msg: err.message });
    }
  },
  facebookLogin: async (req: Request, res: Response) => {
    try {
      const { accessToken, userID } = req.body;

      const URL = `https://graph.facebook.com/v3.0/${userID}/?fields=id,name,email,picture&access_token=${accessToken}`;
      const response = await fetch(URL);
      const { email, name, picture } = await response.json();

      const password = email + "your facebook secret password";
      const passwordHash = await bcrypt.hash(password, 12);

      const user = await Users.findOne({ account: email });
      if (user) {
        loginUser(user, password, res);
      } else {
        const user: IUserParams = {
          name,
          account: email,
          password: passwordHash,
          avatar: picture.data.url,
          type: "facebook",
        };

        registerUser(user, res);
      }
    } catch (err: any) {
      return res.status(500).json({ msg: err.message });
    }
  },
  loginSMS: async (req: Request, res: Response) => {
    try {
      const { phone } = req.body;

      const data = await smsOTP(phone, "sms");
      if (data) {
        res.json(data);
      } else {
        return res.status(400).json({ msg: "Phone invalid!" });
      }
    } catch (err: any) {
      return res.status(500).json({ msg: err.message });
    }
  },
  smsVerify: async (req: Request, res: Response) => {
    try {
      const { phone, code } = req.body;

      const data: any = await smsVerify(phone, code);
      if (!data.valid)
        return res.status(400).json({ msg: "Invalid Authentication." });

      const password = phone + "your phone secret password";
      const passwordHash = await bcrypt.hash(password, 12);

      const user = await Users.findOne({ account: phone });
      if (user) {
        loginUser(user, password, res);
      } else {
        const user: IUserParams = {
          name: phone,
          account: phone,
          password: passwordHash,
          type: "sms",
        };

        registerUser(user, res);
      }
    } catch (err: any) {
      return res.status(500).json({ msg: err.message });
    }
  },
};

export const loginUser = async (
  user: IUser,
  password: string,
  res: Response
) => {
  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) return res.status(400).json({ msg: "Password is incorrect" });

  const access_token = generateAccessToken({ id: user._id });
  const refresh_token = generateRefreshToken({ id: user._id });

  // res.cookie("refreshtoken", refresh_token, {
  //   httpOnly: true,
  //   path: `/api/refresh_token`,
  //   maxAge: 30 * 24 * 60 * 60 * 1000, // 30days
  //   domain: "localhost",
  //   secure: false,
  // });

  res.json({
    msg: "Login Success!",
    access_token,
    refresh_token,
    user: { ...user._doc, password: "" },
  });
};

export const registerUser = async (user: IUserParams, res: Response) => {
  const newUser = new Users(user);
  await newUser.save();

  const access_token = generateAccessToken({ id: newUser._id });
  const refresh_token = generateRefreshToken({ id: newUser._id });

  res.json({
    msg: "Login Success!",
    access_token,
    refresh_token,
    user: { ...newUser._doc, password: "" },
  });
};

export default authCtrl;
