const attachInteractionListeners = () => {
    ['.btn', 'a.cursor-pointer', '.tab'].forEach((selector) => {
        addEventListeners(selector);
    });
};

const addEventListeners = (selector) => {
    document.querySelectorAll(selector).forEach((element) => {
        if (element.getAttribute('listener') !== 'true') {
            element.addEventListener('click', (event) => {
                const elementClicked = event.currentTarget;

                elementClicked.setAttribute('listener', 'true');
                window.analytics.track(element.innerText, {});
            });
        }
    });
};

export default attachInteractionListeners;
