import {useEffect, useState} from 'react';

const useModal = (initial) => {
    const [modal, setModal] = useState(initial);

    useEffect(() => {
        if (modal) {
            document.querySelector('html').style.overflow = 'hidden';
            document.querySelector('html').style.paddingRight = '15px';
        } else {
            document.querySelector('html').style.overflow = 'auto';
            document.querySelector('html').style.paddingRight = 0;
        }
    }, [modal]);

    return [modal, (value) => setModal(value)];
};

export default useModal;
