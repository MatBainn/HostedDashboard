import React, { useState } from "react";
import { Table, Form, Button, Badge, Modal, Alert } from "react-bootstrap";
import emailjs from "@emailjs/browser";
import feedbackData from "../data/feedbackData";
import PaginationControls from "../components/PaginationControls"; 
import StickyHeader from "../components/StickyHeader";

function SupportFeedback() {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [filterCategory, setFilterCategory] = useState("");
  const [tickets, setTickets] = useState(feedbackData);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [replyMessage, setReplyMessage] = useState("");
  const [notification, setNotification] = useState({
    show: false,
    message: "",
    variant: "",
  });
  const [isSending, setIsSending] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
const entriesPerPage = 10; // You can adjust to 10, 15, 20

const currentUser = JSON.parse(localStorage.getItem("currentUser"));


const filteredAllTickets = tickets.filter((ticket) => {
  const lowerSearch = searchTerm.toLowerCase();

  const matchesSearch =
    ticket.id.toString().toLowerCase().includes(lowerSearch) ||
    ticket.user.toLowerCase().includes(lowerSearch);

  const matchesStatus = filterStatus === "" || ticket.status === filterStatus;
  const matchesCategory = filterCategory === "" || ticket.category === filterCategory;

  return matchesSearch && matchesStatus && matchesCategory;
});

// Pagination logic: slice tickets to show only for current page
const indexOfLastEntry = currentPage * entriesPerPage;
const indexOfFirstEntry = indexOfLastEntry - entriesPerPage;
const currentTickets = filteredAllTickets.slice(indexOfFirstEntry, indexOfLastEntry);


  const getStatusBadge = (status) => {
    switch (status) {
      case "Open":
        return <Badge bg="primary">Open</Badge>;
      case "In Progress":
        return (
          <Badge bg="warning" text="dark">
            In Progress
          </Badge>
        );
      case "Resolved":
        return <Badge bg="success">Resolved</Badge>;
      case "Closed":
        return <Badge bg="secondary">Closed</Badge>;
      default:
        return <Badge bg="light">Unknown</Badge>;
    }
  };

  const handleView = (ticket) => {
    setSelectedTicket(ticket);
    setReplyMessage("");
    setShowModal(true);
  };

  const handleClose = () => {
    setShowModal(false);
    setSelectedTicket(null);
    setReplyMessage("");
  };

  const handleReply = (e) => {
    e.preventDefault();
  
    if (selectedTicket && replyMessage.trim() !== "" && !isSending) {
      setIsSending(true); // disable multiple clicks
  
      const templateParams = {
        user: selectedTicket.user,
        user_email: selectedTicket.email,
        subject: selectedTicket.subject,
        message: selectedTicket.message,
        category: selectedTicket.category,
        date: selectedTicket.date,
        response: replyMessage,
        time: new Date().toLocaleString()
      };
  
      emailjs.send(
        "service_atdlzb4",
        "template_p9jpaw9",
        templateParams,
        "I6CD2UFXfVfbcm238"
      )
      .then(() => {
        const updatedTickets = tickets.map((ticket) =>
          ticket.id === selectedTicket.id
            ? { ...ticket, response: replyMessage, status: "In Progress" }
            : ticket
        );
        setTickets(updatedTickets);
        setSelectedTicket({ ...selectedTicket, response: replyMessage, status: "In Progress" });
  
        // ✅ Show Success
        setNotification({
          show: true,
          message: `✅ Reply to #${selectedTicket.id} successfully sent!`,
          variant: "success"
        });
  
        setReplyMessage("");
      })
      .catch((error) => {
        console.error('❗ Failed to send email:', error);
  
        // ✅ Show Error Notification
        setNotification({
          show: true,
          message: `❗ Failed to send reply to #${selectedTicket.id}. Please check and try again.`,
          variant: "danger"
        });
      })
      .finally(() => {
        setIsSending(false); // re-enable button
        setTimeout(() => {
          setNotification({ show: false, message: "", variant: "" });
        }, 10000); // hide after 10 seconds
      });
    }
  };
  

  const handleStatusChange = (e) => {
    const newStatus = e.target.value;
    if (selectedTicket) {
      const updatedTickets = tickets.map((ticket) =>
        ticket.id === selectedTicket.id
          ? { ...ticket, status: newStatus }
          : ticket
      );
      setTickets(updatedTickets);
      setSelectedTicket({ ...selectedTicket, status: newStatus });
    }
  };

  return (
    <div className="p-4">
      <StickyHeader
        currentUser={currentUser}
        pageTitle="Support Feedback"
        className="mb-4"
      />

      {notification.show && (
        <Alert
          variant={notification.variant}
          onClose={() =>
            setNotification({ show: false, message: "", variant: "" })
          }
          dismissible
        >
          {notification.message}
        </Alert>
      )}

      <Form className="d-flex align-items-center flex-wrap mb-4 gap-3 mt-4">
        <div className="d-flex flex-wrap align-items-center gap-3 mb-4 w-100">
          {/* Search Field */}
          <div className="d-flex align-items-center flex-grow-1 gap-2">
            <Form.Label className="mb-0">
              <strong>Search:</strong>
            </Form.Label>
            <div className="d-flex align-items-center flex-grow-1 gap-1">
              <Form.Control
                type="text"
                placeholder="Search by ID or User..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              {searchTerm && (
                <Button
                  variant="outline-danger"
                  size="sm"
                  onClick={() => setSearchTerm("")}
                  className="clear-button"
                >
                  <i className="bi bi-x"></i>
                </Button>
              )}
            </div>
          </div>

          {/* Status Filter */}
          <div className="d-flex align-items-center flex-grow-1 gap-2">
            <Form.Label className="mb-0">
              <strong>Status:</strong>
            </Form.Label>
            <div className="d-flex align-items-center flex-grow-1 gap-1">
              <Form.Select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
              >
                <option value="">All</option>
                <option value="Open">Open</option>
                <option value="In Progress">In Progress</option>
                <option value="Resolved">Resolved</option>
                <option value="Closed">Closed</option>
              </Form.Select>
              {filterStatus && (
                <Button
                  variant="outline-danger"
                  size="sm"
                  onClick={() => setFilterStatus("")}
                  className="clear-button"
                >
                  <i className="bi bi-x" style={{ fontSize: "20px" }}></i>
                </Button>
              )}
            </div>
          </div>

          {/* Category Filter */}
          <div className="d-flex align-items-center flex-grow-1 gap-2">
            <Form.Label className="mb-0">
              <strong>Category:</strong>
            </Form.Label>
            <div className="d-flex align-items-center flex-grow-1 gap-1">
              <Form.Select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
              >
                <option value="">All</option>
                <option value="Technical Issue">Technical Issue</option>
                <option value="Billing & Payments">Billing & Payments</option>
                <option value="Account Management">Account Management</option>
                <option value="Feature Request">Feature Request</option>
                <option value="General Inquiry">General Inquiry</option>
              </Form.Select>
              {filterCategory && (
                <Button
                  variant="outline-danger"
                  size="sm"
                  onClick={() => setFilterCategory("")}
                  className="clear-button"
                >
                  <i className="bi bi-x" style={{ fontSize: "20px" }}></i>
                </Button>
              )}
            </div>
          </div>
        </div>
      </Form>

      <Table   hover responsive>
        <thead>
          <tr>
            <th>ID</th>
            <th>User</th>
            <th>Subject</th>
            <th>Category</th>
            <th>Status</th>
            <th>Date</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {currentTickets.map((ticket) => (
            <tr key={ticket.id}>
              <td>{ticket.id}</td>
              <td>{ticket.user}</td>
              <td>{ticket.subject}</td>
              <td>{ticket.category}</td>
              <td>{getStatusBadge(ticket.status)}</td>
              <td>{ticket.date}</td>
              <td>
                <Button
                  size="sm"
                  variant="primary"
                  onClick={() => handleView(ticket)}
                >
                  View
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>
      
      <PaginationControls
  totalItems={filteredAllTickets.length}
  entriesPerPage={entriesPerPage}
  setEntriesPerPage={null}  // (optional if you want)
  currentPage={currentPage}
  setCurrentPage={setCurrentPage}
  startIndex={indexOfFirstEntry}
 />


      {/* Modal for Ticket Details */}
      <Modal show={showModal} onHide={handleClose} centered>
        <Modal.Header closeButton>
          <Modal.Title>View #{selectedTicket?.id} Enquiry Details</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedTicket && (
            <div style={{ fontSize: "14px" }}>
              {/* Notification inside modal */}
              {notification.show && (
                <Alert
                  variant={notification.variant}
                  onClose={() =>
                    setNotification({ show: false, message: "", variant: "" })
                  }
                  dismissible
                >
                  {notification.message}
                </Alert>
              )}

              {/* Ticket Information */}
              <div style={{ marginBottom: "20px" }}>
                <p>
                  <strong>User:</strong> {selectedTicket.user}
                </p>
                <p>
                  <strong>Email:</strong> {selectedTicket.email}
                </p>
                <p>
                  <strong>Subject:</strong> {selectedTicket.subject}
                </p>
                <p>
                  <strong>Category:</strong> {selectedTicket.category}
                </p>
                <p>
                  <strong>Message:</strong>
                </p>
                <div
                  style={{
                    backgroundColor: "#f9f9f9",
                    padding: "10px",
                    borderRadius: "5px",
                    border: "1px solid #e0e0e0",
                    marginBottom: "10px",
                  }}
                >
                  {selectedTicket.message}
                </div>
                <p>
                  <strong>Status:</strong>{" "}
                  {getStatusBadge(selectedTicket.status)}
                </p>
                <p>
                  <strong>Date Created:</strong> {selectedTicket.date}
                </p>
              </div>

              <hr style={{ margin: "20px 0" }} />

              {/* Reply Section */}
              <Form onSubmit={handleReply}>
                {/* Change Status at Top */}
                <Form.Group className="mb-3">
                  <Form.Label>
                    <strong>Change Status:</strong>
                  </Form.Label>
                  <Form.Select
                    value={selectedTicket.status}
                    onChange={handleStatusChange}
                  >
                    <option value="Open">Open</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Resolved">Resolved</option>
                    <option value="Closed">Closed</option>
                  </Form.Select>
                </Form.Group>

                {/* Write Reply Area */}
                <Form.Group className="mb-3">
                  <Form.Label>
                    <strong>Write a Reply:</strong>
                  </Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={4}
                    value={replyMessage}
                    onChange={(e) => setReplyMessage(e.target.value)}
                    required
                  />
                </Form.Group>
                {/* Send Reply Button */}
                <Button
                  variant="primary"
                  type="submit"
                  className="w-100"
                  disabled={isSending} // Disable while sending
                >
                  {isSending ? "Sending..." : "Send Reply"}
                </Button>
              </Form>
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>


        </Modal.Footer>
      </Modal>
    </div>
  );
}

export default SupportFeedback;
