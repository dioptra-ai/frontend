## Writing a Data Mapping module for Asynchronous Data Sources

Data Mapping modules are used to transform data into a format supported by Dioptra (see [documentation](/documentation/supported-types/)).

### Supported 3rd party modules
* pandas
* numpy

### Module Definition

The module should be written in Python >=3.9 and will be imported and run on the Dioptra platform to transform data received. It should be accessible via a public URL (preferably version-controlled) such as a GitHub repo.

The top-level module should contain a function called `transform` that takes a single argument `batch`. `batch` will be a list of strings, each a line taken from the data source. The module should parse the data and return a list of objects in the format described in the [documentation](/documentation/supported-types/).

> Note: `batch` may have an arbitrary number of lines, which may not correspond to how the data was sent to the data source.

### Example: Reading CSV data

```python
from io import StringIO
import pandas as pd

def transform(batch):
    csv = StringIO('\n'.join(batch))
    df = pd.read_csv(csv, names=['col1', 'col2', 'col3'])

    return df.to_dict(orient='records')
```
