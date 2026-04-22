import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { config } from "../config/env.ts";
import { createUser, findUserByEmail } from "../db/user.repo.ts";

export class AuthService {
    async register(email: string, password: string) {
        const existing = await findUserByEmail(email)
        if(existing) {
            throw new Error("User already exists");
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const user = await createUser(email, hashedPassword);

        return { message: "User created succesfully", userId: user.id};
    }

    async login(email: string, password: string) {
        const user = await findUserByEmail(email);

        if(!user) {
            throw new Error("Invalid Credentials");
        }

        const isValid = await bcrypt.compare(password, user.password);
        if(!isValid) {
            throw new Error("Invalid Credentials")
        }

        const token = jwt.sign(
            { userId: user.id, email: user.email},
            config.jwtSecret as string,
            {expiresIn: '7d'}
        );
        console.log("Token generated:", token ? "YES ✅" : "NO ❌");


        return {token};
    }
}
