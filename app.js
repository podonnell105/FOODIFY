const searchMeal = async (e) => {
  e.preventDefault();

  // Select Elements
  const resultsContainer = document.querySelector(".results-container");
  const header = document.querySelector("header");
  const body = document.querySelector("body");

  const showMealInfo = (meal) => {
      const { strMeal, strMealThumb, strInstructions } = meal;

      const mealElement = document.createElement("div");
      mealElement.classList.add("meal");
      mealElement.innerHTML = `
          <div class="meal-content">
              <div class="meal-image">
                  <img src="${strMealThumb}" alt="${strMeal}">
              </div>
              <div class="meal-details">
                  <h2 class="meal-title">${strMeal}</h2>
                  <p class="meal-info">${strInstructions}</p>
              </div>
          </div>
      `;
      resultsContainer.appendChild(mealElement);

      // Add click event listener to expand/collapse details
      mealElement.addEventListener("click", () => {
          mealElement.classList.toggle("expanded");
      });
  };

  const showAlert = (message) => {
      alert(message);
  };

  // Fetch Data
  const fetchMealData = async (ingredient) => {
      try {
          const res = await fetch(`https://www.themealdb.com/api/json/v1/1/filter.php?i=${ingredient}`);
          if (!res.ok) {
              throw new Error('Network response was not ok');
          }
          const { meals } = await res.json();
          return meals;
      } catch (error) {
          console.error('Fetch error: ', error);
          showAlert("An error occurred while fetching the meal data.");
      }
  };

  const fetchMealDetails = async (mealId) => {
      try {
          const res = await fetch(`https://www.themealdb.com/api/json/v1/1/lookup.php?i=${mealId}`);
          if (!res.ok) {
              throw new Error('Network response was not ok');
          }
          const { meals } = await res.json();
          return meals[0];
      } catch (error) {
          console.error('Fetch error: ', error);
          showAlert("An error occurred while fetching the meal details.");
      }
  };

  const ingredients = Array.from(document.querySelectorAll('.tag')).map(tag => tag.textContent.trim());

  if (ingredients.length > 0) {
      resultsContainer.innerHTML = ""; // Clear previous results
      let mealsWithAllIngredients = new Set();

      for (const ingredient of ingredients) {
          const meals = await fetchMealData(ingredient);
          if (!meals) {
              showAlert(`Meal not found for ingredient: ${ingredient}`);
              return;
          }

          const mealIds = new Set(meals.map(meal => meal.idMeal));
          if (mealsWithAllIngredients.size === 0) {
              mealsWithAllIngredients = mealIds;
          } else {
              mealsWithAllIngredients = new Set([...mealsWithAllIngredients].filter(id => mealIds.has(id)));
          }

          if (mealsWithAllIngredients.size === 0) {
              showAlert("No meals found with all the specified ingredients :(");
              return;
          }
      }

      const mealIdsArray = Array.from(mealsWithAllIngredients).slice(0, 10);
      for (const mealId of mealIdsArray) {
          const meal = await fetchMealDetails(mealId);
          if (meal) {
              showMealInfo(meal);
          }
      }

      // Move the search bar up
      body.style.height = "auto";
      header.style.transform = "translateY(-200px)";
  } else {
      showAlert("Please try searching for meal :)");
  }
};

const form = document.querySelector("form");
form.addEventListener("submit", searchMeal);

const magnifier = document.querySelector(".magnifier");
magnifier.addEventListener("click", (e) => {
  e.preventDefault();
  searchMeal(e);
});

const input = document.querySelector(".input");
const tagsContainer = document.querySelector(".tags-container");

input.addEventListener("keydown", (e) => {
  if (e.key === 'Enter') {
      e.preventDefault();
      const value = input.value.trim();
      if (value) {
          addTag(value);
          input.value = '';
      }
  }
});

const addTag = (value) => {
  const tag = document.createElement("div");
  tag.classList.add("tag");
  tag.innerHTML = `${value} <i class="fa-solid fa-xmark"></i>`;
  tagsContainer.appendChild(tag);

  tag.querySelector("i").addEventListener("click", () => {
      tag.remove();
  });
};
