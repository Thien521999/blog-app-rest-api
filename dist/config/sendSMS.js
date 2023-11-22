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
exports.smsVerify = exports.smsOTP = exports.sendSMS = void 0;
const twilio_1 = require("twilio");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const from = process.env.TWILIO_PHONE_NUMBER;
const client = new twilio_1.Twilio(accountSid, authToken);
const serviceID = `${process.env.TWILIO_SERVICE_ID}`;
const sendSMS = (to, body, txt) => {
    try {
        client.messages
            .create({
            body: `BlogDev ${txt} - ${body}`,
            from,
            to,
        })
            .then((message) => console.log(message.sid));
    }
    catch (error) {
        console.log("error", error);
    }
};
exports.sendSMS = sendSMS;
const smsOTP = (to, channel) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const data = yield client.verify.v2
            .services(serviceID)
            .verifications.create({
            to,
            channel,
        });
        return data;
    }
    catch (error) {
        console.log("error", error);
    }
});
exports.smsOTP = smsOTP;
const smsVerify = (to, code) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const data = yield client.verify.v2
            .services(serviceID)
            .verificationChecks.create({
            to,
            code,
        });
        return data;
    }
    catch (error) {
        console.log("error", error);
    }
});
exports.smsVerify = smsVerify;
