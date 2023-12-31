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
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateEmail = exports.validPhone = exports.validRegister = void 0;
const validRegister = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { name, account, password } = req.body;
    const errors = [];
    if (!name) {
        errors.push("Please add your name.");
    }
    else if (name.length > 20) {
        errors.push("Your name is up to 20 chars long");
    }
    if (!account) {
        errors.push("Please add your email or phone number.");
    }
    else if (!validPhone(account) && !(0, exports.validateEmail)(account)) {
        errors.push("Email or phone number format is incorrect.");
    }
    if (password.length < 6) {
        errors.push("Password must be at least 6 chars.");
    }
    if (errors.length > 0) {
        return res.status(400).json({ msg: errors });
    }
    else {
        next();
    }
});
exports.validRegister = validRegister;
function validPhone(phone) {
    const re = /^[+]/g;
    return re.test(phone);
}
exports.validPhone = validPhone;
const validateEmail = (email) => {
    return String(email)
        .toLowerCase()
        .match(/^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|.(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/);
};
exports.validateEmail = validateEmail;
