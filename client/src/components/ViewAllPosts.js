import React from "react";
import { useEffect, useState } from "react";
import axios from "axios";
import { Grid, Paper, Typography, Avatar, Box, Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField, CircularProgress } from '@mui/material';
import { ToastContainer, toast } from 'react-toastify';
import { AddCircleOutline } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

function AllPosts({ accessToken }) {

    const navigate = useNavigate();

    const [posts, setPosts] = useState([]);
    const [openDialog, setOpenDialog] = useState(false);
    const [currentPost, setCurrentPost] = useState(null);
    const [newComment, setNewComment] = useState("");
    const [loading, setLoading] = useState(false);

    const [openCreatePostDialog, setOpenCreatePostDialog] = useState(false);
    const [description, setDescription] = useState("");
    const [image, setImage] = useState(null);
    const [imageName, setImageName] = useState("No file chosen");

    const [coordinates, setCoordinates] = useState({ lat: null, lng: null });
    const [address, setAddress] = useState("");
    const [openMapDialog, setOpenMapDialog] = useState(false);

    useEffect(() => {
        setLoading(true);
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
            .finally(() => setLoading(false));
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

    const handleCreatePostOpenDialog = () => {
        setOpenCreatePostDialog(true);
    }

    const handleCloseCreatePostDialog = () => {
        setOpenCreatePostDialog(false);
        setDescription("");
        setImage(null);
        setImageName("No file chosen");
        setCoordinates({ lat: null, lng: null });
        setAddress("");
        set
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];

        if (file) {
            setImageName(file.name);

            const reader = new FileReader();
            reader.onloadend = () => {
                setImage(reader.result);
            };
            reader.readAsDataURL(file);
        }
    }

    const handleChooseLocation = () => {
        setOpenMapDialog(true);
    }

    const handleLocationSelect = (lat, lng) => {
        setCoordinates({ lat, lng });
        setOpenMapDialog(false);

        axios.get(`https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`)
            .then(response => {
                if (response.data && response.data.address) {
                    const addressData = response.data.address;
                    const street = addressData.road || '';
                    const number = addressData.house_number || '';
                    const city = addressData.city || addressData.town || addressData.village || '';
                    const postalCode = addressData.postcode || '';

                    const formattedAddress = `${street} ${number}, ${city}, ${postalCode}`;
                    setAddress(formattedAddress);
                } else {
                    toast.error('No address found for these coordinates.');
                }
            })
            .catch(error => {
                console.error("Error fetching address:", error);
                toast.error("Failed to fetch address.");
            });
    }

    const handleCreatePost = (e) => {
        e.preventDefault();

        if (!description.trim() || !image) {
            toast.warning("Action blocked: You cannot create post without image/description/location.");
            return;
        }

        const newPost = {
            description: description,
            image: image,
            x: coordinates.lat,
            y: coordinates.lng,
            created_by: localStorage.getItem("currentUser")
        }

        console.log(newPost);

        setLoading(true);

        api.post("/post/createPost", newPost)
            .then(() => {
                handleCloseCreatePostDialog();
                window.location.reload();
            })
            .catch((error) => {
                console.log(error);
                toast.error(error.response?.data);
            })
            .finally(() => {
                setLoading(false);
            })
    }

    function LocationMarker() {
        const map = useMapEvents({
            click(e) {
                const { lat, lng } = e.latlng;
                handleLocationSelect(lat, lng);
                map.flyTo(e.latlng, map.getZoom());
            },
        });
        return coordinates.lat !== null ? <Marker position={[coordinates.lat, coordinates.lng]} /> : null;
    }

    return (
        <Grid container spacing={2}>
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
            {accessToken && (
                <Grid item xs={2} sx={{ margin: 2 }}>
                    <Paper onClick={handleCreatePostOpenDialog} elevation={6} className="paper" sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', cursor: 'pointer' }}>
                        <AddCircleOutline sx={{ fontSize: 50, color: '#007bff' }} />
                    </Paper>
                </Grid>
            )}
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
            <Dialog open={loading} PaperProps={{ style: { backgroundColor: 'transparent', boxShadow: 'none' } }}>
                <CircularProgress color="primary" />
            </Dialog>
            <Dialog open={openCreatePostDialog} onClose={handleCloseCreatePostDialog} fullWidth maxWidth="sm">
                <DialogTitle>Create New Post</DialogTitle>
                <DialogContent>
                    <Box component="form" onSubmit={handleCreatePost} noValidate>
                        <TextField
                            fullWidth
                            label="Description"
                            margin="normal"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            required
                        />
                    </Box>
                    <Box mt={2} display="flex" alignItems="center">
                        <input
                            type="file"
                            accept="image/*"
                            onChange={handleImageChange}
                            style={{ display: 'none' }}
                            id="file-input"
                        />
                        <label htmlFor="file-input" style={{ width: '40%' }}>
                            <Button
                                variant="outlined"
                                color="primary"
                                component="span"
                                sx={{ width: '100%', padding: '10px' }}
                            >
                                Choose File
                            </Button>
                        </label>
                        <Typography variant="body2" sx={{ marginLeft: 2 }}>
                            {imageName}
                        </Typography>
                    </Box>
                    <Box mt={2} display="flex" alignItems="center">
                        <Button
                            variant="outlined"
                            color="primary"
                            onClick={handleChooseLocation}
                            sx={{ width: '40%', padding: '10px' }}
                        >
                            Choose Location
                        </Button>
                        <Typography variant="body2" sx={{ marginLeft: 2 }}>
                            {address || "No location chosen"}
                        </Typography>
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseCreatePostDialog} color="primary">Cancel</Button>
                    <Button onClick={handleCreatePost} color="primary">Create Post</Button>
                </DialogActions>
            </Dialog>

            <Dialog open={openMapDialog} onClose={() => setOpenMapDialog(false)} fullWidth maxWidth="md">
                <DialogTitle>Choose Location</DialogTitle>
                <DialogContent dividers>
                    <MapContainer center={[51.505, -0.09]} zoom={13} style={{ height: "400px", width: "100%" }}>
                        <TileLayer
                            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        />
                        <LocationMarker />
                    </MapContainer>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenMapDialog(false)} color="primary">Close</Button>
                </DialogActions>
            </Dialog>
            <ToastContainer />
        </Grid>
    )
}

export default AllPosts;
