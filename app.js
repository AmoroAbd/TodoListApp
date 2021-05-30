// IMPORTING REQUIRE MODULES
const express = require("express");
const bodyParser = require("body-parser");
const path = require("path");
const mongoose = require("mongoose");
const lodash = require("lodash");

// IMPORTING MY OWN MODULES

//DECLARING GLOBAL VARIABLES
// var items = ["Buy Food", "Cook the Food", "Eat the Food"];
// let workedItems = [];

// Storing item in database
mongoose.connect(
  "mongodb+srv://Ibn:ibnsaabs@todolistappcluster.hjnib.mongodb.net/todolistDB",
  {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  }
);
// item schema
const itemSchema = {
  name: String,
};

// item model
const Item = mongoose.model("Item", itemSchema);

// some items
const item1 = new Item({
  name: "Go buy food",
});
const item2 = new Item({
  name: "Go Eat food",
});
const defautItems = [item1, item2];

// List schema
const listSchema = {
  name: String,
  items: [itemSchema],
};

// list model
const List = mongoose.model("List", listSchema);

// INITIALIZING APP
const app = express();

// SERVING STATIC FILES
app.use(express.static(path.join(__dirname, "public")));

// MIDDLEWARE FUNCTIONS
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// USING TEMPLATING ENGINE
app.set("view engine", "ejs");

// ROUTES
app.get("/", function (req, res) {
  Item.find({}, function (err, foundItems) {
    if (foundItems.length === 0) {
      Item.insertMany(defautItems, function (err) {
        if (err) {
          console.log(err);
        } else {
          console.log("Success added items to database");
        }
      });
      res.redirect("/");
    } else {
      res.render("list", { listTitle: "Today", newListItems: foundItems });
    }
  });
  // let day = date();
  // res.render("list", { listTitle: day, newListItems: items });
  // res.render("list", { listTitle: "Today", newListItems: items });
});

// Add Items
app.post("/", function (req, res) {
  const itemName = req.body.newItem;
  const listName = req.body.list;
  const item = new Item({
    name: itemName,
  });
  if (listName === "Today") {
    item.save();
    res.redirect("/");
  } else {
    List.findOne(
      {
        name: listName,
      },
      function (err, foundList) {
        foundList.items.push(item);
        foundList.save();
        res.redirect("/" + listName);
      }
    );
  }
});

// Delete Items
app.post("/delete", function (req, res) {
  const checkedItemId = req.body.checkbox;
  const listName = req.body.listName;
  if (listName === "Today") {
    Item.findByIdAndRemove(checkedItemId.trim(), function (err) {
      if (!err) {
        console.log("Deleted");
        res.redirect("/");
      } else {
        console.log(err);
      }
    });
  } else {
    List.findOneAndUpdate(
      { name: listName },
      { $pull: { items: { _id: checkedItemId.trim() } } },
      function (err, result) {
        if (!err) {
          res.redirect("/" + listName);
        }
      }
    );
  }
});

// Dynamic route
app.get("/:object", function (req, res) {
  const customListName = req.params.object;
  customListName = loadash.capitalize(customListName);
  List.findOne(
    {
      name: customListName,
    },
    function (err, foundList) {
      if (!err) {
        if (!foundList) {
          // Create the new list
          const list = new List({
            name: customListName,
            items: defautItems,
          });
          list.save();
          res.redirect("/" + customListName);
        } else {
          // Show the existing list
          res.render("list", {
            listTitle: foundList.name,
            newListItems: foundList.items,
          });
        }
      }
    }
  );
});

// STARTING THE SERVER
const PORT = process.env.PORT || 3000;
app.listen(PORT, function () {
  console.log(`Server Started on port ${PORT}`);
});
