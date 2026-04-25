import jwt from "jsonwebtoken";

export const sendToken = (user) => {
  return jwt.sign({ id: user._id }, "secret");
};
