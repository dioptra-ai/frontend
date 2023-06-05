import React, {useEffect} from 'react';
import {useHistory, useLocation} from 'react-router-dom';
import Joyride, {ACTIONS, EVENTS, STATUS} from 'react-joyride';

const GuidedTour = () => {
    const [stepIndex, setStepIndex] = React.useState(0);
    const [runJoyride, setRunJoyride] = React.useState(false);
    const history = useHistory();
    const location = useLocation();
    const handleJoyrideCallback = React.useCallback(({action, index, status, type}) => {
        if ([EVENTS.STEP_AFTER, EVENTS.TARGET_NOT_FOUND].includes(type)) {
            setStepIndex(index + (action === ACTIONS.PREV ? -1 : 1));
        } else if ([STATUS.FINISHED, STATUS.SKIPPED].includes(status)) {
            handleRunJoyride(false);
            setStepIndex(0);
        }
    }, []);
    const runJoyrideRef = React.useRef(runJoyride);
    const handleRunJoyride = (run) => {
        runJoyrideRef.current = run;
        setRunJoyride(run);
    };

    useEffect(() => {
        const clickListener = (event) => {
            if (event.target.id === 'joyride-0') {
                setStepIndex(1);
            } else if (event.target.id === 'joyride-1') {
                setStepIndex(2);
            }
        };
        const changeListener = (event) => {
            if (event.target.id === 'joyride-2') {
                setStepIndex(3);
            }
        };
        const historyUnlistener = history.listen((location) => {
            if (location.pathname.startsWith('/settings/uploads') && runJoyrideRef.current === true) {
                setStepIndex(4);
            } else if (location.pathname.startsWith('/data-lake') && runJoyrideRef.current === true) {
                setStepIndex(5);
            } else {
                handleRunJoyride(false);
                setStepIndex(0);
            }
        });

        window.addEventListener('click', clickListener);
        window.addEventListener('change', changeListener);

        return () => {
            window.removeEventListener('click', clickListener);
            window.removeEventListener('change', changeListener);
            historyUnlistener();
        };
    }, []);

    useEffect(() => {
        const interval = setInterval(() => {
            const firstElement = document.querySelector('#joyride-0');

            if (firstElement && stepIndex === 0) {
                handleRunJoyride(true);
                setTimeout(() => {
                    document.querySelector('.react-joyride__beacon').click();
                }, 100);
                clearInterval(interval);
            }
        }, 250);

        return () => clearInterval(interval);
    }, [location.pathname]);

    return runJoyride && (
        <Joyride
            callback={handleJoyrideCallback}
            continuous
            run
            scrollToFirstStep
            showProgress
            showSkipButton
            spotlightClicks
            steps={[{
                target: '#joyride-0',
                // "Download sample data" link.
                content: 'Let\'s start simple: download some sample data to work with.'
            }, {
                target: '#joyride-1',
                // Upload Data button.
                content: 'Now let\'s upload it to the Data Lake.',
                hideFooter: true
            }, {
                target: '#joyride-2',
                // "Choose File" button.
                content: 'Find the file on your local machine.',
                hideFooter: true
            }, {
                target: '#joyride-3',
                // "Submit" button.
                content: 'Great! Now click the "Submit" button to upload the file to the Data Lake.',
                hideFooter: true
            }, {
                target: '#joyride-4',
                // "Data Lake" menu link.
                content: 'Now that we sent some data to the Data Lake, let\'s go explore it.',
                hideFooter: true
            }, {
                target: '#joyride-5',
                // "Data Lake" page.
                content: 'It can take a few seconds for the data to be ingested. When the Data Lake is empty, click on "Reload" to load the latest data.'
            }]}
            stepIndex={stepIndex}
            styles={{
                options: {
                    arrowColor: '#fff',
                    backgroundColor: '#fff',
                    beaconSize: 36,
                    overlayColor: 'rgba(0, 0, 0, 0.5)',
                    primaryColor: '#000',
                    textColor: '#333',
                    zIndex: 1000
                }
            }}
        />
    );
};

export default GuidedTour;
