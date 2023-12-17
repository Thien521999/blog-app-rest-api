import express from "express";
import authCtrl from "../controllers/authCtrl";
import { auth } from "../middleware/auth";
import { validRegister } from "../middleware/valid";

const router = express.Router();

router.post("/register", validRegister, authCtrl.register);
router.post("/active", authCtrl.activeAccount);
router.post("/login", authCtrl.login);
router.post("/logout", auth, authCtrl.logout);
router.post("/refresh_token", authCtrl.refreshToken);
router.post("/google_login", authCtrl.googleLogin);
router.post("/facebook_login", authCtrl.facebookLogin);
router.post("/login_sms", authCtrl.loginSMS);
router.post("/sms_verify", authCtrl.smsVerify);

export default router;
