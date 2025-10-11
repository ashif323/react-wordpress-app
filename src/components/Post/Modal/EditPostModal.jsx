const EditPostModal = ({handleCloseEvent}) => {
    return <>
        <div class="modal" id="editPostModal">
            <div class="fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-50">
                <div class="bg-white p-6 rounded-lg shadow-lg w-1/2 relative">
                <div class="loader"></div> 
                <h2 class="text-2xl mb-4">Edit Post</h2>
                <form>
                    <div class="mb-4 flex space-x-4">
                    <div class="flex-1">
                        <label class="block text-sm font-medium mb-2">Title</label>
                        <input
                        type="text"
                        class="border border-gray-300 rounded w-full p-2"
                        value="Sample Post Title"
                        required
                        />
                    </div>
                    <div class="flex-1">
                        <label class="block text-sm font-medium mb-2">Category</label>
                        <select
                        class="border border-gray-300 rounded w-full p-2"
                        required
                        >
                        <option value="">Select Category</option>
                        <option value="1">Category 1</option> 
                        <option value="2">Category 2</option> 
                        </select>
                    </div>
                    </div>
            
                    <div class="mb-4">
                    <label class="block text-sm font-medium mb-2">Content</label>
                    <textarea class="border border-gray-300 rounded w-full p-2" rows="6" required>Sample post content goes here
                    </textarea>
                    </div>
            
                    <div class="mb-4 flex space-x-4">
                    <div class="flex-1">
                        <label class="block text-sm font-medium mb-2">Featured Image</label>
                        <input
                        type="file"
                        />
                        <br /><br />
                        <img src="http://localhost/wp/wp-tuts/wp-content/uploads/2024/10/default-featured-image.jpg" />
                    </div>
                    <div class="flex-1">
                        <label class="block text-sm font-medium mb-2">Status</label>
                        <select
                        class="border border-gray-300 rounded w-full p-2"
                        required
                        >
                        <option value="publish">Publish</option>
                        <option value="draft">Draft</option>
                        </select>
                    </div>
                    </div>
            
                    <div class="flex justify-end">
                    <button
                        type="button"
                        class="bg-gray-500 text-white px-4 py-2 rounded mr-2"
                    onClick={handleCloseEvent}>
                        Cancel
                    </button>
                    <button
                        type="submit"
                        class="bg-blue-500 text-white px-4 py-2 rounded"
                    >
                        Update
                    </button>
                    </div>
                </form>
                </div>
            </div>
    </div>

  

    </>
}

export default EditPostModal;