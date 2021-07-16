import {useEffect, useState} from 'react';

const useModal = (initial) => {
    const [modal, setModal] = useState(initial);

    useEffect(() => {
        if (modal) {
            document.querySelector('html').style.overflow = 'hidden';
        } else {
            document.querySelector('html').style.overflow = 'auto';
        }
    }, [modal]);

    return [modal, (value) => setModal(value)];
};

export default useModal;
