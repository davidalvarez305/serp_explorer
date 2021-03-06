import axios from "axios";
import { __prod__, REDIRECT_URI } from "../constants.js";
import { AppDataSource } from "../database/db.js";
import { UserColumns } from "../models/user.js";

const User = AppDataSource.getRepository(UserColumns);

export const GetAuthToken = (scope) => {
  return new Promise((resolve, reject) => {
    axios
      .post(process.env.GOOGLE_AUTH_URI, null, {
        params: {
          access_type: "offline",
          approval_prompt: "force",
          scope: scope,
          client_id: process.env.GOOGLE_CLIENT_ID,
          redirect_uri: REDIRECT_URI,
          response_type: "code",
        },
      })
      .then((final) => {
        resolve(final.request._redirectable._currentUrl);
      })
      .catch((err) => {
        if (__prod__) {
          reject(err.message);
        } else {
          reject({ message: err });
        }
      });
  });
};

export const GetAccessToken = async (req) => {
  return new Promise((resolve, reject) => {
    axios
      .post(process.env.GOOGLE_TOKEN_URI, null, {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        params: {
          code: req.body.code,
          client_id: process.env.GOOGLE_CLIENT_ID,
          client_secret: process.env.GOOGLE_CLIENT_SECRET,
          redirect_uri: REDIRECT_URI,
          scope: req.body.scope,
          grant_type: "authorization_code",
        },
      })
      .then(async (data) => {
        console.log(req.session);
        // Persist data to Cookie
        req.session.refresh_token = data.data.refresh_token;
        req.session.access_token = data.data.access_token;
        req.session.lastRequest = Date.now();

        // Persist data to Database
        User.findOneBy({ id: req.session.userId })
          .then(async (u) => {
            u.refresh_token = data.data.refresh_token;
            await User.save(u)
              .then((user) => {
                resolve(user);
              })
              .catch(reject);
          })
          .catch((err) => {
            console.error("Failed to persist refresh token to user database.");
            reject({ message: err });
          });
      })
      .catch((e) => {
        if (__prod__) {
          reject(e.message);
        } else {
          reject({ message: e });
        }
      });
  });
};

export const RefreshGoogleToken = async (req) => {
  let refreshToken = "";
  return new Promise(async (resolve, reject) => {
    // If User cleared cookies and there's no refresh token, get it from DB.
    if (!req.session.refresh_token) {
      try {
        const user = await User.findOneBy({ id: req.session.userId });
        refreshToken = user.refresh_token;
      } catch (err) {
        reject(err.message);
      }
    } else {
      refreshToken = req.session.refresh_token;
    }

    axios
      .post(process.env.GOOGLE_TOKEN_URI, null, {
        params: {
          client_id: process.env.GOOGLE_CLIENT_ID,
          client_secret: process.env.GOOGLE_CLIENT_SECRET,
          refresh_token: refreshToken,
          grant_type: "refresh_token",
        },
      })
      .then((data) => {
        req.session.refresh_token = data.data.refresh_token;
        req.session.access_token = data.data.access_token;
        req.session.lastRequest = Date.now();
        resolve(data.data);
      })
      .catch((e) => {
        if (__prod__) {
          reject(e.message);
        } else {
          reject({ message: e });
        }
      });
  });
};
