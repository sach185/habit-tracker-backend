const bcrypt = require("bcrypt");
const User = require("../models/UserModel");
const { getToken } = require("../util");

const saltRounds = 10;

module.exports.registerUser = async (req, res) => {
  const { firstName, lastName, email, password } = req.body;

  // check if email exists in the DB
  User.findOne({ email: email }, async (err, doc) => {
    if (err)
      return res
        .status(400)
        .send({ success: false, message: "Failed", error: err });
    if (doc) {
      res.status(409).send({ success: false, message: "Record Exists" });
    } else {
      //Hash the password
      const pwHash = await bcrypt.hash(password, saltRounds);

      var newUser = User({
        firstname: firstName,
        lastname: lastName,
        email,
        password: pwHash,
        goalLimit: 4,
      });

      // save the user
      newUser.save(function (err, result) {
        if (err)
          return res
            .status(400)
            .send({ success: false, message: "Failed", error: err });

        result.password = undefined;
        let userObject = result.toObject();
        userObject.token = getToken(userObject);

        res.status(200).send({
          success: true,
          message: "User Registered Successfully",
          user: userObject,
        });
      });
    }
  });
};

module.exports.userLogin = async (req, res) => {
  const { email, password } = req.body;
  // check if email exists in the DB
  User.findOne(
    { email: email },
    "firstname lastname email password goalLimit",
    async (err, doc) => {
      if (err)
        return res
          .status(400)
          .send({ success: false, message: "Failed", error: err });

      if (doc) {
        const checkPasswordMatch = await bcrypt.compare(password, doc.password);
        // check if password matches
        if (!checkPasswordMatch) {
          return res
            .status(401)
            .send({ success: false, message: "Incorrect email or password" });
        }

        doc.password = undefined;
        let userObject = doc.toObject();
        userObject.token = getToken(userObject);

        res.status(200).send({
          success: true,
          message: "Login Success",
          user: userObject,
        });
      } else {
        res.status(404).send({ success: false, message: "User not found" });
      }
    }
  );
};
