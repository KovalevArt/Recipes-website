import axios from 'axios';
import { key,proxy } from '../config';

export default class Recipe {
	constructor(id) {
		this.id = id;
	}

	async getRecipe() {
		try {
			const res = await axios(`${proxy}http://food2fork.com/api/get/?key=${key}&rId=${this.id}`);
			this.title = res.data.recipe.title;
			this.author = res.data.recipe.publisher;
			this.img = res.data.recipe.image_url;
			this.url = res.data.recipe.source_url;
			this.ingredients = res.data.recipe.ingredients;
			//console.log(res.data.recipe.ingredients.length);
		} catch (error) {
			console.log(error);
			alert('Что-то пошло не так')
		}

	}

	calcTime() {
		//Предположим, что нам необходимо по 15 минут для 3 ингридиентов.
		const numIng = this.ingredients.length;
		
		const periods = Math.ceil(numIng / 3);
		this.time = periods * 15;
	}

	calcServing() {
		this.servings = 4;
	}

	parseIngredients() {

		const unitsLong = ['tablespoons','tablespoon','ounces','ounce','teaspoons','teaspoon','cups','pounds'];
		const unitsShort = ['tbsp','tbsp','oz','oz','tsp','tsp','cup','pound'];
		const units = [...unitsShort, 'kg', 'g']
		const newIngredients = this.ingredients.map(el=> {
				// сокращаем слова
				let ingredient = el.toLowerCase();
				unitsLong.forEach((unit, i) => {
					ingredient = ingredient.replace(unit, unitsShort[i])
				});
				//убираем скобки
				ingredient = ingredient.replace(/ *\([^]*\) */g, ' ');

				//
				const arrIng = ingredient.split(' ');
				const unitIndex = arrIng.findIndex(el2 => units.includes(el2));

				let objIng;
				if (unitIndex > -1) {
					// 4 1/2 -> [4, 1/2] --> eval("4+1/2") ==> 4+0.5=4.5
					//4 -> [4]
					const arrCount = arrIng.slice(0, unitIndex); 
					let count;
					if (arrCount.length === 1 ) {
						count = eval(arrIng[0].replace('-','+'));
					} else {
						count = eval(arrIng.slice(0, unitIndex).join('+'));
					}

					objIng = {
						count,
						unit:arrIng[unitIndex],
						ingredient: arrIng.slice(unitIndex + 1).join(' ')
					}


				} else if (parseInt(arrIng[0],10)) {
					//there is No a unit, но первое слово - число
					objIng = {
						count:parseInt(arrIng[0],10),
						unit:'',
						ingredient: arrIng.slice(1).join(' ')
					}
				} else if (unitIndex === -1) {
					//there is No a unit, и не число
					objIng = {
						count:1,
						unit:'',
						ingredient
					}
				}
				return objIng;

		});
		this.ingredients = newIngredients
	}

	upgradeServings (type) {
		
		const newServings = type === 'dec' ? this.servings - 1 : this.servings + 1;

        
        this.ingredients.forEach(ing => {
            ing.count *= (newServings / this.servings);
        });

        this.servings = newServings;
		
	}
}
