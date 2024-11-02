function addRecommendations(opportunities, recommendations) {
    // recommendations is a list of opportunity IDs in orderr of relevance
    // opportunities is a json object with opportunities indexed by ID
    // create a json object with opportunities in order of recommendations
    // take care if something is undefined

    if (opportunities === undefined || recommendations === undefined) {
        console.log("Opportunities or Recommendations are undefined");
        return;
    }

    let recommendedOpportunities = [];
    recommendations.forEach(id => {
        if (opportunities[id] === undefined) {
            console.log("Opportunity ID not found: ", id);
            return;
        }
        opportunities[id].recommend = true;
        recommendedOpportunities.push(opportunities[id]);
    });
     
    // add other opportunities to the end of the list
    for (let id in opportunities) {
        if (!recommendations.includes(id)) {
            opportunities[id].recommend = false;
            recommendedOpportunities.push(opportunities[id]);
        }
    }

    // console.log(recommendedOpportunities);
    return recommendedOpportunities;
}

module.exports = { addRecommendations };    // Export the function