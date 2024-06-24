import type { CancelablePromise } from '../client/core/CancelablePromise';
import { LoginService, UsersService } from '../client/services';
import type { Body_login_login_access_token, NewPassword } from '../client/models';

export const loginAccessToken = async ({ formData }: { formData: Body_login_login_access_token }): CancelablePromise<Token> => {
  const response = await LoginService.loginLoginAccessToken({ formData });
  return response;
};

export const getCurrentUser = async (): CancelablePromise<UserOut> => {
  const response = await UsersService.usersReadUserMe();
  return response;
};

export const recoverPassword = async (email: string): CancelablePromise<Message> => {
  const response = await LoginService.loginRecoverPassword({ email });
  return response;
};

export const resetPassword = async (token: string, newPassword: string): CancelablePromise<Message> => {
  const requestBody: NewPassword = { token, new_password: newPassword };
  const response = await LoginService.loginResetPassword({ requestBody });
  return response;
};