## Getting your API key

To get an API key, navigate to you profile and click `Create API Key`. Alternatively, send us an email et hello@dioptra.ai and we'll get you set up.

### Uploading your first datapoints to the lake

```python
from dioptra.lake.utils import upload_to_lake
os.environ['DIOPTRA_API_KEY'] = DIOPTRA_API_KEY

upload_to_lake(
    [{
        'model_id': 'cat_dog_classifier',
        'prediction': {
            'class_name': 'DOG',
            'confidence': 0.9
        },
        'groundtruth': {
            'class_name': 'CAT'
        },
        'tags': {
            'ApertureValue': '45/8',
            'DateTimeOriginal': '2008:05:30 15:56:01'
        },
        'embeddings': [100, 200, 300, 400, 500, 600, 700, 800, 900, 1000],
        'image_metadata': {
            'width': 1280,
            'height': 853,
            'uri': 'http://cdn.pixabay.com/photo/2014/11/30/14/11/cat-551554_1280.jpg'
        }
    }])

```

or using our API

```python
import os
import requests

DIOPTRA_API_KEY = os.environ['DIOPTRA_API_KEY']

r = requests.post('https://api.dioptra.ai/events', headers={
    'content-type': 'application/json',
    'x-api-key': DIOPTRA_API_KEY
}, json={
    'records': [
        {
            'model_id': 'cat_dog_classifier',
            'prediction': {
                'class_name': 'DOG',
                'confidence': 0.9
            },
            'groundtruth': {
                'class_name': 'CAT'
            },
            'tags': {
                'ApertureValue': '45/8',
                'DateTimeOriginal': '2008:05:30 15:56:01'
            },
            'embeddings': [100, 200, 300, 400, 500, 600, 700, 800, 900, 1000],
            'image_metadata': {
                'width': 1280,
                'height': 853,
                'uri': 'http://cdn.pixabay.com/photo/2014/11/30/14/11/cat-551554_1280.jpg'
            }
        }
    ]
})
```

Congrats, you logged your first event!

### Visualizing your Data

* Log back into Dioptra
* Filter your data by entering `groundtruth = "CAT"` in the filters bar
* Click on the confusion matrix to visualize the cats that have been miscassified
* Browse your data under `Data Explorer` > `Data Viewer`
* Cluster your data under `Data Explorer` > `Clustering`
* Find outliers under `Data Explorer` > `Outlier Detection`
