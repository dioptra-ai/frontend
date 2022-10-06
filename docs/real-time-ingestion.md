## Real-Time Ingestion API

Data can be sent to Dioptra via the Real-Time Ingestion API. This API is designed to be simple, and used when data is being generated in low to medium volumes and can be sent inline, in real-time.

### Authentication

Dioptra uses API Keys to authenticate data ingestion calls. To authenticate, you must include the `x-api-key` header in your request. You cangenrate and find your API key from the [Profile](/profile) page.

### Request Format

Send a POST request with a JSON body to the `/events` endpoint. The JSON body should contain a `records` list, containing events in [supported format](/documentation/supported_types/).

### Example Request

```python
import requests


r = requests.post('https://api.dioptra.ai/events', headers={
    'content-type': 'application/json',
    'x-api-key': DIOPTRA_API_KEY
}, json={
    'records': []
})
```
