import mongoose from 'mongoose';

const backgroundImageSchema = new mongoose.Schema({
    url: { type: String, required: true },
    active: { type: Boolean, default: true }
}, { timestamps: true });

const BackgroundImage = mongoose.model('BackgroundImage', backgroundImageSchema);

export default BackgroundImage;
