import type { CancelablePromise } from './core/CancelablePromise';
import { OpenAPI } from './core/OpenAPI';
import { request as __request } from './core/request';

import type { Request,MostRelevantEntitiesRequest,SearchType,Body_login_login_access_token,Message,NewPassword,Token,UserOut,UpdatePassword,UserCreate,UserCreateOpen,UsersOut,UserUpdate,UserUpdateMe,ItemCreate,ItemOut,ItemsOut,ItemUpdate,SearchHistoriesOut,SearchHistory,SearchHistoryCreate,WorkspaceCreate,WorkspaceRead,WorkspacesOut,ClassificationSchemeCreate,ClassificationSchemeRead,ClassificationSchemeUpdate,ArticleResponse } from './models';

export type AppData = {
        
    }

export type LocationsData = {
        GetLocationContents: {
                    limit?: number
location: string
skip?: number
                    
                };
GetLocationEntitiesContents: {
                    limit?: number
location: string
skip?: number
                    
                };
LocationFromQuery: {
                    query: string
                    
                };
GeojsonEventsView: {
                    eventType: string
                    
                };
GetLocationEntities: {
                    limit?: number
locationName: string
minRelevance?: number
skip?: number
                    
                };
GetLeaderInfo: {
                    state: string
                    
                };
GetLegislationData: {
                    state: string
                    
                };
GetEconData: {
                    indicators?: Array<string>
state: string
                    
                };
GetCoordinates: {
                    language?: string
location: string
                    
                };
GetGeojsonForArticleIds: {
                    requestBody: Array<string>
                    
                };
GetLocationMetadata: {
                    location: string
                    
                };
ChannelRoute: {
                    path: string
requestBody: Request
serviceName: string
                    
                };
    }

export type SearchData = {
        GetContents: {
                    classificationScores?: string | null
entities?: Array<string> | null
excludeKeywords?: Array<string> | null
keyword?: string | null
keywordWeights?: string | null
limit?: number
locations?: Array<string> | null
newsCategory?: string | null
searchQuery?: string | null
searchType?: SearchType
secondaryCategories?: Array<string> | null
skip?: number
topics?: Array<string> | null
                    
                };
GetMostRelevantEntities: {
                    requestBody: MostRelevantEntitiesRequest
                    
                };
SearchSynthesizer: {
                    searchQuery: string
                    
                };
    }

export type EntitiesData = {
        SearchEntities: {
                    /**
 * Maximum number of records to return
 */
limit?: number
/**
 * Search query for entities
 */
query: string
/**
 * Number of records to skip
 */
skip?: number
                    
                };
GetEntityDetails: {
                    /**
 * Entity for details
 */
entity: string
/**
 * Maximum number of records to return
 */
limit?: number
/**
 * Number of records to skip
 */
skip?: number
                    
                };
SearchEntities1: {
                    /**
 * Maximum number of records to return
 */
limit?: number
/**
 * Search query for entities
 */
query: string
/**
 * Number of records to skip
 */
skip?: number
                    
                };
GetEntityDetails1: {
                    /**
 * Entity for details
 */
entity: string
/**
 * Maximum number of records to return
 */
limit?: number
/**
 * Number of records to skip
 */
skip?: number
                    
                };
    }

export type LoginData = {
        LoginAccessToken: {
                    formData: Body_login_login_access_token
                    
                };
RecoverPassword: {
                    email: string
                    
                };
ResetPassword: {
                    requestBody: NewPassword
                    
                };
RecoverPasswordHtmlContent: {
                    email: string
                    
                };
    }

export type UsersData = {
        ReadUsers: {
                    limit?: number
skip?: number
                    
                };
CreateUser: {
                    requestBody: UserCreate
                    
                };
UpdateUserMe: {
                    requestBody: UserUpdateMe
                    
                };
UpdatePasswordMe: {
                    requestBody: UpdatePassword
                    
                };
CreateUserOpen: {
                    requestBody: UserCreateOpen
                    
                };
ReadUserById: {
                    userId: number
                    
                };
UpdateUser: {
                    requestBody: UserUpdate
userId: number
                    
                };
DeleteUser: {
                    userId: number
                    
                };
    }

export type UtilsData = {
        TestEmail: {
                    emailTo: string
                    
                };
    }

export type ItemsData = {
        ReadItems: {
                    limit?: number
skip?: number
                    
                };
CreateItem: {
                    requestBody: ItemCreate
                    
                };
ReadItem: {
                    id: number
                    
                };
UpdateItem: {
                    id: number
requestBody: ItemUpdate
                    
                };
DeleteItem: {
                    id: number
                    
                };
    }

export type SearchHistoryData = {
        CreateSearchHistory: {
                    requestBody: SearchHistoryCreate
                    
                };
ReadSearchHistories: {
                    limit?: number
skip?: number
                    
                };
    }

export type WorkspacesData = {
        CreateWorkspace: {
                    requestBody: WorkspaceCreate
                    
                };
ReadWorkspaces: {
                    limit?: number
skip?: number
                    
                };
ReadWorkspaceById: {
                    workspaceId: number
                    
                };
DeleteWorkspace: {
                    workspaceId: number
                    
                };
UpdateWorkspace: {
                    requestBody: WorkspaceCreate
workspaceId: number
                    
                };
    }

export type ClassificationSchemesData = {
        CreateClassificationScheme: {
                    requestBody: ClassificationSchemeCreate
workspaceId: number
                    
                };
ReadClassificationSchemes: {
                    limit?: number
skip?: number
workspaceId: number
                    
                };
ReadClassificationScheme: {
                    schemeId: number
workspaceId: number
                    
                };
UpdateClassificationScheme: {
                    requestBody: ClassificationSchemeUpdate
schemeId: number
workspaceId: number
                    
                };
DeleteClassificationScheme: {
                    schemeId: number
workspaceId: number
                    
                };
    }

export type GeoData = {
        GeojsonEventsView: {
                    eventType: string
                    
                };
    }

export type ArticlesData = {
        GetArticles: {
                    /**
 * Maximum number of articles to return
 */
limit?: number
/**
 * Search query for articles
 */
query: string
/**
 * Number of articles to skip
 */
skip?: number
                    
                };
ArticlesByEntity: {
                    /**
 * Date for articles
 */
date?: string
/**
 * Entity for articles
 */
entity: string
/**
 * Maximum number of articles to return
 */
limit?: number
/**
 * Number of articles to skip
 */
skip?: number
                    
                };
    }

export type ClassificationData = {
        GetLocationFromQuery: {
                    query: string
                    
                };
    }

export type FlowsData = {
        Report: {
                    query: string
                    
                };
    }

export type ReportData = {
        Report: {
                    query: string
                    
                };
    }

export type TasksData = {
        QueryExpansion: {
                    query: string
                    
                };
    }

export type ScoresData = {
        GetEntityScoresInTimeframe: {
                    entity: string
timeframeFrom?: string
timeframeTo?: string
                    
                };
    }

export class AppService {

	/**
	 * Readyz
	 * @returns unknown Successful Response
	 * @throws ApiError
	 */
	public static readyz(): CancelablePromise<unknown> {
				return __request(OpenAPI, {
			method: 'GET',
			url: '/api/v1/healthz/readiness',
		});
	}

	/**
	 * Liveness
	 * @returns unknown Successful Response
	 * @throws ApiError
	 */
	public static liveness(): CancelablePromise<unknown> {
				return __request(OpenAPI, {
			method: 'GET',
			url: '/api/v1/healthz/liveness',
		});
	}

	/**
	 * Healthz
	 * @returns unknown Successful Response
	 * @throws ApiError
	 */
	public static healthz(): CancelablePromise<unknown> {
				return __request(OpenAPI, {
			method: 'GET',
			url: '/api/v1/healthz/healthz',
		});
	}

}

export class LocationsService {

	/**
	 * Get Location Contents
	 * Get articles related to a location with basic pagination.
	 * @returns unknown Successful Response
	 * @throws ApiError
	 */
	public static getLocationContents(data: LocationsData['GetLocationContents']): CancelablePromise<unknown> {
		const {
location,
skip = 0,
limit = 20,
} = data;
		return __request(OpenAPI, {
			method: 'GET',
			url: '/api/v1/locations/{location}/contents',
			path: {
				location
			},
			query: {
				skip, limit
			},
			errors: {
				422: `Validation Error`,
			},
		});
	}

	/**
	 * Get Location Entities Contents
	 * Get articles related to a location with basic pagination.
	 * @returns unknown Successful Response
	 * @throws ApiError
	 */
	public static getLocationEntitiesContents(data: LocationsData['GetLocationEntitiesContents']): CancelablePromise<unknown> {
		const {
location,
skip = 0,
limit = 20,
} = data;
		return __request(OpenAPI, {
			method: 'GET',
			url: '/api/v1/locations/{location}/entities/contents',
			path: {
				location
			},
			query: {
				skip, limit
			},
			errors: {
				422: `Validation Error`,
			},
		});
	}

	/**
	 * Location From Query
	 * @returns unknown Successful Response
	 * @throws ApiError
	 */
	public static locationFromQuery(data: LocationsData['LocationFromQuery']): CancelablePromise<unknown> {
		const {
query,
} = data;
		return __request(OpenAPI, {
			method: 'GET',
			url: '/api/v1/locations/location_from_query',
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
	public static geojsonView(): CancelablePromise<unknown> {
				return __request(OpenAPI, {
			method: 'GET',
			url: '/api/v1/locations/geojson/',
		});
	}

	/**
	 * Geojson Events View
	 * @returns unknown Successful Response
	 * @throws ApiError
	 */
	public static geojsonEventsView(data: LocationsData['GeojsonEventsView']): CancelablePromise<unknown> {
		const {
eventType,
} = data;
		return __request(OpenAPI, {
			method: 'GET',
			url: '/api/v1/locations/geojson_events',
			query: {
				event_type: eventType
			},
			errors: {
				422: `Validation Error`,
			},
		});
	}

	/**
	 * Dashboard View
	 * @returns string Successful Response
	 * @throws ApiError
	 */
	public static dashboardView(): CancelablePromise<string> {
				return __request(OpenAPI, {
			method: 'GET',
			url: '/api/v1/locations/dashboard',
		});
	}

	/**
	 * Get Location Entities
	 * @returns unknown Successful Response
	 * @throws ApiError
	 */
	public static getLocationEntities(data: LocationsData['GetLocationEntities']): CancelablePromise<unknown> {
		const {
locationName,
skip = 0,
limit = 50,
minRelevance = 0,
} = data;
		return __request(OpenAPI, {
			method: 'GET',
			url: '/api/v1/locations/{location_name}/entities',
			path: {
				location_name: locationName
			},
			query: {
				skip, limit, min_relevance: minRelevance
			},
			errors: {
				422: `Validation Error`,
			},
		});
	}

	/**
	 * Get Leader Info
	 * @returns unknown Successful Response
	 * @throws ApiError
	 */
	public static getLeaderInfo(data: LocationsData['GetLeaderInfo']): CancelablePromise<unknown> {
		const {
state,
} = data;
		return __request(OpenAPI, {
			method: 'GET',
			url: '/api/v1/locations/leaders/{state}',
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
	public static getLegislationData(data: LocationsData['GetLegislationData']): CancelablePromise<unknown> {
		const {
state,
} = data;
		return __request(OpenAPI, {
			method: 'GET',
			url: '/api/v1/locations/legislation/{state}',
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
	public static getEconData(data: LocationsData['GetEconData']): CancelablePromise<unknown> {
		const {
state,
indicators = [
    "GDP",
    "GDP_GROWTH"
],
} = data;
		return __request(OpenAPI, {
			method: 'GET',
			url: '/api/v1/locations/econ_data/{state}',
			path: {
				state
			},
			query: {
				indicators
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
	public static updateLeaders(): CancelablePromise<unknown> {
				return __request(OpenAPI, {
			method: 'GET',
			url: '/api/v1/locations/update_leaders/',
		});
	}

	/**
	 * Get Tavily Data
	 * @returns unknown Successful Response
	 * @throws ApiError
	 */
	public static getTavilyData(): CancelablePromise<unknown> {
				return __request(OpenAPI, {
			method: 'GET',
			url: '/api/v1/locations/get_articles',
		});
	}

	/**
	 * Get Coordinates
	 * Fetches the coordinates, bounding box, and location type for a given location.
	 * @returns unknown Successful Response
	 * @throws ApiError
	 */
	public static getCoordinates(data: LocationsData['GetCoordinates']): CancelablePromise<unknown> {
		const {
location,
language = 'en',
} = data;
		return __request(OpenAPI, {
			method: 'GET',
			url: '/api/v1/locations/get_coordinates',
			query: {
				location, language
			},
			errors: {
				422: `Validation Error`,
			},
		});
	}

	/**
	 * Get Geojson For Article Ids
	 * @returns unknown Successful Response
	 * @throws ApiError
	 */
	public static getGeojsonForArticleIds(data: LocationsData['GetGeojsonForArticleIds']): CancelablePromise<unknown> {
		const {
requestBody,
} = data;
		return __request(OpenAPI, {
			method: 'POST',
			url: '/api/v1/locations/get_geojson_for_article_ids',
			body: requestBody,
			mediaType: 'application/json',
			errors: {
				422: `Validation Error`,
			},
		});
	}

	/**
	 * Get Location Metadata
	 * Get metadata about a location including supported features
	 * @returns unknown Successful Response
	 * @throws ApiError
	 */
	public static getLocationMetadata(data: LocationsData['GetLocationMetadata']): CancelablePromise<unknown> {
		const {
location,
} = data;
		return __request(OpenAPI, {
			method: 'GET',
			url: '/api/v1/locations/metadata/{location}',
			path: {
				location
			},
			errors: {
				422: `Validation Error`,
			},
		});
	}

	/**
	 * Channel Route
	 * A channel route that forwards requests to a specified service.
	 * @returns unknown Successful Response
	 * @throws ApiError
	 */
	public static channelRoute(data: LocationsData['ChannelRoute']): CancelablePromise<unknown> {
		const {
serviceName,
path,
requestBody,
} = data;
		return __request(OpenAPI, {
			method: 'GET',
			url: '/api/v1/locations/channel/{service_name}/{path}',
			path: {
				service_name: serviceName, path
			},
			body: requestBody,
			mediaType: 'application/json',
			errors: {
				422: `Validation Error`,
			},
		});
	}

}

export class SearchService {

	/**
	 * Get Contents
	 * @returns unknown Successful Response
	 * @throws ApiError
	 */
	public static getContents(data: SearchData['GetContents'] = {}): CancelablePromise<unknown> {
		const {
searchQuery,
searchType = 'semantic',
skip = 0,
limit = 20,
newsCategory,
secondaryCategories,
keyword,
entities,
locations,
topics,
classificationScores,
keywordWeights,
excludeKeywords,
} = data;
		return __request(OpenAPI, {
			method: 'GET',
			url: '/api/v1/search/contents',
			query: {
				search_query: searchQuery, search_type: searchType, skip, limit, news_category: newsCategory, secondary_categories: secondaryCategories, keyword, entities, locations, topics, classification_scores: classificationScores, keyword_weights: keywordWeights, exclude_keywords: excludeKeywords
			},
			errors: {
				422: `Validation Error`,
			},
		});
	}

	/**
	 * Get Most Relevant Entities
	 * @returns unknown Successful Response
	 * @throws ApiError
	 */
	public static getMostRelevantEntities(data: SearchData['GetMostRelevantEntities']): CancelablePromise<unknown> {
		const {
requestBody,
} = data;
		return __request(OpenAPI, {
			method: 'POST',
			url: '/api/v1/search/most_relevant_entities',
			body: requestBody,
			mediaType: 'application/json',
			errors: {
				422: `Validation Error`,
			},
		});
	}

	/**
	 * Search Synthesizer
	 * @returns unknown Successful Response
	 * @throws ApiError
	 */
	public static searchSynthesizer(data: SearchData['SearchSynthesizer']): CancelablePromise<unknown> {
		const {
searchQuery,
} = data;
		return __request(OpenAPI, {
			method: 'GET',
			url: '/api/v1/search/search_synthesizer',
			query: {
				search_query: searchQuery
			},
			errors: {
				422: `Validation Error`,
			},
		});
	}

}

export class EntitiesService {

	/**
	 * Search Entities
	 * Search and paginate through entities based on a query.
	 * @returns unknown Successful Response
	 * @throws ApiError
	 */
	public static searchEntities(data: EntitiesData['SearchEntities']): CancelablePromise<unknown> {
		const {
query,
skip = 0,
limit = 50,
} = data;
		return __request(OpenAPI, {
			method: 'GET',
			url: '/api/v1/entities/',
			query: {
				query, skip, limit
			},
			errors: {
				422: `Validation Error`,
			},
		});
	}

	/**
	 * Get Entity Details
	 * Retrieve detailed information about a specific entity.
	 * @returns unknown Successful Response
	 * @throws ApiError
	 */
	public static getEntityDetails(data: EntitiesData['GetEntityDetails']): CancelablePromise<unknown> {
		const {
entity,
skip = 0,
limit = 50,
} = data;
		return __request(OpenAPI, {
			method: 'GET',
			url: '/api/v1/entities/by_entity',
			query: {
				entity, skip, limit
			},
			errors: {
				422: `Validation Error`,
			},
		});
	}

	/**
	 * Search Entities
	 * Search and paginate through entities based on a query.
	 * @returns unknown Successful Response
	 * @throws ApiError
	 */
	public static searchEntities1(data: EntitiesData['SearchEntities1']): CancelablePromise<unknown> {
		const {
query,
skip = 0,
limit = 50,
} = data;
		return __request(OpenAPI, {
			method: 'GET',
			url: '/api/v2/entities/',
			query: {
				query, skip, limit
			},
			errors: {
				422: `Validation Error`,
			},
		});
	}

	/**
	 * Get Entity Details
	 * Retrieve detailed information about a specific entity.
	 * @returns unknown Successful Response
	 * @throws ApiError
	 */
	public static getEntityDetails1(data: EntitiesData['GetEntityDetails1']): CancelablePromise<unknown> {
		const {
entity,
skip = 0,
limit = 50,
} = data;
		return __request(OpenAPI, {
			method: 'GET',
			url: '/api/v2/entities/by_entity',
			query: {
				entity, skip, limit
			},
			errors: {
				422: `Validation Error`,
			},
		});
	}

}

export class LoginService {

	/**
	 * Login Access Token
	 * OAuth2 compatible token login, get an access token for future requests
	 * @returns Token Successful Response
	 * @throws ApiError
	 */
	public static loginAccessToken(data: LoginData['LoginAccessToken']): CancelablePromise<Token> {
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
	public static testToken(): CancelablePromise<UserOut> {
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
	public static recoverPassword(data: LoginData['RecoverPassword']): CancelablePromise<Message> {
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
	public static resetPassword(data: LoginData['ResetPassword']): CancelablePromise<Message> {
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
	public static recoverPasswordHtmlContent(data: LoginData['RecoverPasswordHtmlContent']): CancelablePromise<string> {
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

export class UsersService {

	/**
	 * Read Users
	 * Retrieve users.
	 * @returns UsersOut Successful Response
	 * @throws ApiError
	 */
	public static readUsers(data: UsersData['ReadUsers'] = {}): CancelablePromise<UsersOut> {
		const {
skip = 0,
limit = 100,
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
	public static createUser(data: UsersData['CreateUser']): CancelablePromise<UserOut> {
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
	public static readUserMe(): CancelablePromise<UserOut> {
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
	public static updateUserMe(data: UsersData['UpdateUserMe']): CancelablePromise<UserOut> {
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
	public static updatePasswordMe(data: UsersData['UpdatePasswordMe']): CancelablePromise<Message> {
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
	public static createUserOpen(data: UsersData['CreateUserOpen']): CancelablePromise<UserOut> {
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
	public static readUserById(data: UsersData['ReadUserById']): CancelablePromise<UserOut> {
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
	public static updateUser(data: UsersData['UpdateUser']): CancelablePromise<UserOut> {
		const {
userId,
requestBody,
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
	public static deleteUser(data: UsersData['DeleteUser']): CancelablePromise<Message> {
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

export class UtilsService {

	/**
	 * Test Email
	 * Test emails.
	 * @returns Message Successful Response
	 * @throws ApiError
	 */
	public static testEmail(data: UtilsData['TestEmail']): CancelablePromise<Message> {
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

	/**
	 * Healthz
	 * @returns unknown Successful Response
	 * @throws ApiError
	 */
	public static healthz(): CancelablePromise<unknown> {
				return __request(OpenAPI, {
			method: 'GET',
			url: '/api/v1/utils/healthz',
		});
	}

	/**
	 * Readyz
	 * @returns unknown Successful Response
	 * @throws ApiError
	 */
	public static readyz(): CancelablePromise<unknown> {
				return __request(OpenAPI, {
			method: 'GET',
			url: '/api/v1/utils/healthz/readiness',
		});
	}

	/**
	 * Liveness
	 * @returns unknown Successful Response
	 * @throws ApiError
	 */
	public static liveness(): CancelablePromise<unknown> {
				return __request(OpenAPI, {
			method: 'GET',
			url: '/api/v1/utils/healthz/liveness',
		});
	}

}

export class ItemsService {

	/**
	 * Read Items
	 * Retrieve items.
	 * @returns ItemsOut Successful Response
	 * @throws ApiError
	 */
	public static readItems(data: ItemsData['ReadItems'] = {}): CancelablePromise<ItemsOut> {
		const {
skip = 0,
limit = 100,
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
	public static createItem(data: ItemsData['CreateItem']): CancelablePromise<ItemOut> {
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
	public static readItem(data: ItemsData['ReadItem']): CancelablePromise<ItemOut> {
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
	public static updateItem(data: ItemsData['UpdateItem']): CancelablePromise<ItemOut> {
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
	public static deleteItem(data: ItemsData['DeleteItem']): CancelablePromise<Message> {
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

export class SearchHistoryService {

	/**
	 * Create Search History
	 * Create a new search history entry.
	 * @returns SearchHistory Successful Response
	 * @throws ApiError
	 */
	public static createSearchHistory(data: SearchHistoryData['CreateSearchHistory']): CancelablePromise<SearchHistory> {
		const {
requestBody,
} = data;
		return __request(OpenAPI, {
			method: 'POST',
			url: '/api/v1/search_histories/create',
			body: requestBody,
			mediaType: 'application/json',
			errors: {
				422: `Validation Error`,
			},
		});
	}

	/**
	 * Read Search Histories
	 * Retrieve search histories for the current user.
	 * @returns SearchHistoriesOut Successful Response
	 * @throws ApiError
	 */
	public static readSearchHistories(data: SearchHistoryData['ReadSearchHistories'] = {}): CancelablePromise<SearchHistoriesOut> {
		const {
skip = 0,
limit = 100,
} = data;
		return __request(OpenAPI, {
			method: 'GET',
			url: '/api/v1/search_histories/read',
			query: {
				skip, limit
			},
			errors: {
				422: `Validation Error`,
			},
		});
	}

}

export class WorkspacesService {

	/**
	 * Create Workspace
	 * Create a new workspace.
 * Only accessible by superusers.
	 * @returns WorkspaceRead Successful Response
	 * @throws ApiError
	 */
	public static createWorkspace(data: WorkspacesData['CreateWorkspace']): CancelablePromise<WorkspaceRead> {
		const {
requestBody,
} = data;
		return __request(OpenAPI, {
			method: 'POST',
			url: '/api/v1/workspaces/create',
			body: requestBody,
			mediaType: 'application/json',
			errors: {
				422: `Validation Error`,
			},
		});
	}

	/**
	 * Read Workspaces
	 * Retrieve all workspaces.
 * Only accessible by superusers.
	 * @returns WorkspacesOut Successful Response
	 * @throws ApiError
	 */
	public static readWorkspaces(data: WorkspacesData['ReadWorkspaces'] = {}): CancelablePromise<WorkspacesOut> {
		const {
skip = 0,
limit = 100,
} = data;
		return __request(OpenAPI, {
			method: 'GET',
			url: '/api/v1/workspaces/read',
			query: {
				skip, limit
			},
			errors: {
				422: `Validation Error`,
			},
		});
	}

	/**
	 * Read Workspace By Id
	 * Get a specific workspace by ID.
 * Only accessible by superusers.
	 * @returns WorkspaceRead Successful Response
	 * @throws ApiError
	 */
	public static readWorkspaceById(data: WorkspacesData['ReadWorkspaceById']): CancelablePromise<WorkspaceRead> {
		const {
workspaceId,
} = data;
		return __request(OpenAPI, {
			method: 'GET',
			url: '/api/v1/workspaces/{workspace_id}',
			path: {
				workspace_id: workspaceId
			},
			errors: {
				422: `Validation Error`,
			},
		});
	}

	/**
	 * Delete Workspace
	 * Delete a workspace.
 * Only accessible by superusers.
	 * @returns unknown Successful Response
	 * @throws ApiError
	 */
	public static deleteWorkspace(data: WorkspacesData['DeleteWorkspace']): CancelablePromise<unknown> {
		const {
workspaceId,
} = data;
		return __request(OpenAPI, {
			method: 'DELETE',
			url: '/api/v1/workspaces/{workspace_id}',
			path: {
				workspace_id: workspaceId
			},
			errors: {
				422: `Validation Error`,
			},
		});
	}

	/**
	 * Update Workspace
	 * Update an existing workspace.
 * Only accessible by superusers.
	 * @returns WorkspaceRead Successful Response
	 * @throws ApiError
	 */
	public static updateWorkspace(data: WorkspacesData['UpdateWorkspace']): CancelablePromise<WorkspaceRead> {
		const {
workspaceId,
requestBody,
} = data;
		return __request(OpenAPI, {
			method: 'PATCH',
			url: '/api/v1/workspaces/update/{workspace_id}',
			path: {
				workspace_id: workspaceId
			},
			body: requestBody,
			mediaType: 'application/json',
			errors: {
				422: `Validation Error`,
			},
		});
	}

}

export class ClassificationSchemesService {

	/**
	 * Create Classification Scheme
	 * @returns ClassificationSchemeRead Successful Response
	 * @throws ApiError
	 */
	public static createClassificationScheme(data: ClassificationSchemesData['CreateClassificationScheme']): CancelablePromise<ClassificationSchemeRead> {
		const {
workspaceId,
requestBody,
} = data;
		return __request(OpenAPI, {
			method: 'POST',
			url: '/api/v1/classification_schemes/{workspace_id}',
			path: {
				workspace_id: workspaceId
			},
			body: requestBody,
			mediaType: 'application/json',
			errors: {
				422: `Validation Error`,
			},
		});
	}

	/**
	 * Read Classification Schemes
	 * @returns ClassificationSchemeRead Successful Response
	 * @throws ApiError
	 */
	public static readClassificationSchemes(data: ClassificationSchemesData['ReadClassificationSchemes']): CancelablePromise<Array<ClassificationSchemeRead>> {
		const {
workspaceId,
skip = 0,
limit = 100,
} = data;
		return __request(OpenAPI, {
			method: 'GET',
			url: '/api/v1/classification_schemes/{workspace_id}',
			path: {
				workspace_id: workspaceId
			},
			query: {
				skip, limit
			},
			errors: {
				422: `Validation Error`,
			},
		});
	}

	/**
	 * Read Classification Scheme
	 * @returns ClassificationSchemeRead Successful Response
	 * @throws ApiError
	 */
	public static readClassificationScheme(data: ClassificationSchemesData['ReadClassificationScheme']): CancelablePromise<ClassificationSchemeRead> {
		const {
workspaceId,
schemeId,
} = data;
		return __request(OpenAPI, {
			method: 'GET',
			url: '/api/v1/classification_schemes/{workspace_id}/{scheme_id}',
			path: {
				workspace_id: workspaceId, scheme_id: schemeId
			},
			errors: {
				422: `Validation Error`,
			},
		});
	}

	/**
	 * Update Classification Scheme
	 * @returns ClassificationSchemeRead Successful Response
	 * @throws ApiError
	 */
	public static updateClassificationScheme(data: ClassificationSchemesData['UpdateClassificationScheme']): CancelablePromise<ClassificationSchemeRead> {
		const {
workspaceId,
schemeId,
requestBody,
} = data;
		return __request(OpenAPI, {
			method: 'PATCH',
			url: '/api/v1/classification_schemes/{workspace_id}/{scheme_id}',
			path: {
				workspace_id: workspaceId, scheme_id: schemeId
			},
			body: requestBody,
			mediaType: 'application/json',
			errors: {
				422: `Validation Error`,
			},
		});
	}

	/**
	 * Delete Classification Scheme
	 * @returns unknown Successful Response
	 * @throws ApiError
	 */
	public static deleteClassificationScheme(data: ClassificationSchemesData['DeleteClassificationScheme']): CancelablePromise<unknown> {
		const {
workspaceId,
schemeId,
} = data;
		return __request(OpenAPI, {
			method: 'DELETE',
			url: '/api/v1/classification_schemes/{workspace_id}/{scheme_id}',
			path: {
				workspace_id: workspaceId, scheme_id: schemeId
			},
			errors: {
				422: `Validation Error`,
			},
		});
	}

}

export class GeoService {

	/**
	 * Geojson Events View
	 * @returns unknown Successful Response
	 * @throws ApiError
	 */
	public static geojsonEventsView(data: GeoData['GeojsonEventsView']): CancelablePromise<unknown> {
		const {
eventType,
} = data;
		return __request(OpenAPI, {
			method: 'GET',
			url: '/api/v2/geo/geojson_events',
			query: {
				event_type: eventType
			},
			errors: {
				422: `Validation Error`,
			},
		});
	}

}

export class ArticlesService {

	/**
	 * Get Articles
	 * @returns ArticleResponse Successful Response
	 * @throws ApiError
	 */
	public static getArticles(data: ArticlesData['GetArticles']): CancelablePromise<ArticleResponse> {
		const {
query,
skip = 0,
limit = 20,
} = data;
		return __request(OpenAPI, {
			method: 'GET',
			url: '/api/v2/articles/basic',
			query: {
				query, skip, limit
			},
			errors: {
				422: `Validation Error`,
			},
		});
	}

	/**
	 * Articles By Entity
	 * @returns ArticleResponse Successful Response
	 * @throws ApiError
	 */
	public static articlesByEntity(data: ArticlesData['ArticlesByEntity']): CancelablePromise<ArticleResponse> {
		const {
entity,
skip = 0,
limit = 20,
date,
} = data;
		return __request(OpenAPI, {
			method: 'GET',
			url: '/api/v2/articles/by_entity',
			query: {
				entity, skip, limit, date
			},
			errors: {
				422: `Validation Error`,
			},
		});
	}

}

export class ClassificationService {

	/**
	 * Get Location From Query
	 * @returns unknown Successful Response
	 * @throws ApiError
	 */
	public static getLocationFromQuery(data: ClassificationData['GetLocationFromQuery']): CancelablePromise<unknown> {
		const {
query,
} = data;
		return __request(OpenAPI, {
			method: 'GET',
			url: '/api/v2/classification/location_from_query',
			query: {
				query
			},
			errors: {
				422: `Validation Error`,
			},
		});
	}

}

export class FlowsService {

	/**
	 * Report
	 * @returns unknown Successful Response
	 * @throws ApiError
	 */
	public static report(data: FlowsData['Report']): CancelablePromise<unknown> {
		const {
query,
} = data;
		return __request(OpenAPI, {
			method: 'POST',
			url: '/api/v2/flows/report',
			query: {
				query
			},
			errors: {
				422: `Validation Error`,
			},
		});
	}

}

export class ReportService {

	/**
	 * Report
	 * @returns unknown Successful Response
	 * @throws ApiError
	 */
	public static report(data: ReportData['Report']): CancelablePromise<unknown> {
		const {
query,
} = data;
		return __request(OpenAPI, {
			method: 'POST',
			url: '/api/v2/flows/report',
			query: {
				query
			},
			errors: {
				422: `Validation Error`,
			},
		});
	}

}

export class TasksService {

	/**
	 * Query Expansion
	 * @returns unknown Successful Response
	 * @throws ApiError
	 */
	public static queryExpansion(data: TasksData['QueryExpansion']): CancelablePromise<unknown> {
		const {
query,
} = data;
		return __request(OpenAPI, {
			method: 'POST',
			url: '/api/v2/tasks/query_expansion',
			query: {
				query
			},
			errors: {
				422: `Validation Error`,
			},
		});
	}

}

export class ScoresService {

	/**
	 * Get Entity Scores In Timeframe
	 * @returns unknown Successful Response
	 * @throws ApiError
	 */
	public static getEntityScoresInTimeframe(data: ScoresData['GetEntityScoresInTimeframe']): CancelablePromise<unknown> {
		const {
entity,
timeframeFrom = '2000-01-01',
timeframeTo = '2025-01-28',
} = data;
		return __request(OpenAPI, {
			method: 'GET',
			url: '/api/v2/scores/by_entity',
			query: {
				entity, timeframe_from: timeframeFrom, timeframe_to: timeframeTo
			},
			errors: {
				422: `Validation Error`,
			},
		});
	}

}