//  This controller is made for placing order that if we order from 2 different shops to dono shop pr alg alg order jayga

import Shop from "../models/shop.model.js"
import Order from "../models/order.model.js"
import User from "../models/user.model.js"
import DeliveryAssignment from "../models/deliveryAssignment.model.js"
import { sendDeliveryOtpMail } from "../utils/mail.js"
import Razorpay from "razorpay"
import dotenv from "dotenv"
dotenv.config()

// razorpay instance
let instance = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
});

export const placeOrder = async (req, res) => {
    console.log("✅ placeOrder API hit");  // <--- Add this line

    try {
        const { cartItems, paymentMethod, deliveryAddress, totalAmount } = req.body
        if (cartItems.length == 0 || !cartItems) {
            return res.status(400).json({ message: "cart is empty" })
        }
        if (!deliveryAddress?.text || !deliveryAddress?.latitude || !deliveryAddress?.longitude) {
            return res.status(400).json({ message: "Send complete delivery address" })
        }

        const groupItemsByShop = {}  //we have intialize an empty Array here

        // NOTE :-  we have a simple thing that we have intiailize an empty array and have started a forEach loop jo hmm cart ke hrr item pr traverese krega orr uski shop id dekhega agr vo shop id vala array exists krta hai to item ko usme add kr dega otherwise new array bna dega fir further aese hi loop chlta rhega saare items pr

        cartItems.forEach(item => {
            const shopId = typeof item.shop === "object" ? item.shop._id : item.shop;
            if (!groupItemsByShop[shopId]) {
                groupItemsByShop[shopId] = []
            }
            groupItemsByShop[shopId].push(item)
        });

        // basically object.keys is used to get all keys of that object ( yaha pr keys shops hai)
        const shopOrders = await Promise.all(Object.keys(groupItemsByShop).map(async (shopId) => {
            const shop = await Shop.findById(shopId).populate("owner")
            if (!shop) {
                return res.status(400).json({ message: "Shop not found" })
            }

            const items = groupItemsByShop[shopId]    // jiski ye shopid hai uss shop ke items mil jaynge

            const subtotal = items.reduce((sum, i) => sum + Number(i.price) * Number(i.quantity), 0)

            return {
                shop: shop._id,
                owner: shop.owner._id,
                subtotal,
                shopOrderItems: items.map((i) => ({
                    item: i.id,
                    price: i.price,
                    quantity: i.quantity,
                    name: i.name
                }))
            }
        }
        ))

        if (paymentMethod == "online") {
            const razorOrder = await instance.orders.create({
                amount: Math.round(totalAmount * 100),  // for converting into paise for razorpay
                currency: 'INR',
                receipt: `receipt_${Date.now()}`
            })

            // now create Order

            const newOrder = await Order.create({
                user: req.userId,
                paymentMethod,
                deliveryAddress,
                totalAmount,
                shopOrders,
                razorpayOrderId: razorOrder.id,
                payment: false

            })

            return res.status(200).json({
                razorOrder,
                orderId: newOrder._id,
            })
        }
        const newOrder = await Order.create({
            user: req.userId,
            paymentMethod,
            deliveryAddress,
            totalAmount,
            shopOrders
        })

        await newOrder.populate("shopOrders.shopOrderItems.item", "name image price")
        await newOrder.populate("shopOrders.shop", "name")
        await newOrder.populate("shopOrders.owner", "name socketId")
        await newOrder.populate("user", "name email mobile")

        const io = req.app.get('io')

        if (io) {
            newOrder.shopOrders.forEach(shopOrder => {
                const ownerSocketId = shopOrder.owner.socketId
                if (ownerSocketId) {
                    io.to(ownerSocketId).emit('newOrder', {    // this line  will emit the new order to the shop of particular order
                        _id: newOrder._id,
                        paymentMethod: newOrder.paymentMethod,
                        user: newOrder.user,
                        shopOrders: shopOrder,
                        createdAt: newOrder.createdAt,
                        deliveryAddress: newOrder.deliveryAddress,
                        payment: newOrder.payment
                    })
                }
            });
        }



        return res.status(201).json(newOrder)
    } catch (error) {
        return res.status(500).json({ message: `place order error ${error}` })
    }
}


// razorpay me kucch code and syntax already fixed hai 
export const verifyPayment = async (req, res) => {
    try {
        const { razorpay_payment_id, orderId } = req.body
        const payment = await instance.payments.fetch(razorpay_payment_id)
        if (!payment || payment.status != "captured") {
            return res.status(400).json({ message: "payment not captured" })
        }
        const order = await Order.findById(orderId)
        if (!order) {
            return res.status(400).json({ message: "order not found" })
        }

        order.payment = true
        order.razorpayPaymentId = razorpay_payment_id
        await order.save()

        await order.populate("shopOrders.shopOrderItems.item", "name image price")
        await order.populate("shopOrders.shop", "name")
        await order.populate("shopOrders.owner", "name socketId")
        await order.populate("user", "name email mobile")

        const io = req.app.get('io')

        if (io) {
            order.shopOrders.forEach(shopOrder => {
                const ownerSocketId = shopOrder.owner.socketId
                if (ownerSocketId) {
                    io.to(ownerSocketId).emit('newOrder', {
                        _id: order._id,
                        paymentMethod: order.paymentMethod,
                        user: order.user,
                        shopOrders: shopOrder,
                        createdAt: order.createdAt,
                        deliveryAddress: order.deliveryAddress,
                        payment: order.payment
                    })
                }
            });
        }


        return res.status(200).json(order)

    } catch (error) {
        return res.status(500).json({ message: `verify payment  error ${error}` })
    }
}



export const getMyOrders = async (req, res) => {
    try {
        const user = await User.findById(req.userId)
        if (user.role == "user") {
            const orders = await Order.find({ user: req.userId })
                .sort({ createdAt: -1 })    // this sort is done so that recent order is shown upside
                .populate("shopOrders.shop", "name ")
                .populate("shopOrders.owner", "name email mobile")
                .populate("shopOrders.shopOrderItems.item", "name image price")


            return res.status(200).json(orders)
        } else if (user.role == "owner") {

            const orders = await Order.find({ "shopOrders.owner": req.userId })
                .sort({ createdAt: -1 })    // this sort is done so that recent order is shown upside
                .populate("shopOrders.shop", "name")
                .populate("user")
                .populate("shopOrders.shopOrderItems.item", "name image price")
                .populate("shopOrders.assignedDeliveryBoy", "fullName mobile")

            const filteredOrders = orders.map((order => ({
                _id: order._id,
                paymentMethod: order.paymentMethod,
                user: order.user,
                shopOrders: order.shopOrders.find(o => o.owner._id == req.userId),

                createdAt: order.createdAt,
                deliveryAddress: order.deliveryAddress,

                payment: order.payment

            })))
            return res.status(200).json(filteredOrders)
        }


    } catch (error) {
        return res.status(500).json({ message: `get User error:${error}` })
    }
}

// controller to update status

export const updateOrderStatus = async (req, res) => {
    try {
        const { orderId, shopId } = req.params
        const { status } = req.body
        const order = await Order.findById(orderId)

        const shopOrder = order.shopOrders.find(o => o.shop == shopId)
        if (!shopOrder) {
            return res.status(400).json({ message: "Shop Order not found" })
        }
        shopOrder.status = status

        let deliveryBoysPayload = []

        // functionality for searching delivery boy in nearvy to 7km area 
        if (status == "out of delivery" && !shopOrder.assignment) {
            const { longitude, latitude } = order.deliveryAddress
            const nearByDeliveryBoys = await User.find({
                role: "deliveryBoy",

                location: {
                    $near: {
                        $geometry: {
                            type: "Point",
                            coordinates: [Number(longitude), Number(latitude)]
                        },
                        $maxDistance: 7000 // 7 km

                    }
                }
            })

            // this is array of ids of delivery boys mtlb basically ap function use krke saare delivery boys ke ids nikal ly rhe hai
            const nearByIds = nearByDeliveryBoys.map(b => b._id)
            const busyIds = await DeliveryAssignment.find({
                // $in is used to check if the value is present in the array or not
                assignedTo: { $in: nearByIds },
                status: { $nin: ["broadcasted", "completed"] }  // we are checking that status should not be broadcasted or completed
            }).distinct("assignedTo") // distinct is used to get unique ids
            const busyIdSet = new Set(busyIds.map(id => String(id))) // ye set isliye bna rhe hai taki hme fast lookup mil jaye mtlb agr busy id hai to hme jaldi se pata chal jaye

            // and also set duplicates ko remove kr deta hai

            const availableBoys = nearByDeliveryBoys.filter(b => !busyIdSet.has(String(b._id)))
            const candidates = availableBoys.map(b => b._id)

            if (candidates.length == 0) {
                await order.save()
                return res.json({
                    message: "order status updated but there is no delivery boy available in your area right now"
                })
            }
            const deliveryAssignment = await DeliveryAssignment.create({
                order: order._id,
                shop: shopOrder.shop,
                shopOrderId: shopOrder._id,
                brodcastedTo: candidates,
                status: "broadcasted"
            })
            shopOrder.assignedDeliveryBoy = deliveryAssignment.assignedTo
            shopOrder.assignment = deliveryAssignment._id
            deliveryBoysPayload = availableBoys.map(b => ({
                id: b._id,
                fullName: b.fullName,
                longitude: b.location.coordinates?.[0],
                latitude: b.location.coordinates?.[1],
                mobile: b.mobile
            }))


            // enabling socket.io ( real time order update for delivery Boy)

            await deliveryAssignment.populate('order')
            await deliveryAssignment.populate('shop')
            const io = req.app.get('io')
            if (io) {
                availableBoys.forEach(boy => {
                    const boySocketId = boy.socketId
                    if (boySocketId) {
                        io.to(boySocketId).emit('newAssignment', {
                            sentTo: boy._id,
                            assignmentId: deliveryAssignment._id,
                            orderId: deliveryAssignment.order._id,
                            shopName: deliveryAssignment.shop.name,
                            deliveryAddress: deliveryAssignment.order.deliveryAddress,
                            items: deliveryAssignment.order.shopOrders.find(so => so._id.equals(deliveryAssignment.shopOrderId)).shopOrderItems || [],
                            subtotal: deliveryAssignment.order.shopOrders.find(so => so._id.equals(deliveryAssignment.shopOrderId))?.subtotal
                        })
                    }
                });
            }



        }





        await shopOrder.save()
        await order.save()
        const updatedShopOrder = order.shopOrders.find(o => o.shop._id == shopId)
        await order.populate("shopOrders.shop", "name")
        await order.populate("shopOrders.assignedDeliveryBoy", "fullName email mobile")
        await order.populate("user", "socketId")


        const io = req.app.get('io')
        if (io) {
            const userSocketId = order.user.socketId
            if (userSocketId) {
                io.to(userSocketId).emit('update-status', {
                    orderId: order._id,
                    shopId: updatedShopOrder.shop._id,
                    status: updatedShopOrder.status,
                    userId: order.user._id

                })
            }
        }

        return res.status(200).json({
            shopOrder: updatedShopOrder,
            assignedDeliveryBoy: updatedShopOrder?.assignedDeliveryBoy,
            availableBoys: deliveryBoysPayload,
            assignment: updatedShopOrder?.assignment._id
        })



    } catch (error) {
        return res.status(500).json({ message: `order status error: ${error}` })
    }
}


export const getDeliveryBoyAssignment = async (req, res) => {
    try {
        const deliveryBoyId = req.userId
        const assignment = await DeliveryAssignment.find({
            brodcastedTo: deliveryBoyId,
            status: "broadcasted"
        })
            .populate("order")
            .populate("shop")

        const formatted = assignment.map(a => ({
            assignmentId: a._id,
            orderId: a.order._id,
            shopName: a.shop.name,
            deliveryAddress: a.order.deliveryAddress,
            items: a.order.shopOrders.find(so => so._id.equals(a.shopOrderId)).shopOrderItems || [],
            subtotal: a.order.shopOrders.find(so => so._id.equals(a.shopOrderId)).subtotal || []

        }))

        return res.status(200).json(formatted)
    } catch (error) {
        return res.status(500).json({ message: `get Assignment error: ${error}` })

    }
}

export const acceptOrder = async (req, res) => {
    try {
        const { assignmentId } = req.params
        const assignment = await DeliveryAssignment.findById(assignmentId)
        if (!assignment) {
            return res.status(400).json({ message: "Assignment not found" })
        }
        if (assignment.status !== "broadcasted") {
            return res.status(400).json({ message: "Assignment Expired !!" })
        }

        const alreadyAssigned = await DeliveryAssignment.findOne({
            assignedTo: req.userId,
            status: { $nin: ["broadcasted", "completed"] }
        })

        if (alreadyAssigned) {
            return res.status(400).json({ message: "You are already assigned with another order" })
        }

        assignment.assignedTo = req.userId
        assignment.status = "assigned"
        assignment.acceptedAt = new Date()
        await assignment.save()

        const order = await Order.findById(assignment.order)
        if (!order) {
            return res.status(400).json({ message: "Order not found" })
        }
        const shopOrder = order.shopOrders.id(assignment.shopOrderId)
        shopOrder.assignedDeliveryBoy = req.userId
        await order.save()

        return res.status(200).json({ message: "Order accepted successfully" })
    } catch (error) {
        return res.status(500).json({ message: `accept Order error: ${error}` })
    }
}

export const getCurrentOrder = async (req, res) => {
    try {
        const assignment = await DeliveryAssignment.findOne({
            assignedTo: req.userId,
            status: "assigned"
        })
            .populate("shop", "name")
            .populate("assignedTo", "fullName email mobile location")
            .populate({
                path: "order",
                populate: [{
                    path: "user",
                    select: "fullName email mobile",

                }]
            })

        if (!assignment) {
            return res.status(400).json({ message: "Assignment not found" })
        }
        if (!assignment.order) {
            return res.status(400).json({ message: "Order not found" })
        }

        const shopOrder = assignment.order.shopOrders.find(so => toString(so._id) == toString(assignment.shopOrderId))

        if (!shopOrder) {
            return res.status(400).json({ message: "Shop Order not found" })
        }

        let deliveryBoyLocation = {
            lat: null,
            lon: null
        }
        if (assignment.assignedTo.location.coordinates.length == 2) {
            deliveryBoyLocation.lat = assignment.assignedTo.location.coordinates[1]
            deliveryBoyLocation.lon = assignment.assignedTo.location.coordinates[0]
        }

        let customerLocation = {
            lat: null,
            lon: null
        }
        if (assignment.order.deliveryAddress) {

            customerLocation.lat = assignment.order.deliveryAddress.latitude
            customerLocation.lon = assignment.order.deliveryAddress.longitude
        }


        return res.status(200).json({
            _id: assignment.order._id,
            user: assignment.order.user,
            shopOrder,
            deliveryAddress: assignment.order.deliveryAddress,
            deliveryBoyLocation,
            customerLocation
        })
    } catch (error) {
        return res.status(500).json({ message: `get Current Order error: ${error}` })
    }
}


export const getOrderById = async (req, res) => {
    try {
        const { orderId } = req.params
        const order = await Order.findById(orderId)

            .populate("user")
            .populate({
                path: "shopOrders.shop",
                model: "Shop"
            })

            .populate({
                path: "shopOrders.assignedDeliveryBoy",
                model: "User"

            })


            .populate({
                path: "shopOrders.shopOrderItems.item",
                model: "Item"

            })

            .lean()

        if (!order) {
            return res.status(400).json({ message: "Order not found" })
        }

        return res.status(200).json(order)
    } catch (error) {
        return res.status(500).json({ message: `get Order By Id error: ${error}` })
    }
}


export const sendDeliveryOtp = async (req, res) => {
    try {
        const { orderId, shopOrderId } = req.body
        const order = await Order.findById(orderId).populate("user")
        const shopOrder = order.shopOrders.id(shopOrderId)
        if (!order || !shopOrder) {
            return res.status(400).json({ message: "Order or Shop Order not found" })
        }

        const otp = Math.floor(1000 + Math.random() * 9000).toString()
        shopOrder.deliveryOtp = otp
        shopOrder.otpExpires = new Date(Date.now() + 5 * 60 * 1000) // OTP expires in 10 minutes
        await order.save()
        await sendDeliveryOtpMail(order.user, otp)

        return res.json({ message: `Delivery OTP sent to ${order?.user?.fullName} successfully` })
    } catch (error) {
        return res.status(500).json({ message: `send Delivery Otp error: ${error}` })
    }
}


export const verifyDeliveryOtp = async (req, res) => {
    try {
        const { orderId, shopOrderId, otp } = req.body

        const order = await Order.findById(orderId).populate("user")
        const shopOrder = order.shopOrders.id(shopOrderId)
        if (!order || !shopOrder) {
            return res.status(400).json({ message: "Order or Shop Order not found" })
        }

        if (shopOrder.deliveryOtp !== otp || !shopOrder.otpExpires || shopOrder.otpExpires < Date.now()) {
            return res.status(400).json({ message: "Invalid/Expired OTP" })
        }

        shopOrder.status = "delivered"
        shopOrder.deliveredAt = Date.now()

        await order.save()

        // Delete the delivery assignment as the order is delivered
        await DeliveryAssignment.deleteOne({
            shopOrderId: shopOrder._id,
            order: order._id,
            assignedTo: shopOrder.assignedDeliveryBoy
        })

        res.status(200).json({ message: "OTP verified successfully , order marked as delivered" })
    } catch (error) {
        return res.status(500).json({ message: `verify Delivery Otp error: ${error}` })
    }
}


export const getTodayDeliveries = async (req, res) => {
    try {
        const deliveryBoyId = req.userId
        const startsOfDay = new Date()
        startsOfDay.setHours(0, 0, 0, 0)

        const orders = await Order.find({
            "shopOrders.assignedDeliveryBoy": deliveryBoyId,   // deliveryBoy ki id mtlb jisko order assign hua hai
            "shopOrders.status": "delivered",                    // status delivered hona chahiye uss delivery boy ka
            "shopOrders.deliveredAt": { $gte: startsOfDay }    // aur deliveredAt aaj ki date ke barabar ya usse jyada hona chahiye
        }).lean()                      // lean is used to get plain javascript object instead of mongoose document

        let todaysDeliveries = []

        orders.forEach(order => {
            order.shopOrders.forEach(shopOrder => {
                if (shopOrder.assignedDeliveryBoy == deliveryBoyId &&
                    shopOrder.status == "delivered" &&
                    shopOrder.deliveredAt &&
                    shopOrder.deliveredAt >= startsOfDay
                ) {
                    todaysDeliveries.push(shopOrder)
                }
            })
        })

        let stats = {}

        todaysDeliveries.forEach(shopOrder => {
            const hour = new Date(shopOrder.deliveredAt).getHours()
            stats[hour] = (stats[hour] || 0) + 1
        })

        let formattedStats = Object.keys(stats).map(hour => ({
            hour: parseInt(hour),
            count: stats[hour]
        }))

        formattedStats.sort((a, b) => a.hour - b.hour)

        return res.status(200).json(formattedStats)


    } catch (error) {
        return res.status(500).json({ message: `today deliveries error ${error}` })
    }
}


