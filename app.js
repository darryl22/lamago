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
    if (request.session.currency === undefined) {
        request.session.currency = "KES"
    }
    next()
})

app.get("/", (request, response) => {
    let summercapsule = []
    let linenluxe = []
    let celestialchic = []
    let newIn = [
        "Kara Silk Top - Turquoise",
        "Kara Silk Top - Red",
        "Jani Strapy Set - Olive",
        "Jani Strapy Set - Beige",
        "Tiwi Silk Top",
        "Kara Silk Top",
        "Velora Midi Dress - White",
        "Jani Strapy Set",
        "Vito Summer Shorts - Black",
        "Vito Summer Shorts - White",
        "Vito Summer Shorts",
        "Velora Midi Dress"
    ]
    async function db() {
        try {
            const database = client.db("lamago")
            const clothing = database.collection("clothing")
            let [res, newItems] = await Promise.all([clothing.find().toArray(), clothing.find({title: {$in : newIn}}).toArray()])
            for (let x = 0; x < res.length; x++) {
                let collection
                try {
                    collection = res[x].collection.toString()
                } catch {
                    collection = "none"
                }
                // console.log(collection)
                if (collection.includes("summercapsule") === true) {
                    summercapsule.push(res[x])
                }

                if (collection.includes("linenluxe") === true) {
                    linenluxe.push(res[x])
                }

                if (collection.includes("celestialchic") === true) {
                    celestialchic.push(res[x])
                }
            }
            response.render("index.ejs", {cart: request.session.cart, cartTotal: request.session.cartTotal, summercapsule: summercapsule, linenluxe: linenluxe, celestialchic: celestialchic, newitems: newItems})
        } catch (error) {
            console.log(error)
            response.render("index.ejs", {cart: request.session.cart, cartTotal: request.session.cartTotal})
        }
    }
    db()
    // response.render("index.ejs", {cart: request.session.cart, cartTotal: request.session.cartTotal})
})

app.post("/changecurrency", (request, response) => {
    request.session.currency = request.body.action
    console.log(request.body, request.session.currency)
    response.json({"currency": request.session.currency})
})

app.get("/aboutus", (request, response) => {
    response.render("aboutus.ejs", {cart: request.session.cart, cartTotal: request.session.cartTotal})
})

app.get("/shop/:category", (request, response) => {
    console.log(request.params)
    async function db() {
        try {
            const database = client.db("lamago")
            const clothing = database.collection("clothing")
            let res = await clothing.find().toArray()
            if (request.params.category === "all") {
                response.render("shop.ejs", {items: res, cart: request.session.cart, cartTotal: request.session.cartTotal, category: request.params.category})
            } else if (request.params.category === "dress"){
                let itemsArray = []
                for (let x = 0; x < res.length; x++) {
                    if (res[x].category.includes("dress")) {
                        itemsArray.push(res[x])
                    }
                }
                response.render("shop.ejs", {items: itemsArray, cart: request.session.cart, cartTotal: request.session.cartTotal, category: request.params.category})
            } else if (request.params.category === "mididress"){
                let itemsArray = []
                for (let x = 0; x < res.length; x++) {
                    if (res[x].category.includes("mididress")) {
                        itemsArray.push(res[x])
                    }
                }
                response.render("shop.ejs", {items: itemsArray, cart: request.session.cart, cartTotal: request.session.cartTotal, category: request.params.category})
            } else if (request.params.category === "minidress"){
                let itemsArray = []
                for (let x = 0; x < res.length; x++) {
                    if (res[x].category.includes("minidress")) {
                        itemsArray.push(res[x])
                    }
                }
                response.render("shop.ejs", {items: itemsArray, cart: request.session.cart, cartTotal: request.session.cartTotal, category: request.params.category})
            } else if (request.params.category === "maxidress"){
                let itemsArray = []
                for (let x = 0; x < res.length; x++) {
                    if (res[x].category.includes("maxidress")) {
                        itemsArray.push(res[x])
                    }
                }
                response.render("shop.ejs", {items: itemsArray, cart: request.session.cart, cartTotal: request.session.cartTotal, category: request.params.category})
            } else if (request.params.category === "set"){
                let itemsArray = []
                for (let x = 0; x < res.length; x++) {
                    if (res[x].category.includes("set")) {
                        itemsArray.push(res[x])
                    }
                }
                response.render("shop.ejs", {items: itemsArray, cart: request.session.cart, cartTotal: request.session.cartTotal, category: request.params.category})
            } else if (request.params.category === "top"){
                let itemsArray = []
                for (let x = 0; x < res.length; x++) {
                    if (res[x].category.includes("top")) {
                        itemsArray.push(res[x])
                    }
                }
                response.render("shop.ejs", {items: itemsArray, cart: request.session.cart, cartTotal: request.session.cartTotal, category: request.params.category})
            } else if (request.params.category === "pants"){
                let itemsArray = []
                for (let x = 0; x < res.length; x++) {
                    if (res[x].category.includes("pants")) {
                        itemsArray.push(res[x])
                    }
                }
                response.render("shop.ejs", {items: itemsArray, cart: request.session.cart, cartTotal: request.session.cartTotal, category: request.params.category})
            } else if (request.params.category === "coat"){
                let itemsArray = []
                for (let x = 0; x < res.length; x++) {
                    if (res[x].category.includes("coat")) {
                        itemsArray.push(res[x])
                    }
                }
                response.render("shop.ejs", {items: itemsArray, cart: request.session.cart, cartTotal: request.session.cartTotal, category: request.params.category})
            } else if (request.params.category === "shorts"){
                let itemsArray = []
                for (let x = 0; x < res.length; x++) {
                    if (res[x].category.includes("shorts")) {
                        itemsArray.push(res[x])
                    }
                }
                response.render("shop.ejs", {items: itemsArray, cart: request.session.cart, cartTotal: request.session.cartTotal, category: request.params.category})
            } else if (request.params.category === "skirts"){
                let itemsArray = []
                for (let x = 0; x < res.length; x++) {
                    if (res[x].category.includes("skirts")) {
                        itemsArray.push(res[x])
                    }
                }
                response.render("shop.ejs", {items: itemsArray, cart: request.session.cart, cartTotal: request.session.cartTotal, category: request.params.category})
            }
        } catch (error) {
            console.log(error)
            response.render("shop.ejs", {items: [], cart: request.session.cart, cartTotal: request.session.cartTotal, category: request.params.category})
        }
    }
    db()
})

app.get("/preorder", (request, response) => {
    async function db() {
        try {
            const database = client.db("lamago")
            const clothing = database.collection("clothing")
            let res = await clothing.find().toArray()
            let preorder = []
            for (let x = 0; x < res.length; x++) {
                try {
                    if (res[x].preorder === "true") {
                        preorder.push(res[x])
                    }
                } catch {
                    console.log("no preorder")
                }
            }
            response.render("preorder.ejs", {items: preorder, cart: request.session.cart, cartTotal: request.session.cartTotal})
        } catch (error) {
            console.log(error)
            response.render("preorder.ejs", {items: [], cart: request.session.cart, cartTotal: request.session.cartTotal})
        }
    }
    db()
})

app.get("/giftcards", (request, response) => {
    response.render("giftcards.ejs", {cart: request.session.cart, cartTotal: request.session.cartTotal})
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
    let cart = request.session.cart
    if (action === "addone") {
        let item = {
            size: request.body.size,
            quantity: parseInt(request.body.quantity),
            itemname: request.body.itemname,
            price: {
                "KES": request.body.priceKES,
                "USD": request.body.priceUSD
            },
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
    let tempKES = 0
    let tempUSD = 0
    for (let x = 0; x < cart.length; x++) {
        tempKES = tempKES + (cart[x].price.KES * cart[x].quantity)
        tempUSD = tempUSD + (cart[x].price.USD * cart[x].quantity)
    }
    console.log(tempUSD, tempKES)
    request.session.cartTotal = {
        "KES": tempKES,
        "USD": tempUSD
    }
    response.json({"success": true, "cart": request.session.cart, "cartTotal": request.session.cartTotal})
})

app.get("/login", (request, response) => {
    response.render("login.ejs")
})

app.get("/contactus", (request, response) => {
    response.render("contactus.ejs", {cart: request.session.cart, cartTotal: request.session.cartTotal})
})

app.post("/contactus", (request, response) => {
    response.redirect("/contactus")
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