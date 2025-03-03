const express = require("express")
const app = express()
require("dotenv").config()
const bodyParser = require("body-parser")
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
    }
    next()
})

app.get("/", (request, response) => {
    response.render("index.ejs", {cart: request.session.cart})
})

app.get("/aboutus", (request, response) => {
    response.render("aboutus.ejs", {cart: request.session.cart})
})

app.get("/shop/:category", (request, response) => {
    async function db() {
        try {
            const database = client.db("lamago")
            const clothing = database.collection("clothing")
            let res = await clothing.find().toArray()
            response.render("shop.ejs", {items: res, cart: request.session.cart})
        } catch (error) {
            console.log(error)
            response.render("shop.ejs", {cart: request.session.cart})
        }
    }
    db()
})

app.get("/itemdetail/:id", (request, response) => {
    console.log(request.session)
    // request.session.cart = []

    let id = new ObjectId(request.params.id)
    async function db() {
        try {
            const database = client.db("lamago")
            const item = database.collection("clothing")
            let res = await item.findOne({"_id": id})
            response.render("itemdetail.ejs", {item: res, cart: request.session.cart})
        } catch (error) {
            console.log(error)
            response.render("itemdetail.ejs", {cart: request.session.cart})
        }
    }
    db()
})

app.get("/cart", (request,response) => {
    console.log("cart function")
    response.render("cart.ejs")
})

app.post("/cart", (request,response) => {
    console.log(request.session)
    console.log(request.body)
    let action = request.body.action
    let cart = request.session.cart
    let item = {
        size: request.body.size,
        quantity: parseInt(request.body.quantity),
        itemname: request.body.itemname,
        price: request.body.price,
        image: request.body.image
    }
    if (action === "addone") {
        if (cart.length === 0) {
            cart.push(item)
        } else {
            for (let x = 0; x < cart.length; x++) {
                if (cart[x].itemname === item.itemname) {
                    cart[x].quantity = cart[x].quantity + 1
                }
                if ((x + 1) === cart.length && cart[x].itemname !== item.itemname) {
                    cart.push(item)
                }
            }
        }
    }
    response.json({"success": true, "cart": request.session.cart})
})

app.listen(PORT, () => {
    console.log(`server started on port ${PORT}`)
})