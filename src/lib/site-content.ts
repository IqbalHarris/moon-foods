import businessFile from '../content/business.json';
import homepageFile from '../content/homepage.json';
import foodFile from '../content/food.json';
import { normalizeBusiness, normalizeHomepage, normalizeFood } from './content-model.mjs';

export const business = normalizeBusiness(businessFile);
export const homepage = normalizeHomepage(homepageFile);
export const food = normalizeFood(foodFile);
