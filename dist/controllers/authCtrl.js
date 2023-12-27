"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerUser = exports.loginUser = void 0;
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const jwt_decode_1 = __importDefault(require("jwt-decode"));
const generateToken_1 = require("../config/generateToken");
const sendMail_1 = __importDefault(require("../config/sendMail"));
const sendSMS_1 = require("../config/sendSMS");
const valid_1 = require("../middleware/valid");
const userModel_1 = __importDefault(require("../models/userModel"));
const CLIENT_URL = `${process.env.BASE_URL}`;
const authCtrl = {
    register: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const { name, account, password } = req.body;
            // find in database
            const user = yield userModel_1.default.findOne({ account });
            if (user)
                return res
                    .status(400)
                    .json({ msg: "Email or Phone number already exists." });
            const passwordHash = yield bcrypt_1.default.hash(password, 12); // ma hoa password
            // encode password
            const newUser = {
                name,
                account,
                password: passwordHash,
            };
            // handle active token
            const active_token = (0, generateToken_1.generateActiveToken)({ newUser });
            // URl không chứa được dấu .(tìm hiểu thêm)
            const replacedToken = active_token === null || active_token === void 0 ? void 0 : active_token.replace(/\./g, "~");
            const url = `${CLIENT_URL}/active/${replacedToken}`;
            // check mail valid
            if ((0, valid_1.validateEmail)(account)) {
                // send email , use nodemailer
                (0, sendMail_1.default)(account, url, "Verify your email address");
                return res.json({
                    msg: "Success! Please check your email",
                });
            }
            else if ((0, valid_1.validPhone)(account)) {
                // send sms, use Twilio
                (0, sendSMS_1.sendSMS)(account, url, "Verify your phone number");
                return res.json({
                    msg: "Success! Please check phone.",
                });
            }
        }
        catch (err) {
            // next(err) //neu dùng next(err) thi expessjs se dua ve xu ly loi tap trung chinh la "Middleware xu ly loi tap trung"
            return res.status(500).json({ msg: err.message });
        }
    }),
    activeAccount: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const { active_token } = req.body;
            const decoded = (jsonwebtoken_1.default.verify(active_token, `${process.env.ACTIVE_TOKEN_SECRET}`));
            const { newUser } = decoded;
            if (!newUser)
                return res.status(400).json({ msg: "Invalid authentication." });
            const user = yield userModel_1.default.findOne({ account: newUser === null || newUser === void 0 ? void 0 : newUser.account });
            if (user)
                return res.status(400).json({ msg: "Account already exists." });
            const new_user = new userModel_1.default(newUser);
            yield new_user.save();
            res.json({ msg: "Account has been activated!" });
        }
        catch (err) {
            // let errMsg;
            // if (err.code === 11000) {
            //   errMsg = Object.keys(err.keyValue)[0] + " aready exists.";
            // } else {
            //   let name = Object.keys(err.errors)[0];
            //   errMsg = err.errors[`${name}`].message;
            // }
            return res.status(500).json({ msg: err.message });
        }
    }),
    login: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const { account, password } = req.body;
            const user = yield userModel_1.default.findOne({ account });
            if (!user)
                return res.status(400).json({ msg: "This account does not exits." });
            // if user exist
            (0, exports.loginUser)(user, password, res);
        }
        catch (err) {
            return res.status(500).json({ msg: err.message });
        }
    }),
    logout: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        if (!req.user)
            return res.status(400).json({ msg: "Invalid Authentication!" });
        try {
            res.clearCookie("refreshtoken", { path: `/api/refresh_token` });
            yield userModel_1.default.findOneAndUpdate({ _id: req.user._id }, {
                rf_token: "",
            });
            return res.json({ msg: "Logged out" });
        }
        catch (err) {
            return res.status(500).json({ msg: err.message });
        }
    }),
    refreshToken: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const rf_token = req.body.refresh_token;
            console.log("rf_token-------", rf_token);
            if (!rf_token)
                return res.status(400).json({ msg: "Please login now!" });
            const decoded = (jsonwebtoken_1.default.verify(rf_token, `${process.env.REFRESH_TOKEN_SECRET}`));
            if (!decoded.id)
                return res.status(400).json({ msg: "Please login now!" });
            const user = yield userModel_1.default.findById(decoded.id).select("-password +rf_token");
            if (!user)
                return res.status(400).json({ msg: "This account does not exist." });
            // console.log({ rf_token, "user.rf_token": user.rf_token });
            // if (rf_token !== user.rf_token) {
            //   console.log("in");
            //   return res.status(400).json({ msg: "Please login now!" });
            // }
            const access_token = (0, generateToken_1.generateAccessToken)({ id: user._id });
            const refresh_token = (0, generateToken_1.generateRefreshToken)({ id: user._id });
            yield userModel_1.default.findOneAndUpdate({ _id: user._id }, {
                rf_token: refresh_token,
            });
            return res.json({ access_token, user });
        }
        catch (err) {
            return res.status(500).json({ msg: err.message });
        }
    }),
    googleLogin: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const { access_token } = req.body;
            const decoded = (0, jwt_decode_1.default)(access_token);
            const { email, email_verified, name, picture } = decoded;
            if (!email_verified)
                return res.status(500).json({ msg: "Email verification failed!" });
            const password = email + "your google secret password";
            const passwordHash = yield bcrypt_1.default.hash(password, 12);
            const user = yield userModel_1.default.findOne({ account: email });
            if (user) {
                (0, exports.loginUser)(user, password, res);
            }
            else {
                const user = {
                    name,
                    account: email,
                    password: passwordHash,
                    avatar: picture,
                    type: "google",
                };
                (0, exports.registerUser)(user, res);
            }
        }
        catch (err) {
            return res.status(500).json({ msg: err.message });
        }
    }),
    facebookLogin: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const { accessToken, userID } = req.body;
            const URL = `https://graph.facebook.com/v3.0/${userID}/?fields=id,name,email,picture&access_token=${accessToken}`;
            const response = yield fetch(URL);
            const { email, name, picture } = yield response.json();
            const password = email + "your facebook secret password";
            const passwordHash = yield bcrypt_1.default.hash(password, 12);
            const user = yield userModel_1.default.findOne({ account: email });
            if (user) {
                (0, exports.loginUser)(user, password, res);
            }
            else {
                const user = {
                    name,
                    account: email,
                    password: passwordHash,
                    avatar: picture.data.url,
                    type: "facebook",
                };
                (0, exports.registerUser)(user, res);
            }
        }
        catch (err) {
            return res.status(500).json({ msg: err.message });
        }
    }),
    loginSMS: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const { phone } = req.body;
            const data = yield (0, sendSMS_1.smsOTP)(phone, "sms");
            if (data) {
                res.json(data);
            }
            else {
                return res.status(400).json({ msg: "Phone invalid!" });
            }
        }
        catch (err) {
            return res.status(500).json({ msg: err.message });
        }
    }),
    smsVerify: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const { phone, code } = req.body;
            const data = yield (0, sendSMS_1.smsVerify)(phone, code);
            if (!data.valid)
                return res.status(400).json({ msg: "Invalid Authentication." });
            const password = phone + "your phone secret password";
            const passwordHash = yield bcrypt_1.default.hash(password, 12);
            const user = yield userModel_1.default.findOne({ account: phone });
            if (user) {
                (0, exports.loginUser)(user, password, res);
            }
            else {
                const user = {
                    name: phone,
                    account: phone,
                    password: passwordHash,
                    type: "sms",
                };
                (0, exports.registerUser)(user, res);
            }
        }
        catch (err) {
            return res.status(500).json({ msg: err.message });
        }
    }),
    forgotPassword: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const { account } = req.body;
            const user = yield userModel_1.default.findOne({ account });
            if (!user)
                return res.status(400).json({ msg: "This account does not exist!" });
            if (user.type !== "register") {
                return res.status(400).json({
                    msg: `Quick login account this ${user.type} can't use this function.`,
                });
            }
            const access_token = (0, generateToken_1.generateAccessToken)({ id: user.id });
            // URl không chứa được dấu .(tìm hiểu thêm)
            const replacedToken = access_token === null || access_token === void 0 ? void 0 : access_token.replace(/\./g, "~");
            const url = `${CLIENT_URL}/reset_password/${replacedToken}`;
            // const url = `${CLIENT_URL}/reset_password/${access_token}`;
            if ((0, valid_1.validPhone)(account)) {
                (0, sendSMS_1.sendSMS)(account, url, "Forgot password");
                return res.status(200).json({
                    msg: "Success! Please check your phone",
                });
            }
            else if ((0, valid_1.validateEmail)(account)) {
                (0, sendMail_1.default)(account, url, "Forgot password");
                return res.status(200).json({
                    msg: "Success! Please check your email",
                });
            }
        }
        catch (err) {
            return res.status(500).json({ msg: err.message });
        }
    }),
};
const loginUser = (user, password, res) => __awaiter(void 0, void 0, void 0, function* () {
    const isMatch = yield bcrypt_1.default.compare(password, user.password);
    if (!isMatch)
        return res.status(400).json({ msg: "Password is incorrect" });
    const access_token = (0, generateToken_1.generateAccessToken)({ id: user._id });
    const refresh_token = (0, generateToken_1.generateRefreshToken)({ id: user._id });
    // res.cookie("refreshtoken", refresh_token, {
    //   httpOnly: true,
    //   path: `/api/refresh_token`,
    //   maxAge: 30 * 24 * 60 * 60 * 1000, // 30days
    //   domain: "localhost",
    //   secure: false,
    // });
    yield userModel_1.default.findOneAndUpdate({ _id: user._id }, {
        rf_token: refresh_token,
    });
    res.json({
        msg: "Login Success!",
        access_token,
        refresh_token,
        user: Object.assign(Object.assign({}, user._doc), { password: "" }),
    });
});
exports.loginUser = loginUser;
const registerUser = (user, res) => __awaiter(void 0, void 0, void 0, function* () {
    const newUser = new userModel_1.default(user);
    const access_token = (0, generateToken_1.generateAccessToken)({ id: newUser._id });
    const refresh_token = (0, generateToken_1.generateRefreshToken)({ id: newUser._id });
    newUser.rf_token = refresh_token;
    yield newUser.save();
    res.json({
        msg: "Login Success!",
        access_token,
        refresh_token,
        user: Object.assign(Object.assign({}, newUser._doc), { password: "" }),
    });
});
exports.registerUser = registerUser;
exports.default = authCtrl;
