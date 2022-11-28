### Authentication

Dioptra uses API Keys to authenticate data ingestion calls. To authenticate, you must include the `x-api-key` header in your request. You can generate and find your API key from the [Profile](/profile) page.

---

## Batch Ingestion API

Data can be sent to Dioptra via the Batch Ingestion API. This API is designed to be used when data is being generated in high volumes and stored in an object storage service such as S3.

### Request Format

Send a POST request with a JSON body to the `/events` endpoint. The JSON body should contain a `urls` list, containing urls of files to be ingested. Each file line should be in [supported format](/documentation/supported-types/).

### Data Encryption

We recommend you use private buckets to store your data and generate a presigned url to submit your data to Dioptra. 

* If you are using AWS S3, refer to the [AWS documentation](https://docs.aws.amazon.com/AmazonS3/latest/userguide/ShareObjectPreSignedURL.html) for more information.
* If you are using GCP, refer to the [GCP documentation](https://cloud.google.com/storage/docs/access-control/signed-urls) for more information.
* If you are using Azure, refer to the [Azure documentation](https://learn.microsoft.com/en-us/rest/api/storageservices/delegate-access-with-shared-access-signature) for more information.


### Example Request

```python
import requests

r = requests.post('https://api.dioptra.ai/events', headers={
    'content-type': 'application/json',
    'x-api-key': DIOPTRA_API_KEY
}, json={
    # See section above for more information on generating presigned urls.
    'urls': ['s3://signed-url/big-file.ndjson']
})
```

---

## Real-Time Ingestion API

Data can be sent to Dioptra via the Real-Time Ingestion API. This API is designed to be simple, and used when data is being generated in low to medium volumes and can be sent inline, in real-time.

### Request Format

Send a POST request with a JSON body to the `/events` endpoint. The JSON body should contain a `records` list, containing events in [supported format](/documentation/supported_types/).

### Example Request

```python
import requests


r = requests.post('https://api.dioptra.ai/events', headers={
    'content-type': 'application/json',
    'x-api-key': DIOPTRA_API_KEY
}, json={
    'records': [{...}, {...}, {...}]
})
```
