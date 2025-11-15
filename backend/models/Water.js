import mongoose from 'mongoose';

const waterSchema = new mongoose.Schema(
    {
        name: { type: String, required: true },
        source: { type: String, required: true },
        quality: { type: String, required: true },
        ph: { type: Number },
        tds: { type: Number }, 
        contaminants: { type: [String], default: [] },
        tests: { type: Object, default: {} }, // Store test results as key-value pairs
        testedAt: { type: Date, default: Date.now },
        location: {
            type: {
                type: String,
                enum: ['Point'],
                default: 'Point',
            },
            coordinates: {
                type: [Number], // [longitude, latitude]
                required: true,
            },
        },
        // Add user reference to track who added this source
        addedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
        },
    },
    { timestamps: true }
);

// Create geospatial index for location-based queries
waterSchema.index({ location: '2dsphere' });

export default mongoose.model('Water', waterSchema);