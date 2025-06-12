import React, { useState, useEffect } from "react";
import {
  Button,
  Form,
  Badge,
  InputGroup,
  Dropdown,
  Spinner,
  Modal,
  Row,
  Col,
} from "react-bootstrap";
import { getDatabase, ref, onValue, update } from "firebase/database";
import PaginationControls from "../components/PaginationControls";
import StickyHeader from "../components/StickyHeader";
import ConfirmModal from "../components/ConfirmModal";
import VerificationModal from "../components/VerificationModal";
import "../styles/HandymanVerification.css";

function HandymanVerification() {
  const [showIdentitySidebar, setShowIdentitySidebar] = useState(false);
  const [imageData, setImageData] = useState({ front: '', back: '' });
  const [requirements, setRequirements] = useState([
    'Clear full name visible',
    'Date of birth is legible',
    'ID number matches submitted form',
    'Photo matches the person',
    'Document is not expired'
  ]);
  const [checkedItems, setCheckedItems] = useState(Array(5).fill(false));

  const [filterStatus, setFilterStatus] = useState("All");
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [entriesPerPage, setEntriesPerPage] = useState(15);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const currentUser = JSON.parse(localStorage.getItem("currentUser"));
  const [error, setError] = useState(null);
  const [showMessageModal, setShowMessageModal] = useState(false);
  const [showVerificationModal, setShowVerificationModal] = useState(false);
  const [selectedHandyman, setSelectedHandyman] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [editedUser, setEditedUser] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formErrors, setFormErrors] = useState({});
  const [comments, setComments] = useState("");
  const [isApproved, setIsApproved] = useState(false);
  const [verificationType, setVerificationType] = useState("");
  const [verificationLinks, setVerificationLinks] = useState([]);

  const closeAll = () => {
    setShowIdentitySidebar(false);
    setSelected(null);
  };

  const toggleCheckbox = (index) => {
    const updated = [...checkedItems];
    updated[index] = !updated[index];
    setCheckedItems(updated);
  };

  const selectAll = () => setCheckedItems(Array(requirements.length).fill(true));
  const deselectAll = () => setCheckedItems(Array(requirements.length).fill(false));

  const [selected, setSelected] = useState(null);

  const handleOpenIdentitySidebar = (handyman) => {
    setImageData({
      front: handyman.photoIdCard,
      back: handyman.photoIdCardBack || ''
    });
    setShowIdentitySidebar(true);
  };

  const openModal = () => {
    setShowVerificationModal(true);
    setIsApproved(false);
    setComments("");
  };

  const handleApprove = () => {
    console.log("Approved with comment:", comments);
    setShowVerificationModal(false);
  };

  const handleDecline = () => {
    console.log("Declined with comment:", comments);
    setShowVerificationModal(false);
  };

  const handleOpenVerificationModal = (handyman, type) => {
    const link =
      type === "identity"
        ? handyman.photoIdCard
        : handyman.certificates;

    const formattedLinks = Array.isArray(link)
      ? link
      : link
      ? [link]
      : [];
    
    setVerificationLinks(formattedLinks);
    setVerificationType(type);
    setComments("");
    setIsApproved(false);
    setShowVerificationModal(true);
  };

  const [confirmModal, setConfirmModal] = useState({
    show: false,
    handymanId: null,
    newStatus: null,
  });

  const fieldSections = {
    "Personal Info": ["firstName", "lastName", "email", "phoneNumber"],
    Address: [
      "houseNumber",
      "street",
      "area",
      "thana",
      "district",
      "division",
      "postcode",
    ],
    Documents: ["photoIdCard", "certificates"],
    "Account Info": [
      "verificationStatus",
      "isPhoneVerified",
      "createdAt",
      "approvedBy",
    ],
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedUser(null);
    setEditedUser(null);
    setFormErrors({});
    setIsEditing(false);
  };

  const handleInputChange = (key, value) => {
    setEditedUser((prev) => ({ ...prev, [key]: value }));
  };

  const handleUpdate = () => {
    console.log("Updated data:", editedUser);
    setShowModal(false);
  };

  useEffect(() => {
    const db = getDatabase();
    const handymanRef = ref(db, "Handyman");

    const unsubscribe = onValue(
      handymanRef,
      (snapshot) => {
        const dbData = snapshot.val();
        if (dbData) {
          const parsed = Object.keys(dbData).map((key) => ({
            handymanId: key,
            ...dbData[key],
          }));
          setData(parsed);
        } else {
          setData([]);
        }
        setError(null);
        setLoading(false);
      },
      (err) => {
        setError("Failed to load data from the database.");
        console.error(err);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  const handleConfirmPhoneStatus = () => {
    const { handymanId, newStatus } = confirmModal;
    const db = getDatabase();
    const handymanRef = ref(db, `Handyman/${handymanId}`);
    update(handymanRef, { isPhoneVerified: newStatus })
      .then(() => {
        setConfirmModal({ show: false, handymanId: null, newStatus: null });
      })
      .catch((err) => {
        console.error("Error updating phone status:", err);
        setConfirmModal({ show: false, handymanId: null, newStatus: null });
      });
  };

  const handleFileUpload = (fieldKey, file) => {
    setEditedUser((prev) => ({
      ...prev,
      [fieldKey]: file,
    }));
  };

  const filteredData = data.filter((item) => {
    const status = item.verificationStatus || "pending";
    const statusMatch = filterStatus === "All" || status === filterStatus;

    const searchMatch =
      item.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.lastName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.phoneNumber?.toLowerCase().includes(searchTerm.toLowerCase());

    const itemDate = new Date(item.createdAt || item.date);
    const inDateRange =
      (!startDate || new Date(startDate) <= itemDate) &&
      (!endDate || itemDate <= new Date(endDate));

    return statusMatch && searchMatch && inDateRange;
  });

  const totalPages = Math.ceil(filteredData.length / entriesPerPage);
  const startIndex = (currentPage - 1) * entriesPerPage;
  const currentData = filteredData.slice(
    startIndex,
    startIndex + entriesPerPage
  );

  const handleViewDetails = (user) => {
    setSelectedUser(user);
    setEditedUser({ ...user });
    setIsEditing(false);
    setShowModal(true);
  };

  const handleOpenMessageModal = (handyman) => {
    setSelectedHandyman(handyman);
    setShowMessageModal(true);
  };

  return (
    <div className="p-4">
      <StickyHeader
        currentUser={currentUser}
        pageTitle="Handyman Verification"
      />

      <ConfirmModal
        show={confirmModal.show}
        title="Confirm Phone Status Change"
        message={`Are you sure you want to mark this number as ${
          confirmModal.newStatus ? "Verified" : "Not Verified"
        }?`}
        onHide={() =>
          setConfirmModal({ show: false, handymanId: null, newStatus: null })
        }
        onConfirm={handleConfirmPhoneStatus}
      />

      <div className="mb-3 d-flex align-items-center gap-2 mt-4">
        <span>Status:</span>
        <Form.Select
          value={filterStatus}
          onChange={(e) => {
            setFilterStatus(e.target.value);
            setCurrentPage(1);
          }}
          style={{ width: "200px" }}
        >
          <option value="All">All</option>
          <option value="pending">Pending</option>
          <option value="approved">Approved</option>
          <option value="declined">Declined</option>
        </Form.Select>

        {filterStatus !== "All" && (
          <Button
            variant="outline-danger"
            size="sm"
            onClick={() => setFilterStatus("All")}
          >
            <i className="bi bi-x"></i>
          </Button>
        )}
      </div>

      {showIdentitySidebar && (
        <>
          <div className="overlay" onClick={closeAll} />
          <div className="verification-sidebar show">
            <span className="close-btn" onClick={closeAll}>&times;</span>
            <h2>Identity Card Verification</h2>
            <p>Please verify the uploaded identity documents.</p>

            <div className="image-section">
              <h3>Submitted Images</h3>
              <div>
                <p><strong>Front:</strong></p>
                {imageData.front ? (
                  <img src={imageData.front} alt="Front of document" className="verification-image" />
                ) : (
                  <p className="text-muted">No front image available</p>
                )}
              </div>
              {imageData.back && (
                <div>
                  <p><strong>Back:</strong></p>
                  <img src={imageData.back} alt="Back of document" className="verification-image" />
                </div>
              )}
            </div>

            <div className="checkbox-section">
              <div className="select-all">
                <button className="button identity-btn" onClick={selectAll}>Select All</button>
                <button className="button decline-btn" onClick={deselectAll}>Deselect All</button>
              </div>
              {requirements.map((req, index) => (
                <div className="checkbox-item" key={index}>
                  <input
                    type="checkbox"
                    checked={checkedItems[index]}
                    onChange={() => toggleCheckbox(index)}
                  />
                  <label>{req}</label>
                </div>
              ))}
            </div>

            <textarea 
              className="textarea" 
              placeholder="Enter verification comments..."
              value={comments}
              onChange={(e) => setComments(e.target.value)}
            />
            <div className="actions">
              <button className="button decline-btn" onClick={closeAll}>Decline</button>
              <button className="button approve-btn" onClick={closeAll}>Approve</button>
            </div>
          </div>
        </>
      )}

      <div className="d-flex justify-content-around align-items-center mb-3 flex-wrap gap-3">
        <div className="d-flex align-items-center gap-3 flex-grow-1">
          <InputGroup style={{ width: "30%" }}>
            <Form.Control
              placeholder="Search by handyman name, id"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
            />
            {searchTerm && (
              <Button
                variant="outline-danger"
                size="sm"
                onClick={() => setSearchTerm("")}
              >
                <i className="bi bi-x"></i>
              </Button>
            )}
          </InputGroup>

          <div className="d-flex align-items-center gap-1">
            <Form.Label className="mb-0">Show</Form.Label>
            <Form.Control
              type="number"
              min="1"
              max="100"
              value={entriesPerPage}
              onChange={(e) => {
                setEntriesPerPage(Number(e.target.value));
                setCurrentPage(1);
              }}
              style={{ width: "80px" }}
            />
            <span className="ms-1">entries per page</span>
          </div>
        </div>

        <div className="d-flex align-items-center gap-2">
          <span className="fw-semibold">From</span>
          <Form.Control
            type="date"
            value={startDate}
            onChange={(e) => {
              setStartDate(e.target.value);
              setEndDate("");
              setCurrentPage(1);
            }}
            style={{ minWidth: "150px" }}
          />

          <span className="fw-semibold">to</span>
          <Form.Control
            type="date"
            value={endDate}
            min={startDate}
            onChange={(e) => {
              setEndDate(e.target.value);
              setCurrentPage(1);
            }}
            style={{ minWidth: "150px" }}
            disabled={!startDate}
          />

          <Button
            variant="outline-secondary"
            onClick={() => setCurrentPage(1)}
            disabled={!startDate || !endDate}
          >
            Filter
          </Button>

          {(startDate || endDate) && (
            <Button
              variant="outline-danger"
              size="sm"
              onClick={() => {
                setStartDate("");
                setEndDate("");
              }}
            >
              <i className="bi bi-x"></i>
            </Button>
          )}
        </div>

        <Button variant="outline-primary">Export Report</Button>
      </div>

      {loading ? (
        <div className="text-center mt-5">
          <Spinner animation="border" variant="primary" />
          <p className="mt-3">Loading Handyman Data...</p>
        </div>
      ) : (
        <table className="table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Handyman Name</th>
              <th>Phone</th>
              <th>Address</th>
              <th>Identity Card</th>
              <th>Certificates</th>
              <th>Status</th>
              <th>Submission Date</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading || error ? (
              <tr>
                <td colSpan="8" className="text-center text-muted">
                  {loading && (
                    <div className="my-3">
                      <span className="fw-semibold">
                        Loading data from database...
                      </span>
                    </div>
                  )}
                  {error && !loading && (
                    <div
                      className="alert alert-danger text-center my-3"
                      role="alert"
                    >
                      {error}
                    </div>
                  )}
                </td>
              </tr>
            ) : filteredData.length > 0 ? (
              currentData.map((item, index) => (
                <tr key={item.handymanId}>
                  <th>{startIndex + index + 1}</th>
                  <td>
                    {item.firstName} {item.lastName}
                  </td>
                  <td>
                    <Dropdown>
                      <Dropdown.Toggle
                        variant={
                          item.isPhoneVerified ? "success" : "outline-secondary"
                        }
                        size="sm"
                      >
                        {item.isPhoneVerified ? "Verified" : "Not Verified"}
                      </Dropdown.Toggle>
                      <Dropdown.Menu>
                        <Dropdown.Item
                          className="text-success"
                          onClick={() =>
                            setConfirmModal({
                              show: true,
                              handymanId: item.handymanId,
                              newStatus: true,
                            })
                          }
                        >
                          Mark as Verified
                        </Dropdown.Item>
                        <Dropdown.Item
                          className="text-danger"
                          onClick={() =>
                            setConfirmModal({
                              show: true,
                              handymanId: item.handymanId,
                              newStatus: false,
                            })
                          }
                        >
                          Mark as Not Verified
                        </Dropdown.Item>
                      </Dropdown.Menu>
                    </Dropdown>
                  </td>
                  <td>
                    {`${item.houseNumber}, ${item.street}, ${item.area}, ${item.thana}, ${item.district}, ${item.division}, ${item.postcode}`}
                  </td>
                  <td>
                    <Button
                      variant="link"
                      className="p-0 text-decoration-none"
                      onClick={() => handleOpenIdentitySidebar(item)}
                    >
                      {item.photoIdCard?.startsWith("http") ? "View ID Card" : item.photoIdCard || "No ID Card"}
                    </Button>
                  </td>
                  <td>
                    <Button
                      variant="link"
                      className="p-0 text-decoration-none"
                      onClick={() => handleOpenVerificationModal(item, "certificates")}
                    >
                      {item.certificates?.startsWith("http") ? "View Certificate" : item.certificates || "No Certificate"}
                    </Button>
                  </td>
                  <td>
                    <Badge
                      bg={
                        item.verificationStatus === "approved"
                          ? "success"
                          : item.verificationStatus === "declined"
                          ? "danger"
                          : "warning"
                      }
                      text={
                        item.verificationStatus === "pending" ||
                        !item.verificationStatus
                          ? "dark"
                          : "white"
                      }
                    >
                      {(item.verificationStatus || "pending")
                        .charAt(0)
                        .toUpperCase() +
                        (item.verificationStatus || "pending").slice(1)}
                    </Badge>
                  </td>
                  <td>{new Date(item.createdAt).toLocaleDateString()}</td>
                  <td>
                    <Button
                      variant="outline-primary"
                      size="sm"
                      className="me-2"
                      onClick={() => handleViewDetails(item)}
                    >
                      View
                    </Button>

                    <Button
                      variant="outline-info"
                      size="sm"
                      onClick={() => handleOpenMessageModal(item)}
                    >
                      Message
                    </Button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="8" className="text-center text-muted">
                  No records found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      )}

      <PaginationControls
        totalItems={filteredData.length}
        entriesPerPage={entriesPerPage}
        setEntriesPerPage={setEntriesPerPage}
        currentPage={currentPage}
        setCurrentPage={setCurrentPage}
        startIndex={startIndex}
      />

      <Modal
        show={showMessageModal}
        onHide={() => setShowMessageModal(false)}
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>Send Message</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form.Group>
            <Form.Label>Enter your message below:</Form.Label>
            <Form.Control
              as="textarea"
              rows={4}
              placeholder="Type your message here..."
            />
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="danger" onClick={() => setShowMessageModal(false)}>
            Cancel
          </Button>
          <Button variant="info">Send</Button>
        </Modal.Footer>
      </Modal>

      {selectedUser && editedUser && (
        <Modal show={showModal} onHide={handleCloseModal} centered size="lg">
          <Modal.Header closeButton>
            <Modal.Title>
              {editedUser.firstName} {editedUser.lastName}
            </Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form>
              <div style={{ maxHeight: "60vh", overflowY: "auto" }}>
                {Object.entries(fieldSections).map(([sectionTitle, keys]) => {
                  if (sectionTitle === "Documents") {
                    return (
                      <div key={sectionTitle} className="mb-4">
                        <h6 className="border-bottom pb-1 mb-3">
                          {sectionTitle}
                        </h6>
                        <Row className="mb-3">
                          {keys.map((fieldKey, idx) => {
                            const val = editedUser[fieldKey];
                            return (
                              <Col key={fieldKey} md={6}>
                                <Form.Label className="fw-bold text-capitalize">
                                  {fieldKey.replace(/([A-Z])/g, " $1")}
                                </Form.Label>
                                {val && typeof val === "string" ? (
                                  val.startsWith("http") ? (
                                    <div className="d-flex flex-column gap-1 mb-2">
                                      <a
                                        href={val}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                      >
                                        View Document
                                      </a>
                                    </div>
                                  ) : (
                                    <div className="text-muted mb-2">
                                      Uploaded:{" "}
                                      <span className="fw-medium">{val}</span>
                                    </div>
                                  )
                                ) : (
                                  <div className="text-muted mb-2">
                                    No document uploaded
                                  </div>
                                )}

                                {isEditing && (
                                  <Form.Control
                                    type="file"
                                    size="sm"
                                    accept="image/*,.pdf"
                                    onChange={(e) => {
                                      if (e.target.files.length > 0) {
                                        handleFileUpload(
                                          fieldKey,
                                          e.target.files[0]
                                        );
                                      }
                                    }}
                                  />
                                )}
                              </Col>
                            );
                          })}
                        </Row>
                      </div>
                    );
                  }

                  return (
                    <div key={sectionTitle} className="mb-4">
                      <h6 className="border-bottom pb-1 mb-3">
                        {sectionTitle}
                      </h6>
                      {keys.reduce((rows, key, index) => {
                        if (index % 2 === 0) {
                          const nextKey = keys[index + 1];
                          rows.push(
                            <Row className="mb-3" key={index}>
                              {[key, nextKey].map((fieldKey, colIdx) => {
                                if (!fieldKey || !(fieldKey in editedUser))
                                  return <Col key={colIdx} />;
                                const val = editedUser[fieldKey];
                                return (
                                  <Col key={colIdx} className="ms-3">
                                    <Form.Label className="fw-bold text-capitalize">
                                      {fieldKey.replace(/([A-Z])/g, " $1")}
                                    </Form.Label>
                                    {isEditing &&
                                    !["id", "createdAt", "approvedBy"].includes(
                                      fieldKey
                                    ) ? (
                                      <>
                                        <Form.Control
                                          size="sm"
                                          value={val || ""}
                                          onChange={(e) =>
                                            handleInputChange(
                                              fieldKey,
                                              e.target.value
                                            )
                                          }
                                        />
                                        {formErrors[fieldKey] && (
                                          <div className="text-danger small mt-1">
                                            {formErrors[fieldKey]}
                                          </div>
                                        )}
                                      </>
                                    ) : (
                                      <Form.Control
                                        size="sm"
                                        plaintext
                                        readOnly
                                        defaultValue={val?.toString()}
                                      />
                                    )}
                                  </Col>
                                );
                              })}
                            </Row>
                          );
                        }
                        return rows;
                      }, [])}
                    </div>
                  );
                })}
              </div>
            </Form>
          </Modal.Body>
          <Modal.Footer>
            {!isEditing ? (
              <Button variant="secondary" onClick={() => setIsEditing(true)}>
                Edit
              </Button>
            ) : (
              <Button variant="success" onClick={handleUpdate}>
                Save Changes
              </Button>
            )}
            <Button variant="outline-secondary" onClick={handleCloseModal}>
              Close
            </Button>
          </Modal.Footer>
        </Modal>
      )}

      <VerificationModal
        show={showVerificationModal}
        onHide={() => setShowVerificationModal(false)}
        title={verificationType === "identity" ? "Identity Card" : "Certificates"}
        documentType={verificationType}
        documentLinks={verificationLinks}
        comments={comments}
        setComments={setComments}
        isApproved={isApproved}
        setIsApproved={setIsApproved}
        onApprove={() => {
          console.log("Approved:", verificationType, comments);
          setShowVerificationModal(false);
        }}
        onDecline={() => {
          console.log("Declined:", verificationType, comments);
          setShowVerificationModal(false);
        }}
      />
    </div>
  );
}

export default HandymanVerification;