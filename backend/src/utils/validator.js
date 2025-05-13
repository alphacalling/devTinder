let validate = require("validator");

exports.validator = (req) => {
  let email = req.body.email;
  let emailValid = validate.isEmail(email);
  if (!emailValid) {
    return "Email id is not valid";
  }
  let strongPassword = req.body.password;
  let validPassword = validate.isStrongPassword(strongPassword);
  if (!validPassword) {
    return "Your Password is weak";
  }
  return null;
};
