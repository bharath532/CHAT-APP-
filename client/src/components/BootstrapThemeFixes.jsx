import React from 'react';

// Ensures Bootstrap is consistent with our data-theme attribute.
// Kept as a tiny component to avoid sprinkling DOM manipulation across many pages.
export default function BootstrapThemeFixes() {
  React.useEffect(() => {
    document.body.classList.add('bootstrap-theme');
  }, []);

  return null;
}
