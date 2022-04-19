import {makeAutoObservable} from 'mobx';
import baseJSONClient from 'clients/base-json-client';

class DatasetStore {
    datasetsById = {};

    error = null;

    constructor() {
        makeAutoObservable(this);
    }

    async initialize() {
        try {
            const datasets = await baseJSONClient('/api/dataset');

            datasets.forEach((dataset) => {
                this.datasetsById[dataset._id] = dataset;
            });
        } catch (e) {
            console.warn(e);
        }
    }

    get datasets() {

        return Object.values(this.datasetsById);
    }

    getDatasetById(_id) {

        return this.datasetsById[_id];
    }

    getDatasetByDatasetId(datasetId) {

        return this.datasets.find((m) => m.datasetId === datasetId);
    }

    setDatasetById(_id, data) {
        this.datasetsById[_id] = data;
    }

    static getSqlFilters(_id) {

        return `dataset_id = '${_id}'`;
    }
}

export const datasetStore = new DatasetStore();
export {DatasetStore};
