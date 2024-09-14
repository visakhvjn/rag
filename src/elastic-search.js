import 'dotenv/config';
import { Client } from '@elastic/elasticsearch';

const index = process.env.ES_INDEX;
const url = process.env.ES_URL;

const client = new Client({ node: url });

export const checkESConnection = async () => {
  try {
    const health = await client.cluster.health();

    if (health.statusCode === 200) {
      console.log('Connected to ES instance');
    }
  } catch (error) {
    console.error('Error connecting to Elasticsearch:', error);
  }
}

export const saveDocumentToES = async (document) => {
  try {
    const response = await client.index({
      index: index,
      document: document,
    });
    
    console.log('Document indexed:', response.body);
    return response.body;
  } catch (error) {
    console.error('Error indexing document:', error);
    throw error;
  }
}

export const createIndexIfNotExists = async () => {
  try {
    const indexExists = await client.indices.exists({ index: index });

    if (indexExists.body) {
      console.log(`Index "${index}" already exists.`);
    } else {
      const response = await client.indices.create({
        index: index,
        body: {
          mappings: {
            properties: {
              chunk_id: {
                type: 'integer',
              },
              content: {
                type: 'text',
                analyzer: 'standard',
              },
              source: {
                type: 'keyword',
              },
              vector_embedding: {
                type: 'dense_vector',
                dims: 768,
              },
            },
          },
        },
      });

      console.log(`Index "${index}" created successfully:`, response.body);
    }
  } catch (error) {
    console.error(`Error while checking or creating the index "${index}":`, error);
    throw error;
  }
};