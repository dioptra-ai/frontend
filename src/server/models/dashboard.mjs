import mongoose from 'mongoose';

const panelSchema = new mongoose.Schema({
    editable: Boolean,
    type: {type: String, required: true},
    options: Object, // a set of arguments dependent on the type
    title: String,
    gridPos: {
        x: Number,
        y: Number,
        w: Number,
        h: Number
    }
});
const dashboardSchema = new mongoose.Schema({
    title: String,
    editable: Boolean,
    panels: [panelSchema],
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }
});

export default mongoose.model('Dashboard', dashboardSchema);
