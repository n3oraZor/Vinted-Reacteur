//Online mode

require("dotenv").config();
const cloudinary = require("cloudinary");
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const fileupload = require("express-fileupload");
const app = express();

app.use(cors());
app.use(express.json());

//pour lire les fichiers au format form-data => npm install express-fileupload

mongoose.connect(process.env.MONGODB_URI);

//import de mes routes
const userRoutes = require("./routes/user");
const loginRoutes = require("./routes/login");
const publishRoutes = require("./routes/publish");
const offersRoutes = require("./routes/offers");

//utilisation de mes routes
app.use("/user", userRoutes); //on ajoute /user pour raccourcir l'url, on a plus besoin de l'ajouter sur chaque route
app.use("/user", loginRoutes);
app.use(publishRoutes);
app.use(offersRoutes);

app.all("*", (req, res) => {
  res.status(400).json({ message: "all route" });
});

app.listen(process.env.PORT, () => {
  console.log("Serveur live");
});
