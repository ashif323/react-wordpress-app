import { CKEditor } from "@ckeditor/ckeditor5-react";
import ClassicEditor from "@ckeditor/ckeditor5-build-classic";
import { useEffect, useState } from "react";
import Loader from "../../loader";

const EditPostModal = ({ handleCloseEvent, postId, categoriesList, refreshWordpressPosts }) => {
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("");
  const [editorContent, setEditorContent] = useState("");
  const [featuredImage, setFeaturedImage] = useState(null);
  const [status, setStatus] = useState("");
  const [displayLoader, setDisplayLoader] = useState(false);
  const [defaultFeaturedImageUrl, setDefaultFeaturedImageUrl] = useState(
    "http://localhost/wp/wp_plugins/wp-content/uploads/2025/10/no-image-icon-10.png"
  );

  useEffect(() => {
    if (postId) {
      fetchSingleWordPressPostData(postId);
    }
  }, [postId]);

  const fetchSingleWordPressPostData = async (postId) => {
    setDisplayLoader(true);
    try {
      const token = window.localStorage.getItem("jwt_token");

      const apiResponse = await fetch(
        `http://localhost/wp/wp_plugins/wp-json/wp/v2/posts/${postId}`,
        {
          method: "GET",
          headers: {
            Authorization: "Bearer " + token,
          },
        }
      );

      if (!apiResponse.ok) {
        const error = await apiResponse.json();
        console.error("Failed to fetch post:", error);
        alert("Failed to fetch post: " + error.message);
        return;
      }
      const apiData = await apiResponse.json();

      setTitle(apiData.title.rendered);
      setCategory(apiData.categories[0]);
      setEditorContent(apiData.content.rendered);
      setStatus(apiData.status);

      let featuredImageMediaId = apiData.featured_media;
      if (featuredImageMediaId > 0) {
        fetchWordPressPostMediaURL(featuredImageMediaId);
      } else {
        setDefaultFeaturedImageUrl(
          "http://localhost/wp/wp_plugins/wp-content/uploads/2025/10/no-image-icon-10.png"
        );
      }
    } catch (error) {
      console.log("Fetch single post error:", error);
    } finally {
      setDisplayLoader(false);
    }
  };

  const fetchWordPressPostMediaURL = async (mediaId) => {
    setDisplayLoader(true);
    try {
      const token = window.localStorage.getItem("jwt_token");

      const apiResponse = await fetch(
        `http://localhost/wp/wp_plugins/wp-json/wp/v2/media/${mediaId}`,
        {
          method: "GET",
          headers: {
            Authorization: "Bearer " + token,
          },
        }
      );

      if (!apiResponse.ok) {
        const error = await apiResponse.json();
        console.error("Failed to fetch media:", error);
        alert("Failed to fetch featured image: " + error.message);
        return;
      }
      const apiData = await apiResponse.json();
      setDefaultFeaturedImageUrl(apiData.source_url);
    } catch (error) {
      console.log("Fetch media error:", error);
    } finally {
      setDisplayLoader(false);
    }
  };

  const handleFormSubmitData = async (event) => {
    event.preventDefault();

    const postData = {
      title,
      content: editorContent,
      categories: [category],
      status,
    };

    let featuredMediaId = null;
    if (featuredImage) {
      featuredMediaId = await uploadNewFeaturedMediaImage(featuredImage);
      if (featuredMediaId) {
        postData.featured_media = featuredMediaId;
      }
    }

    setDisplayLoader(true);
    try {
      const token = window.localStorage.getItem("jwt_token");

      const apiResponse = await fetch(
        `http://localhost/wp/wp_plugins/wp-json/wp/v2/posts/${postId}`,
        {
          method: "PUT",
          headers: {
            Authorization: "Bearer " + token,
            "Content-type": "application/json",
          },
          body: JSON.stringify(postData),
        }
      );

      if (!apiResponse.ok) {
        const errorData = await apiResponse.json();
        console.error("Failed to update post:", errorData);
        alert("Failed to update post: " + errorData.message);
        return;
      }

      const apiData = await apiResponse.json();
      console.log("Updated Post:", apiData);

      handleCloseEvent();
      refreshWordpressPosts();
    } catch (error) {
      console.log("Post update error:", error);
      alert("Unexpected error occurred while updating post.");
    } finally {
      setDisplayLoader(false);
    }
  };

  const uploadNewFeaturedMediaImage = async (file) => {
    setDisplayLoader(true);
    try {
      const token = window.localStorage.getItem("jwt_token");

      const formdata = new FormData();
      formdata.append("file", file);
      formdata.append("alt_text", "New Featured Image");

      const response = await fetch(
        "http://localhost/wp/wp_plugins/wp-json/wp/v2/media",
        {
          method: "POST",
          headers: {
            Authorization: "Bearer " + token,
          },
          body: formdata,
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        console.error("Media upload failed:", errorData);
        alert("Media upload failed: " + errorData.message);
        return null;
      }

      const data = await response.json();
      return data.id;
    } catch (error) {
      console.log("Upload error:", error);
      alert("Unexpected error during media upload.");
      return null;
    } finally {
      setDisplayLoader(false);
    }
  };

  return (
    <div className="modal" id="editPostModal">
      <div className="fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-50">
        <div className="bg-white p-6 rounded-lg shadow-lg w-1/2 relative">
          {displayLoader && <Loader />}
          <h2 className="text-2xl mb-4">Edit Post</h2>
          <form onSubmit={handleFormSubmitData}>
            <div className="mb-4 flex space-x-4">
              <div className="flex-1">
                <label className="block text-sm font-medium mb-2">Title</label>
                <input
                  type="text"
                  className="border border-gray-300 rounded w-full p-2"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                />
              </div>
              <div className="flex-1">
                <label className="block text-sm font-medium mb-2">Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="border border-gray-300 rounded w-full p-2"
                  required
                >
                  <option value="">Select Category</option>
                  {Object.entries(categoriesList).map(([index, value]) => (
                    <option value={index} key={index}>
                      {value}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">Content</label>
              <CKEditor
                editor={ClassicEditor}
                data={editorContent}
                onChange={(e, editor) => setEditorContent(editor.getData())}
              />
            </div>
            <div className="mb-4 flex space-x-4">
              <div className="flex-1">
                <label className="block text-sm font-medium mb-2">Featured Image</label>
                <input
                  type="file"
                  onChange={(e) => setFeaturedImage(e.target.files[0])}
                />
                <br />
                <br />
                <img
                  src={defaultFeaturedImageUrl}
                  alt="Featured"
                  style={{ height: "100px" }}
                />
              </div>
              <div className="flex-1">
                <label className="block text-sm font-medium mb-2">Status</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="border border-gray-300 rounded w-full p-2"
                  required
                >
                  <option value="publish">Publish</option>
                  <option value="draft">Draft</option>
                </select>
              </div>
            </div>
            <div className="flex justify-end">
              <button
                type="button"
                className="bg-gray-500 text-white px-4 py-2 rounded mr-2"
                onClick={handleCloseEvent}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="bg-blue-500 text-white px-4 py-2 rounded"
              >
                Update
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EditPostModal;
