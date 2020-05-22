var express = require("express");
var router = express.Router({mergeParams: true});
var Campground = require("../models/campgrounds")
var Comment = require("../models/comment");
var middleware = require("../middleware");

//ADD NEW COMMENTS
router.get("/new", middleware.isLoggedIn, function(req, res){
	Campground.findById(req.params.id, function(err, campground){
		if(err){
			console.log(err)
		} else {
			res.render("comments/new", {campground: campground});
		}
	});
});

//COMMENTS CREATE
router.post("/", middleware.isLoggedIn, function(req, res){
	Campground.findById(req.params.id, function(err, campground){
		if(err){
			console.log(err);
			res.redirect("/campgrounds");
		} else {
			Comment.create(req.body.comment, function(err, comment){
				if(err) {
					console.log(err)
				} else {
					//Add username and Id to comment
					comment.author.username = req.user.username;
					comment.author.id = req.user._id;
					comment.save();
					campground.comments.push(comment);
					campground.save();
					req.flash("success", "Successfully created Comment")
					res.redirect("/campgrounds/" + campground._id);
				}
			});
		}
	});	
});

//COMMENTS EDIT
router.get("/:comment_id/edit", middleware.checkCommentOwnership, function(req, res){
	Campground.findById(req.params.id, function(err, foundCampground){
		if(err || !foundCampground){
			req.falsh("error", "Campground not found")
			return res.redirect("back")
		}
		Comment.findById(req.params.comment_id, function(err, foundComment){
			if(err){
				res.redirect("back")
			} else {
				res.render("comments/edit", {campground_id: req.params.id, 
											 comment:foundComment});	
			}
		});
	});
});

//COMMENTS UPDATE
router.put("/:comment_id", middleware.checkCommentOwnership, function(req, res){
	Comment.findByIdAndUpdate(req.params.comment_id, req.body.comment, function(err, updatedComment){
		if(err || !updatedComment){
			req.flash("error", "Comment not found");
			res.redirect("back")
		} else {
			res.redirect("/campgrounds/" + req.params.id);
		}
	});
});


//COMMENTS DETROY 
router.delete("/:comment_id", middleware.checkCommentOwnership, function(req, res){
	Comment.findByIdAndRemove(req.params.comment_id, function(err){
		if(err){
			res.redirect("back")
		} else {
			req.flash("succes", "Comment deleted!")
			res.redirect("/campgrounds/" + req.params.id)
		}
	});
});


module.exports = router;
