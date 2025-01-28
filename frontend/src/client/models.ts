export type ArticleResponse = {
	contents: Array<Record<string, unknown>>;
};



export type Body_login_login_access_token = {
	grant_type?: string | null;
	username: string;
	password: string;
	scope?: string;
	client_id?: string | null;
	client_secret?: string | null;
};



export type ClassificationSchemeCreate = {
	name: string;
	description?: string | null;
	type: string;
	expected_datatype: string;
	prompt?: string | null;
	input_text?: string | null;
	field_annotations?: Array<string> | null;
	model_annotations?: string | null;
};



export type ClassificationSchemeRead = {
	name: string;
	description?: string | null;
	type: string;
	expected_datatype: string;
	prompt?: string | null;
	input_text?: string | null;
	field_annotations?: Array<string> | null;
	model_annotations?: string | null;
	id: number;
	created_at: string;
	updated_at: string;
};



export type ClassificationSchemeUpdate = {
	name: string;
	description?: string | null;
	type: string;
	expected_datatype: string;
	prompt?: string | null;
	input_text?: string | null;
	field_annotations?: Array<string> | null;
	model_annotations?: string | null;
};



export type HTTPValidationError = {
	detail?: Array<ValidationError>;
};



export type ItemCreate = {
	title: string;
	description?: string | null;
};



export type ItemOut = {
	title: string;
	description?: string | null;
	id: number;
	owner_id: number;
};



export type ItemUpdate = {
	title?: string | null;
	description?: string | null;
};



export type ItemsOut = {
	data: Array<ItemOut>;
	count: number;
};



export type Message = {
	message: string;
};



export type MostRelevantEntitiesRequest = {
	article_ids: Array<string>;
};



export type NewPassword = {
	token: string;
	new_password: string;
};



export type QueryType = {
	type: string;
};



/**
 * Request object for search synthesizer
 */
export type Request = {
	query: string;
	query_type: QueryType;
};



export type SearchHistoriesOut = {
	data: Array<SearchHistoryRead>;
	count: number;
};



export type SearchHistory = {
	query: string;
	timestamp?: string;
	id?: number | null;
	user_id: number;
};



export type SearchHistoryCreate = {
	query: string;
	timestamp?: string;
};



export type SearchHistoryRead = {
	query: string;
	timestamp?: string;
	id: number;
	user_id: number;
};



export type SearchType = 'text' | 'semantic' | 'structured';



export type Token = {
	access_token: string;
	token_type?: string;
};



export type UpdatePassword = {
	current_password: string;
	new_password: string;
};



export type UserCreate = {
	email: string;
	is_active?: boolean;
	is_superuser?: boolean;
	full_name?: string | null;
	password: string;
};



export type UserCreateOpen = {
	email: string;
	password: string;
	full_name?: string | null;
};



export type UserOut = {
	email: string;
	is_active?: boolean;
	is_superuser?: boolean;
	full_name?: string | null;
	id: number;
};



export type UserUpdate = {
	email?: string | null;
	is_active?: boolean;
	is_superuser?: boolean;
	full_name?: string | null;
	password?: string | null;
};



export type UserUpdateMe = {
	full_name?: string | null;
	email?: string | null;
};



export type UsersOut = {
	data: Array<UserOut>;
	count: number;
};



export type ValidationError = {
	loc: Array<string | number>;
	msg: string;
	type: string;
};



export type WorkspaceCreate = {
	name: string;
	description?: string | null;
	sources?: Array<string> | null;
};



export type WorkspaceRead = {
	name: string;
	description?: string | null;
	sources?: Array<string> | null;
	uid: number;
	user_id_ownership: number;
	created_at: string;
	updated_at: string;
};



export type WorkspacesOut = {
	data: Array<WorkspaceRead>;
	count: number;
};

