import mongoose from 'mongoose';

const panelSchema = new mongoose.Schema({
    title: String,
    editable: Boolean,
    type: {type: String, required: true},
    options: Object, // a set of arguments dependent on the type
    gridPos: {
        x: Number,
        y: Number,
        w: Number,
        h: Number
    }
});

export const Panel = mongoose.model('Panel', panelSchema);

Panel.types = {
    SECTION: 'Section',
    BAR_GRAPH: 'BarGraph',
    LINE_GRAPH: 'LineGraph'
};

const dashboardSchema = new mongoose.Schema({
    title: String,
    editable: Boolean,
    panels: [panelSchema],
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }
});

export default mongoose.model('Dashboard', dashboardSchema);
