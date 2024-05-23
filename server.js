const express = require("express")
const bodyparser = require("body-parser")
const mongoose = require("mongoose")
const passport = require("passport")
const methodOverride = require("method-override")
const  session = require("express-session");
const passportLocalMongoose = require("passport-local-mongoose");

const app = express()
const port = process.env.PORT || 4000

app.set("view engine","ejs")
app.use(bodyparser.urlencoded({extended:true}))
app.use(methodOverride("_method"))
app.use(express.static("public"))
mongoose.set('strictQuery', false);

app.use(
    session({
        secret:"AS@7100",
        resave:true,
        saveUninitialized:false
    })
)

app.use(passport.initialize())
app.use(passport.session())


mongoose.connect(
    "mongodb+srv://sibi:arunsibi@hospital-systems.wgqwd8m.mongodb.net/hms-admin-DB?retryWrites=true&w=majority&appName=hospital-systems"
)

const userSchema = new mongoose.Schema({
    email : String,
    passport:String,
})

userSchema.plugin(passportLocalMongoose)

const user = new mongoose.model("users" ,userSchema)

passport.use(user.createStrategy())

passport.serializeUser(user.serializeUser()) //logged user data session store 
passport.deserializeUser(user.deserializeUser()); //logout user data session delete 



const patients = mongoose.model("patients",{
    patient_id:Number,
    patient_name:String,
    patient_age:Number,
    patient_address:String,
    patient_moblie:Number,
    patient_disease:String
})



app.get("/",(req,res)=>{
    res.render("index")
 })

 app.get("/admin",(req,res)=>{
   if(req.isAuthenticated()){
    res.render("admin")
   }
   else{
    res.redirect("/")
   }
 })

 app.get("/addpatient",(req,res)=>{
    if(req.isAuthenticated()){
        res.render("addpatient")
    }
    else{
        res.redirect("/")
    }
 })

 app.get("/dashbord",(req,res)=>{
    if(req.isAuthenticated()){
        patients.find({}).then((data)=>{
            if(data){
                res.render("dashbord",{data})
            }
        })
       
    }else{
        res.redirect("/")
    }
 })


app.get("/update/:id",(req,res)=>{
    if(req.isAuthenticated()){

        patients.findOne({patient_name:req.params.id}).then((data)=>{
            res.render("update",{data})
        }).catch((err)=>{
            console.log(err);
        })

    }
    else{
        res.redirect("/")
    }
})

app.get("/delete/:id",(req,res)=>{
    if(req.isAuthenticated()){
        patients.deleteOne({patient_name:req.params.id}).then((data)=>{
            res.redirect("/dashbord")
        }).catch((err)=>{
            console.log(err);
        })
    }
    else{
        res.redirect("/")
    }
})

 app.post("/addpatient",(req,res)=>{
    const patient = new patients(req.body)
    
    patient.save().then(()=>{
        res.render("addpatient")
    }).catch((err)=>{
        console.log(err);
    })

 })

 app.put("/update/:id",(req,res)=>{
    patients.updateOne({patient_name:req.params.id},{
        $set:{
            patient_name:req.body.patient_name,
            patient_age:req.body.patient_age,
            patient_address:req.body.patient_address,
            patient_moblie:req.body.patient_moblie,
            patient_disease:req.body.patient_disease,
        }
    })
    .then((data)=>{
        res.redirect("/dashbord")
    }).catch((err)=>{
        console.log(err);
    })
 })

app.post("/",(req,res)=>{
    
    // user.register({username:req.body.username},req.body.password,(err,user)=>{
    //     if(err){
    //         console.log(err);
    //     }
    //     else{
    //         console.log(user);
    //         passport.authenticate("local")(req,res,()=>{
    //             res.redirect("/")
    //         })
    //     }
    // })

    const users = new user({
        username:req.body.username,
        password:req.body.password
    })

    req.logIn(users,(err)=>{
        if(err){
            console.log(err);
        }
        else{
            passport.authenticate("local")(req,res,()=>{
                res.redirect("/admin")
            })
        }
    })

   
})
app.get("/logout",(req,res)=>{
    req.logOut((err)=>{
        if(err){
            console.log(err);
        }
        else{
            res.redirect("/")
        }
    })
})

app.listen(port,()=>{
    console.log(`server is up and running ${port}`);
})

