import React, { useState, useContext, useEffect } from 'react';
import axios from 'axios';
import { MagnifyingGlass } from 'react-loader-spinner';
import { Link } from 'react-router-dom';
import SavedSummaries from './Components/SavedSummaries';
import userContext from '../context/userContext';
import toast from 'react-hot-toast';
import { FaAngleDown, FaAngleUp } from 'react-icons/fa';

function Home() {
  const [url, setUrl] = useState('');
  const [summary, setSummary] = useState('');
  const [loading, setLoading] = useState(false);
  const [posts, setPosts] = useState([]);
  const { user, setUser } = useContext(userContext);
  const [showPosts, setShow] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setSummary('');
    try {
      const response = await axios.post('/summarize', { url });
      setLoading(false);
      const { summary} = response.data;
      if (summary) {setSummary(summary);
      } else {
        toast.error("Couldn't Summarize!");
      }
    } catch (error) {
      console.error('Error fetching summary:', error);
      setLoading(false);
      toast.error("Error fetching summary!");
    }
  };

  useEffect(() => {
    if (user) {
      axios.get('/posts', { headers: { token: localStorage.getItem('token') } })
        .then(response => {
          setPosts(response.data.posts);
        })
        .catch(error => {
          console.error('Error fetching posts:', error);
        });
    }
  }, [user]);

  const handleSave = async () => {
    if (!user) toast.error("You need to Sign In!");
    else {
      try {
        const response=(await axios.post('/save-summary', { post: summary }, { headers: { token: localStorage.getItem('token') } })).data.newSummary;
        setPosts([...posts,response]);
        toast.success("Summary Saved!");
      } catch (error) {
        console.error('Error saving summary:', error);
        toast.success("Couldn't Save Summary!")
      }
    }
  };

  const handleDelete = async (summaryId) => {
    try {
      await axios.delete('/delete-summary', { headers: { token: localStorage.getItem('token') }, data: { summaryId } });
      setPosts(posts.filter(post => post.id !== summaryId));
      toast.success("Summary Deleted!");
    } catch (error) {
      console.error('Error deleting summary:', error);
      toast.success("Could't Delete Summary!");
    }
  };

  return (
    <div className="App">
      <nav className="navbar ">
        <div className="navbar-brand" href="/">SummaryHub</div>
        <div className="ml-auto">
          {!user && (<Link to="/login" className="nav-link text-white">Log In</Link>)}
          {user && (<Link to='/' className="nav-link text-white" onClick={() => { localStorage.clear(); setUser(null); toast.success("Logged Out!") }}>Sign Out</Link>)}
        </div>
      </nav>
      {user && (<h2 className="user-text mt-3">Hello {user.name}!</h2>)}
      <div className="container mt-5">
        <div className="row">
          <div className="col-md-8 offset-md-2">
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label htmlFor="article-url">Article URL:</label>
                <input
                  type="url"
                  id="url"
                  className="form-control"
                  value={url}
                  placeholder='Enter URL'
                  onChange={(e) => setUrl(e.target.value)}
                  required
                />
              </div>
              <button type="submit" className="btn btn-primary btn-block">Summarize</button>
            </form>
            {loading && (
              <div className="text-center mt-4">
                <MagnifyingGlass
                  visible={loading}
                  height={120}
                  width={120}
                  ariaLabel="magnifying-glass-loading"
                  glassColor="#c0efff"
                  color="#e15b64"
                />
              </div>
            )}
            {summary && (
              <div id="summary-result" className="mt-4 card shadow-sm">
                <div className="card-body">
                  <h5 className="card-title">Summary</h5>
                  <p className="card-text">{summary}</p>
                  <button className="summ-button" onClick={handleSave}>Save</button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      {user && (
        <div className="toggle-container">
          <button className="btn-toggle" onClick={() => setShow(!showPosts)}>
            Saved Summaries {showPosts ? <FaAngleDown /> : <FaAngleUp />}
          </button>
        </div>
      )}

      {posts.length > 0 && showPosts && (
        <SavedSummaries posts={posts} onDelete={handleDelete} />
      )}
    </div>
  );
}

export default Home;
