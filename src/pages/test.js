import Expandable from '../components/expandable';
import Incident from '../components/incident';

const incident = {
    name: 'Some incident name',
    resolved: true,
    subIncidents: [
        {
            name: 'Some incident name',
            resolved: true
        },
        {
            name: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Quisque bibendum sem eget convallis malesuada. Quisque accumsan nisi ut ipsum tincidunt, a posuere nisi viverra. Quisque a lorem tellus.',
            resolved: false
        }
    ]
};

export default () => {
    return (
        <div
            style={{
                width: '60%',
                margin: 'auto',
                padding: '50px',
                backgroundColor: 'white'
            }}
        >
            <Expandable
                content={
                    <Incident
                        fullwidth={true}
                        name={incident.name}
                        resolved={incident.resolved}
                    />
                }
                expandedContent={incident.subIncidents.map((incident, i) => (
                    <Incident
                        borderBottom
                        fullwidth={false}
                        key={i}
                        name={incident.name}
                        resolved={incident.resolved}
                    />
                ))}
            />
        </div>
    );
};
