## Supported formats

Datapoints are the core element of a dataset. Each datapoint describes a single piece of data and can contain several fields.

### Generic fields

Generic fields describe the datapoint and its relationship to models and datasets.
```json
{
    "model_id": "STRING", // the model that generated this datapoint
    "model_type": "STRING", // the type of model for that datapoint. [List of available ENUMS](##model-specific-fields)
    "request_id": "STRING", // a unique identifier connecting to your system default: uuid4()
    "timestamp": "TIMESTAMP", // default: ingestion time
    "tags": {
        "STRING": "STRING" //  key-value pairs for arbitrary metadata
    },
    "dataset_id": "STRING", //  the id of the dataset the datapoint belongs to
    "benchmark_id": "STRING" //  the id of the benchmark run the datapoint belongs to
}
```

### Metadata fields

Depending on the type of data, some metadata may be used.

```json
{
    "image_metadata": { // metadata about the image described by this datapoint
        "width": "INT", // image width. required with object detection
        "height": "INT", //image height. required with object detection
        "uri": "STRING", // a uri to the image for rendering purposes (http://, s3:// etc.)
        "object": { // crop of the image the model focuses on
            "top": "INTEGER", // top pixel coordinate of the object box
            "left": "INTEGER", // left pixel coordinate of the object box
            "height": "INTEGER", // pixel height of the object box
            "width": "INTEGER", // pixel width of the object box
        },
        "brightness": "FLOAT",
        "sharpness": "FLOAT",
        "contrast": "FLOAT"
    },
    "video_metadata": { // metadata about the video frame described by this datapoint
        "width": "INT",
        "height": "INT",
        "uri": "STRING", // a uri to the image for rendering purposes (http://, s3:// etc.)
        "frame": "INT",
        "frame_rate": "FLOAT"
    },
    "audio_metadata": { // metadata about the audio sample described by this datapoint
        "uri": "STRING",  // a uri to the image for rendering purposes (http://, s3:// etc.)
        "duration": "FLOAT",
        "sampling_rate": "INT",
        "start_time": "FLOAT",
        "end_time": "FLOAT"
    },
    "text": "STRING",  // text can be passed directly 
    "text_metadata": { // metadata about the text described by this datapoint
        "uri": "STRING"
    }
}
```

### Features fields

Dioptra accepts discrete features as well embeddings features.

```json
{
    "embeddings": [], // a 1D, 2D or 3D array of floats for the prediction described by this datapoint. Will be used for embedings and activation based mining and analyses
    "features": {"STRING", ["FLOAT", "INT", "STRING", "TIMESTAMP"]} // arbitrary key value pairs of explicit features
}
```

### Model specific fields

Regardless of the model type, prediction and groundtruth are available using the following fields.

```json
{
    "prediction": "MODEL_FORMAT", // model specific prediction format
    "mc_dropout": ["MODEL_FORMAT"],  // a list of model specific predictions from a Monte Carlo Dropout
    "query_by_committee": ["MODEL_FORMAT"], // a list of model specific predictions from a Query By Commitee ensemble of models
    "groundtruth": "MODEL_FORMAT" // model specific groundtruth format
}
```

#### Classifiers

##### Model type ENUMs

```json
{
    "model_type": "IMAGE_CLASSIFIER",
    "model_type": "TEXT_CLASSIFIER" 
}
```

##### Prediction format

We take a classifier output un two different formats.

```json
// Simple
{
    "prediction": {
        "class_name": "STRING",
        "confidence": "FLOAT"
    }
}
```

```json
// Full
{
    "prediction": {
        "class_names": ["STRING"], // all class names
        "confidences": ["FLOAT"], // confidence vector. Indexes must match the class names vector
        "logits": ["FLOAT"] // raw logits (before the softmax). Indexes must match the class names vector. Will be available for Activation based mining
    }
}
```

##### Groudntruth format

```json
{
    "groundtruth":  {
        "class_name": "STRING"
    }
}
```

#### Object Detection

##### Model type ENUMs

```json
{
    "model_type": "OBJECT_DETECTION"
}
```

##### Prediction format

We take a classifier output un two different formats.

```json
// Simple
{
    "prediction": [{
        "class_name": "STRING",
        "confidence": "FLOAT",
        "top": "FLOAT",
        "left": "FLOAT",
        "width": "FLOAT",
        "height": "FLOAT",
    }, {...}]
}
```

```json
// Full
{
    "prediction": [{
        "class_names": ["STRING"], // all class names
        "confidences": ["FLOAT"], // confidence vector. Indexes must match the class names vector
        "logits": ["FLOAT"], // raw logits (before the softmax). Indexes must match the class names vector. Will be available for Activation based mining
        "top": "FLOAT",
        "left": "FLOAT",
        "width": "FLOAT",
        "height": "FLOAT",
    }, {...}]
}
```

##### Groudntruth format

```json
{
    "groundtruth":  [{
        "class_name": "STRING",
        "top": "FLOAT",
        "left": "FLOAT",
        "width": "FLOAT",
        "height": "FLOAT",
    }, {...}]
}
```


#### Name Entity Recognition

##### Model type ENUMs

```json
{
    "model_type": "NER"
}
```

##### Prediction format

We take a classifier output un two different formats.

```json
// Simple
{
    "prediction": [{
        "class_name": "STRING",
        "confidence": "FLOAT",
        "start": "INT", // starting character index
        "end": "INT" // ending character index
    }, {...}]
}
```

```json
// Full
{
    "prediction": [{
        "class_names": ["STRING"], // all class names
        "confidences": ["FLOAT"], // confidence vector. Indexes must match the class names vector
        "logits": ["FLOAT"], // raw logits (before the softmax). Indexes must match the class names vector. Will be available for Activation based mining
        "start": "INT", // starting character index
        "end": "INT" // ending character index
    }, {...}]
}
```

##### Groudntruth format

```json
{
    "groundtruth":  [{
        "class_name": "STRING",
        "start": "INT", // starting character index
        "end": "INT" // ending character index
    }, {...}]
}
```

#### Learning to Rank

A datapoint represents a ranked query-document pair.

```json
    "text": "STRING", // the query against which the document has been ranked
    "embeddings": "", // 
    "prediction": {
        "relevance": "FLOAT"
    },
    "groundtruth": {
        "relevance": "FLOAT"
    },
    "features": [{ // the features describing this query-document pair
        "key": "STRING",
        "value": "FLOAT"
    }, {...}]
```
