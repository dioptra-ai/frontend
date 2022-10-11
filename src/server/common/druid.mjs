import fetch from 'node-fetch';

class DruidClient {

    // eslint-disable-next-line class-methods-use-this
    async execute(query) {
        console.log('Executing Druid SQL Query:');
        console.log(query);

        const result = await fetch(`${process.env.TIME_SERIES_DB}/druid/v2/sql/`, {
            method: 'post',
            body: JSON.stringify({query}),
            headers: {'Content-Type': 'application/json'}
        });

        return result.json();
    }

    getOnlineClassDistribution(model, classSource, from, to) {
        return this.execute(`select cast(my_table.my_count as float) / cast(my_count_table.total_count as float) as my_percentage, 
                my_table.${classSource}
            from (
                SELECT count(*) as my_count, ${classSource}, 1 as join_key
                FROM "${process.env.TIME_SERIES_DATA_SOURCE}"
                WHERE __time >= TIMESTAMP '${from}' AND __time <= TIMESTAMP '${to}'
                AND model_id = '${model}'
                GROUP BY 2
            ) as my_table
            join (
                SELECT count(*) as total_count, 1 as join_key
                FROM "${process.env.TIME_SERIES_DATA_SOURCE}"
                WHERE __time >= TIMESTAMP '${from}' AND __time <= TIMESTAMP '${to}'
                AND model_id = '${model}'
            ) as my_count_table
            on my_table.join_key = my_count_table.join_key`);
    }

    getTimeSeriesClassDistribution(model, classSource, from, to, period) {
        return this.execute(`select my_table.my_time as "timestamp", cast(my_table.my_count as float) / cast(my_count_table.total_count as float) as "value", 
                my_table.${classSource}
            from (
                SELECT floor(__time to ${period}) as my_time, count(1) as my_count, ${classSource}
                FROM "${process.env.TIME_SERIES_DATA_SOURCE}"
                WHERE __time >= TIMESTAMP '${from}' AND __time <= TIMESTAMP '${to}'
                AND model_id = '${model}'
                GROUP BY 1, 3
            ) as my_table
            join (
                SELECT floor(__time to ${period}) as my_time, count(*) as total_count
                FROM "${process.env.TIME_SERIES_DATA_SOURCE}"
                WHERE __time >= TIMESTAMP '${from}' AND __time <= TIMESTAMP '${to}'
                AND model_id = '${model}'
                GROUP BY 1
            ) as my_count_table
            on my_table.my_time = my_count_table.my_time`);
    }
}

export {DruidClient};
