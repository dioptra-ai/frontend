## Miners

Miners are jobs that can be run once or on a periodical basis to sample a set amount of data following a strategy. 
They are available under the miners API.

### Creating a miner 

To create a miner, call the miner API with the parameters corresponding to your strategy. 
The response is the miner UUID that can be used to check the miner status, logs and retreive results.

```python
## Request
import requests

r = requests.post('https://app.dioptra.ai/api/miners', headers={
   'content-type': 'application/json',
   'x-api-key': DIOPTRA_API_KEY
}, json={
   {
      'strategy': 'STRING',
      'size': 'INT', # number of samples to return
      ...
   }
})
```

### Checking the status of a miner 

```python
## Request
import requests

r = requests.get('https://app.dioptra.ai/api/miners/<miner_id>', headers={
   'content-type': 'application/json',
   'x-api-key': DIOPTRA_API_KEY
})
```

### Getting the list of all miners

```python
## Request
import requests

r = requests.get('https://app.dioptra.ai/api/miners', headers={
   'content-type': 'application/json',
   'x-api-key': DIOPTRA_API_KEY
})
```

### Getting results from a miner

```python
## Request
import requests

r = requests.get('https://app.dioptra.ai/api/datapoints?id=<miner_id>', headers={
   'content-type': 'application/json',
   'x-api-key': DIOPTRA_API_KEY
})
```