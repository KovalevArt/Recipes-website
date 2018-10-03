import Search from './models/Search';
import Recipe from './models/Recipe';
import * as searchView from './views/searchView';
import * as recipeView from './views/recipeView';
import { elements, renderLoader,clearLoader } from './views/base';
/*
GLBAL state
*/


/*SEARCH CONTROLLEr*/
const state = {}

const controlSearch = async () => {
	const query = searchView.getInput(); //todo

	//console.log(query);

	if (query) {

		//добавлям в состояние объект
		state.search = new Search(query);
		//очищаем импут
		searchView.clearInput();
		//ckear result
		searchView.clearResults();
		//иконка загрузки
		renderLoader(elements.searchRes);

		try {
			//ищем рецепты
			await state.search.getResults();

			//console.log(state.search.result);
			clearLoader();
			//рендер ркзультатов
			searchView.renderResults(state.search.result);

		} catch (err) {
			alert("ОШИБКА");
			clearLoader();
		}
		

	}
}

elements.searchForm.addEventListener('submit', e=> {
	e.preventDefault();
	controlSearch();
});


elements.searchResPages.addEventListener('click', e => {
	const btn = e.target.closest('.btn-inline');
	//console.log(btn);
	if (btn) {
		const goToPage = parseInt(btn.dataset.goto, 10);
		searchView.clearResults();
		searchView.renderResults(state.search.result, goToPage);
	}
});

/*RECIPE CONTROLLER
*/
 const r = new Recipe(47011);
 r.getRecipe();


console.log(r);

const controlRecipe = async () => {
	// Берем Id от URL
	const id = window.location.hash.replace('#','');
	
	if (id) {
		//готовим UI для изменений
		recipeView.clearRecipe();
		renderLoader(elements.recipe);

		//Подсветить выбранный элемент
		if	(state.search) searchView.highlightSelecte(id);

		//создаем новый объект рецепт
		state.recipe = new Recipe(id);

		try {
			// Получаем данные рецепта
			await state.recipe.getRecipe();
			state.recipe.parseIngredients();
			//Расчитываем время 
			state.recipe.calcTime();
			state.recipe.calcServing();
			//Рендер резульатов
			console.log(state);
			clearLoader();
			recipeView.renderRecipe(state.recipe);
		} catch (err) {
			alert('Error processing');
		}
		
	}
};

['hashchange', 'load'].forEach(event=> window.addEventListener(event, controlRecipe));

// работа с кнопками управления

elements.recipe.addEventListener('click', e => {//debugger;
	if (e.target.matches('.btn-decrease, .btn-decrease *')) {
		//btn-decrease нажата 
		
		state.recipe.upgradeServings('dec')
	} else if (e.target.matches('.btn-increase, .btn-increase *')) {
		//btn-increase нажата
		
		state.recipe.upgradeServings('inc')
	}
	console.log(state.recipe)
})