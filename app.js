var bodyParser = require("body-parser"),
methodOverride = require("method-override"),
expressSanitizer = require("express-sanitizer"),
mongoose       = require("mongoose"),
express        = require("express"),
TaskModel  	   = require("./models/task"),
app            = express();

// APP CONFIG
mongoose.connect("mongodb://localhost/notes");
app.set("view engine", "ejs");
app.use(express.static("public"));
app.use(bodyParser.urlencoded({extended: true}));
app.use(expressSanitizer());
app.use(methodOverride("_method"));

app.get("/", function(req, res){
    res.redirect("/tasks");
});

//INDEX - show all tasks
app.get("/tasks", function(req, res){
    // Get all tasks from DB    

    TaskModel.find({'status':'started'}).sort([['stamp', -1]]).exec(function(err, allTasks){
       if(err){
           console.log(err);
       } else {

       		TaskModel.distinct('page', {"status":"started"},function(err, pages) {
       			if( err){
       				console.log(err);
       			}
       			else {
       				res.render("tasks/index",{tasks:allTasks, pages:pages});		
       			}
    		});
          	
       }
    });
});

//CREATE - add new task to DB
app.post("/tasks", function(req, res){
    // get data from form and add to tasks array
    var content = req.body.task.content;
    var page = req.body.task.page;
    var newTask = {content: content, page: page, section: "none", status: 'started'};
    console.log(newTask);
    // Create a new task and save to DB
    TaskModel.create(newTask, function(err, newlyCreated){
        if(err){
            console.log(err);
        } else {
            //redirect back to tasks page
            console.log(newlyCreated);
            res.redirect("/tasks");
        }
    });
});

//NEW - show form to create new task
app.get("/tasks/new", function(req, res){
   res.render("tasks/new"); 
});

// SHOW - shows more info about one task
app.get("/tasks/:id", function(req, res){
    //find the task with provided ID
    TaskModel.findById(req.params.id)/*.populate("comments")*/.exec(function(err, foundTask){
        if(err){
            console.log(err);
        } else {
            console.log(foundTask)
            //render show template with that task
            res.render("tasks/show", {task: foundTask});
        }
    });
});

// EDIT 
app.get("/tasks/:id/edit", function(req, res){
   TaskModel.findById(req.params.id, function(err, task){
       if(err){
           console.log(err);
           res.redirect("/tasks")
       } else {
       		TaskModel.find({'status':'started'}, function(err, allTasks){
       			if(err){
           			console.log(err);
       			} else {	
           			res.render("tasks/edit", {edittask: task,tasks: allTasks});
           		}
           	});
       }
   });
});

app.put("/tasks/:id", function(req, res){

   console.log(req.body);
   console.log(req.params);

   if(req.body.hasOwnProperty('close_button')){
   		// mark the item as closed
   		console.log("close");
   		TaskModel.findById(req.params.id, function(err, task){
	        
	        if(err){
	            console.log(err);
	        } else {
	        	task.status="closed";
	        	TaskModel.findByIdAndUpdate(req.params.id,task,function(err,updatedTask){
	        		if(err){
	        			console.log(err);
	        		}
	        	});
	        }
        });
        res.redirect("/tasks");
   }
   else if(req.body.hasOwnProperty('edit_button')){
   		// enable editing of the item - go to the show page
   		// which i think i want to be the same as the index page except all buttons removed 
   		// except for accept and cancel for the active item, which will also have the fields in editable controls
   		console.log("edit");
   		console.log(req.params.id);
   		var path = "/tasks/"+req.params.id+"/edit";
   		//res.redirect("/tasks/req.params.id/edit");
   		res.redirect(path);
   }
   else if(req.body.hasOwnProperty('delete_button')){
   		// mark the item as deleted
   		console.log("delete");
   		TaskModel.findById(req.params.id, function(err, task){
	        
	        if(err){
	            console.log(err);
	        } else {
	        	task.status="deleted";
	        	TaskModel.findByIdAndUpdate(req.params.id,task,function(err,updatedTask){
	        		if(err){
	        			console.log(err);
	        		}
	        	});
	        }
        });
   		res.redirect("/tasks");
   }
   else if(req.body.hasOwnProperty('save_button')){
   		console.log('Edit saved');
   		TaskModel.findByIdAndUpdate(req.params.id, req.body.task, function(err, blog){
       		if(err){
           		console.log(err);
       		} 
   		});
   		res.redirect("/tasks");
   }
   else if(req.body.hasOwnProperty('cancel_button')){
   		console.log('Edit cancelled');
   		res.redirect("/tasks");
   }
   else{
   		console.log("dunno");
   		res.redirect("/tasks");
   }
   
   
});
// ====================
// COMMENTS ROUTES
// ====================
/*
app.get("/campgrounds/:id/comments/new", function(req, res){
    // find campground by id
    Campground.findById(req.params.id, function(err, campground){
        if(err){
            console.log(err);
        } else {
             res.render("comments/new", {campground: campground});
        }
    })
});

app.post("/campgrounds/:id/comments", function(req, res){
   //lookup campground using ID
   Campground.findById(req.params.id, function(err, campground){
       if(err){
           console.log(err);
           res.redirect("/campgrounds");
       } else {
        Comment.create(req.body.comment, function(err, comment){
           if(err){
               console.log(err);
           } else {
               campground.comments.push(comment);
               campground.save();
               res.redirect('/campgrounds/' + campground._id);
           }
        });
       }
   });
   //create new comment
   //connect new comment to campground
   //redirect campground show page
});
*/
app.listen(8080, function(){
   console.log("TaskLogger server started!");
});