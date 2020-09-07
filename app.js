var express= 			require("express");
	expressSanitizer=	require("express-sanitizer");
	bodyParser=			require("body-parser");
	mongoose=			require("mongoose");
	app=				express();
//app config


const sgMail = require('@sendgrid/mail');
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

mongoose.connect("mongodb://localhost/restful_blog_app");
app.set("view engine","ejs");
app.use(express.static("public"));
app.use(bodyParser.urlencoded({extended: true}));
app.use(expressSanitizer());


//Mongoose/model config
var BlogSchema= new mongoose.Schema({
	title: String,
	image:String,
	body:String,
	created:{type:Date,default:Date.now}
});

var Blog=mongoose.model("Blog",BlogSchema);

  Blog.create({
 	title:"Test Blog",
 	image:"https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=1500&q=80",
 	body:"Hello this is a blogpost"	
 });


//ROutes


//Redirecting to home
app.get("/",function(req,res) {
	res.redirect("/blogs");
	// body...
})


//Index route
app.get("/blogs",function(req,res) {
	Blog.find({},function(err,foundBlogs) {
		if(err)
		{
			console.log("error");
		}
		else
		{
			res.render("index",{blogs:foundBlogs});
			
		}
		// body...
	});

	// body...
});



//New route
app.get("/blogs/new",function(req,res) {
	res.render("new");
	// body...
});

//CREAte router
app.post("/blogs",function(req,res) {
	//create blog


	req.body.blog.body=req.sanitize(req.body.blog.body);

	
	Blog.create(req.body.blog,function(err,newBlog) {
		if(err)
		{
			console.log(err);
			res.render("new");
		}
		else
		{
			//then redirect to index
			res.redirect("/blogs");	
		}
		// body...
	})
	
	});


//SHOW route
app.get("/blogs/:id",function(req,res) {
	Blog.findById(req.params.id,function(err,foundBlog) {
		if(err)
		{
			res.redirect("/blogs");
		}
		else
		{
			res.render("show",{blog:foundBlog});
		}
		// body...
	});
	// body...
});


//Edit route
app.get("/updateblogs/:id",function(req,res) {
	Blog.findById(req.params.id,function(err,foundBlog) 
	{	
		// body...
		if(err)
		{
			res.redirect("/blogs");
		}
		else
		{
			res.render("edit",{blog:foundBlog});

		}
	})
	
});

var em=" ";
//update route
app.post("/updateblogs/:id",function(req,res) {
	req.body.blog.body=req.sanitize(req.body.blog.body);
	em=req.body.email;
	const msg = {
  	to: em,
  	from: "sherishaikh2611@gmail.com",
  	subject: 'Sending with SendGrid is Fun',
  	text: req.body.blog.body,
	};
	console.log(msg);

	sgMail.send(msg);

	Blog.findByIdAndUpdate(req.params.id,req.body.blog,function(err,updatedBlog) 
	{

		if(err)
		{
			res.redirect("/blogs");
			console.log(err);
		}
		else
		{
			res.redirect("/blogs/"+req.params.id);
		}
		// body...
	});
	// body...
});



//Delete route
app.get("/deleteblogs/:id",function(req,res) {
	// body...
	//destroy blog
	Blog.findByIdAndRemove(req.params.id,function(err) {
		if(err)
		{
			res.redirect("/blogs");
		}
		else
		{
			res.redirect("/blogs");
		}
	})
	//redirect
	
});





app.listen(3000,'localhost',function() {
	// body...
	console.log("Listening to port"+3000);
	console.log("BlogApp Local Server has Started");

});