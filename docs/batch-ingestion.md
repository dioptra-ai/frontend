## Batch Ingestion API

Data can be sent to Dioptra via the Batch Ingestion API. This API is designed to be used where data is being generated in high volumes and stored in an object storage service such as S3 before being ingested into Dioptra.

### Authentication

Dioptra uses API Keys to authenticate data ingestion calls. To authenticate, you must include the `x-api-key` header in your request. You cangenrate and find your API key from the [Profile](/profile) page.

### Request Format

Send a POST request with a JSON body to the `/events` endpoint. The JSON body should contain a `urls` list, containing urls of files to be ingested. Each file line should be in [supported format](/documentation/supported_types/).

### Example Request

```python
import requests


r = requests.post('https://api.dioptra.ai/events', headers={
    'content-type': 'application/json',
    'x-api-key': DIOPTRA_API_KEY
}, json={
    'urls': ['s3://my-bucket/big-file.ndjson']
})
```
