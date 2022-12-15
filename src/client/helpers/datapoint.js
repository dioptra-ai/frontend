
export const datapointIsImage = (datapoint) => {

    return Boolean(datapoint['image_metadata']);
};

export const datapointIsVideo = (datapoint) => {

    return Boolean(datapoint['video_metadata']);
};

export const datapointIsText = (datapoint) => {

    return Boolean(datapoint['text']);
};

export const datapointIsAudio = (datapoint) => {

    return Boolean(datapoint['audio_metadata']);
};

export const labelsAreNER = (labels) => {

    return Boolean(labels?.[0]?.['prediction']?.['start']) || Boolean(labels?.[0]?.['groundtruth']?.['start']);
};

export const labelsAreClassifier = (labels) => {

    return Boolean(labels?.[0]?.['prediction']?.['class_name']) || Boolean(labels?.[0]?.['groundtruth']?.['class_name']);
};

export const labelsAreObjectDetection = (labels) => {

    return Boolean(labels?.[0]?.['prediction']?.['top']) || Boolean(labels?.[0]?.['groundtruth']?.['top']);
};

export const labelsAreLearningToRank = (labels) => {

    return Boolean(labels?.[0]?.['prediction']?.['score']) || Boolean(labels?.[0]?.['groundtruth']?.['relevance']);
};
