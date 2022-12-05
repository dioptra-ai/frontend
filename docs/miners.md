## Miners

Miners are jobs that can be run once or on a periodical basis to sample a set amount of data following a strategy.

### Creating a miner

To create a miner, you can either use ouf Python SDK or call the miner API with the parameters corresponding to your strategy.
If using the API, the response is the miner UUID that can be used to check the miner status, logs and retrieve results.

```python

# JSON Response
# {"miner_id":"638582968c17be2cc105122b"}

```

We currently support 4 miner types:

#### `strategy: ENTROPY`

::: dioptra.miners.entropy_miner.EntropyMiner
    handler: python
    rendering:
      show_source: true

or with our API

```python
## Request
import requests

r = requests.post('https://app.dioptra.ai/api/miners', headers={
   'content-type': 'application/json',
   'x-api-key': DIOPTRA_API_KEY
}, json={
   {
      'strategy': 'ENTROPY',
      'size': 'INT', # number of samples to return
      'select': {
         'filters': [...],
         'limit': ...,
         'order_by': ...,
         'desc': ...,
      }
   }
})
```

#### `strategy: ACTIVATION`

::: dioptra.miners.actvation_miner.ActivationMiner
    handler: python
    rendering:
      show_source: true

or with our API

```python
## Request
import requests

r = requests.post('https://app.dioptra.ai/api/miners', headers={
   'content-type': 'application/json',
   'x-api-key': DIOPTRA_API_KEY
}, json={
   {
      'strategy': 'ACTIVATION',
      'size': 'INT', # number of samples to return
      'embeddings_field': 'STRING', # embeddings field to be used. Can be 'embeddings', 'prediction.embeddings' or logits
      'select': {
         'filters': [...],
         'limit': ...,
         'order_by': ...,
         'desc': ...,
      }
   }
})
```

#### `strategy: NEAREST_NEIGHBORS`
Required parameters:
   * `select_reference`: datapoints to use as reference.

::: dioptra.miners.knn_miner.KNNMiner
    handler: python
    rendering:
      show_source: true

```python
## Request
import requests

r = requests.post('https://app.dioptra.ai/api/miners', headers={
   'content-type': 'application/json',
   'x-api-key': DIOPTRA_API_KEY
}, json={
   {
      'strategy': 'NEAREST_NEIGHBORS',
      'size': 'INT', # number of samples to return
      'embeddings_field': 'STRING', # embeddings field to be used. Can be 'embeddings' or 'prediction.embeddings'
      'select': {
         'filters': [...],
         'limit': ...,
         'order_by': ...,
         'desc': ...,
      },
      'select_reference': {
         'filters': [...],
         'limit': ...,
         'order_by': ...,
         'desc': ...
      }
   }
})
```

#### `strategy: CORESET`
Required parameters:
   * `select_reference`: datapoints to use as reference.

::: dioptra.miners.coreset_miner.CoresetMiner
    handler: python
    rendering:
      show_source: true

or with our API

```python
## Request
import requests

r = requests.post('https://app.dioptra.ai/api/miners', headers={
   'content-type': 'application/json',
   'x-api-key': DIOPTRA_API_KEY
}, json={
   {
      'strategy': 'CORESET',
      'size': 'INT', # number of samples to return
      'embeddings_field': 'STRING', # embeddings field to be used. Can be 'embeddings' or 'prediction.embeddings'
      'select': {
         'filters': [...],
         'limit': ...,
         'order_by': ...,
         'desc': ...,
      },
      'select_reference': { # Optional parameter. Can be used to identify datapoints already selected in the dataset
         'filters': [...],
         'limit': ...,
         'order_by': ...,
         'desc': ...
      }
   }
})
```

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
