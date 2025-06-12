import React, { useState } from "react";
import { Table, Form, Button, InputGroup, Badge, Modal } from "react-bootstrap";
import PaginationControls from "../components/PaginationControls";
import jobData from "../data/jobData";
import "bootstrap-icons/font/bootstrap-icons.css";
import StickyHeader from "../components/StickyHeader";
import { database } from "../firebase";
import { ref, onValue } from "firebase/database";


function JobManagement() {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("All");
  const [entriesPerPage, setEntriesPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedJob, setSelectedJob] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const currentUser = JSON.parse(localStorage.getItem("currentUser"));


  const filteredJobs = jobData.filter((job) => {
    const matchesStatus =
      filterStatus === "All" ||
      job.jobStatus?.toLowerCase() === filterStatus.toLowerCase();
    const matchesSearch =
      job.jobCat?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.jobLocation?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.jobDesc?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.jobId?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const totalPages = Math.ceil(filteredJobs.length / entriesPerPage);
  const startIndex = (currentPage - 1) * entriesPerPage;
  const currentJobs = filteredJobs.slice(
    startIndex,
    startIndex + entriesPerPage
  );

  return (
    <div className="p-4">
      <StickyHeader currentUser={currentUser} pageTitle="Job Management" className="mb-4" />

      <div className="d-flex justify-content-between align-items-center mb-3 flex-wrap gap-3 mt-4">
        <div className="d-flex align-items-center gap-4 flex-grow-1">
          <InputGroup style={{ width: "50%" }}>
            <Form.Control
              placeholder="Search by job ID, category, location, or description"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
            />
          </InputGroup>

          <div className="d-flex align-items-center gap-2">
            <Form.Label className="mb-0">Status:</Form.Label>
            <Form.Select
              value={filterStatus}
              onChange={(e) => {
                setFilterStatus(e.target.value);
                setCurrentPage(1);
              }}
              style={{ width: "150px" }}
            >
              <option value="All">All</option>
              <option value="Open">Open</option>
              <option value="In Progress">In Progress</option>
              <option value="Completed">Completed</option>
              <option value="Cancelled">Cancelled</option>
            </Form.Select>
          </div>
        </div>

        <Button variant="outline-primary">Export Jobs</Button>
      </div>

      <Table   hover responsive>
        <thead>
          <tr>
            <th>ID</th>
            <th>Job Category</th>
            <th>Description</th>
            <th>Created By</th>
            <th>Location</th>
            <th>Date</th>
            <th>Time</th>
            <th>Salary</th>
            <th>Status</th>
            <th>Quotes</th>
            <th>Finished By</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {currentJobs.length > 0 ? (
            currentJobs.map((job, index) => (
              <tr key={job.jobId}>
                <td title={job.jobId}>{job.jobId.slice(0, 8)}...</td>
                <td>{job.jobCat}</td>
                <td>{job.jobDesc}</td>
                <td>
                  <div className="d-flex align-items-center gap-2">
                    <i className="bi bi-person"></i>
                    <span>{job.createdBy || "N/A"}</span>
                  </div>
                </td>
                <td>{job.jobLocation}</td>
                <td>
                  {job.jobDateFrom} - {job.jobDateTo}
                </td>
                <td>
                  {job.jobTimeFrom} - {job.jobTimeTo}
                </td>
                <td>
                  {job.jobSalaryFrom} - {job.jobSalaryTo}
                </td>
                <td>
                  <Badge
                    bg={
                      job.jobStatus === "Completed"
                        ? "success"
                        : job.jobStatus === "Cancelled"
                        ? "danger"
                        : job.jobStatus === "In Progress"
                        ? "primary"
                        : "warning"
                    }
                  >
                    {job.jobStatus || "Open"}
                  </Badge>
                </td>
                <td>{job.quotedHandymen?.length || 0}</td>
                <td>
                  {job.jobStatus === "Completed" ? (
                    <div className="d-flex align-items-center gap-2">
                      <i className="bi bi-person-workspace"></i>
                      <span>{job.finishedBy || "Handyman"}</span>
                    </div>
                  ) : (
                    <span className="text-muted">—</span>
                  )}
                </td>
                <td>
                  <Button
                    size="sm"
                    variant="info"
                    onClick={() => {
                      setSelectedJob(job);
                      setShowModal(true);
                    }}
                  >
                    View
                  </Button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="12" className="text-center text-muted">
                No jobs found.
              </td>
            </tr>
          )}
        </tbody>
      </Table>

      <PaginationControls
        totalItems={filteredJobs.length}
        entriesPerPage={entriesPerPage}
        setEntriesPerPage={setEntriesPerPage}
        currentPage={currentPage}
        setCurrentPage={setCurrentPage}
        startIndex={startIndex}
      />

      {/* View Modal */}
      <Modal
        show={showModal}
        onHide={() => setShowModal(false)}
        centered
        size="lg"
      >
        <Modal.Header closeButton>
          <Modal.Title>Job Details</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedJob && (
            <div>
              <p>
                <strong>Job ID:</strong> {selectedJob.jobId}
              </p>
              <p>
                <strong>Category:</strong> {selectedJob.jobCat}
              </p>
              <p>
                <strong>Description:</strong> {selectedJob.jobDesc}
              </p>
              <p>
                <strong>Location:</strong> {selectedJob.jobLocation}
              </p>
              <p>
                <strong>Date:</strong> {selectedJob.jobDateFrom} to{" "}
                {selectedJob.jobDateTo}
              </p>
              <p>
                <strong>Time:</strong> {selectedJob.jobTimeFrom} to{" "}
                {selectedJob.jobTimeTo}
              </p>
              <p>
                <strong>Salary:</strong> {selectedJob.jobSalaryFrom} -{" "}
                {selectedJob.jobSalaryTo}
              </p>
              <p>
                <strong>Status:</strong> {selectedJob.jobStatus}
              </p>
              <p>
                <strong>Created By:</strong> {selectedJob.createdBy}
              </p>
              <p>
                <strong>Finished By:</strong> {selectedJob.finishedBy || "—"}
              </p>
              <p>
                <strong>Quotes:</strong>{" "}
                {selectedJob.quotedHandymen?.join(", ") || "None"}
              </p>
              <p>
                <strong>Created At:</strong> {selectedJob.createdAt}
              </p>
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant="outline-secondary"
            onClick={() => setShowModal(false)}
          >
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}

export default JobManagement;
