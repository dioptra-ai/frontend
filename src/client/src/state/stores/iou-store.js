import {
    autorun,
    makeAutoObservable
} from 'mobx';

class IOUStore {
    iou = 0.5;

    constructor(initialValue) {
        const iou = new URL(window.location).searchParams.get('iou');

        if (iou) {
            this.iou = JSON.parse(iou);
        } else if (initialValue) {
            this.iou = JSON.parse(initialValue).iou;
        }
        makeAutoObservable(this);
    }

    get iou() {
        return this.iou;
    }

    set iou(iou) {

        this.iou = iou;
    }
}

export const iouStore = new IOUStore(localStorage.getItem('iouStore'));

autorun(() => {
    localStorage.setItem('iouStore', JSON.stringify(iouStore));
});
