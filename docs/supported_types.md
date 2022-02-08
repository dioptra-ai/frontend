# Supported types

Dioptra supports the types below.
For more info about how to log each one of those types, see the [collector](collector.md)


## Model types

Dioptra supports several model types.
In order to use the logger, Dioptra expects the following schema for prediction and groundtruth

### Classifier


### Object Detection

#### Prediction

::: dioptra.schemas.object_detection_schema
    handler: python
    rendering:
      show_source: true

#### Groundtruth

::: dioptra.schemas.object_detection_schema
    handler: python
    rendering:
      show_source: true

### Question Answering

#### Prediction

::: dioptra.schemas.question_answering_prediction_schema
    handler: python
    rendering:
      show_source: true

#### Groundtruth

::: dioptra.schemas.question_answering_groundtruth_schema
    handler: python
    rendering:
      show_source: true

### Automated Speech Recognition

#### Prediction

::: dioptra.schemas.automated_speech_recogniton_schema
    handler: python
    rendering:
      show_source: true

#### Groundtruth

::: dioptra.schemas.automated_speech_recogniton_schema
    handler: python
    rendering:
      show_source: true

## Data

Dioptra supports several data types.
In order to use the logger, Dioptra expects the following schema for the data and metadata

### TABULAR

::: dioptra.schemas.feature_schema
    handler: python
    rendering:
      show_source: true

### Image

::: dioptra.schemas.image_metadata_schema
    handler: python
    rendering:
      show_source: true

::: dioptra.schemas.embeddings_schema
    handler: python
    rendering:
      show_source: true

### Text

::: dioptra.schemas.text_metadata_schema
    handler: python
    rendering:
      show_source: true

::: dioptra.schemas.embeddings_schema
    handler: python
    rendering:
      show_source: true

### Audio

::: dioptra.schemas.audio_metadata_schema
    handler: python
    rendering:
      show_source: true

::: dioptra.schemas.embeddings_schema
    handler: python
    rendering:
      show_source: true


## Tags

Dioptra ingests any sort of tag for slicing and dicing purposes
The schema is as follows

::: dioptra.schemas.tag_schema
    handler: python
    rendering:
      show_source: true
