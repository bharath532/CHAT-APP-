import React from 'react';

export default function Loader() {
  return (
    <div className="d-flex align-items-center justify-content-center py-5">
      <div className="spinner-border text-primary" role="status" aria-label="loading" />
    </div>
  );
}
