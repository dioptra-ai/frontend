# Datapoint Types

Datapoints are the core element of a dataset. Each datapoint describes a single piece of data and can contain the following fields:

```json
{
    "timestamp": "TIMESTAMP", // default: ingestion time

    "dataset_id": "STRING",
    "benchmark_id": "STRING",

    "tags": {"STRING": "STRING"}, // key-value pairs for arbitrary metadata
    "image_metadata": { // metadata about the image described by this datapoint
        "width": "INT",
        "height": "INT",
        "uri": "STRING"
    },
    "video_metadata": { // metadata about the video frame described by this datapoint
        "width": "INT",
        "height": "INT",
        "uri": "STRING",
        "frame": "INT",
        "frame_rate": "FLOAT"
    },
    "audio_metadata": { // metadata about the audio sample described by this datapoint
        "uri": "STRING",
        "duration": "FLOAT",
        "sampling_rate": "INT",
        "start_time": "FLOAT",
        "end_time": "FLOAT"
    },
    "text": "STRING",
    "text_metadata": { // metadata about the text described by this datapoint
        "uri": "STRING"
    },
    // a 1D, 2D or 3D array of floats for the prediction described by this datapoint.
    // 3D embeddings enable dynamic roi-pooling analyses.
    "embeddings": [],

    // An identifier for the request that generated this datapoint.
    "request_id": "STRING", // default: uuid4()
    "model_id": "STRING", // the model that generated this datapoint
    "model_version": "STRING", // the model version that generated this datapoint
    "prediction": {
        "class_name": "STRING",
        "confidence": "FLOAT",
        "logits": ["FLOAT"],
        "confidences": ["FLOAT"],
        "entropy": "FLOAT", // auto-generated
        "ratio_of_confidence": "FLOAT", // auto-generated
        "margin_of_confidence": "FLOAT", // auto-generated
        // See below for additional optional fields.
    },
    "groundtruth":  {
        "class_name": "STRING"
        // See below for additional optional fields.
    }
}
```

## Model Types

Dioptra accepts optional prediction and groundtruth fields for some models types. These fields are used to generate additional metrics and visualizations.

### Classifiers

```json
    {
        "prediction": {
            "class_name": "STRING",
            "confidence": "FLOAT"
        },
        "groundtruth":  {
            "class_name": "STRING"
        }
    }
```

### Name Entity Recognition

For `class_name` the following schemes are supported for metrics computation: IOB1, IOB2, IOE1, IOE2, IOBES, BILOU.
Predictions will be matched to same-index ground-truths.

```json
    {
        "prediction": [{
            "class_name": "STRING",
            "confidence": "FLOAT",
            "start": "INT", // starting character index
            "end": "INT" // ending character index
        }, {...}],
        "groundtruth":  [{
            "class_name": "STRING",
            "start": "INT", // starting character index
            "end": "INT" // ending character index
        }, {...}]
    }
```

### Object Detection

In a datapoint, each element of the `prediction` and `groundtruth` lists describes a single object in the image.
Predictions and ground-truths with the highest IoUs will be matched first.

```json
    "prediction": [{
        "class_name": "STRING",
        "confidence": "FLOAT",
        "top": "INTEGER", // top left pixel coordinate of the bounding box
        "left": "INTEGER", // top left pixel coordinate of the bounding box
        "height": "INTEGER", // pixel height of the bounding box
        "width": "INTEGER", // pixel width of the bounding box
        "embeddings": "ARRAY", // auto-generated
        "objectness": "FLOAT"
    }, {...}],
    "groundtruth": [{
        "class_name": "STRING",
        "top": "INTEGER", // top left pixel coordinate of the bounding box
        "left": "INTEGER", // top left pixel coordinate of the bounding box
        "height": "INTEGER", // pixel height of the bounding box
        "width": "INTEGER", // pixel width of the bounding box
    }, {...}]
```

### Learning to Rank

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
