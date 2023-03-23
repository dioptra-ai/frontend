import {postgresClient} from './index.mjs';
import SelectableModel from './selectable-model.mjs';

class Datapoint extends SelectableModel {
    static getTableName() {
        return 'datapoints';
    }

    static async upsertByEventUuids(organizationId, eventUuids) {
        const {rows: events} = await postgresClient.query(
            `SELECT DISTINCT request_id FROM events WHERE organization_id = $1 AND uuid IN (${eventUuids.map((_, i) => `$${i + 2}`).join(',')})`,
            [organizationId, ...eventUuids]
        );
        const rows = Datapoint.upsert(organizationId, events.map((event) => event['request_id']));

        return rows;
    }
}

export default Datapoint;
