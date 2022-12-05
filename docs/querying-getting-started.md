## Getting started with the lake

Dioptra offers a comprehensive set of APIs to execute metadata, metrics and ML queries on its data lake.

### Data selector

All Dioptra APIs leverage the same data selector.

```json
{
    "filters": [{
        "left": "STRING", // field
        "op": ["<", "<=", ">", ">=", "=", "!=", "in", "not in", "like", "not like"],
        "right": "STRING" // field or value
    }, {...}],
    "limit": "INT", // maximum number of rows to return
    "order_by": "STRING", // field name
    "desc": "BOOLEAN" // descending order
}
```

`filters` is a list of conditions that will be ANDed to filter the data
`left` is always a field value
`right` can be a value or a field. Field names should be enclosed in double quotes, and values in single quotes.
`limit` can be used to limit the amount of data in the selection and can be combined with `order_by` and `desc` to control the selection.

The fields can be any metadata and heuristics pre computed at a datapoint level during ingestion.
They include some active learning metrics:

```python
prediction.confidence
prediction.entropy
prediction.confidence.variance
prediction.box.variance
```

### Downloading data from the lake

The most basic way to query data is using the `download_from_lake` utility
This is essentially a SQL query running on your data.

::: dioptra.lake.utils.download_from_lake
    handler: python
    rendering:
      show_source: true

You can also use the API directly

```python
## Request
import requests

r = requests.post('https://app.dioptra.ai/api/metrics/select', headers={
   'content-type': 'application/json',
   'x-api-key': DIOPTRA_API_KEY
}, json={
   {
      'select': "STRING", # a coma separated list of fields to be retreived
      'filters': [...],
      'limit': ...,
      'order_by': ...,
      'desc': ...
   }
})
```
