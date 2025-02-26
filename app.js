//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const _ = require("lodash")


const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

const url = "mongodb+srv://krishan:krishan123@cluster0.kijn4fm.mongodb.net/todolistDB";
mongoose.connect(url, { 
  useNewUrlParser: true, 
  useUnifiedTopology: true 
}).then(() => {
  console.log('Connected to MongoDB');
}).catch(err => {
  console.error('Error connecting to MongoDB:', err);
});



const itemSchema = {
  name: String
};

const Item = mongoose.model("Item",itemSchema);

const item1 = new Item({
  name: "welcome to your todolist"
})

const item2 = new Item({
  name: "nice"
})

const item3 = new Item({
  name: "to see you"
})

const defaultItems = [item1, item2, item3];

const listSchema = {
   name: String,
   items: [itemSchema]
}

const List = mongoose.model("List",listSchema);


app.get("/", function(req, res) {

  Item.find({},function(err,foundItems){

    if(foundItems.length === 0){
      Item.insertMany(defaultItems,function(err){
        if(err){
          console.log(err);
        }
      })
      res.redirect("/");
    }
 
    else{
      res.render("list", {listTitle: "Today", newListItems: foundItems});
    }

    
  })
  

});


app.post("/delete",function(req,res){
   const checkedItem = req.body.checkbox;
   const listName = req.body.listName;


   if(listName === "Today"){
    Item.findByIdAndRemove(checkedItem,function(err){
      if(!err){
       console.log("successfully deleted the item");
       res.redirect("/");
      }
  })
   }
   else{
      List.findOneAndUpdate({name:listName},{$pull:{items:{_id: checkedItem}}} ,function(err,foundList){
        if(!err){
          res.redirect("/"+listName);
        }
      })
   }

   

})

app.post("/", function(req, res){
  const listName = req.body.list;
  const item = new Item ({
    name: req.body.newItem
  })
  

  if(listName === "Today"){
    item.save();
    res.redirect("/");
  }
  
   else{

    List.findOne({name :listName},function(err,foundList){
      foundList.items.push(item);
      foundList.save();
      res.redirect("/"+listName);
    })
   }
  }
);




app.get("/:customListName",function(req,res){
  var customListName =_.capitalize(req.params.customListName);

  List.findOne({name: customListName},function(err,foundList){
      if(!err){
        if(!foundList){
             const list = new List({
              name: customListName,
              items: defaultItems
             })
             list.save();
             res.redirect("/"+customListName)
        }
        else{
          res.render("list", {listTitle: customListName, newListItems: foundList.items});
        }
      }
})
})
app.get("/about", function(req, res){
  res.render("about");
});

const port = process.env.PORT || 3000;
app.listen(port, function() {
  console.log("Server started on port 3000");
});
