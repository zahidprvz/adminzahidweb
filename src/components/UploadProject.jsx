import React, { useState } from 'react';
import { db, storage } from '../../firebase';
import { collection, addDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { motion, AnimatePresence } from 'framer-motion';
import { FaCloudUploadAlt, FaGithub, FaLink, FaTags, FaImage, FaTrash, FaCheckCircle, FaExclamationCircle } from 'react-icons/fa';
import { FiX } from 'react-icons/fi';

const UploadProject = () => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    githubLink: '',
    liveLink: '',
    tags: [],
  });
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [tagInput, setTagInput] = useState('');
  const [uploading, setUploading] = useState(false);
  const [status, setStatus] = useState({ type: '', message: '' });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
      setImagePreview(URL.createObjectURL(file));
      setStatus({ type: '', message: '' });
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
      setImage(file);
      setImagePreview(URL.createObjectURL(file));
      setStatus({ type: '', message: '' });
    } else {
      setStatus({ type: 'error', message: 'Only image files are allowed.' });
    }
  };

  const addTag = (e) => {
    if (e.key === 'Enter' && tagInput.trim() !== '') {
      e.preventDefault();
      setFormData((prev) => ({
        ...prev,
        tags: [...new Set([...prev.tags, tagInput.trim()])],
      }));
      setTagInput('');
    }
  };

  const removeTag = (tagToRemove) => {
    setFormData((prev) => ({
      ...prev,
      tags: prev.tags.filter((tag) => tag !== tagToRemove),
    }));
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      githubLink: '',
      liveLink: '',
      tags: [],
    });
    setImage(null);
    setImagePreview(null);
    setTagInput('');
    setUploading(false);
  };

  const validateForm = () => {
    if (!formData.title || !formData.description || !formData.githubLink || !image) {
      setStatus({ type: 'error', message: 'Please fill in all required fields and upload an image.' });
      return false;
    }
    if (formData.githubLink && !formData.githubLink.startsWith('http')) {
      setStatus({ type: 'error', message: 'GitHub link must be a valid URL.' });
      return false;
    }
    if (formData.liveLink && !formData.liveLink.startsWith('http')) {
      setStatus({ type: 'error', message: 'Live demo link must be a valid URL.' });
      return false;
    }
    return true;
  };

  const handleUpload = async () => {
    if (!validateForm()) {
      return;
    }

    setUploading(true);
    setStatus({ type: 'info', message: 'Uploading project...' });

    try {
      const imageRef = ref(storage, `projects/${image.name}-${Date.now()}`);
      await uploadBytes(imageRef, image);
      const imageUrl = await getDownloadURL(imageRef);

      await addDoc(collection(db, 'projects'), {
        ...formData,
        imageUrl,
      });

      setStatus({ type: 'success', message: 'Project uploaded successfully!' });
      resetForm();
    } catch (error) {
      console.error('Error uploading project:', error);
      setStatus({ type: 'error', message: `Error uploading project: ${error.message}` });
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-gray-200 p-6 flex items-center justify-center">
      <motion.div
        className="bg-gray-800 p-8 md:p-12 rounded-3xl shadow-2xl w-full max-w-4xl"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
      >
        <motion.h2
          className="text-3xl md:text-4xl font-bold mb-8 text-center text-yellow-400"
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          Add a New <span className="text-white">Project</span>
        </motion.h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Form Fields Section */}
          <motion.div className="space-y-6" initial={{ x: -20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: 0.4 }}>
            {/* Project Title */}
            <div>
              <label className="block text-gray-400 font-semibold mb-2">Project Title</label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                className="w-full bg-gray-700 text-white border-none rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-yellow-400 transition-colors"
                placeholder="e.g., AI-Powered Chatbot"
              />
            </div>

            {/* Project Description */}
            <div>
              <label className="block text-gray-400 font-semibold mb-2">Project Description</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                className="w-full bg-gray-700 text-white border-none rounded-lg px-4 py-3 h-32 focus:outline-none focus:ring-2 focus:ring-yellow-400 transition-colors"
                placeholder="A brief description of the project..."
              ></textarea>
            </div>

            {/* Tags Input */}
            <div>
              <label className="block text-gray-400 font-semibold mb-2 flex items-center">
                <FaTags className="mr-2" /> Tags
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={addTag}
                  className="w-full bg-gray-700 text-white border-none rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-yellow-400 transition-colors"
                  placeholder="Press Enter to add a tag"
                />
                <div className="absolute top-1/2 -translate-y-1/2 right-4 text-gray-400">
                  <FaTags />
                </div>
              </div>
              <div className="mt-2 flex flex-wrap gap-2">
                <AnimatePresence>
                  {formData.tags.map((tag) => (
                    <motion.div
                      key={tag}
                      className="flex items-center bg-yellow-400 text-gray-900 px-3 py-1 rounded-full text-sm font-medium"
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                    >
                      {tag}
                      <button onClick={() => removeTag(tag)} className="ml-2 text-gray-900 hover:text-white">
                        <FiX />
                      </button>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </div>

            {/* GitHub Link */}
            <div>
              <label className="block text-gray-400 font-semibold mb-2 flex items-center">
                <FaGithub className="mr-2" /> GitHub Link
              </label>
              <input
                type="text"
                name="githubLink"
                value={formData.githubLink}
                onChange={handleChange}
                className="w-full bg-gray-700 text-white border-none rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-yellow-400 transition-colors"
                placeholder="https://github.com/your-project"
              />
            </div>

            {/* Live Demo Link */}
            <div>
              <label className="block text-gray-400 font-semibold mb-2 flex items-center">
                <FaLink className="mr-2" /> Live Demo Link (Optional)
              </label>
              <input
                type="text"
                name="liveLink"
                value={formData.liveLink}
                onChange={handleChange}
                className="w-full bg-gray-700 text-white border-none rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-yellow-400 transition-colors"
                placeholder="https://your-project.vercel.app"
              />
            </div>
          </motion.div>

          {/* Image Upload and Preview Section */}
          <motion.div
            className="flex flex-col items-center justify-center space-y-6"
            initial={{ x: 20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.6 }}
          >
            <label
              htmlFor="file-upload"
              className="w-full h-64 border-2 border-dashed border-gray-600 rounded-lg flex flex-col items-center justify-center text-center p-4 cursor-pointer hover:border-yellow-400 transition-colors"
              onDragOver={handleDragOver}
              onDrop={handleDrop}
            >
              <input id="file-upload" type="file" className="hidden" onChange={handleImageChange} accept="image/*" />
              {imagePreview ? (
                <img src={imagePreview} alt="Preview" className="max-h-full max-w-full rounded-lg object-contain" />
              ) : (
                <div className="flex flex-col items-center text-gray-500">
                  <FaImage className="text-5xl mb-4 text-yellow-400" />
                  <p className="font-semibold">Drag & drop an image here</p>
                  <p className="text-sm">or</p>
                  <span className="mt-2 px-4 py-2 bg-yellow-400 text-gray-900 rounded-full font-bold hover:bg-yellow-500 transition-colors">
                    Browse
                  </span>
                </div>
              )}
            </label>
            {image && (
              <motion.div
                className="flex items-center text-gray-400 text-sm"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <span className="truncate max-w-xs">{image.name}</span>
                <button onClick={() => { setImage(null); setImagePreview(null); }} className="ml-2 text-red-500 hover:text-red-400">
                  <FaTrash />
                </button>
              </motion.div>
            )}
          </motion.div>
        </div>

        {/* Status Message and Upload Button */}
        <motion.div
          className="mt-12 space-y-4"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.8 }}
        >
          <AnimatePresence>
            {status.message && (
              <motion.div
                className={`p-4 rounded-lg flex items-center ${status.type === 'success' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
              >
                {status.type === 'success' ? <FaCheckCircle className="mr-3" /> : <FaExclamationCircle className="mr-3" />}
                {status.message}
              </motion.div>
            )}
          </AnimatePresence>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleUpload}
            disabled={uploading}
            className="w-full bg-yellow-400 text-gray-900 px-6 py-3 rounded-lg font-bold text-lg hover:bg-yellow-500 transition-colors flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {uploading ? (
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                className="flex items-center"
              >
                <FaCloudUploadAlt className="mr-2" /> Uploading...
              </motion.div>
            ) : (
              <>
                <FaCloudUploadAlt className="mr-2" /> Upload Project
              </>
            )}
          </motion.button>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default UploadProject;
