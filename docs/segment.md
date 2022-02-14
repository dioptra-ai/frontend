## Getting Started
Before you start, make sure Dioptra supports the source type and connection mode you’ve chosen to implement. You can learn more about [connection modes here](https://segment.com/docs/connections/destinations/#connection-modes).

| |Web|Mobile|Server|
|---|---|---|---|
|📱 Device-mode|⬜️|⬜️|⬜️|
|☁️ Cloud-mode|✅|✅|✅|

1. From the Segment web app, click Catalog.
2. Search for “Dioptra” in the Catalog, select it, and choose which of your sources to connect the destination to.
3. In the destination settings, enter your Dioptra API Key. Once destination enabled we’ll start forwarding your calls to Dioptra.
4. `Map Track Events`: Enter the Segment .track() event names that will be processed by Dioptra

## Event Properties
* By default, the [`properties` field](https://segment.com/docs/connections/spec/track/#properties) of the Segment `.track()` event will be mapped to the Dioptra API fields.
* Optionally, the following fields will be taken from [`context.traits`](https://segment.com/docs/connections/spec/identify/#traits) (from `.track()` or `.identify()`):
    * `model_id`: `String`
    * `model_version`: `String`
    * `tags`: `Object`
* Optionally, from the Segment App, in the Dioptra Destination Settings, enter the Segment `.track()` properties that will be mapped to Dioptra 
`tags` and `features`.
