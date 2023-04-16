import SelectableModel from './selectable-model.mjs';

class BBox extends SelectableModel {
    static getTableName() {
        return 'bboxes';
    }
}

export default BBox;
