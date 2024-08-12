const express = require("express");
const fileupload = require("express-fileupload");
const isAuthentificated = require("../middlewares/isAuthentificated");
const cloudinary = require("cloudinary");

const router = express.Router();
const app = express();

const User = require("../models/User");
const Offer = require("../models/Offer");

//Fonction de convertion des images
const convertToBase64 = (file) => {
  return `data:${file.mimetype};base64,${file.data.toString("base64")}`;
};

//Publier une offre, après vérification de l'authentification
router.post("/publish", isAuthentificated, fileupload(), async (req, res) => {
  try {
    const { title, description, price, condition, city, brand, size, color } =
      req.body;

    if (price > 10000) {
      return res.status(500).json({ message: "Prix cannot exceed 10.000" });
    }
    if (title.length > 50) {
      return res
        .status(500)
        .json({ message: "Title cannot exceed 50 caracters" });
    }
    if (description.length > 500) {
      return res
        .status(500)
        .json({ message: "Description cannot exceed 500 caracters" });
    }

    const newOffer = new Offer({
      product_name: title,
      product_description: description,
      product_price: price,
      product_details: [
        { MARQUE: brand },
        { TAILLE: size },
        { ETAT: condition },
        { COULEUR: color },
        { EMPLACEMENT: city },
      ],
      owner: req.user,
    });

    const pictureToConvert = req.files.picture;
    const product_image = await cloudinary.uploader.upload(
      convertToBase64(pictureToConvert),
      { folder: `vinted/offer/${newOffer._id}` }
    );

    // Je sauvegarde cette action
    await newOffer.save();

    //Je répond au client avec les données intégrées + message
    res.status(201).json({
      newOffer,
      product_image,
    });

    // on aurait pu creer un nouvel objet ex: const newOffer = new Offer avec uniquement les objets que nous avons besoin
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.delete("/publish/:id", isAuthentificated, async (req, res) => {
  try {
    // On recherche le product à modifier à partir de son id et on le supprime :
    const findOfferByID = await Offer.findById(req.params.id);
    if (!findOfferByID) {
      return res
        .status(201)
        .json({ message: "This ID is not linked to an offer" });
    }
    res.status(201).json({ message: "Offer has been deleted" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

//Modifier un evenement
router.patch(
  "/publish/modif/:id",
  isAuthentificated,
  fileupload(),
  async (req, res) => {
    try {
      const updates = req.body;
      const updatedData = {
        product_name: updates.title,
        product_description: updates.description,
        product_price: updates.price,
        product_details: [
          { MARQUE: updates.brand },
          { TAILLE: updates.size },
          { ÉTAT: updates.condition },
          { COULEUR: updates.color },
          { EMPLACEMENT: updates.city },
        ],
      };

      const offerModification = await Offer.findByIdAndUpdate(
        req.params.id,
        updatedData,
        { new: true }
      );
      //Je répond au client avec les données intégrées + message
      res.status(201).json({
        message: "Event successfully modified again",
      });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
);

module.exports = router;
