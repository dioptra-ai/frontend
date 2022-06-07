
export const datapointIsImage = (datapoint) => {

    return Boolean(datapoint['image_metadata.uri']);
};

export const datapointIsVideo = (datapoint) => {

    return Boolean(datapoint['video_metadata.uri']);
};

export const datapointIsText = (datapoint) => {

    return Boolean(datapoint['text']);
};

export const datapointIsAudio = (datapoint) => {

    return Boolean(datapoint['audio_metadata.uri']);
};
