import Post from "../models/Post.js";

export const createPost = async (req, res) => {
  try {
    const { content, author } = req.body;
    const postData = { content, author };
    if (req.file) {
      postData.image = req.file.path.replace(/\\/g, "/"); 
    }
    const post = await Post.create(postData);
    const populatedPost = await Post.findById(post._id).populate("author", "name");
    res.status(201).json(populatedPost);
  } catch (error) {
    res.status(500).json({ message: "Failed to create post", error: error.message });
  }
};

export const getPosts = async (req, res) => {
  try {
    const posts = await Post.find()
      .populate("author", "name")
      .populate("comments.user", "name")
      .sort({ createdAt: -1 });
    res.json(posts);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch posts", error: error.message });
  }
};

export const toggleLike = async (req, res) => {
  try {
    const { userId } = req.body;
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: "Post not found" });

    const index = post.likes.indexOf(userId);
    if (index === -1) {
      post.likes.push(userId);
    } else {
      post.likes.splice(index, 1);
    }

    await post.save();
    res.json(post);
  } catch (error) {
    res.status(500).json({ message: "Failed to update like", error: error.message });
  }
};

export const addComment = async (req, res) => {
  try {
    const { userId, text } = req.body;
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: "Post not found" });

    post.comments.push({ user: userId, text });
    await post.save();
    
    const updatedPost = await Post.findById(req.params.id)
      .populate("author", "name")
      .populate("comments.user", "name");
      
    res.json(updatedPost);
  } catch (error) {
    res.status(500).json({ message: "Failed to add comment", error: error.message });
  }
};
