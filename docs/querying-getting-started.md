## Getting started with querying

Dioptra offers a comprehensive set of APIs to execute metadata, metrics and ML queries.

### Data selector

All Dioptra APIs leverage the same data selector.

```json
{
    "filters": [{
        "left": "STRING", // field
        "operator": ["<", "<=", ">", ">=", "=", "!=", "in", "not in", "like", "not like"],
        "right": "STRING" // field or value
    }, {...}],
    "limit": "INT",
    "order_by": "STRING", // field
    "desc": "BOOLEAN"
}
```

`filters` is the main object. It is a list of conditions that will be applied to the data  
`left` is always a field value  
`right` can be a value or a field. Field names should be enclosed in double quotes, values in single quotes  
`limit` can be used to limit the amount of data in the selection and can be combined with `order_by` and `desc` to control the selection 

The fields can be any metadata and heuristics pre computed at a datapoint level during ingestion.
They include some active learning metrics:

```python
prediction.confidence
prediction.entropy
prediction.confidence.variance
prediction.box.variance
```

### The select endpoint

The most basic way to query data is using the select endpoint.
This is essentially a SQL query running on your data.

```python
## Request
import requests

r = requests.post('https://app.dioptra.ai/api/metrics/select', headers={
   'content-type': 'application/json',
   'x-api-key': DIOPTRA_API_KEY
}, json={
   {
      'select': ["STRING"], # list of fields to be retreived
      'filters': [...],
      'limit': ...,
      'order_by': ...,
      'desc': ...
   }
})
```
