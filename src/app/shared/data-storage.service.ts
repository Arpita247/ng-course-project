import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { RecipeService } from "../recipes/recipe.service";
import { Recipe } from "../recipes/recipe.model";
import { map, tap } from "rxjs/operators";

@Injectable({ providedIn: 'root' })
export class DataStorageService {

    constructor(private http: HttpClient, private recipeService: RecipeService) { }

    storeRecipes() {
        const recipes = this.recipeService.getRecipes();
        this.http
            .put('https://ng-course-recipe-book-d88d0-default-rtdb.firebaseio.com/recipes.json', recipes)
            .subscribe((response) => {
                console.log(response);
            })
    }

    fetchRecipes() {
       return this.http
            .get<Recipe[]>('https://ng-course-recipe-book-d88d0-default-rtdb.firebaseio.com/recipes.json')
            //map is used to transform the data before it is returned
            //in this case we are transforming the data to add ingredients to the recipes
            //if the recipe has no ingredients, we set it to an empty array
            .pipe(map(recipes => {
                return recipes.map(recipe => {
                    return { ...recipe, ingredients: recipe.ingredients ? recipe.ingredients : [] }
                })
            }), tap(recipes => {
                this.recipeService.setRecipes(recipes);
            }))
    }
}