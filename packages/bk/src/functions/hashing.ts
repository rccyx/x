import argon2 from "argon2";

export const hash = argon2.hash;
export const verify = argon2.verify;
