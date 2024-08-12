const express = require("express");
const fileupload = require("express-fileupload");
const isAuthentificated = require("../middlewares/isAuthentificated");

const router = express.Router();
const User = require("../models/User");

// Upload photo et configuration
const cloudinary = require("cloudinary").v2;
// Upload photo et configuration

//crypting datas package
const uid2 = require("uid2");
const SHA256 = require("crypto-js/sha256");
const encBase64 = require("crypto-js/enc-base64");

//Création d'un compte avec les paramètres en body
router.post("/signup", async (req, res) => {
  try {
    //destructuring (on stock req.body directement dans username)
    const { username, email, newsletter, password } = req.body;

    const salt = uid2(16);
    const hash = SHA256(password + salt).toString(encBase64);
    const token = uid2(64);

    const findEmailInDB = await User.findOne({ email: email });
    if (findEmailInDB) {
      return res.status(409).json({ message: "email already exists" });
    }

    if (!username) {
      return res.status(500).json({ message: "username is empty" });
    }

    //Pour créer l'utilisateur en base
    const newUser = new User({
      account: {
        username: username,
        avatar: "",
      },
      email: email,
      newsletter: newsletter,
      salt: salt,
      hash: hash,
      token: token,
    });

    await newUser.save();

    res.status(201).json({
      message: "New user created",
      _id: newUser._id,
      token: token,
      account: {
        username: username,
        avatar: "",
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post("/account", isAuthentificated, fileupload(), async (req, res) => {
  try {
    //Fonction de convertion des images
    const convertToBase64 = (file) => {
      return `data:${file.mimetype};base64,${file.data.toString("base64")}`;
    };

    const pictureToConvert = req.files.profil_picture;
    const profil_image = await cloudinary.uploader.upload(
      convertToBase64(pictureToConvert),
      { folder: `vinted/profile/${req.user._id}` }
    );
    console.log(profil_image);
    const user = await User.findById(req.user._id);
    user.account.avatar = profil_image.url;
    await user.save();

    res.status(201).json({
      message: "Profile updated",
    });
  } catch (error) {
    //Je répond au client avec les données intégrées + message

    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
