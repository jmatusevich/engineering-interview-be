import { SQLDataSource } from "datasource-sql";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";

import {
  isValidInt,
  isValidString,
  singleItemResponse,
  multiItemResponse,
} from "./helpers";

import logger from "$/src/logger";
import { User } from "$/src/types/User";

class UsersDataSource extends SQLDataSource {
  getUsers() {
    return this.knex
      .select("*")
      .from("users")
      .then(multiItemResponse<User>);
  }
  getUserFromJWT(token: string) {
    if (!isValidString(token)) {
      return null;
    }
    const secret = process.env.JWT_SECRET ?? "";
    if (!isValidString(secret, 32)) {
      throw new Error("ServerMisconfiguration");
    }
    return new Promise<User | null>((resolve, reject) => {
      jwt.verify(token, secret, { algorithms: ["HS256"] }, (error, decoded) => {
        if (error) {
          reject(error);
        } else if (decoded?.sub) {
          const userId = parseInt(decoded.sub as string, 10);
          // TODO: Validate issue date, is it necessary?
          resolve(this.getUser(userId));
        } else {
          // TODO: should this fail? we did get a payload but didn't have the right value
          resolve(null);
        }
      });
    });
  }
  async getJWT(username: string, password: string) {
    const secret = process.env.JWT_SECRET ?? "";
    if (!isValidString(secret, 32)) {
      throw new Error("ServerMisconfiguration");
    }
    if (!isValidString(username) || !isValidString(password)) {
      throw new Error("MissingFields");
    }
    const user = await this.getUserByUsername(username);
    if (!user) {
      throw new Error("UnknownUser");
    }
    const hash = user.password;
    if (await bcrypt.compare(password, hash)) {
      return jwt.sign({ sub: user.id }, secret, { algorithm: "HS256" });
    } else {
      throw new Error("InvalidLogin");
    }
  }
  getUser(id: number) {
    if (!isValidInt(id)) {
      throw new Error("InvalidId");
    }
    return this.knex
      .select("*")
      .from("users")
      .where("id", id)
      .then(singleItemResponse<User>);
  }
  getUserByUsername(username: string) {
    if (!isValidString(username)) {
      throw new Error("InvalidUsername");
    }

    return this.knex
      .select("*")
      .from("users")
      .where("username", username)
      .then(singleItemResponse<User>);
  }
  async updateUser(
    id: number,
    parameters:
      | {
          username?: string;
          oldPassword?: undefined;
          password?: undefined;
        }
      | {
          username?: string;
          oldPassword: string;
          password: string;
        }
  ) {
    if (!isValidInt(id)) {
      throw new Error("MissingUserId");
    }
    const { username, oldPassword, password } = parameters;
    if (!!username && !isValidString(username)) {
      throw new Error("InvalidUsername");
    }
    if (!!password && !oldPassword) {
      throw new Error("UpdatingPasswordWithoutOldPassword");
    }
    if (!password && !!oldPassword) {
      throw new Error("MissingNewPassword");
    }
    if (!!password && !isValidString(password)) {
      throw new Error("InvalidNewPasswordLength");
    }
    if (!!oldPassword && !isValidString(oldPassword)) {
      throw new Error("InvalidOldPassword");
    }
    const user = await this.getUser(id);
    if (!user) {
      throw new Error("InvalidUser");
    }
    const fieldsToUpdate: Partial<User> = {};
    if (oldPassword) {
      if (await bcrypt.compare(oldPassword, user.password)) {
        const hashedNewPassword = await bcrypt.hash(password, 10);
        fieldsToUpdate.password = hashedNewPassword;
      } else {
        throw new Error("InvalidLogin");
      }
    }
    if (username) {
      fieldsToUpdate.username = username;
    }
    if (Object.keys(fieldsToUpdate).length === 0) {
      logger.info("No-op user update");
      return null;
    }
    return this.knex
      .update({
        ...fieldsToUpdate,
        updatedAt: this.knex.raw("DEFAULT"),
      })
      .from("users")
      .where("id", user.id)
      .returning(["*"])
      .then(singleItemResponse<User>)
      .catch((error) => {
        const re = /users_username_unique/;
        if (re.test(error.message)) {
          logger.info(error.message);
          throw new Error("UsernameIsUsed");
        } else {
          logger.error(error.message);
          throw new Error("UnknownError");
        }
      });
  }
  async createUser({
    username,
    password,
  }: {
    username: string;
    password: string;
  }) {
    if (!isValidString(username) || !isValidString(password)) {
      throw new Error("MissingFields");
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    return this.knex
      .insert({ username, password: hashedPassword }, [
        "id",
        "username",
        "createdAt",
        "updatedAt",
      ])
      .into("users")
      .then(singleItemResponse<User>)
      .catch((error) => {
        const re = /users_username_unique/;
        if (re.test(error.message)) {
          logger.info(error.message);
          throw new Error("UsernameIsUsed");
        } else {
          logger.error(error.message);
          throw new Error("UnknownError");
        }
      });
  }
  deleteUser(id: number) {
    if (!isValidInt(id)) {
      throw new Error("MissingFields");
    }
    return this.knex.from("users").where("id", id).del();
  }
}

export default UsersDataSource;
