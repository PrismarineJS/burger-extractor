
// Block extractor

const fs = require('fs');
const path = require('path');

module.exports = ({ recipes }, outputDirectory) => new Promise((resolve, reject) => {

	const extracted = {};

	// For each recipe
	for(let name in recipes) {

		const recipeList = recipes[name];
		const recipeData = [];
		extracted[name] = recipeData

		// For each possible recipe for item
		for (var i = 0; i < recipeList.length; ++i) {

			const recipe = recipeList[i]

			// recipeData[i] = [];
			const recipeItemList = recipeData;

			switch(recipe.type) {

				case 'shape':

					let inShape;
					recipeItemList.push({
						count: recipe.amount,
						metadata: recipe.metadata,
						inShape: inShape = [],
						result: {
							count: recipe.makes.count,
							textId: recipe.makes.name
						}
					})

					// For each shape
					for (j = recipe.shape.length - 1; j >= 0; --j) {

						const line = recipe.shape[j];
						const shapeLine = [];

						for (var k = 0; k < line.length; ++k) {

							if (line[k]) shapeLine.push(line[k].name)
							else shapeLine.push(null)
						}

						inShape.push(shapeLine)

					}

					break;

				case 'shapeless':
				
					let ingredients;
					recipeItemList.push({
						count: recipe.amount,
						metadata: recipe.metadata,
						ingredients: ingredients = [],
						result: {
							count: recipe.makes.count,
							textId: recipe.makes.name
						}
					})
			
					// For each recipe ingredient
					for (j = 0; j < recipe.ingredients.length; ++j) {
						var ingredient = recipe.ingredients[j]
						ingredients.push(ingredient.name)
					}

					break;

				default:
					reject(new Error(`Unexpected recipe type ${recipe.type}`))
					break;

			}

		}

	}

	try {
		fs.writeFileSync(path.join(outputDirectory, 'recipes.json'), JSON.stringify(extracted, null, 2))
		resolve()
	} catch(e) {
		reject(e)
	}

})