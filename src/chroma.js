import 'dotenv/config';
import { ChromaClient } from 'chromadb';

const client = new ChromaClient();
const CHROMA_COLLECTION = process.env.CHROMA_COLLECTION;

export const createChromaCollectionIfNotExists = async () => {
  try {
    const collectionCount = await client.countCollections();

    if (!collectionCount) {
      await client.createCollection({
        name: CHROMA_COLLECTION,
      });

      console.log(`collection with name ${CHROMA_COLLECTION} created!`);
    } else {
      console.log(`collection with name ${CHROMA_COLLECTION} exists!`);
    }
  } catch (err) {
    console.log(err);
  }
};

export const addChromaDocument = async (documents, ids) => {
  try {
    const collection = await client.getCollection({ name: CHROMA_COLLECTION });

    await collection.add({
      documents,
      ids,
    });

    console.log('Document added');
  } catch (err) {
    console.error('Error adding document to ChromaDB:', err);
  }
};
