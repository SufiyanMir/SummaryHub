import React from 'react';
import './savedSummaries.css';

const SavedSummaries = ({ posts, onDelete }) => {
  return (  
    <div >
      {posts.map((post) => (
        <div key={post.id} className="summary-card">
            <p className="card-text">{post.text}</p>
            <button className="summBtn" onClick={() => onDelete(post.id)}>Delete</button>
        </div>
      ))}
    </div>
  );
};

export default SavedSummaries;
