
export const datapointIsImage = (datapoint) => {

    return Boolean(datapoint['image_metadata']);
};

export const datapointIsVideo = (datapoint) => {

    return Boolean(datapoint['video_metadata']);
};

export const datapointIsText = (datapoint) => {

    return Boolean(datapoint['text']);
};

export const datapointIsNER = (datapoint) => {

    return datapointIsText(datapoint) && (Boolean(datapoint.prediction?.start) || Boolean(datapoint.groundtruth?.start));
};

export const datapointIsAudio = (datapoint) => {

    return Boolean(datapoint['audio_metadata']);
};

export const datapointIsClassifier = (datapoint) => {

    return Boolean(datapoint['prediction']) || Boolean(datapoint['groundtruth']);
};

export const datapointIsObjectDetection = (datapoint) => {

    return Boolean(datapoint.prediction?.top) || Boolean(datapoint.groundtruth?.top);
};
