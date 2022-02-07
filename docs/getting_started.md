## Getting your API key

To get an API key, navigate to you profile and click `Create API Key`

## Setting up your collector

The Dioptra collector can be used to start logging events to the platform.

### Install Library

Install the Dioptra library in an environment using Python > 3.5.3.
```sh
$ pip3 install dioptra
```

Or clone the repo:
```sh
$ git clone https://github.com/dioptra-ai/collector-py.git
$ python3 setup.py install
```

### Logging your first event

```python
import datetime
import uuid
from dioptra.api import Logger

dioptra_logger = Logger(api_key=API_KEY)

dioptra_logger.commit(
    model_id='my_model_id',
    model_version='v1.1',
    timestamp=datetime.datetime.utcnow()
    request_id=str(uuid.uuid4()),
    prediction='cat',
    groundtruth='dog',
    confidence=0.9,
    embeddings=[0.9, -1.8, 0.46],
    image_metadata={
        'uri': 'https://cdn.pixabay.com/photo/2014/11/30/14/11/cat-551554_1280.jpg'
    },
    tags={
        'source': 'pixabay'
    })
```

Congrats, you logged your first event !


## Setting up a model

Now that your first event is logged, you can register your first model.

In `model` page, click `Register Model`

- `model id` enter `my_model_id`
- `model name` enter `Cat detector`
- `Description` enter `My first model monitored with Dioptra`
- `Model type` select `Image Classifier`

Hit `Create Model`

And you're done !
