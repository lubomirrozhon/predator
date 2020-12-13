import React,{useState} from 'react';
import {Modal, Button} from 'react-bootstrap';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import {faRetweet} from '@fortawesome/free-solid-svg-icons';

export const RepeatTest = () => {
    let [showModal, setShow] = useState(false);

    const openModalWindow = () => {
        setShow(true);
    };

    const closeModalWindow = () => {
        setShow(false);
    };

    return (
        <>
            <div style={{ borderLeft: '1px solid #8080803b',
                paddingLeft: '1em',
                paddingRight: '0.1em'}}
                 onClick={openModalWindow}>
                <div style={{marginTop: '0.7em',
                    marginRight: '0.9em'}}>
                    <FontAwesomeIcon icon={faRetweet} />
                </div>
            </div>
            <Modal show={showModal}
                   onHide={closeModalWindow}
                   animation={false}>
                <Modal.Header closeButton>
                    <Modal.Title>Try Out Test</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <input placeholder="test"
                           style={{padding: "10px",
                               border: "2px solid #eee"}}
                           name="repeat" />
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary"
                            onClick={closeModalWindow}>
                        Close
                    </Button>
                    <Button variant="primary"
                            onClick={closeModalWindow}>
                        TryIt
                    </Button>
                </Modal.Footer>
            </Modal>
        </>

    );
}
