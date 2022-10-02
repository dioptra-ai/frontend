
export const datapointIsImage = (datapoint) => {

    return Boolean(datapoint['image_metadata.uri']);
};

export const datapointIsVideo = (datapoint) => {

    return Boolean(datapoint['video_metadata.uri']);
};

export const datapointIsText = (datapoint) => {

    return Boolean(datapoint['text']);
};

export const datapointIsNER = (datapoint) => {

    return datapointIsText(datapoint) && (Boolean(datapoint['prediction.class_name']) || Boolean(datapoint['groundtruth.class_name']));
};

export const datapointIsAudio = (datapoint) => {

    return Boolean(datapoint['audio_metadata.uri']);
};

export const datapointIsClassifier = (datapoint) => {

    return Boolean(datapoint['prediction']) || Boolean(datapoint['groundtruth']);
};

export const datapointIsObjectDetection = (datapoint) => {

    return Boolean(datapoint['prediction.top']) || Boolean(datapoint['groundtruth.top']);
};
