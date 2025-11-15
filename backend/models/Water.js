import mongoose from 'mongoose';

const waterSchema = new mongoose.Schema(
    {
        source: { type: String, required: true },
        quality: { type: String, required: true },
        ph: { type: Number },
        tds: { type: Number }, 
        contaminants: { type: [String], default: [] },
        testedAt: { type: Date, default: Date.now },
        location: {
            type: {
                type: String,
                enum: ['Point'],
                default: 'Point',
            },
            coordinates: {
                type: [Number],
                default: [0, 0],
            },
            required: true,
        },
    },
    { timestamps: true } // handles createdAt + updatedAt automatically
);

export default mongoose.model('Water', waterSchema);
