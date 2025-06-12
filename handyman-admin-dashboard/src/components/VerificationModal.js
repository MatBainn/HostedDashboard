import React from "react";
import { Modal, Button, Form, Row, Col } from "react-bootstrap";

const VerificationModal = ({
  show,
  onHide,
  title,
  documentType,
  documentLinks = [],
  comments,
  setComments,
  isApproved,
  setIsApproved,
  onApprove,
  onDecline,
}) => {
  return (
    <Modal show={show} onHide={onHide} centered size="lg">
      <Modal.Header closeButton>
        <Modal.Title>{title} Verification</Modal.Title>
      </Modal.Header>

      <Modal.Body>
        <h6 className="mb-3">Document Preview</h6>
        <Row className="mb-4">
          {documentLinks.map((link, index) => (
            <Col md={6} key={index}>
              {link?.endsWith(".pdf") ? (
                <a href={link} target="_blank" rel="noopener noreferrer">
                  View PDF Document {index + 1}
                </a>
              ) : (
                <img
                  src={link}
                  alt={`Document ${index + 1}`}
                  className="img-fluid rounded border mb-2"
                  style={{ maxHeight: "250px", width: "100%", objectFit: "cover" }}
                />
              )}
            </Col>
          ))}
        </Row>

        <Form.Group className="mb-3">
          <Form.Check
            label={`I have reviewed the ${documentType} and confirm it's valid.`}
            checked={isApproved}
            onChange={(e) => setIsApproved(e.target.checked)}
          />
        </Form.Group>

        <Form.Group>
          <Form.Label>Admin Comment</Form.Label>
          <Form.Control
            as="textarea"
            rows={3}
            placeholder="Optional comment..."
            value={comments}
            onChange={(e) => setComments(e.target.value)}
          />
        </Form.Group>
      </Modal.Body>

      <Modal.Footer>
        <Button variant="danger" onClick={onDecline}>
          Decline
        </Button>
        <Button variant="success" onClick={onApprove}>
          Approve
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default VerificationModal;
