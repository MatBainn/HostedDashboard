import React from "react";
import { Container, Row, Col, Image } from "react-bootstrap";
import "../styles/StickyHeader.css";

const DEFAULT_AVATAR = "https://firebasestorage.googleapis.com/v0/b/handymanapplicationcos40006.firebasestorage.app/o/handyman-assets%2Fdefault-avatar-icon.jpg?alt=media&token=c3f57823-156c-460b-92e1-3f7df51941a3";

const StickyHeader = ({ currentUser, pageTitle }) => {
  return (
    <header className="sticky-header bg-white py-2 px-4 margin-bottom-4">
      <Container fluid>
        <Row className="align-items-center justify-content-between">
          <Col>
            <h2 className="mb-0">{pageTitle}</h2>
          </Col>
          <Col xs="auto" className="d-flex align-items-center gap-2">
            <i className="bi bi-bell-fill text-muted" style={{ fontSize: "1.2rem" }} />
            <span>{currentUser?.firstName}</span>
            <Image
              src={DEFAULT_AVATAR}
              roundedCircle
              width={36}
              height={36}
              alt="Profile"
            />
          </Col>
        </Row>
      </Container>
    </header>
  );
};

export default StickyHeader;
