import React, { useState } from "react";
import { Button, Form, Badge, InputGroup, Dropdown } from "react-bootstrap";
import handymanData from "../data/handymanData";
import PaginationControls from "../components/PaginationControls";

function HandymanVerification() {
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [entriesPerPage, setEntriesPerPage] = useState(15);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [data, setData] = useState(handymanData);
  const [statusFilter, setStatusFilter] = useState("Pending");

  const handleSetPhoneStatus = (handymanId, newStatus) => {
    setData((prev) =>
      prev.map((h) =>
        h.handymanId === handymanId
          ? {
              ...h,
              isPhoneVerified: newStatus === "Verified",
              phoneVerificationFailed: newStatus === "Failed"
            }
          : h
      )
    );
  };
  

  const filteredData = data.filter((item) => {
    const matchStatus = item.status === statusFilter;
    const matchSearch =
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.bvn.toLowerCase().includes(searchTerm.toLowerCase());
    const itemDate = new Date(item.date);
    const inDateRange =
      (!startDate || new Date(startDate) <= itemDate) &&
      (!endDate || itemDate <= new Date(endDate));
    return matchStatus && matchSearch && inDateRange;
  });

  const startIndex = (currentPage - 1) * entriesPerPage;
  const currentData = filteredData.slice(
    startIndex,
    startIndex + entriesPerPage
  );

  return (
    <div className="p-4">
      <h3 className="mb-4">Handyman Verification</h3>

      <div className="d-flex gap-2 flex-wrap mb-4">
        {['Pending', 'Approved', 'Declined'].map((status) => (
          <Button
            key={status}
            variant={statusFilter === status ? "primary" : "outline-secondary"}
            onClick={() => setStatusFilter(status)}
          >
            {status} Verification
          </Button>
        ))}
      </div>

      <div className="d-flex justify-content-around align-items-center mb-3 flex-wrap gap-3">
        <div className="d-flex align-items-center gap-5 flex-grow-1">
          <InputGroup style={{ width: "30%" }}>
            <Form.Control
              placeholder="Search by handyman name, id"
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
            <th>ID</th>
            <th>Handyman Name</th>
            <th>Phone</th>
            <th>Identity Card</th>
            <th>Certificates</th>
            <th>Status</th>
            <th>Submission Date</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {currentData.map((item, index) => (
            <tr key={index}>
              <th>{startIndex + index + 1}</th>
              <td>{item.name}</td>
              <td>
                <Dropdown>
                  <Dropdown.Toggle variant="outline-secondary" size="sm">
                    {item.isPhoneVerified ? "✅ Verified" : item.phoneVerificationFailed ? "❌ Failed" : "⏳ Pending"}
                  </Dropdown.Toggle>
                  <Dropdown.Menu>
                    <Dropdown.Item onClick={() => handleSetPhoneStatus(item.handymanId, "Verified")}>Set Verified</Dropdown.Item>
                    <Dropdown.Item onClick={() => handleSetPhoneStatus(item.handymanId, "Failed")}>Set Failed</Dropdown.Item>
                    <Dropdown.Item onClick={() => handleSetPhoneStatus(item.handymanId, "Pending")}>Set Pending</Dropdown.Item>
                  </Dropdown.Menu>
                </Dropdown>
              </td>
              <td>
                <a href="#" className="text-decoration-none">{item.idCard}</a>
              </td>
              <td>
                <a href="#" className="text-decoration-none">{item.cert}</a>
              </td>
              <td>
                <Badge
                  bg={
                    item.status === "Approved"
                      ? "success"
                      : item.status === "Declined"
                      ? "danger"
                      : "warning"
                  }
                  text={item.status === "Pending" ? "dark" : "white"}
                >
                  {item.status}
                </Badge>
              </td>
              <td>{item.date}</td>
              <td>
                <a href="#" className="text-primary text-decoration-none">Send message</a>
              </td>
            </tr>
          ))}
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

export default HandymanVerification;
