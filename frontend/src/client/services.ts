import type { CancelablePromise } from './core/CancelablePromise';
import { OpenAPI } from './core/OpenAPI';
import { request as __request } from './core/request';

import type { Body_login_login_access_token,Message,NewPassword,Token,UserOut,UpdatePassword,UserCreate,UserCreateOpen,UsersOut,UserUpdate,UserUpdateMe,ItemCreate,ItemOut,ItemsOut,ItemUpdate } from './models';

export type TDataLoginLoginAccessToken = {
                formData: Body_login_login_access_token
                
            }
export type TDataLoginRecoverPassword = {
                email: string
                
            }
export type TDataLoginResetPassword = {
                requestBody: NewPassword
                
            }
export type TDataLoginRecoverPasswordHtmlContent = {
                email: string
                
            }

export class LoginService {

	/**
	 * Login Access Token
	 * OAuth2 compatible token login, get an access token for future requests
	 * @returns Token Successful Response
	 * @throws ApiError
	 */
	public static loginLoginAccessToken(data: TDataLoginLoginAccessToken): CancelablePromise<Token> {
		const {
formData,
} = data;
		return __request(OpenAPI, {
			method: 'POST',
			url: '/api/v1/login/access-token',
			formData: formData,
			mediaType: 'application/x-www-form-urlencoded',
			errors: {
				422: `Validation Error`,
			},
		});
	}

	/**
	 * Test Token
	 * Test access token
	 * @returns UserOut Successful Response
	 * @throws ApiError
	 */
	public static loginTestToken(): CancelablePromise<UserOut> {
				return __request(OpenAPI, {
			method: 'POST',
			url: '/api/v1/login/test-token',
		});
	}

	/**
	 * Recover Password
	 * Password Recovery
	 * @returns Message Successful Response
	 * @throws ApiError
	 */
	public static loginRecoverPassword(data: TDataLoginRecoverPassword): CancelablePromise<Message> {
		const {
email,
} = data;
		return __request(OpenAPI, {
			method: 'POST',
			url: '/api/v1/password-recovery/{email}',
			path: {
				email
			},
			errors: {
				422: `Validation Error`,
			},
		});
	}

	/**
	 * Reset Password
	 * Reset password
	 * @returns Message Successful Response
	 * @throws ApiError
	 */
	public static loginResetPassword(data: TDataLoginResetPassword): CancelablePromise<Message> {
		const {
requestBody,
} = data;
		return __request(OpenAPI, {
			method: 'POST',
			url: '/api/v1/reset-password/',
			body: requestBody,
			mediaType: 'application/json',
			errors: {
				422: `Validation Error`,
			},
		});
	}

	/**
	 * Recover Password Html Content
	 * HTML Content for Password Recovery
	 * @returns string Successful Response
	 * @throws ApiError
	 */
	public static loginRecoverPasswordHtmlContent(data: TDataLoginRecoverPasswordHtmlContent): CancelablePromise<string> {
		const {
email,
} = data;
		return __request(OpenAPI, {
			method: 'POST',
			url: '/api/v1/password-recovery-html-content/{email}',
			path: {
				email
			},
			errors: {
				422: `Validation Error`,
			},
		});
	}

}

export type TDataUsersReadUsers = {
                limit?: number
skip?: number
                
            }
export type TDataUsersCreateUser = {
                requestBody: UserCreate
                
            }
export type TDataUsersUpdateUserMe = {
                requestBody: UserUpdateMe
                
            }
export type TDataUsersUpdatePasswordMe = {
                requestBody: UpdatePassword
                
            }
export type TDataUsersCreateUserOpen = {
                requestBody: UserCreateOpen
                
            }
export type TDataUsersReadUserById = {
                userId: number
                
            }
export type TDataUsersUpdateUser = {
                requestBody: UserUpdate
userId: number
                
            }
export type TDataUsersDeleteUser = {
                userId: number
                
            }

export class UsersService {

	/**
	 * Read Users
	 * Retrieve users.
	 * @returns UsersOut Successful Response
	 * @throws ApiError
	 */
	public static usersReadUsers(data: TDataUsersReadUsers = {}): CancelablePromise<UsersOut> {
		const {
limit = 100,
skip = 0,
} = data;
		return __request(OpenAPI, {
			method: 'GET',
			url: '/api/v1/users/',
			query: {
				skip, limit
			},
			errors: {
				422: `Validation Error`,
			},
		});
	}

	/**
	 * Create User
	 * Create new user.
	 * @returns UserOut Successful Response
	 * @throws ApiError
	 */
	public static usersCreateUser(data: TDataUsersCreateUser): CancelablePromise<UserOut> {
		const {
requestBody,
} = data;
		return __request(OpenAPI, {
			method: 'POST',
			url: '/api/v1/users/',
			body: requestBody,
			mediaType: 'application/json',
			errors: {
				422: `Validation Error`,
			},
		});
	}

	/**
	 * Read User Me
	 * Get current user.
	 * @returns UserOut Successful Response
	 * @throws ApiError
	 */
	public static usersReadUserMe(): CancelablePromise<UserOut> {
				return __request(OpenAPI, {
			method: 'GET',
			url: '/api/v1/users/me',
		});
	}

	/**
	 * Update User Me
	 * Update own user.
	 * @returns UserOut Successful Response
	 * @throws ApiError
	 */
	public static usersUpdateUserMe(data: TDataUsersUpdateUserMe): CancelablePromise<UserOut> {
		const {
requestBody,
} = data;
		return __request(OpenAPI, {
			method: 'PATCH',
			url: '/api/v1/users/me',
			body: requestBody,
			mediaType: 'application/json',
			errors: {
				422: `Validation Error`,
			},
		});
	}

	/**
	 * Update Password Me
	 * Update own password.
	 * @returns Message Successful Response
	 * @throws ApiError
	 */
	public static usersUpdatePasswordMe(data: TDataUsersUpdatePasswordMe): CancelablePromise<Message> {
		const {
requestBody,
} = data;
		return __request(OpenAPI, {
			method: 'PATCH',
			url: '/api/v1/users/me/password',
			body: requestBody,
			mediaType: 'application/json',
			errors: {
				422: `Validation Error`,
			},
		});
	}

	/**
	 * Create User Open
	 * Create new user without the need to be logged in.
	 * @returns UserOut Successful Response
	 * @throws ApiError
	 */
	public static usersCreateUserOpen(data: TDataUsersCreateUserOpen): CancelablePromise<UserOut> {
		const {
requestBody,
} = data;
		return __request(OpenAPI, {
			method: 'POST',
			url: '/api/v1/users/open',
			body: requestBody,
			mediaType: 'application/json',
			errors: {
				422: `Validation Error`,
			},
		});
	}

	/**
	 * Read User By Id
	 * Get a specific user by id.
	 * @returns UserOut Successful Response
	 * @throws ApiError
	 */
	public static usersReadUserById(data: TDataUsersReadUserById): CancelablePromise<UserOut> {
		const {
userId,
} = data;
		return __request(OpenAPI, {
			method: 'GET',
			url: '/api/v1/users/{user_id}',
			path: {
				user_id: userId
			},
			errors: {
				422: `Validation Error`,
			},
		});
	}

	/**
	 * Update User
	 * Update a user.
	 * @returns UserOut Successful Response
	 * @throws ApiError
	 */
	public static usersUpdateUser(data: TDataUsersUpdateUser): CancelablePromise<UserOut> {
		const {
requestBody,
userId,
} = data;
		return __request(OpenAPI, {
			method: 'PATCH',
			url: '/api/v1/users/{user_id}',
			path: {
				user_id: userId
			},
			body: requestBody,
			mediaType: 'application/json',
			errors: {
				422: `Validation Error`,
			},
		});
	}

	/**
	 * Delete User
	 * Delete a user.
	 * @returns Message Successful Response
	 * @throws ApiError
	 */
	public static usersDeleteUser(data: TDataUsersDeleteUser): CancelablePromise<Message> {
		const {
userId,
} = data;
		return __request(OpenAPI, {
			method: 'DELETE',
			url: '/api/v1/users/{user_id}',
			path: {
				user_id: userId
			},
			errors: {
				422: `Validation Error`,
			},
		});
	}

}

export type TDataUtilsTestEmail = {
                emailTo: string
                
            }

export class UtilsService {

	/**
	 * Test Email
	 * Test emails.
	 * @returns Message Successful Response
	 * @throws ApiError
	 */
	public static utilsTestEmail(data: TDataUtilsTestEmail): CancelablePromise<Message> {
		const {
emailTo,
} = data;
		return __request(OpenAPI, {
			method: 'POST',
			url: '/api/v1/utils/test-email/',
			query: {
				email_to: emailTo
			},
			errors: {
				422: `Validation Error`,
			},
		});
	}

}

export type TDataItemsReadItems = {
                limit?: number
skip?: number
                
            }
export type TDataItemsCreateItem = {
                requestBody: ItemCreate
                
            }
export type TDataItemsReadItem = {
                id: number
                
            }
export type TDataItemsUpdateItem = {
                id: number
requestBody: ItemUpdate
                
            }
export type TDataItemsDeleteItem = {
                id: number
                
            }

export class ItemsService {

	/**
	 * Read Items
	 * Retrieve items.
	 * @returns ItemsOut Successful Response
	 * @throws ApiError
	 */
	public static itemsReadItems(data: TDataItemsReadItems = {}): CancelablePromise<ItemsOut> {
		const {
limit = 100,
skip = 0,
} = data;
		return __request(OpenAPI, {
			method: 'GET',
			url: '/api/v1/items/',
			query: {
				skip, limit
			},
			errors: {
				422: `Validation Error`,
			},
		});
	}

	/**
	 * Create Item
	 * Create new item.
	 * @returns ItemOut Successful Response
	 * @throws ApiError
	 */
	public static itemsCreateItem(data: TDataItemsCreateItem): CancelablePromise<ItemOut> {
		const {
requestBody,
} = data;
		return __request(OpenAPI, {
			method: 'POST',
			url: '/api/v1/items/',
			body: requestBody,
			mediaType: 'application/json',
			errors: {
				422: `Validation Error`,
			},
		});
	}

	/**
	 * Read Item
	 * Get item by ID.
	 * @returns ItemOut Successful Response
	 * @throws ApiError
	 */
	public static itemsReadItem(data: TDataItemsReadItem): CancelablePromise<ItemOut> {
		const {
id,
} = data;
		return __request(OpenAPI, {
			method: 'GET',
			url: '/api/v1/items/{id}',
			path: {
				id
			},
			errors: {
				422: `Validation Error`,
			},
		});
	}

	/**
	 * Update Item
	 * Update an item.
	 * @returns ItemOut Successful Response
	 * @throws ApiError
	 */
	public static itemsUpdateItem(data: TDataItemsUpdateItem): CancelablePromise<ItemOut> {
		const {
id,
requestBody,
} = data;
		return __request(OpenAPI, {
			method: 'PUT',
			url: '/api/v1/items/{id}',
			path: {
				id
			},
			body: requestBody,
			mediaType: 'application/json',
			errors: {
				422: `Validation Error`,
			},
		});
	}

	/**
	 * Delete Item
	 * Delete an item.
	 * @returns Message Successful Response
	 * @throws ApiError
	 */
	public static itemsDeleteItem(data: TDataItemsDeleteItem): CancelablePromise<Message> {
		const {
id,
} = data;
		return __request(OpenAPI, {
			method: 'DELETE',
			url: '/api/v1/items/{id}',
			path: {
				id
			},
			errors: {
				422: `Validation Error`,
			},
		});
	}

}

export type TDataCountriesCountryFromQuery = {
                query: string
                
            }
export type TDataCountriesGetLeaderInfo = {
                state: string
                
            }
export type TDataCountriesGetLegislationData = {
                state: string
                
            }
export type TDataCountriesGetEconData = {
                state: string
                
            }

export class CountriesService {

	/**
	 * Country From Query
	 * @returns unknown Successful Response
	 * @throws ApiError
	 */
	public static countriesCountryFromQuery(data: TDataCountriesCountryFromQuery): CancelablePromise<unknown> {
		const {
query,
} = data;
		return __request(OpenAPI, {
			method: 'GET',
			url: '/api/v1/countries/country_from_query/',
			query: {
				query
			},
			errors: {
				422: `Validation Error`,
			},
		});
	}

	/**
	 * Geojson View
	 * @returns unknown Successful Response
	 * @throws ApiError
	 */
	public static countriesGeojsonView(): CancelablePromise<unknown> {
				return __request(OpenAPI, {
			method: 'GET',
			url: '/api/v1/countries/geojson/',
		});
	}

	/**
	 * Get Leader Info
	 * @returns unknown Successful Response
	 * @throws ApiError
	 */
	public static countriesGetLeaderInfo(data: TDataCountriesGetLeaderInfo): CancelablePromise<unknown> {
		const {
state,
} = data;
		return __request(OpenAPI, {
			method: 'GET',
			url: '/api/v1/countries/leaders/{state}',
			path: {
				state
			},
			errors: {
				422: `Validation Error`,
			},
		});
	}

	/**
	 * Get Legislation Data
	 * @returns unknown Successful Response
	 * @throws ApiError
	 */
	public static countriesGetLegislationData(data: TDataCountriesGetLegislationData): CancelablePromise<unknown> {
		const {
state,
} = data;
		return __request(OpenAPI, {
			method: 'GET',
			url: '/api/v1/countries/legislation/{state}',
			path: {
				state
			},
			errors: {
				422: `Validation Error`,
			},
		});
	}

	/**
	 * Get Econ Data
	 * @returns unknown Successful Response
	 * @throws ApiError
	 */
	public static countriesGetEconData(data: TDataCountriesGetEconData): CancelablePromise<unknown> {
		const {
state,
} = data;
		return __request(OpenAPI, {
			method: 'GET',
			url: '/api/v1/countries/econ_data/{state}',
			path: {
				state
			},
			errors: {
				422: `Validation Error`,
			},
		});
	}

	/**
	 * Update Leaders
	 * @returns unknown Successful Response
	 * @throws ApiError
	 */
	public static countriesUpdateLeaders(): CancelablePromise<unknown> {
				return __request(OpenAPI, {
			method: 'GET',
			url: '/api/v1/countries/update_leaders/',
		});
	}

	/**
	 * Get Tavily Data
	 * @returns unknown Successful Response
	 * @throws ApiError
	 */
	public static countriesGetTavilyData(): CancelablePromise<unknown> {
				return __request(OpenAPI, {
			method: 'GET',
			url: '/api/v1/countries/get_articles',
		});
	}

}

export type TDataSearchGetTavilyData = {
                query: string
                
            }
export type TDataSearchGetReport = {
                query: string
                
            }

export class SearchService {

	/**
	 * Get Tavily Data
	 * @returns unknown Successful Response
	 * @throws ApiError
	 */
	public static searchGetTavilyData(data: TDataSearchGetTavilyData): CancelablePromise<unknown> {
		const {
query,
} = data;
		return __request(OpenAPI, {
			method: 'GET',
			url: '/api/v1/search/get_articles',
			query: {
				query
			},
			errors: {
				422: `Validation Error`,
			},
		});
	}

	/**
	 * Get Report
	 * @returns unknown Successful Response
	 * @throws ApiError
	 */
	public static searchGetReport(data: TDataSearchGetReport): CancelablePromise<Record<string, unknown>> {
		const {
query,
} = data;
		return __request(OpenAPI, {
			method: 'GET',
			url: '/api/v1/search/report/{query}',
			path: {
				query
			},
			errors: {
				422: `Validation Error`,
			},
		});
	}

}