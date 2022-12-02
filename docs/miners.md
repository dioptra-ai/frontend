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
   "display_name": "8 Cats that look like dogs",
   "strategy": "NEAREST_NEIGHBORS", # See Strategies below.
   "metric": "euclidean",
   "size": 8,
   "embeddings_field": "embeddings", # "embeddings", "prediction.embeddings", etc
   "select: {
      "filters": [{
         "left": "groundtruth.class_name",
         "op": "=",
         "right": "cat"
      }]
   },
   "select_reference": {
      "filters": [{
         "left": "groundtruth.class_name",
         "op": "=",
         "right": "dog"
      }]
   }
})

# JSON Response
# {"miner_id":"638582968c17be2cc105122b"}

```

### Miner Strategies

#### `strategy: NEAREST_NEIGHBORS`
Required parameters:
   * `select_reference`: datapoints to use as reference.

#### `strategy: CORESET`
Required parameters:
   * `select_reference`: datapoints to use as reference.

#### `strategy: ENTROPY`

#### `strategy: ACTIVATION`
   

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
