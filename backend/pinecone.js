const { Pinecone } = require('@pinecone-database/pinecone');
const PINECONE_API_KEY="pcsk_7R2S84_LH18HbNXttwUxG9JoBYXytycFCgzxFyPh9uvrZZGBPMcU3NxAys16CNzZMmqnBg"


const pc = new Pinecone({
  apiKey: PINECONE_API_KEY
});

const indexName = 'researchfinders';

const model = 'multilingual-e5-large';

async function getRecommendations(opportunitieData, interests) {
    if (interests.length === 0) return opportunitieData;

    const opportunities = Object.keys(opportunitieData).map(key => ({
        id: key,
        text: opportunitieData[key].longDescription
    }));

    // console.log("==========================================");
    // console.log(opportunities);
    // console.log("==========================================");

    const embeddings = await pc.inference.embed(
    model,
    opportunities.map(d => d.text),
    { inputType: 'passage', truncate: 'END' }
    );

    // console.log(embeddings[0]);

    const index = pc.index(indexName);

    const vectors = opportunities.map((d, i) => ({
    id: d.id,
    values: embeddings[i].values,
    metadata: { 
        text: d.text
        }
    }));

    await index.namespace('ns1').upsert(vectors);

    // const stats = await index.describeIndexStats();
    // console.log('interests', interests);

    // console.log(stats)
    
    const query = interests;
    
    const embedding = await pc.inference.embed(
        model,
        query,
        { inputType: 'query' }
    );

    const queryResponse = await index.namespace("ns1").query({
        topK: 4,
        vector: embedding[0].values,
        includeValues: false,
        includeMetadata: true
    });
    
    // console.log('queryResponse', queryResponse);
    
    let recommendations = [];
    queryResponse.matches.forEach(element => {
        recommendations.push(element.id);
    });

    return recommendations;
}


// getRecommendations(opportunities, ['robotics', 'navigation', 'autonomous systems']);

module.exports = { getRecommendations };