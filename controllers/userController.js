const bcrypt = require("bcrypt");
const User = require("../models/UserModel");
const saltRounds = 10;

module.exports.registerUser = async (req, res) => {
  const { firstname, lastname, email, password } = req.body;

  // check if email exists in the DB
  User.findOne({ email: email }, async (err, doc) => {
    if (err) throw err;
    if (doc) {
      res.status(409).send({ success: false, error: "Record Exists" });
    } else {
      //Hash the password
      const pwHash = await bcrypt.hash(password, saltRounds);

      var newUser = User({
        firstname,
        lastname,
        email,
        password: pwHash,
        goalLimit: 4,
      });

      // save the user
      newUser.save(function (err) {
        if (err) throw err;
        res
          .status(200)
          .send({ success: true, message: "User Registered Successfully" });
      });
    }
  });
};

module.exports.userLogin = async (req, res) => {
  const { email, password } = req.body;
  // check if email exists in the DB
  User.findOne({ email: email }, async (err, doc) => {
    if (err) throw err;

    if (doc) {
      const checkPasswordMatch = await bcrypt.compare(password, doc.password);
      // check if password matches
      if (!checkPasswordMatch) {
        return res
          .status(401)
          .send({ success: false, message: "Incorrect email or password" });
      }

      doc.password = undefined;

      res.status(200).send({ success: true, message: "Login Success", doc });
    } else {
      res.status(404).send({ success: false, error: "User not found" });
    }
  });
};
