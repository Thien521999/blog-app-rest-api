import { Twilio } from "twilio";
import dotenv from "dotenv";
dotenv.config();

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const from = process.env.TWILIO_PHONE_NUMBER;
const client = new Twilio(accountSid, authToken);
const serviceID = `${process.env.TWILIO_SERVICE_ID}`;

export const sendSMS = (to: string, body: string, txt: string) => {
  try {
    client.messages
      .create({
        body: `BlogDev ${txt} - ${body}`,
        from,
        to,
      })
      .then((message: any) => console.log(message.sid));
  } catch (error) {
    console.log("error", error);
  }
};

export const smsOTP = async (to: string, channel: string) => {
  try {
    const data = await client.verify.v2
      .services(serviceID)
      .verifications.create({
        to,
        channel,
      });

    return data;
  } catch (error) {
    console.log("error", error);
  }
};

export const smsVerify = async (to: string, code: string) => {
  try {
    const data = await client.verify.v2
      .services(serviceID)
      .verificationChecks.create({
        to,
        code,
      });

    return data;
  } catch (error) {
    console.log("error", error);
  }
};
