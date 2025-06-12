import React, { useState } from "react";
import { Button, Form, Modal, Table, Badge } from "react-bootstrap";
import userData from "../data/userData";
import handymanData from "../data/handymanData";
import StickyHeader from "../components/StickyHeader";

function UserManagement() {
  const [userType, setUserType] = useState("User");
  const [showModal, setShowModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [filterStatus, setFilterStatus] = useState("All");
  const [isEditing, setIsEditing] = useState(false);
  const [editedUser, setEditedUser] = useState(null);
  // Delete Button State
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);
  const currentUser = JSON.parse(localStorage.getItem("currentUser"));


  const data = userType === "User" ? userData : handymanData;

  const handleShowModal = (user) => {
    setSelectedUser(user);
    setEditedUser({ ...user });
    setIsEditing(false);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedUser(null);
    setEditedUser(null);
    setIsEditing(false);
  };

  const handleInputChange = (field, value) => {
    setEditedUser((prev) => ({ ...prev, [field]: value }));
  };

  const handleUpdate = () => {
    console.log("Updated user: ", editedUser);
    setSelectedUser(editedUser);
    setIsEditing(false);
  };

  const filteredUsers = data.filter((user) => {
    return (
      filterStatus === "All" || user.verified === (filterStatus === "Verified")
    );
  });

  return (
    <div className="p-4">
      <StickyHeader
        currentUser={currentUser}
        pageTitle="User Management"
        className="mb-4"
      />
      {/* Toggle between User and Handyman */}
      <div className="mb-3 d-flex align-items-center gap-3 mt-4">
        <strong>Select View:</strong>
        <Form.Select
          value={userType}
          onChange={(e) => setUserType(e.target.value)}
          style={{ width: "200px" }}
        >
          <option>User</option>
          <option>Handyman</option>
        </Form.Select>
      </div>
      {/* Filter Status Buttons */}
      <div className="d-flex gap-2 flex-wrap mb-4">
        {[
          { label: "All", value: "All" },
          { label: "Verified", value: "Verified" },
          { label: "Unverified", value: "Unverified" },
        ].map((status) => (
          <Button
            key={status.value}
            variant={
              filterStatus === status.value ? "primary" : "outline-secondary"
            }
            onClick={() => setFilterStatus(status.value)}
          >
            {status.label} Status
          </Button>
        ))}
      </div>
      {/* Users Table */}
      <Table hover>
        <thead>
          <tr>
            <th>ID</th>
            <th>Name</th>
            <th>Phone</th>
            <th>Status</th>
            <th>Created</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {filteredUsers.map((user, index) => (
            <tr key={index}>
              <td>{user.userId || user.handymanId}</td>
              <td>
                {user.firstName} {user.lastName}
              </td>
              <td>{user.phoneNumber}</td>
              <td>
                <Badge bg={user.verified ? "success" : "warning"}>
                  {user.verified ? "Verified" : "Unverified"}
                </Badge>
              </td>
              <td>{user.createdAt}</td>
              <td>
                <Button
                  size="sm"
                  variant="info"
                  className="me-1"
                  onClick={() => handleShowModal(user)}
                >
                  View
                </Button>
                <Button
                  size="sm"
                  variant="danger"
                  onClick={() => {
                    setUserToDelete(user);
                    setShowDeleteConfirm(true);
                  }}
                >
                  Delete
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>
      {/* Edit Modal */}
      {selectedUser && editedUser && (
        <Modal show={showModal} onHide={handleCloseModal} centered size="lg">
          <Modal.Header closeButton>
            <Modal.Title>
              {editedUser.firstName} {editedUser.lastName}
            </Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Table borderless>
              <tbody>
                {Object.entries(editedUser).map(([key, value], idx) => (
                  <tr key={idx}>
                    <td>
                      <strong>{key.replace(/([A-Z])/g, " $1")}</strong>
                    </td>
                    <td>
                      {isEditing ? (
                        <Form.Control
                          size="sm"
                          value={value || ""}
                          onChange={(e) =>
                            handleInputChange(key, e.target.value)
                          }
                        />
                      ) : (
                        value?.toString()
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
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
      {/* Show a confirmation modal before deletion */}
      <Modal
        show={showDeleteConfirm}
        onHide={() => setShowDeleteConfirm(false)}
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>Confirm Delete</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          Are you sure you want to delete{" "}
          <strong>
            {userToDelete?.firstName} {userToDelete?.lastName}
          </strong>
          ?
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant="secondary"
            onClick={() => setShowDeleteConfirm(false)}
          >
            Cancel
          </Button>
          <Button
            variant="danger"
            onClick={() => {
              console.log("Deleted:", userToDelete);
              setShowDeleteConfirm(false);
              setUserToDelete(null);
              // Optional: Update state to remove the user from table if needed
            }}
          >
            Yes, Delete
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}

export default UserManagement;
