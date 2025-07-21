import { Injectable } from "@angular/core";
import { ActivatedRouteSnapshot, Resolve, Router, RouterStateSnapshot } from "@angular/router";
import { Recipe } from "./recipe.model";
import { DataStorageService } from "../shared/data-storage.service";
import { RecipeService } from "./recipe.service";
import { Observable, of } from "rxjs";
import { map, catchError } from "rxjs/operators";

@Injectable({ providedIn: 'root' })
export class RecipeResolverService implements Resolve<Recipe[]> {

    constructor(
        private dataStorageService: DataStorageService, 
        private recipesService: RecipeService,
        private router: Router
    ) { }

    resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<Recipe[]> | Recipe[] {
        // Get the id parameter from the route
        const id = route.params['id'];
        
        const recipes = this.recipesService.getRecipes();

        if (recipes.length === 0) {
            // If no recipes are loaded, fetch them first and then validate
            return this.dataStorageService.fetchRecipes().pipe(
                map((fetchedRecipes: Recipe[]) => {
                    if (id !== undefined) {
                        return this.validateRecipeId(id, fetchedRecipes);
                    }
                    return fetchedRecipes;
                }),
                catchError(() => {
                    this.router.navigate(['/recipes']);
                    return of([]);
                })
            );
        } else {
            // Recipes are already loaded, validate the ID if it exists
            if (id !== undefined) {
                return this.validateRecipeId(id, recipes);
            }
            return recipes;
        }
    }

    private validateRecipeId(id: string, recipes: Recipe[]): Recipe[] {
        const recipeIndex = +id; // Convert string to number
        
        // Check if ID is a valid number and within bounds
        if (isNaN(recipeIndex) || recipeIndex < 0 || recipeIndex >= recipes.length) {
            // Invalid ID - redirect to recipes page
            this.router.navigate(['/recipes']);
            return [];
        }
        
        // ID is valid, return the recipes
        return recipes;
    }
}