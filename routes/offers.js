const express = require("express");
const fileupload = require("express-fileupload");
const cloudinary = require("cloudinary");

const isAuthentificated = require("../middlewares/isAuthentificated");

const router = express.Router();
const app = express();

const User = require("../models/User");
const Offer = require("../models/Offer");

router.get("/offers", async (req, res) => {
  try {
    console.log(req.query);

    const regExp = new RegExp(req.query.title, "i");
    const filter = {};

    if (req.query.priceMin) {
      filters.product_price = { $gte: Number(req.query.priceMin) };
    }

    if (req.query.priceMax) {
      if (filters.product_price) {
        filters.product_price.$lte = Number(req.query.priceMax);
      } else {
        filters.product_price = { $lte: Number(req.query.priceMin) };
      }
    }

    const sort = {};

    let nbPage = 1;
    if (req.query.page) {
      nbPage = req.query.page;
    }

    let nbLimit = 5;
    const nbSkip = (page - 1) * limit;

    req.query.sort === "price-asc"
      ? (sort.product.price = 1)
      : (sort.product.price = -1);

    const offer = await Offer.find({ product_name: regExp })
      //trier par nom et ne prendre que quelques objets
      .sort()
      .limit(nbLimit)
      .skip(nbSkip);
    res.json(offer);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get("/offers/:id", async (req, res) => {
  try {
    // on récupère les paramètres de la query
    let getofferUsingID = req.params.id;
    // on utilise la méthode pour rechercher l'évènement à partir de l'ID
    const offer = await Offer.findById(getofferUsingID);
    // Je répond au client
    res.status(201).json(offer);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});
module.exports = router;
