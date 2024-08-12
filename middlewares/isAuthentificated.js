const express = require("express");
const User = require("../models/User");

const isAuthentificated = async (req, res, next) => {
  const token = req.headers.authorization.replace("Bearer ", "");
  //je cherche dans ma bdd si j'ai un token qui correspond /!\ à l'espace après Bearer
  const user = await User.findOne({
    token: token,
  });

  // on réintègre les données de user dans l'objet req (clé = req.user) pour le transmettre au reste du code
  req.user = user;

  if (!req.user) {
    return res
      .status(401)
      .json({ message: "User is not authentified - Please check token" });
  }

  next();
};

module.exports = isAuthentificated;
