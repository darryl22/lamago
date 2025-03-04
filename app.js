const express = require("express")
const app = express()
require("dotenv").config()
const bodyParser = require("body-parser")
const Mailjet = require('node-mailjet');
const mailjet = Mailjet.apiConnect(
    process.env.MAILJET_API_KEY,
    process.env.MAILJET_API_SECRET,
);
const {MongoClient, ObjectId} = require("mongodb")
const session = require("express-session")
const MongoDBStore  = require("connect-mongodb-session")(session)
const store = new MongoDBStore ({
    uri: "mongodb://localhost:27017/skateapp",
    databaseName: "lamago",
    collection: "mySessions"
})
const PORT = process.env.PORT
const uri = process.env.MONGO_URI
const client = new MongoClient(uri)

app.set("view engine", "ejs")
app.use(bodyParser.urlencoded({extended: true, limit: "300mb"}))
app.use(express.static('public'))
app.use(require("express-session")({
    secret: process.env.SESSION_SECRET,
    cookie: {
        maxAge: 604800000
    },
    store: store,
    resave: true,
    saveUninitialized: true
}))

app.use((request, response, next) => {
    if (request.session.cart === undefined) {
        request.session.cart = []
        request.session.cartTotal = 0
    }
    next()
})

app.get("/", (request, response) => {
    response.render("index.ejs", {cart: request.session.cart, cartTotal: request.session.cartTotal})
})

app.get("/aboutus", (request, response) => {
    response.render("aboutus.ejs", {cart: request.session.cart, cartTotal: request.session.cartTotal})
})

app.get("/shop/:category", (request, response) => {
    async function db() {
        try {
            const database = client.db("lamago")
            const clothing = database.collection("clothing")
            let res = await clothing.find().toArray()
            response.render("shop.ejs", {items: res, cart: request.session.cart, cartTotal: request.session.cartTotal})
        } catch (error) {
            console.log(error)
            response.render("shop.ejs", {cart: request.session.cart, cartTotal: request.session.cartTotal})
        }
    }
    db()
})

app.get("/itemdetail/:id", (request, response) => {

    let id = new ObjectId(request.params.id)
    async function db() {
        try {
            const database = client.db("lamago")
            const item = database.collection("clothing")
            let res = await item.findOne({"_id": id})
            response.render("itemdetail.ejs", {item: res, cart: request.session.cart, cartTotal: request.session.cartTotal})
        } catch (error) {
            console.log(error)
            response.render("itemdetail.ejs", {cart: request.session.cart, cartTotal: request.session.cartTotal})
        }
    }
    db()
})

app.get("/cart", (request,response) => {
    console.log("cart function")
    response.render("cart.ejs", {cart: request.session.cart, cartTotal: request.session.cartTotal})
})

app.post("/cart", (request,response) => {
    let action = request.body.action
    console.log(request.body)
    let cart = request.session.cart
    if (action === "addone") {
        let item = {
            size: request.body.size,
            quantity: parseInt(request.body.quantity),
            itemname: request.body.itemname,
            price: request.body.price,
            image: request.body.image
        }

        if (cart.length === 0) {
            cart.push(item)
            console.log("first item")
        } else {
            let inserted = false
            for (let x = 0; x < cart.length; x++) {
                if (cart[x].itemname === item.itemname) {
                    cart[x].quantity = parseInt(cart[x].quantity) + parseInt(request.body.quantity)
                    console.log("added quantity")
                    inserted = true
                }
            }
            if (inserted === false) {
                cart.push(item)
            }
        }
    } else if (action === "removeone") {
        for (let x = 0; x < cart.length; x++) {
            if (cart[x].itemname === request.body.itemname) {
                cart[x].quantity = parseInt(cart[x].quantity) - 1
                console.log("remove one")
                console.log(cart[x].quantity)
            }
        }
    } else if (action === "addquantity") {
        for (let x = 0; x < cart.length; x++) {
            if (cart[x].itemname === request.body.itemname) {
                cart[x].quantity = parseInt(cart[x].quantity) + 1
                console.log("added one")
                console.log(cart[x].quantity)
            }
        }
    } else if (action === "removeitem") {
        for (let x = 0; x < cart.length; x++) {
            if (cart[x].itemname === request.body.itemname) {
                cart.splice(x, 1)
                console.log("removed item")
            }
        }
    }
    let temp = 0
    for (let x = 0; x < cart.length; x++) {
        temp = temp + (cart[x].price * cart[x].quantity)
    }
    console.log(temp)
    request.session.cartTotal = temp
    response.json({"success": true, "cart": request.session.cart, "cartTotal": request.session.cartTotal})
})

app.get("/login", (request, response) => {
    response.render("login.ejs")
})

app.post("/login", (request, response) => {
    const email = request.body.email
    const mailrequest = mailjet.post('send', { version: 'v3.1' }).request({
        Messages: [
            {
                From: {
                    Email: "lamagostoremail@gmail.com",
                    Name: "Mailjet Pilot"
                    },
                To: [
                    {
                    Email: email,
                    Name: "passenger 1"
                    }
                ],
                Subject: "Lamago Login Verification",
                TextPart: "New token",
                HTMLPart: `<p>Your login token is : <span style='font-weight: bold;'>123456</span></p>`
            }
            ]
        })

        mailrequest
            .then((result) => {
                console.log(result)
            })
            .catch((err) => {
                console.log(err.statusCode)
            })
    response.redirect(`/verification?email=${email}`)
})

app.get("/verification", (request, response) => {
    response.render("verification.ejs")
})

app.post("/verification", (request, response) => {
    response.redirect("/profile")
})

app.get("/profile", (request, response) => {
    response.render("profile.ejs", {cart: request.session.cart, cartTotal: request.session.cartTotal})
})

app.listen(PORT, () => {
    console.log(`server started on port ${PORT}`)
})