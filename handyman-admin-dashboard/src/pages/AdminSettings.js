import React, { useState, useEffect } from "react";
import {
  Table,
  Button,
  Modal,
  Form,
  Badge,
  Row,
  Col,
  OverlayTrigger,
  Tooltip,
  Alert,
  Fade,
} from "react-bootstrap";
import { database } from "../firebase";
import { ref, onValue, set, remove } from "firebase/database";
import { v4 as uuidv4 } from "uuid";
import { formatDistanceToNow } from "date-fns";
import StickyHeader from "../components/StickyHeader";


const roleOptions = ["Master Admin", "Staff Member"];
const statusOptions = ["active", "inactive"];

function AdminSettings() {
  const [admins, setAdmins] = useState([]);
  const [filteredAdmins, setFilteredAdmins] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedAdmin, setSelectedAdmin] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [isNewAdmin, setIsNewAdmin] = useState(false);
  const [filterRole, setFilterRole] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [notification, setNotification] = useState({
    show: false,
    message: "",
    variant: "",
  });
  const [formErrors, setFormErrors] = useState({});


  const currentUser = JSON.parse(localStorage.getItem("currentUser"));

  useEffect(() => {
    const adminRef = ref(database, "admin");
    return onValue(adminRef, (snapshot) => {
      const data = snapshot.val();
      const adminArray = data
        ? Object.entries(data)
            .filter(([key]) => key !== "test")
            .map(([id, admin]) => ({ id, ...admin }))
        : [];
      setAdmins(adminArray);
      applyFilters(adminArray);
    });
  }, [filterRole, filterStatus, searchTerm]);

  const showNotification = (message, variant = "success") => {
    setNotification({ show: true, message, variant });
    setTimeout(
      () => setNotification({ show: false, message: "", variant: "" }),
      3000
    );
  };

  const handleEdit = (admin) => {
    setIsNewAdmin(false);
    setSelectedAdmin({ ...admin, lastUpdated: new Date().toISOString() });
    setShowModal(true);
  };

  const handleAddNewAdmin = () => {
    const timestamp = new Date().toISOString();
    const newAdmin = {
      id: uuidv4(),
      firstName: "",
      lastName: "",
      email: "",
      role: "Staff Member",
      status: "active",
      password: "",
      dateCreated: timestamp,
      lastUpdated: timestamp,
    };
    setIsNewAdmin(true);
    setSelectedAdmin(newAdmin);
    setShowModal(true);
  };

  const handleDelete = async (adminId) => {
    if (!window.confirm("Are you sure you want to delete this admin?")) return;

    const newErrors = {};
    if (!selectedAdmin.firstName.trim())
      newErrors.firstName = "First name is required.";
    if (!selectedAdmin.lastName.trim())
      newErrors.lastName = "Last name is required.";
    if (!selectedAdmin.email.trim()) newErrors.email = "Email is required.";
    if (!selectedAdmin.password || selectedAdmin.password.length < 6)
      newErrors.password = "Password must be at least 6 characters.";
    if (Object.keys(newErrors).length > 0) {
      setFormErrors(newErrors);
      return;
    } else {
      setFormErrors({});
    }

    try {
      await remove(ref(database, `admin/${adminId}`));
      showNotification("Admin deleted successfully.", "warning");
    } catch (error) {
      console.error("Failed to delete admin:", error);
      showNotification("❌ Failed to delete admin.", "danger");
    }
  };

  const handleSave = async () => {
    const errors = {};
    if (!selectedAdmin.firstName.trim()) errors.firstName = "First name is required.";
    if (!selectedAdmin.lastName.trim()) errors.lastName = "Last name is required.";
    if (!selectedAdmin.email.trim()) errors.email = "Email is required.";
    if (!selectedAdmin.password?.trim()) errors.password = "Password is required.";
    if (!selectedAdmin.password || selectedAdmin.password.length < 6)
      errors.password = "Password must be at least 6 characters.";
    
  if (Object.keys(errors).length > 0) {
    setFormErrors(errors);
    return;
  }

    if (selectedAdmin.password.length < 6) {
      showNotification("🔐 Password must be at least 6 characters.", "danger");
      return;
    }

    if (!window.confirm("Are you sure you want to save changes?")) return;

    const newErrors = {};
    if (!selectedAdmin.firstName.trim())
      newErrors.firstName = "First name is required.";
    if (!selectedAdmin.lastName.trim())
      newErrors.lastName = "Last name is required.";
    if (!selectedAdmin.email.trim()) newErrors.email = "Email is required.";
    if (!selectedAdmin.password || selectedAdmin.password.length < 6)
      newErrors.password = "Password must be at least 6 characters.";
    if (Object.keys(newErrors).length > 0) {
      setFormErrors(newErrors);
      return;
    } else {
      setFormErrors({});
    }

    try {
      const updatedAdmin = {
        ...selectedAdmin,
        lastUpdated: new Date().toISOString(),
        ...(isNewAdmin && { dateCreated: new Date().toISOString() }),
      };

      await set(ref(database, `admin/${selectedAdmin.id}`), updatedAdmin);
      showNotification(
        isNewAdmin
          ? `${selectedAdmin.firstName} ${selectedAdmin.lastName} created successfully.`
          : `Changes for ${selectedAdmin.firstName} ${selectedAdmin.lastName} saved.`
      );
      setShowModal(false);
    } catch (error) {
      console.error("Failed to update admin:", error);
      showNotification("❌ Failed to save changes.", "danger");
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setSelectedAdmin((prev) => ({ ...prev, [name]: value }));
  };

  const applyFilters = (data) => {
    let result = data;
    if (searchTerm) {
      result = result.filter(
        (admin) =>
          admin.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
          `${admin.firstName} ${admin.lastName}`
            .toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          admin.role.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    if (filterRole) {
      result = result.filter((admin) => admin.role === filterRole);
    }
    if (filterStatus) {
      result = result.filter((admin) => admin.status === filterStatus);
    }
    setFilteredAdmins(result);
  };

  return (
    <div className="container mt-4">
      <StickyHeader currentUser={currentUser} pageTitle="Admin Settings" />
      <Fade in={notification.show}>
        <div>
          {notification.show && (
            <Alert
              variant={notification.variant}
              className="mt-3"
              dismissible
              onClose={() =>
                setNotification({ show: false, message: "", variant: "" })
              }
            >
              {notification.message}
            </Alert>
          )}
        </div>
      </Fade>
      {currentUser?.role === "Master Admin" ? (
        <div className="mt-4">
          <Row className="mb-4 align-items-center">
            <Col md={4} className="d-flex align-items-center">
              <Form.Control
                placeholder="Search by name, email or role..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </Col>
            <Col md={3} className="d-flex align-items-center">
              <Form.Select
                value={filterRole}
                onChange={(e) => setFilterRole(e.target.value)}
              >
                <option value="">Filter by Role</option>
                {roleOptions.map((role) => (
                  <option key={role} value={role}>
                    {role}
                  </option>
                ))}
              </Form.Select>
              {filterRole && (
                <Button
                  variant="outline-danger"
                  size="sm"
                  onClick={() => setFilterRole("")}
                  className="ms-2"
                >
                  <i className="bi bi-x" style={{ fontSize: "20px" }}></i>
                </Button>
              )}
            </Col>
            <Col md={3} className="d-flex align-items-center">
              <Form.Select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
              >
                <option value="">Filter by Status</option>
                {statusOptions.map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </Form.Select>
              {filterStatus && (
                <Button
                  variant="outline-danger"
                  size="sm"
                  onClick={() => setFilterStatus("")}
                  className="ms-2"
                >
                  <i className="bi bi-x" style={{ fontSize: "20px" }}></i>
                </Button>
              )}
            </Col>
            <Col md={2} className="text-end">
              <Button variant="success" onClick={handleAddNewAdmin}>
                + Add New Admin
              </Button>
            </Col>
          </Row>

          <Table striped bordered hover responsive>
            <thead>
              <tr>
                <th>First Name</th>
                <th>Last Name</th>
                <th>Email</th>
                <th>Role</th>
                <th>Status</th>
                <th>Date Created</th>
                <th>Last Updated</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredAdmins.map((admin) => (
                <tr key={admin.id}>
                  <td>{admin.firstName}</td>
                  <td>{admin.lastName}</td>
                  <td>{admin.email}</td>
                  <td>
                    <Badge
                      bg={admin.role === "Master Admin" ? "danger" : "info"}
                    >
                      {admin.role}
                    </Badge>
                  </td>
                  <td>
                    <Badge
                      bg={admin.status === "active" ? "success" : "secondary"}
                    >
                      {admin.status}
                    </Badge>
                  </td>
                  <td>
                    {admin.dateCreated ? (
                      <OverlayTrigger
                        placement="top"
                        overlay={
                          <Tooltip id={`tooltip-date-${admin.id}-created`}>
                            {new Date(admin.dateCreated).toLocaleString()}
                          </Tooltip>
                        }
                      >
                        <span>
                          {formatDistanceToNow(new Date(admin.dateCreated), {
                            addSuffix: true,
                          })}
                        </span>
                      </OverlayTrigger>
                    ) : (
                      "-"
                    )}
                  </td>
                  <td>
                    {admin.lastUpdated ? (
                      <OverlayTrigger
                        placement="top"
                        overlay={
                          <Tooltip id={`tooltip-date-${admin.id}-updated`}>
                            {new Date(admin.lastUpdated).toLocaleString()}
                          </Tooltip>
                        }
                      >
                        <span>
                          {formatDistanceToNow(new Date(admin.lastUpdated), {
                            addSuffix: true,
                          })}
                        </span>
                      </OverlayTrigger>
                    ) : (
                      "-"
                    )}
                  </td>
                  <td>
                    <div className="d-flex gap-2">
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() => handleEdit(admin)}
                      >
                        Edit
                      </Button>
                      <Button
                        variant="danger"
                        size="sm"
                        onClick={() => handleDelete(admin.id)}
                      >
                        Delete
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>

          <Modal show={showModal} onHide={() => setShowModal(false)}>
            <Modal.Header closeButton>
              <Modal.Title>
                {isNewAdmin ? "Add New Admin" : "Edit Admin"}
              </Modal.Title>
            </Modal.Header>
            <Modal.Body>
              {selectedAdmin && (
                <Form>
<Form.Group className="mb-3">
  <Form.Label>First Name</Form.Label>
  <Form.Control
    name="firstName"
    value={selectedAdmin.firstName}
    onChange={handleChange}
    className={formErrors.firstName ? "is-invalid" : ""}
  />
  {formErrors.firstName && (
    <div className="invalid-feedback">{formErrors.firstName}</div>
  )}
</Form.Group>

<Form.Group className="mb-3">
  <Form.Label>Last Name</Form.Label>
  <Form.Control
    name="lastName"
    value={selectedAdmin.lastName}
    onChange={handleChange}
    className={formErrors.lastName ? "is-invalid" : ""}
  />
  {formErrors.lastName && (
    <div className="invalid-feedback">{formErrors.lastName}</div>
  )}
</Form.Group>

<Form.Group className="mb-3">
  <Form.Label>Email</Form.Label>
  <Form.Control
    name="email"
    type="email"
    value={selectedAdmin.email}
    onChange={handleChange}
    className={formErrors.email ? "is-invalid" : ""}
  />
  {formErrors.email && (
    <div className="invalid-feedback">{formErrors.email}</div>
  )}
</Form.Group>

<Form.Group className="mb-3">
  <Form.Label>Role</Form.Label>
  <Form.Select
    name="role"
    value={selectedAdmin.role}
    onChange={handleChange}
  >
    {roleOptions.map((role) => (
      <option key={role}>{role}</option>
    ))}
  </Form.Select>
</Form.Group>

<Form.Group className="mb-3">
  <Form.Label>Status</Form.Label>
  <Form.Select
    name="status"
    value={selectedAdmin.status}
    onChange={handleChange}
  >
    <option>active</option>
    <option>inactive</option>
  </Form.Select>
</Form.Group>

<Form.Group className="mb-3">
  <Form.Label>Password</Form.Label>
  <Form.Control
    name="password"
    type="text"
    value={selectedAdmin.password || ""}
    onChange={handleChange}
    className={formErrors.password ? "is-invalid" : ""}
  />
  {formErrors.password && (
    <div className="invalid-feedback">{formErrors.password}</div>
  )}
</Form.Group>
                </Form>
              )}
            </Modal.Body>
            <Modal.Footer>
              <Button variant="secondary" onClick={() => setShowModal(false)}>
                Cancel
              </Button>
              <Button variant="success" onClick={handleSave}>
                Save Changes
              </Button>
            </Modal.Footer>
          </Modal>
        </div>
      ) : (
        <p className="text-danger mt-3">
          Access Denied. Only Master Admins can view this page.
        </p>
      )}
    </div>
  );
}

export default AdminSettings;
