import React, { useState } from "react";
import { Button, Form, Badge, InputGroup, Dropdown } from "react-bootstrap";
import userData from "../data/userData";
import PaginationControls from "../components/PaginationControls";
import StickyHeader from "../components/StickyHeader";

function UserVerification() {
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [entriesPerPage, setEntriesPerPage] = useState(15);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [data, setData] = useState(userData);
  const [statusFilter, setStatusFilter] = useState("All");
  const currentUser = JSON.parse(localStorage.getItem("currentUser"));

  const handleSetStatus = (userId, newStatus) => {
    setData((prev) =>
      prev.map((user) =>
        user.userId === userId ? { ...user, status: newStatus } : user
      )
    );
  };

  const getDerivedStatus = (item) => {
    if (item.status === "Suspected") return "Suspected";
    if (item.isPhoneVerified === "fail") return "Failed";
    if (item.isPhoneVerified === true) return "Verified";
    return "Pending";
  };

  const filteredData = data.filter((item) => {
    const matchSearch =
      (item.firstName &&
        item.firstName.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (item.lastName &&
        item.lastName.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (item.email &&
        item.email.toLowerCase().includes(searchTerm.toLowerCase()));

    const itemDate = new Date(item.createdAt);
    const inDateRange =
      (!startDate || new Date(startDate) <= itemDate) &&
      (!endDate || itemDate <= new Date(endDate));

    const derivedStatus = getDerivedStatus(item);
    const matchStatus =
      statusFilter === "All" || derivedStatus === statusFilter;

    return matchSearch && inDateRange && matchStatus;
  });

  const startIndex = (currentPage - 1) * entriesPerPage;
  const currentData = filteredData.slice(
    startIndex,
    startIndex + entriesPerPage
  );

  return (
    <div className="p-4">
      <StickyHeader
        currentUser={currentUser}  
        pageTitle="User Verification"
        className="mb-4"
      />
      <div className="d-flex align-items-center gap-2 mb-3 mt-4">
        <span className="fw-semibold">Status:</span>
        <Form.Select
          value={statusFilter}
          onChange={(e) => {
            setStatusFilter(e.target.value);
            setCurrentPage(1);
          }}
          style={{ width: "200px" }}
        >
          <option value="All">All Status</option>
          <option value="Verified">Verified</option>
          <option value="Pending">Pending</option>
          <option value="Suspected">Suspected</option>
        </Form.Select>
      </div>

      <div className="d-flex justify-content-around align-items-center mb-3 flex-wrap gap-3">
        <div className="d-flex align-items-center gap-4 flex-grow-1">
          <InputGroup style={{ width: "40%" }}>
            <Form.Control
              placeholder="Search by name or email"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
            />
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
        </div>

        <Button variant="outline-primary">Export Report</Button>
      </div>

      <table className="table">
        <thead>
          <tr>
            <th>#</th>
            <th>Name</th>
            <th>Email</th>
            <th>Phone</th>
            <th>Phone Verified</th>
            <th>ID Card</th>
            <th>Address</th>
            <th>Notes</th>
            <th>Status</th>
            <th>Created At</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {filteredData.length > 0 ? (
            currentData.map((item, index) => {
              const derivedStatus = getDerivedStatus(item);

              return (
                <tr key={index}>
                  <th>{startIndex + index + 1}</th>
                  <td>
                    {item.firstName} {item.lastName}
                  </td>
                  <td>{item.email}</td>
                  <td>{item.phoneNumber}</td>
                  <td>
                    <Badge
                      bg={
                        item.isPhoneVerified === true
                          ? "success"
                          : item.isPhoneVerified === "fail"
                          ? "secondary"
                          : item.isPhoneVerified === "pending"
                          ? "warning"
                          : "light"
                      }
                      text={
                        item.isPhoneVerified === "pending" ? "dark" : "white"
                      }
                    >
                      {item.isPhoneVerified === true
                        ? "Verified"
                        : item.isPhoneVerified === "fail"
                        ? "Failed"
                        : item.isPhoneVerified === "pending"
                        ? "Pending"
                        : "Unknown"}
                    </Badge>
                  </td>
                  <td>
                    <a
                      href={item.photoIdCard}
                      target="_blank"
                      rel="noreferrer"
                      className="text-decoration-none"
                    >
                      View ID
                    </a>
                  </td>
                  <td>
                    {item.houseNumber} {item.street}, {item.area}, {item.thana},{" "}
                    {item.district}, {item.division}, {item.postcode},{" "}
                    {item.country}
                  </td>
                  <td>{item.notes || "—"}</td>
                  <td>
                    <Badge
                      bg={
                        derivedStatus === "Verified"
                          ? "success"
                          : derivedStatus === "Pending"
                          ? "warning"
                          : derivedStatus === "Suspected"
                          ? "danger"
                          : derivedStatus === "Failed"
                          ? "secondary"
                          : "light"
                      }
                      text={derivedStatus === "Pending" ? "dark" : "white"}
                    >
                      {derivedStatus}
                    </Badge>
                  </td>
                  <td>{item.createdAt}</td>
                  <td>
                    <Dropdown>
                      <Dropdown.Toggle variant="outline-secondary" size="sm">
                        •••
                      </Dropdown.Toggle>
                      <Dropdown.Menu>
                        <Dropdown.Item
                          className="text-danger"
                          onClick={() =>
                            handleSetStatus(item.userId, "Suspected")
                          }
                        >
                          Mark as Suspected
                        </Dropdown.Item>
                        <Dropdown.Item
                          onClick={() => handleSetStatus(item.userId, null)}
                        >
                          Unmark Suspected
                        </Dropdown.Item>
                      </Dropdown.Menu>
                    </Dropdown>
                  </td>
                </tr>
              );
            })
          ) : (
            <tr>
              <td colSpan="11" className="text-center text-muted">
                No records found.
              </td>
            </tr>
          )}
        </tbody>
      </table>

      <PaginationControls
        totalItems={filteredData.length}
        entriesPerPage={entriesPerPage}
        setEntriesPerPage={setEntriesPerPage}
        currentPage={currentPage}
        setCurrentPage={setCurrentPage}
        startIndex={startIndex}
      />
    </div>
  );
}

export default UserVerification;
