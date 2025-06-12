import React from "react";
import { Image } from "react-bootstrap";

const DEFAULT_AVATAR = "https://firebasestorage.googleapis.com/v0/b/handymanapplicationcos40006.firebasestorage.app/o/handyman-assets%2Fdefault-avatar-icon.jpg?alt=media&token=c3f57823-156c-460b-92e1-3f7df51941a3";

const AdminProfileHeader = ({ user }) => {
  return (
    <div className="admin-profile-header text-center mt-auto pt-3">
      <Image src={DEFAULT_AVATAR} roundedCircle width={40} height={40} alt="Admin Avatar" />
      <div className="mt-2">
        <strong>{user.firstName} {user.lastName}</strong>
        <div className="text-muted small">{user.email}</div>
        <div className="badge bg-secondary mt-1">{user.role}</div>
      </div>
    </div>
  );
};

export default AdminProfileHeader;
