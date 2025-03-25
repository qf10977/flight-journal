import mongoose from 'mongoose'

const airportSchema = new mongoose.Schema({
    iata: {
        type: String,
        required: true,
        unique: true,
        uppercase: true,
        trim: true
    },
    name: {
        type: String,
        required: true,
        trim: true
    },
    city: {
        type: String,
        required: true,
        trim: true
    },
    country: {
        type: String,
        required: true,
        trim: true
    },
    timezone: String,
    elevation: Number,
    latitude: Number,
    longitude: Number,
    facilities: {
        type: Map,
        of: String
    },
    transportation: {
        subway: [{
            line: String,
            stations: [String],
            firstTrain: String,
            lastTrain: String,
            frequency: String
        }],
        bus: [{
            route: String,
            destination: String,
            schedule: String,
            price: String
        }],
        taxi: {
            availableAreas: [String],
            approximatePrices: Map
        }
    },
    terminals: [{
        name: String,
        facilities: [String],
        restaurants: [{
            name: String,
            location: String,
            cuisine: String,
            hours: String
        }],
        shops: [{
            name: String,
            location: String,
            category: String,
            hours: String
        }]
    }],
    hotels: [{
        name: String,
        location: String,
        price: String,
        contact: String,
        amenities: [String]
    }],
    boardingProcess: {
        checkIn: {
            locations: [String],
            deadlines: Map,
            requirements: [String]
        },
        security: {
            locations: [String],
            requirements: [String],
            tips: [String]
        },
        immigration: {
            location: String,
            requirements: [String]
        },
        gates: {
            layout: String,
            walkingTimes: Map
        }
    }
})

export default mongoose.model('Airport', airportSchema) 