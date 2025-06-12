import React from "react";
import { Modal, Button, Spinner } from "react-bootstrap";

function ConfirmModal({
  show,
  onHide,
  onConfirm,
  title = "Confirm Action",
  body = "Are you sure you want to proceed?",
  loading = false,
  confirmText = "Confirm",
  cancelText = "Cancel",
}) {
  return (
    <Modal show={show} onHide={onHide} centered>
      <Modal.Header closeButton>
        <Modal.Title>{title}</Modal.Title>
      </Modal.Header>

      <Modal.Body>{body}</Modal.Body>

      <Modal.Footer>
        <Button variant="secondary" onClick={onHide} disabled={loading}>
          {cancelText}
        </Button>
        <Button variant="primary" onClick={onConfirm} disabled={loading}>
          {loading ? (
            <>
              <Spinner
                as="span"
                animation="border"
                size="sm"
                role="status"
                aria-hidden="true"
                className="me-2"
              />
              Saving...
            </>
          ) : (
            confirmText
          )}
        </Button>
      </Modal.Footer>
    </Modal>
  );
}

export default ConfirmModal;
