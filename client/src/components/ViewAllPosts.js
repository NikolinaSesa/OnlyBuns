import React from "react";
import { useEffect, useState } from "react";
import axios from "axios";
import { Grid, Paper, Typography, Avatar, Box, Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField } from '@mui/material';
import { ToastContainer, toast } from 'react-toastify';

function AllPosts({ accessToken }) {

    const [posts, setPosts] = useState([]);
    const [openDialog, setOpenDialog] = useState(false);
    const [currentPost, setCurrentPost] = useState(null);
    const [newComment, setNewComment] = useState("");

    useEffect(() => {
        axios
            .get("http://localhost:8000/api/post/getAll")
            .then((response) => {
                const updatedPosts = response.data.map((post) => {
                    const diffInMinutes = (new Date().getTime() - new Date(post.created_at).getTime()) / (1000 * 60);
                    if (diffInMinutes < 60) {
                        post.created_before = `${Math.floor(diffInMinutes)} minutes ago`;
                    } else if (diffInMinutes < 1440) {
                        const diffInHours = Math.floor(diffInMinutes / 60);
                        post.created_before = `${diffInHours} hours ago`;
                    } else {
                        const diffInDays = Math.floor(diffInMinutes / 1440);
                        post.created_before = `${diffInDays} days ago`;
                    }
                    return post;
                });

                setPosts(updatedPosts);
                console.log(updatedPosts);
            })
            .catch((error) => {
                console.log(error);
                toast.error(error.response?.data);
            })
    }, [])

    const api = axios.create({
        baseURL: 'http://localhost:8000/api',
        headers: {
            'x-auth-token': `${accessToken}`,
            'Content-Type': 'application/json'
        }
    });

    const handleComment = (postId) => {
        const post = posts.find((p) => p._id === postId);
        setCurrentPost(post);
        setOpenDialog(true);
    }

    const handleAddComment = () => {
        if (!accessToken) {
            toast.warning("Action blocked: Only logged-in users can comment. Please log in.");
            return;
        }

        if (!newComment.trim()) return;

        const comment = {
            postId: currentPost._id,
            created_by: localStorage.getItem("currentUser"),
            text: newComment
        }

        api.put("/post/commentPost", comment).then((result) => {
            const updatedPosts = posts.map((post) => {
                if (post._id === currentPost._id) {
                    return {
                        ...post,
                        comments: result.data.comments
                    }
                }
                return post;
            });

            setPosts(updatedPosts);
            setOpenDialog(false);
            setCurrentPost(null);
            setNewComment("");

        }).catch(error => {
            console.log(error);
            toast.error(error.response?.data);
        })

    };

    const handleCloseDialog = () => {
        setOpenDialog(false);
        setCurrentPost(null);
        setNewComment("");
    };

    const handleLike = (postId) => {
        if (!accessToken) {
            toast.warning("Action blocked: Only logged-in users can like. Please log in.");
            return;
        }

        const like = {
            postId: postId,
            liked_by: localStorage.getItem("currentUser")
        }

        api.put("/post/likePost", like).then((result) => {
            const updatedPosts = posts.map((post) => {
                if (post._id === postId) {
                    return {
                        ...post,
                        likes: result.data.likes
                    }
                }

                return post;
            });

            setPosts(updatedPosts);

        }).catch((error) => {
            console.log(error.response);
            toast.error(error.response?.data);
        })
    }

    const handleViewUserProfile = (postId) => {
        const post = posts.find((post) => post._id === postId);

        axios
            .get(`http://localhost:8000/api/user/getUser/${post.created_by}`)
            .then((result) => {
                console.log(result.data);
            })
            .catch(error => {
                console.error(error);
            })

    }

    return (
        <Grid container spacing={4}>
            {posts.map((post) => (
                <Grid item xs={2} key={post._id} sx={{ margin: 2 }}>
                    <Paper className="paper" elevation={6}>
                        <Box display="flex" justifyContent="center" alignItems="center" mb={1}>
                            <Avatar
                                src={post.image}
                                alt={post.created_by}
                                variant="square"
                                sx={{ width: 150, height: 150, objectFit: 'cover' }}
                            />
                        </Box>
                        <Typography variant="h6" bgcolor='#007bff' borderRadius='5px' color='white' padding='5px' component="div" onClick={() => handleViewUserProfile(post._id)} style={{ cursor: 'pointer', marginRight: '5px' }}>
                            {post.created_by}
                        </Typography>
                        <Typography variant="body1" padding='5px' component="div">
                            {post.description}
                        </Typography>
                        <Typography variant="body2" padding='5px' component="div">
                            <span role="img" aria-label="like" style={{ cursor: 'pointer', marginRight: '5px' }} on onClick={() => handleLike(post._id)}>👍</span> {post.likes.length} | <span role="img" aria-label="comment" style={{ cursor: 'pointer', marginRight: '5px' }} onClick={() => handleComment(post._id)}>💬</span> {post.comments.length}
                        </Typography>
                        <Typography variant="body1" padding='5px' component="div" sx={{ fontSize: '0.875rem', color: 'gray' }}>
                            {post.created_before}
                        </Typography>
                    </Paper>
                </Grid>
            ))}
            <ToastContainer />
            <Dialog open={openDialog} onClose={handleCloseDialog} fullWidth maxWidth="sm">
                <DialogTitle>Comments</DialogTitle>
                <DialogContent>
                    {currentPost && currentPost.comments.map((comment, index) => (
                        <Typography key={index} variant="body2" gutterBottom>
                            {comment.created_by}: {comment.text}
                        </Typography>
                    ))}
                    <TextField
                        fullWidth
                        margin="dense"
                        label="Add a comment"
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseDialog} color="primary">Cancel</Button>
                    <Button onClick={handleAddComment} color="primary">Add Comment</Button>
                </DialogActions>
            </Dialog>
        </Grid>
    )
}

export default AllPosts;
