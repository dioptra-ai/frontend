import {
    autorun,
    makeAutoObservable
} from 'mobx';

class SegmentationStore {
    s = [];

    constructor(initialValue) {
        const segmentation = new URL(window.location).searchParams.get('segmentation');

        if (segmentation) {
            this.segmentation = JSON.parse(segmentation);
        } else if (initialValue) {
            this.segmentation = JSON.parse(initialValue).s;
        }
        makeAutoObservable(this);
    }

    get segmentation() {

        return this.s;
    }

    set segmentation(segmentation) {

        this.s = segmentation;
    }
}

export const segmentationStore = new SegmentationStore(localStorage.getItem('segmentationStore'));

autorun(() => {
    localStorage.setItem('segmentationStore', JSON.stringify(segmentationStore));
});
