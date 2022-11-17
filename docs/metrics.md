## Metrics endpoints

Computing a metrics with Dioptra is as simple as running a post request  
Data is selected using the [data selector](/documentation/querying-getting-started/)  
We also request a `model_type` parameter to be passed as some metrics can be computed differently based on context  

```python
## Available metrics endpoint names are
count
accuracy
precision
recall
f1-score
map
mar
word-error-rate
exact-match
spearman-cosine
pearson-cosine
confidence
entropy
```

```python
## Request
import requests

r = requests.post('https://app.dioptra.ai/api/metrics/<endpoint_name>', headers={
   'content-type': 'application/json',
   'x-api-key': DIOPTRA_API_KEY
}, json={
   {
    "model_type": "MODEL_TYPE",
    'filters': [...],
    'limit': ...,
    'order_by': ...,
    'desc': ...
   }
})
```