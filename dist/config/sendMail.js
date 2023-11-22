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
const nodemailer = require("nodemailer");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const EMAIL_PASSWORD = `${process.env.EMAIL_PASSWORD}`;
const EMAIL_USERNAME = `${process.env.EMAIL_USERNAME}`;
// send email
const sendEmail = (to, url, txt) => __awaiter(void 0, void 0, void 0, function* () {
    const transporter = nodemailer.createTransport({
        service: "gmail",
        host: "smtp.gmail.com",
        port: 465,
        secure: true,
        auth: {
            user: EMAIL_USERNAME,
            pass: EMAIL_PASSWORD,
        },
    });
    const info = yield transporter.sendMail({
        from: '"tranhoangthiendev <tranhoangthiendev@gmail.com>"',
        to: to,
        subject: "BlogDev",
        text: "Hello world?",
        html: `
                <div style="max-width: 700px; margin:auto; border: 10px solid #ddd; padding: 50px 20px; font-size: 110%;">
                <h2 style="text-align: center; text-transform: uppercase;color: teal;">Welcome to the tranhoangthiendev channel.</h2>
                <p>Congratulations! You're almost set to start using BlogDEV.
                    Just click the button below to validate your email address.
                </p>

                <a href=${url} style="background: crimson; text-decoration: none; color: white; padding: 10px 20px; margin: 10px 0; display: inline-block;">${txt}</a>

                <p>If the button doesn't work for any reason, you can also click on the link below:</p>

                <div>${url}</div>
                </div>
              `,
    });
    return info;
});
exports.default = sendEmail;
