import express from 'express';
import fs from 'fs/promises';
import {
  deleteDocumentById,
  getDocumentById,
  listDocuments
} from '../db.js';

const router = express.Router();

// Get all documents
router.get('/', async (req, res) => {
  try {
    const documents = await listDocuments();
    res.json({ documents });
  } catch (error) {
    console.error('Error fetching documents:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get a single document
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const result = await getDocumentById(id);
    if (!result) {
      return res.status(404).json({ error: 'Document not found' });
    }

    res.json(result);
  } catch (error) {
    console.error('Error fetching document:', error);
    res.status(500).json({ error: error.message });
  }
});

// Delete a document
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // Get document file path before deletion
    const { filePath, deleted } = await deleteDocumentById(id);

    if (!deleted) {
      return res.status(404).json({ error: 'Document not found' });
    }

    if (filePath) {
      try {
        await fs.unlink(filePath);
      } catch (fileError) {
        console.error('Error deleting file:', fileError);
      }
    }

    res.json({ success: true, message: 'Document deleted successfully' });
  } catch (error) {
    console.error('Error deleting document:', error);
    res.status(500).json({ error: error.message });
  }
});

export { router as documentsRouter };

