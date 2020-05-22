var express = require("express");
var router = express.Router();
var Campground = require("../models/campgrounds");
var middleware = require("../middleware");


//============
//Campgrounds Routes
router.get("/", function(req, res){
	Campground.find({}, function(err, allCampgrounds){
		if(err){
			console.log("AN ERROR OCCURED WHILE RETRIEVING FROM THE DB")
		} else {
			res.render("campgrounds/index", {campgrounds: allCampgrounds, 				currentUser: req.user});
		}
	});
});

//CREATE NEW CAMPGROUNDS
router.post("/", middleware.isLoggedIn, function(req, res){
	var name = req.body.name;
	var price = req.body.price;
	var image = req.body.image;
	var desc = req.body.description;
	var author = {
		id: req.user._id,
		username: req.user.username
	};
	var newCampground = {name: name, price: price, image: image, description:desc, author:author};
	Campground.create(newCampground, function(err, newlyCreated){
		if(err){
		   console.log(err)
		   } else {
			   res.redirect("/campgrounds")
		   }
	});
});

router.get("/new", middleware.isLoggedIn, function(req, res){
	res.render("campgrounds/new");
});


//Shows more info about one campground
router.get("/:id", function(req, res){
	var id = req.params.id
	Campground.findById(id).populate("comments").exec(function(err, foundCamp){
		if(err || !foundCamp){
			//Error handling goes here
			req.flash("error", "Campground not found");
			res.redirect("back");
		} else {
			//console.log(foundCamp);
			res.render("campgrounds/show", {campground: foundCamp});
		}
	});
});

//EDIT CAMPGROUNDS ROUTE
router.get("/:id/edit", middleware.checkCampgroundOwnership, function(req, res){
	Campground.findById(req.params.id, function(err, foundCampground){
		res.render("campgrounds/edit", {campground:foundCampground}); 
	});
});

//UPDATE CAMPGROUNDS ROUTE
router.put("/:id", middleware.checkCampgroundOwnership, function(req, res){
	Campground.findByIdAndUpdate(req.params.id, req.body.campground, function(err, updatedCampground){
		if(err){
			res.redirect("/campgrounds");
		} else {
			res.redirect("/campgrounds/" + req.params.id)
		}
	});
});

//DESTROY CAMPGROUND ROUTE
router.delete("/:id", middleware.checkCampgroundOwnership, function(req, res){
	Campground.findByIdAndRemove(req.params.id, function(err){
		if(err){
			res.redirect("/campgrounds")
		} else {
			res.redirect("/campgrounds")
		}
	})
});


module.exports = router;