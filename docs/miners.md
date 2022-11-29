## Miners

Miners are jobs that can be run once or on a periodical basis to sample a set amount of data following a strategy. 
They are available under the miners API.

### Creating a miner 

To create a miner, call the miner API with the parameters corresponding to your strategy. 
The response is the miner UUID that can be used to check the miner status, logs and retrieve results.

```python
import requests

r = requests.post('https://app.dioptra.ai/api/tasks/miners', headers={
   'content-type': 'application/json',
   'x-api-key': DIOPTRA_API_KEY
}, json={
    "uuids": [ # Reference datapoints - see Strategies below.
        "a13b09be-df6a-41a8-83e2-834edc128297",
        "9059e988-1091-4487-aa26-bd9398bac246",
        "914e550d-f2a6-42d2-bfca-a6eb95d931d3",
        "807c8462-8fe4-47bd-93b5-b4712c0b3ad5",
        "d5fb01ce-2e28-48d3-be1a-bfb05ca89bd7"
    ],
    "display_name": "My Miner",
    "ml_model_id": "model_foo",
    "strategy": "NEAREST_NEIGHBORS", # See Strategies below.
    "duplication_factor": 1,
    "metric": "euclidean",
    "limit": 8,
    "embeddings_field": "embeddings", # "embeddings", "prediction.embeddings", etc.
    "filters": [{...}],
    "start_time": "2022-11-22T03:54:59.427Z", # Start of the time range to mine.
    "end_time": "2022-11-29T03:54:59.427Z", # End of the time range to mine.
    "evaluation_period": null # ISO 8601 duration for periodic miners. If null, the miner will run once.
})

# JSON Response
# {"miner_id":"638582968c17be2cc105122b"}

```

### Strategies and Parameters

#### `NEAREST_NEIGHBORS`, `CORESET`
Required parameters:
   * `uuids`: datapoints uuids to use as reference.
   * `ml_model_id`: the model that generated the embeddings that will be mined.

#### `ENTROPY`, `ACTIVATION`
Required parameters:
   * `ml_model_id`: the model that generated the embeddings that will be mined.

---

### Retrieving the configuration of a miner 

```python
import requests

r = requests.get('https://app.dioptra.ai/api/tasks/miners/<miner_id>', headers={
   'content-type': 'application/json',
   'x-api-key': DIOPTRA_API_KEY
})
```

### Retrieving the execution status of a miner

```python
import requests

r = requests.get('https://app.dioptra.ai/api/tasks/miners/inspect/<miner_id>', headers={
   'content-type': 'application/json',
   'x-api-key': DIOPTRA_API_KEY
})
```

### Getting the list and status of all miners

```python
import requests

r = requests.get('https://app.dioptra.ai/api/tasks/miners', headers={
   'content-type': 'application/json',
   'x-api-key': DIOPTRA_API_KEY
})
```

### Getting results from a miner

```python
import requests

# results are in JSON format by default but can be returned
# as CSV by setting the `as_csv` query parameter to anything.
r = requests.get('https://app.dioptra.ai/api/tasks/miners/<miner_id>?as_csv=yep', headers={
   'content-type': 'application/json',
   'x-api-key': DIOPTRA_API_KEY
})
```
